begin;

create or replace function public.is_studio_subscription_active(
  target_studio_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() is not null
    and public.is_studio_member(target_studio_id)
    and exists (
      select 1
      from public.subscriptions as subscription
      where subscription.studio_id = target_studio_id
        and subscription.status in ('active', 'trialing')
        and (
          subscription.current_period_end is null
          or subscription.current_period_end > pg_catalog.now()
        )
    );
$$;

revoke all on function public.is_studio_subscription_active(uuid)
from public, anon;

grant execute on function public.is_studio_subscription_active(uuid)
to authenticated;

drop policy if exists "studio_settings_member_access"
on public.studio_settings;

create policy "studio_settings_select_members"
on public.studio_settings
for select
to authenticated
using (public.is_studio_member(studio_id));

create policy "studio_settings_insert_active_members"
on public.studio_settings
for insert
to authenticated
with check (public.is_studio_subscription_active(studio_id));

create policy "studio_settings_update_active_members"
on public.studio_settings
for update
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

create policy "studio_settings_delete_active_members"
on public.studio_settings
for delete
to authenticated
using (public.is_studio_subscription_active(studio_id));

drop policy if exists "services_member_access"
on public.services;

create policy "services_select_members"
on public.services
for select
to authenticated
using (public.is_studio_member(studio_id));

create policy "services_insert_active_members"
on public.services
for insert
to authenticated
with check (public.is_studio_subscription_active(studio_id));

create policy "services_update_active_members"
on public.services
for update
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

create policy "services_delete_active_members"
on public.services
for delete
to authenticated
using (public.is_studio_subscription_active(studio_id));

drop policy if exists "clients_member_access"
on public.clients;

create policy "clients_active_members"
on public.clients
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

drop policy if exists "appointments_member_access"
on public.appointments;

create policy "appointments_active_members"
on public.appointments
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

drop policy if exists "beauty_packs_member_access"
on public.beauty_packs;

create policy "beauty_packs_active_members"
on public.beauty_packs
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

drop policy if exists "beauty_pack_modules_member_access"
on public.beauty_pack_modules;

create policy "beauty_pack_modules_active_members"
on public.beauty_pack_modules
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

drop policy if exists "client_experiences_member_access"
on public.client_experiences;

create policy "client_experiences_active_members"
on public.client_experiences
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

drop policy if exists "client_experience_responses_member_access"
on public.client_experience_responses;

create policy "client_experience_responses_active_members"
on public.client_experience_responses
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

drop policy if exists "visit_memories_member_access"
on public.visit_memories;

create policy "visit_memories_active_members"
on public.visit_memories
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

drop policy if exists "file_assets_member_access"
on public.file_assets;

create policy "file_assets_active_members"
on public.file_assets
for all
to authenticated
using (public.is_studio_subscription_active(studio_id))
with check (public.is_studio_subscription_active(studio_id));

commit;
