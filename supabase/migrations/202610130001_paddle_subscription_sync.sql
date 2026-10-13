begin;

alter table public.subscriptions
  add column if not exists current_period_start timestamptz,
  add column if not exists scheduled_cancel_at timestamptz,
  add column if not exists last_event_at timestamptz,
  add column if not exists last_event_id text;

create table if not exists public.paddle_webhook_events (
  event_id text primary key,
  event_type text not null,
  occurred_at timestamptz not null,
  processed_at timestamptz not null default pg_catalog.now()
);

alter table public.paddle_webhook_events enable row level security;
revoke all on public.paddle_webhook_events from public, anon, authenticated;

create table if not exists public.paddle_checkout_attempts (
  studio_id uuid primary key
    references public.studios(id)
    on delete cascade,
  price_id text not null,
  checkout_attempt_id uuid not null default gen_random_uuid(),
  lease_id uuid not null,
  lease_expires_at timestamptz not null,
  transaction_id text unique,
  created_at timestamptz not null default pg_catalog.now()
);

alter table public.paddle_checkout_attempts enable row level security;
revoke all on public.paddle_checkout_attempts from public, anon, authenticated;

create or replace function public.reserve_paddle_checkout(
  p_studio_id uuid,
  p_user_id uuid,
  p_price_id text,
  p_lease_id uuid
)
returns table (
  is_new boolean,
  can_reconcile boolean,
  transaction_id text,
  price_id text,
  checkout_attempt_id text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
  reserved_attempt_id text;
  reserved_created_at timestamptz;
  reserved_transaction_id text;
  reserved_price_id text;
  reserved_lease_expires_at timestamptz;
begin
  if not exists (
    select 1
    from public.studio_members as member
    join public.studios as studio
      on studio.id = member.studio_id
    where member.studio_id = p_studio_id
      and member.user_id = p_user_id
      and member.role = 'owner'
      and studio.owner_user_id = p_user_id
  ) then
    raise exception 'Paddle checkout requires the Studio owner';
  end if;

  if exists (
    select 1
    from public.subscriptions as subscription
    where subscription.studio_id = p_studio_id
      and (
        subscription.status in ('active', 'trialing', 'past_due', 'paused')
        or (
          subscription.provider_subscription_id is not null
          and subscription.status <> 'cancelled'
        )
      )
  ) then
    return query select false, false, null::text, p_price_id, null::text, null::timestamptz;
    return;
  end if;

  insert into public.paddle_checkout_attempts (
    studio_id,
    price_id,
    lease_id,
    lease_expires_at
  )
  values (
    p_studio_id,
    p_price_id,
    p_lease_id,
    pg_catalog.now() + interval '5 minutes'
  )
  on conflict (studio_id) do nothing;

  get diagnostics inserted_count = row_count;
  if inserted_count = 1 then
    select attempt.checkout_attempt_id::text, attempt.created_at
    into reserved_attempt_id, reserved_created_at
    from public.paddle_checkout_attempts as attempt
    where attempt.studio_id = p_studio_id;

    return query select true, false, null::text, p_price_id, reserved_attempt_id, reserved_created_at;
    return;
  end if;

  select
    attempt.transaction_id,
    attempt.price_id,
    attempt.checkout_attempt_id::text,
    attempt.created_at,
    attempt.lease_expires_at
  into
    reserved_transaction_id,
    reserved_price_id,
    reserved_attempt_id,
    reserved_created_at,
    reserved_lease_expires_at
  from public.paddle_checkout_attempts as attempt
  where attempt.studio_id = p_studio_id
  for update;

  if reserved_transaction_id is null
     and reserved_price_id = p_price_id
     and reserved_lease_expires_at <= pg_catalog.now() then
    update public.paddle_checkout_attempts
    set
      lease_id = p_lease_id,
      lease_expires_at = pg_catalog.now() + interval '5 minutes'
    where studio_id = p_studio_id;

    return query select false, true, null::text, reserved_price_id, reserved_attempt_id, reserved_created_at;
    return;
  end if;

  return query select
    false,
    false,
    reserved_transaction_id,
    reserved_price_id,
    reserved_attempt_id,
    reserved_created_at;
end;
$$;

create or replace function public.set_paddle_checkout_transaction(
  p_studio_id uuid,
  p_user_id uuid,
  p_lease_id uuid,
  p_checkout_attempt_id uuid,
  p_transaction_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if not exists (
    select 1
    from public.studio_members as member
    join public.studios as studio
      on studio.id = member.studio_id
    where member.studio_id = p_studio_id
      and member.user_id = p_user_id
      and member.role = 'owner'
      and studio.owner_user_id = p_user_id
  ) then
    raise exception 'Paddle checkout requires the Studio owner';
  end if;

  update public.paddle_checkout_attempts
  set transaction_id = p_transaction_id
  where studio_id = p_studio_id
    and lease_id = p_lease_id
    and checkout_attempt_id = p_checkout_attempt_id
    and transaction_id is null;

  get diagnostics updated_count = row_count;
  if updated_count = 1 then
    return true;
  end if;

  return exists (
    select 1
    from public.paddle_checkout_attempts as attempt
    where attempt.studio_id = p_studio_id
      and attempt.checkout_attempt_id = p_checkout_attempt_id
      and attempt.transaction_id = p_transaction_id
  );
end;
$$;

create or replace function public.release_paddle_checkout(
  p_studio_id uuid,
  p_user_id uuid,
  p_transaction_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if not exists (
    select 1
    from public.studio_members as member
    join public.studios as studio
      on studio.id = member.studio_id
    where member.studio_id = p_studio_id
      and member.user_id = p_user_id
      and member.role = 'owner'
      and studio.owner_user_id = p_user_id
  ) then
    raise exception 'Paddle checkout requires the Studio owner';
  end if;

  delete from public.paddle_checkout_attempts
  where studio_id = p_studio_id
    and transaction_id = p_transaction_id;

  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

create or replace function public.apply_paddle_subscription_event(
  p_event_id text,
  p_event_type text,
  p_occurred_at timestamptz,
  p_studio_id uuid,
  p_user_id uuid,
  p_subscription_id text,
  p_customer_id text,
  p_price_id text,
  p_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_scheduled_cancel_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_event_count integer;
  existing_subscription public.subscriptions%rowtype;
begin
  if p_event_type not in (
    'subscription.created',
    'subscription.updated',
    'subscription.canceled'
  ) then
    raise exception 'Unsupported Paddle event type';
  end if;

  if p_status not in (
    'active',
    'trialing',
    'past_due',
    'paused',
    'cancelled'
  ) then
    raise exception 'Unsupported Paddle subscription status';
  end if;

  if not exists (
    select 1
    from public.studio_members as member
    join public.studios as studio
      on studio.id = member.studio_id
    where member.studio_id = p_studio_id
      and member.user_id = p_user_id
      and member.role = 'owner'
      and studio.owner_user_id = p_user_id
  ) then
    raise exception 'Paddle account does not match a Studio owner';
  end if;

  insert into public.paddle_webhook_events (
    event_id,
    event_type,
    occurred_at
  )
  values (
    p_event_id,
    p_event_type,
    p_occurred_at
  )
  on conflict (event_id) do nothing;

  get diagnostics inserted_event_count = row_count;
  if inserted_event_count = 0 then
    return false;
  end if;

  select *
  into existing_subscription
  from public.subscriptions
  where studio_id = p_studio_id
  for update;

  if found then
    if existing_subscription.provider_subscription_id is not null
       and existing_subscription.provider_subscription_id <> p_subscription_id
       and existing_subscription.status <> 'cancelled' then
      raise exception 'Studio already has a different Paddle subscription';
    end if;

    if existing_subscription.last_event_at is not null
       and (
         p_occurred_at < existing_subscription.last_event_at
         or (
           p_occurred_at = existing_subscription.last_event_at
           and existing_subscription.last_event_id is not null
           and p_event_id collate "C" <= existing_subscription.last_event_id collate "C"
         )
       ) then
      return false;
    end if;
  end if;

  insert into public.subscriptions (
    studio_id,
    provider,
    provider_customer_id,
    provider_subscription_id,
    price_id,
    status,
    current_period_start,
    current_period_end,
    scheduled_cancel_at,
    last_event_at,
    last_event_id
  )
  values (
    p_studio_id,
    'paddle',
    p_customer_id,
    p_subscription_id,
    p_price_id,
    p_status,
    p_current_period_start,
    p_current_period_end,
    p_scheduled_cancel_at,
    p_occurred_at,
    p_event_id
  )
  on conflict (studio_id) do update
  set
    provider_customer_id = excluded.provider_customer_id,
    provider_subscription_id = excluded.provider_subscription_id,
    price_id = excluded.price_id,
    status = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    scheduled_cancel_at = excluded.scheduled_cancel_at,
    last_event_at = excluded.last_event_at,
    last_event_id = excluded.last_event_id
  where (
      public.subscriptions.provider_subscription_id is null
      or public.subscriptions.provider_subscription_id = excluded.provider_subscription_id
      or public.subscriptions.status = 'cancelled'
    )
    and (
      public.subscriptions.last_event_at is null
      or excluded.last_event_at > public.subscriptions.last_event_at
      or (
        excluded.last_event_at = public.subscriptions.last_event_at
        and (
          public.subscriptions.last_event_id is null
          or excluded.last_event_id collate "C" > public.subscriptions.last_event_id collate "C"
        )
      )
    );

  get diagnostics inserted_event_count = row_count;
  if inserted_event_count = 0 then
    return false;
  end if;

  if p_status <> 'cancelled' then
    delete from public.paddle_checkout_attempts
    where studio_id = p_studio_id
      and (
        transaction_id is not null
        or lease_expires_at <= pg_catalog.now()
      );
  end if;

  return true;
end;
$$;

revoke all on function public.reserve_paddle_checkout(uuid, uuid, text, uuid)
from public, anon, authenticated;
grant execute on function public.reserve_paddle_checkout(uuid, uuid, text, uuid)
to service_role;

revoke all on function public.set_paddle_checkout_transaction(uuid, uuid, uuid, uuid, text)
from public, anon, authenticated;
grant execute on function public.set_paddle_checkout_transaction(uuid, uuid, uuid, uuid, text)
to service_role;

revoke all on function public.release_paddle_checkout(uuid, uuid, text)
from public, anon, authenticated;
grant execute on function public.release_paddle_checkout(uuid, uuid, text)
to service_role;

revoke all on function public.apply_paddle_subscription_event(
  text,
  text,
  timestamptz,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  timestamptz,
  timestamptz
) from public, anon, authenticated;

grant execute on function public.apply_paddle_subscription_event(
  text,
  text,
  timestamptz,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  timestamptz,
  timestamptz
) to service_role;

commit;
