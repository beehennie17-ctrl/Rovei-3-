begin;

-- =========================================================
-- SECURE CLIENT EXPERIENCE LINKS
-- =========================================================
--
-- The raw client-facing token must NEVER be stored in the
-- database.
--
-- Rovei stores only:
--
--   SHA-256(raw_token)
--
-- The raw secret exists only long enough to be returned once
-- to the authenticated Studio user creating the link.
--
-- Public client requests later hash their presented token and
-- look up the matching experience server-side.
-- =========================================================

alter table public.client_experiences
add column if not exists token_hash text;

alter table public.client_experiences
add column if not exists link_created_at timestamptz;

alter table public.client_experiences
add column if not exists token_expires_at timestamptz;

alter table public.client_experiences
add column if not exists token_revoked_at timestamptz;

alter table public.client_experiences
add column if not exists experience_modules jsonb
not null default '[]'::jsonb;

alter table public.client_experiences
add column if not exists current_step integer
not null default -1;

alter table public.client_experiences
drop constraint if exists client_experiences_modules_array_check;

alter table public.client_experiences
add constraint client_experiences_modules_array_check
check (
  jsonb_typeof(experience_modules) = 'array'
);

alter table public.client_experiences
drop constraint if exists client_experiences_current_step_check;

alter table public.client_experiences
add constraint client_experiences_current_step_check
check (
  current_step >= -1
  and current_step <= 20
);

create unique index if not exists
client_experiences_appointment_uidx
on public.client_experiences(appointment_id)
where appointment_id is not null;

-- =========================================================
-- TOKEN HASH FORMAT
-- =========================================================

alter table public.client_experiences
drop constraint if exists client_experiences_token_hash_check;

alter table public.client_experiences
add constraint client_experiences_token_hash_check
check (
  token_hash is null
  or token_hash ~ '^[0-9a-f]{64}$'
);

-- =========================================================
-- LINK FIELD CONSISTENCY
-- =========================================================
--
-- Legacy/prototype records may have no secure link at all.
--
-- A secure link must have:
--   hash
--   creation timestamp
--   expiry timestamp
-- =========================================================

alter table public.client_experiences
drop constraint if exists client_experiences_link_fields_check;

alter table public.client_experiences
add constraint client_experiences_link_fields_check
check (
  (
    token_hash is null
    and link_created_at is null
    and token_expires_at is null
    and token_revoked_at is null
  )
  or
  (
    token_hash is not null
    and link_created_at is not null
    and token_expires_at is not null
  )
);

-- =========================================================
-- EXPIRY MUST FOLLOW CREATION
-- =========================================================

alter table public.client_experiences
drop constraint if exists client_experiences_token_expiry_check;

alter table public.client_experiences
add constraint client_experiences_token_expiry_check
check (
  token_expires_at is null
  or link_created_at is null
  or token_expires_at > link_created_at
);

-- =========================================================
-- REVOCATION CANNOT PREDATE CREATION
-- =========================================================

alter table public.client_experiences
drop constraint if exists client_experiences_token_revoked_check;

alter table public.client_experiences
add constraint client_experiences_token_revoked_check
check (
  token_revoked_at is null
  or (
    link_created_at is not null
    and token_revoked_at >= link_created_at
  )
);

-- =========================================================
-- TOKEN UNIQUENESS
-- =========================================================
--
-- Even though collisions from 256-bit random tokens are
-- astronomically unlikely, database uniqueness remains an
-- explicit invariant.
-- =========================================================

create unique index if not exists
client_experiences_token_hash_uidx
on public.client_experiences(token_hash)
where token_hash is not null;

-- =========================================================
-- EXPIRY MAINTENANCE
-- =========================================================

create index if not exists
client_experiences_active_link_expiry_idx
on public.client_experiences(token_expires_at)
where
  token_hash is not null
  and token_revoked_at is null;

-- =========================================================
-- SECURITY MODEL
-- =========================================================
--
-- No anonymous RLS policy is added here.
--
-- Public client-link endpoints will use tightly-scoped
-- server-only code with the Supabase secret client.
--
-- This ensures:
--
--   token possession
--        +
--   server-side token verification
--
-- is required before any public experience data is returned.
--
-- Browser clients never receive:
--
--   token_hash
--   studio_id authorization internals
--   service-role credentials
--
-- =========================================================


-- =========================================================
-- PRIVATE CLIENT EXPERIENCE PHOTO STORAGE
-- =========================================================
--
-- The bucket is private.
--
-- Public client browsers never receive direct bucket access.
-- Upload, listing, deletion and signed previews all flow
-- through token-verified server routes.
--
-- Source images are re-encoded server-side before storage,
-- which strips embedded metadata such as EXIF.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'client-experience-photos',
  'client-experience-photos',
  false,
  10485760,
  array['image/webp']::text[]
)
on conflict (id)
do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create index if not exists
file_assets_experience_kind_idx
on public.file_assets (
  client_experience_id,
  kind,
  created_at
)
where client_experience_id is not null;

commit;
