begin;

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete set null,
  contact_email text not null check (char_length(contact_email) between 3 and 254),
  kind text not null check (kind in ('ticket','feedback')),
  category text not null check (category in ('account','billing','studio','clients','technical','other')),
  subject text not null check (char_length(trim(subject)) between 3 and 120),
  message text not null check (char_length(trim(message)) between 15 and 4000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_requests_user_created_idx
on public.support_requests(user_id, created_at desc);
create index if not exists support_requests_status_created_idx
on public.support_requests(status, created_at desc);

alter table public.support_requests enable row level security;

drop policy if exists "support_requests_select_self" on public.support_requests;
create policy "support_requests_select_self" on public.support_requests
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "support_requests_insert_self" on public.support_requests;
create policy "support_requests_insert_self" on public.support_requests
for insert to authenticated with check (
  user_id = (select auth.uid())
  and contact_email = (select auth.jwt() ->> 'email')
  and status = 'open'
  and (studio_id is null or public.is_studio_member(studio_id))
);

revoke all on public.support_requests from anon, authenticated;
grant select, insert on public.support_requests to authenticated;

commit;
