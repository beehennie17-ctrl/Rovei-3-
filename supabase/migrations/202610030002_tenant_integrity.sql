begin;

-- =========================================================
-- BEAUTY PACK SERVICE CATEGORY
-- =========================================================
-- The approved Rovei frontend assigns every Beauty Pack
-- to a service category. Migration 001 did not yet store it.

alter table public.beauty_packs
add column if not exists service_category text;

update public.beauty_packs
set service_category = 'other'
where service_category is null;

alter table public.beauty_packs
alter column service_category set not null;

alter table public.beauty_packs
drop constraint if exists beauty_packs_service_category_check;

alter table public.beauty_packs
add constraint beauty_packs_service_category_check
check (
  service_category in (
    'lashes',
    'brows',
    'nails',
    'makeup',
    'facials',
    'other'
  )
);

-- =========================================================
-- BEAUTY PACK MODULE ID ALIGNMENT
-- =========================================================
-- Frontend ID:
--   current-photos
--
-- Migration 001 originally used:
--   current_photos

alter table public.beauty_pack_modules
drop constraint if exists beauty_pack_modules_module_type_check;

alter table public.beauty_pack_modules
add constraint beauty_pack_modules_module_type_check
check (
  module_type in (
    'consultation',
    'preferences',
    'inspiration',
    'consent',
    'prep',
    'current-photos'
  )
);

-- =========================================================
-- SAME-STUDIO UNIQUE KEYS
-- =========================================================
-- UUID primary keys are already globally unique.
-- These composite keys additionally let foreign keys prove
-- that linked records belong to the same Studio.

alter table public.services
add constraint services_id_studio_unique
unique (id, studio_id);

alter table public.clients
add constraint clients_id_studio_unique
unique (id, studio_id);

alter table public.appointments
add constraint appointments_id_studio_unique
unique (id, studio_id);

alter table public.beauty_packs
add constraint beauty_packs_id_studio_unique
unique (id, studio_id);

alter table public.client_experiences
add constraint client_experiences_id_studio_unique
unique (id, studio_id);

alter table public.visit_memories
add constraint visit_memories_id_studio_unique
unique (id, studio_id);

-- =========================================================
-- APPOINTMENTS
-- =========================================================
-- A Studio cannot attach an appointment to another Studio's
-- client or service.

alter table public.appointments
add constraint appointments_client_same_studio_fk
foreign key (
  client_id,
  studio_id
)
references public.clients (
  id,
  studio_id
);

alter table public.appointments
add constraint appointments_service_same_studio_fk
foreign key (
  service_id,
  studio_id
)
references public.services (
  id,
  studio_id
);

-- =========================================================
-- BEAUTY PACK MODULES
-- =========================================================

alter table public.beauty_pack_modules
add constraint beauty_pack_modules_pack_same_studio_fk
foreign key (
  beauty_pack_id,
  studio_id
)
references public.beauty_packs (
  id,
  studio_id
);

-- =========================================================
-- CLIENT EXPERIENCES
-- =========================================================

alter table public.client_experiences
add constraint client_experiences_client_same_studio_fk
foreign key (
  client_id,
  studio_id
)
references public.clients (
  id,
  studio_id
);

alter table public.client_experiences
add constraint client_experiences_appointment_same_studio_fk
foreign key (
  appointment_id,
  studio_id
)
references public.appointments (
  id,
  studio_id
);

alter table public.client_experiences
add constraint client_experiences_pack_same_studio_fk
foreign key (
  beauty_pack_id,
  studio_id
)
references public.beauty_packs (
  id,
  studio_id
);

-- =========================================================
-- EXPERIENCE RESPONSES
-- =========================================================

alter table public.client_experience_responses
add constraint responses_experience_same_studio_fk
foreign key (
  client_experience_id,
  studio_id
)
references public.client_experiences (
  id,
  studio_id
);

-- =========================================================
-- VISIT MEMORY
-- =========================================================

alter table public.visit_memories
add constraint visit_memories_client_same_studio_fk
foreign key (
  client_id,
  studio_id
)
references public.clients (
  id,
  studio_id
);

alter table public.visit_memories
add constraint visit_memories_appointment_same_studio_fk
foreign key (
  appointment_id,
  studio_id
)
references public.appointments (
  id,
  studio_id
);

-- =========================================================
-- PRIVATE FILE METADATA
-- =========================================================

alter table public.file_assets
add constraint file_assets_client_same_studio_fk
foreign key (
  client_id,
  studio_id
)
references public.clients (
  id,
  studio_id
);

alter table public.file_assets
add constraint file_assets_experience_same_studio_fk
foreign key (
  client_experience_id,
  studio_id
)
references public.client_experiences (
  id,
  studio_id
);

alter table public.file_assets
add constraint file_assets_visit_same_studio_fk
foreign key (
  visit_memory_id,
  studio_id
)
references public.visit_memories (
  id,
  studio_id
);

-- =========================================================
-- IMPORTANT DELETE BEHAVIOUR
-- =========================================================
--
-- These composite foreign keys intentionally use PostgreSQL's
-- default NO ACTION behaviour.
--
-- Migration 001's original single-column foreign keys retain
-- their existing CASCADE / SET NULL behaviour.
--
-- Example:
--   appointments.service_id may become NULL when a service is
--   deleted. With normal MATCH SIMPLE semantics, the composite
--   same-Studio constraint then remains valid.
--
-- This avoids ever attempting to null studio_id.

commit;
