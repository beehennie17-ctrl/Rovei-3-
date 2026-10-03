begin;

create extension if not exists pgcrypto;

-- =========================================================
-- COMMON HELPERS
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- USERS
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    email
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.email
  )
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data
on auth.users
for each row
execute procedure public.handle_new_user();

-- =========================================================
-- STUDIOS / MULTI-TENANCY
-- =========================================================

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null
    references public.profiles(id)
    on delete restrict,

  name text not null
    check (char_length(trim(name)) between 2 and 80),

  timezone text not null default 'UTC',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_members (
  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),

  created_at timestamptz not null default now(),

  primary key (studio_id, user_id)
);

create or replace function public.add_studio_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.studio_members (
    studio_id,
    user_id,
    role
  )
  values (
    new.id,
    new.owner_user_id,
    'owner'
  )
  on conflict (studio_id, user_id)
  do update set role = 'owner';

  return new;
end;
$$;

drop trigger if exists on_studio_created
on public.studios;

create trigger on_studio_created
after insert
on public.studios
for each row
execute procedure public.add_studio_owner_membership();

create or replace function public.is_studio_member(
  target_studio_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.studio_members
    where studio_id = target_studio_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_studio_owner(
  target_studio_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.studios
    where id = target_studio_id
      and owner_user_id = auth.uid()
  );
$$;

-- =========================================================
-- STUDIO CONFIGURATION
-- =========================================================

create table if not exists public.studio_settings (
  studio_id uuid primary key
    references public.studios(id)
    on delete cascade,

  primary_colour text not null default '#941651',
  theme_name text,
  theme_config jsonb not null default '{}'::jsonb,

  experience_modules jsonb not null default '[]'::jsonb,
  availability jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  name text not null,
  category text,

  duration_minutes integer
    check (
      duration_minutes is null
      or duration_minutes between 5 and 1440
    ),

  active boolean not null default true,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_studio_id_idx
on public.services(studio_id);

-- =========================================================
-- CLIENTS / APPOINTMENTS
-- =========================================================

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  first_name text not null,
  last_name text,

  email text,
  phone text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_studio_id_idx
on public.clients(studio_id);

create index if not exists clients_studio_email_idx
on public.clients(studio_id, lower(email))
where email is not null;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  client_id uuid not null
    references public.clients(id)
    on delete cascade,

  service_id uuid
    references public.services(id)
    on delete set null,

  starts_at timestamptz not null,
  timezone text not null default 'UTC',

  status text not null default 'scheduled'
    check (
      status in (
        'scheduled',
        'completed',
        'cancelled'
      )
    ),

  readiness_status text not null default 'draft'
    check (
      readiness_status in (
        'draft',
        'waiting',
        'ready',
        'complete'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_studio_starts_idx
on public.appointments(studio_id, starts_at);

create index if not exists appointments_client_id_idx
on public.appointments(client_id);

-- =========================================================
-- BEAUTY PACKS
-- =========================================================

create table if not exists public.beauty_packs (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  name text not null,
  description text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists beauty_packs_studio_id_idx
on public.beauty_packs(studio_id);

create table if not exists public.beauty_pack_modules (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  beauty_pack_id uuid not null
    references public.beauty_packs(id)
    on delete cascade,

  module_type text not null
    check (
      module_type in (
        'consultation',
        'preferences',
        'inspiration',
        'consent',
        'prep',
        'current_photos'
      )
    ),

  sort_order integer not null default 0,
  config jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists beauty_pack_modules_pack_idx
on public.beauty_pack_modules(beauty_pack_id);

-- =========================================================
-- CLIENT EXPERIENCES
-- =========================================================

create table if not exists public.client_experiences (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  client_id uuid not null
    references public.clients(id)
    on delete cascade,

  appointment_id uuid
    references public.appointments(id)
    on delete cascade,

  beauty_pack_id uuid
    references public.beauty_packs(id)
    on delete set null,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'sent',
        'started',
        'completed',
        'expired'
      )
    ),

  sent_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_experiences_studio_idx
on public.client_experiences(studio_id);

create table if not exists public.client_experience_responses (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  client_experience_id uuid not null
    references public.client_experiences(id)
    on delete cascade,

  module_type text not null,

  payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (client_experience_id, module_type)
);

create index if not exists client_response_experience_idx
on public.client_experience_responses(client_experience_id);

-- =========================================================
-- CLIENT MEMORY
-- =========================================================

create table if not exists public.visit_memories (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  client_id uuid not null
    references public.clients(id)
    on delete cascade,

  appointment_id uuid
    references public.appointments(id)
    on delete set null,

  summary text,
  notes text,

  preferences jsonb not null default '{}'::jsonb,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visit_memories_client_idx
on public.visit_memories(client_id, created_at desc);

-- =========================================================
-- FILE METADATA
-- Actual private Storage policies come in Storage phase.
-- =========================================================

create table if not exists public.file_assets (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id)
    on delete cascade,

  client_id uuid
    references public.clients(id)
    on delete cascade,

  client_experience_id uuid
    references public.client_experiences(id)
    on delete cascade,

  visit_memory_id uuid
    references public.visit_memories(id)
    on delete cascade,

  bucket text not null,
  object_path text not null,

  kind text,
  mime_type text,
  size_bytes bigint
    check (size_bytes is null or size_bytes >= 0),

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),

  unique (bucket, object_path)
);

-- =========================================================
-- SUBSCRIPTION / LEGAL / PRIVACY
-- =========================================================

create table if not exists public.subscriptions (
  studio_id uuid primary key
    references public.studios(id)
    on delete cascade,

  provider text not null default 'paddle'
    check (provider = 'paddle'),

  provider_customer_id text,
  provider_subscription_id text unique,

  price_id text,

  status text not null default 'inactive'
    check (
      status in (
        'inactive',
        'trialing',
        'active',
        'past_due',
        'paused',
        'cancelled'
      )
    ),

  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  studio_id uuid
    references public.studios(id)
    on delete cascade,

  document_type text not null,
  document_version text not null,

  accepted_at timestamptz not null default now(),

  user_agent text
);

create index if not exists legal_acceptances_user_idx
on public.legal_acceptances(user_id);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  studio_id uuid
    references public.studios(id)
    on delete set null,

  request_type text not null
    check (
      request_type in (
        'access',
        'export',
        'correction',
        'deletion'
      )
    ),

  status text not null default 'open'
    check (
      status in (
        'open',
        'processing',
        'completed',
        'rejected'
      )
    ),

  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,

  studio_id uuid
    references public.studios(id)
    on delete set null,

  user_id uuid
    references public.profiles(id)
    on delete set null,

  event_type text not null,
  entity_type text,
  entity_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists audit_events_studio_created_idx
on public.audit_events(studio_id, created_at desc);

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'studios',
    'studio_settings',
    'services',
    'clients',
    'appointments',
    'beauty_packs',
    'client_experiences',
    'client_experience_responses',
    'visit_memories',
    'subscriptions'
  ]
  loop
    execute format(
      'drop trigger if exists set_%I_updated_at on public.%I',
      table_name,
      table_name
    );

    execute format(
      'create trigger set_%I_updated_at
       before update on public.%I
       for each row
       execute procedure public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.studios enable row level security;
alter table public.studio_members enable row level security;
alter table public.studio_settings enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.beauty_packs enable row level security;
alter table public.beauty_pack_modules enable row level security;
alter table public.client_experiences enable row level security;
alter table public.client_experience_responses enable row level security;
alter table public.visit_memories enable row level security;
alter table public.file_assets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.audit_events enable row level security;

-- Profiles

create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Studios

create policy "studios_select_members"
on public.studios
for select
to authenticated
using (public.is_studio_member(id));

create policy "studios_insert_owner"
on public.studios
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "studios_update_owner"
on public.studios
for update
to authenticated
using (public.is_studio_owner(id))
with check (public.is_studio_owner(id));

create policy "studios_delete_owner"
on public.studios
for delete
to authenticated
using (public.is_studio_owner(id));

-- Memberships

create policy "studio_members_select_members"
on public.studio_members
for select
to authenticated
using (
  public.is_studio_member(studio_id)
);

create policy "studio_members_manage_owner"
on public.studio_members
for all
to authenticated
using (
  public.is_studio_owner(studio_id)
)
with check (
  public.is_studio_owner(studio_id)
);

-- Generic studio-owned resources

create policy "studio_settings_member_access"
on public.studio_settings
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "services_member_access"
on public.services
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "clients_member_access"
on public.clients
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "appointments_member_access"
on public.appointments
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "beauty_packs_member_access"
on public.beauty_packs
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "beauty_pack_modules_member_access"
on public.beauty_pack_modules
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "client_experiences_member_access"
on public.client_experiences
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "client_experience_responses_member_access"
on public.client_experience_responses
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "visit_memories_member_access"
on public.visit_memories
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

create policy "file_assets_member_access"
on public.file_assets
for all
to authenticated
using (
  public.is_studio_member(studio_id)
)
with check (
  public.is_studio_member(studio_id)
);

-- Subscription rows are readable by Studio members.
-- Browser users cannot mutate them. Paddle webhooks will use
-- the server-only service-role client.

create policy "subscriptions_select_members"
on public.subscriptions
for select
to authenticated
using (
  public.is_studio_member(studio_id)
);

-- Legal acceptance

create policy "legal_acceptances_select_self"
on public.legal_acceptances
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "legal_acceptances_insert_self"
on public.legal_acceptances
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    studio_id is null
    or public.is_studio_member(studio_id)
  )
);

-- Privacy requests

create policy "privacy_requests_select_self"
on public.privacy_requests
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "privacy_requests_insert_self"
on public.privacy_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
);

-- Audit events are intentionally read-only to Studio users.
-- Server-side code writes them using the service role.

create policy "audit_events_select_members"
on public.audit_events
for select
to authenticated
using (
  studio_id is not null
  and public.is_studio_member(studio_id)
);

commit;
