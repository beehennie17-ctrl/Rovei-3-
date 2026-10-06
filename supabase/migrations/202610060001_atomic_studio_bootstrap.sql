begin;

create or replace function public.bootstrap_studio(
  p_name text,
  p_timezone text,
  p_theme text,
  p_primary_colour text,
  p_custom_primary text,
  p_experience_modules jsonb,
  p_services jsonb
)
returns table (
  studio_id uuid,
  already_exists boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_studio_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  select member.studio_id
  into v_studio_id
  from public.studio_members as member
  where member.user_id = v_user_id
  order by member.created_at
  limit 1;

  if v_studio_id is not null then
    return query select v_studio_id, true;
    return;
  end if;

  if p_name is null or pg_catalog.char_length(pg_catalog.btrim(p_name)) not between 2 and 60
     or p_timezone is null
     or not exists (
       select 1
       from pg_catalog.pg_timezone_names as timezone
       where timezone.name = p_timezone
     )
     or p_theme is null
     or p_theme not in ('blush', 'noir', 'pearl', 'wine', 'mocha', 'sage', 'lilac', 'custom')
     or p_primary_colour is null
     or p_primary_colour !~ '^#[0-9A-Fa-f]{6}$'
     or p_custom_primary is null
     or p_custom_primary !~ '^#[0-9A-Fa-f]{6}$'
     or p_experience_modules is null
     or pg_catalog.jsonb_typeof(p_experience_modules) <> 'array'
     or pg_catalog.jsonb_array_length(p_experience_modules) > 6
     or pg_catalog.jsonb_array_length(p_experience_modules) = 0
     or p_services is null
     or pg_catalog.jsonb_typeof(p_services) <> 'array'
     or pg_catalog.jsonb_array_length(p_services) > 6
     or pg_catalog.jsonb_array_length(p_services) = 0 then
    raise exception 'Invalid Studio configuration'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements_text(p_experience_modules) as module(value)
    where module.value is null
      or module.value not in (
        'consultation', 'preferences', 'inspiration',
        'consent', 'prep', 'current-photos'
      )
  ) or exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_services)
      as service(name text, category text, sort_order integer)
    where service.name is null
      or pg_catalog.char_length(pg_catalog.btrim(service.name)) not between 1 and 80
      or service.category is null
      or service.category not in ('lashes', 'brows', 'nails', 'makeup', 'facials', 'other')
  ) then
    raise exception 'Invalid Studio configuration'
      using errcode = '22023';
  end if;

  insert into public.studios (owner_user_id, name, timezone)
  values (v_user_id, pg_catalog.btrim(p_name), p_timezone)
  returning id into v_studio_id;

  insert into public.studio_settings (
    studio_id,
    primary_colour,
    theme_name,
    theme_config,
    experience_modules,
    availability
  )
  values (
    v_studio_id,
    pg_catalog.upper(p_primary_colour),
    p_theme,
    pg_catalog.jsonb_build_object('customPrimary', p_custom_primary),
    p_experience_modules,
    '{}'::jsonb
  );

  insert into public.services (studio_id, name, category, active, sort_order)
  select
    v_studio_id,
    service.name,
    service.category,
    true,
    service.sort_order
  from pg_catalog.jsonb_to_recordset(p_services)
    as service(name text, category text, sort_order integer);

  return query select v_studio_id, false;
end;
$$;

revoke all on function public.bootstrap_studio(
  text, text, text, text, text, jsonb, jsonb
) from public, anon;

grant execute on function public.bootstrap_studio(
  text, text, text, text, text, jsonb, jsonb
) to authenticated;

commit;
