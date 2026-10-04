# Rovei Backend Phase 2 — Application Data Layer

Rovei Backend Phase 2 introduces the authenticated application API layer while preserving the approved prototype frontend.

## Backend Core

Phase 2 includes:

- Zod runtime request validation
- IANA timezone validation
- structured backend errors
- authenticated user context
- server-derived Studio context
- backend configuration status endpoint

The browser does not provide an authoritative Studio ID.

Instead:

authenticated user
→ studio_members
→ studio_id
→ Studio-owned data

## Studio API

Implemented:

- `POST /api/studio/bootstrap`
- `GET /api/studio`
- `PUT /api/studio`

The Studio bootstrap persists:

- Studio identity
- timezone
- theme
- custom primary colour
- service categories
- client-experience modules

## Clients API

Implemented:

- `GET /api/clients`
- `POST /api/clients`

Client creation also creates the initial appointment.

Appointment date/time values are interpreted in the Studio's IANA timezone and stored as UTC timestamps.

## Schedule API

Implemented:

- `GET /api/appointments`
- `PATCH /api/appointments/[id]`

Schedule output converts stored timestamps back into the appointment timezone for display.

## Beauty Packs API

Implemented:

- `GET /api/beauty-packs`
- `POST /api/beauty-packs`
- `GET /api/beauty-packs/[id]`
- `PUT /api/beauty-packs/[id]`
- `DELETE /api/beauty-packs/[id]`

Beauty Packs persist:

- name
- service category
- ordered experience modules

## Tenant Integrity

Migration `202610030002_tenant_integrity.sql` adds database-level same-Studio relationship enforcement.

RLS remains the primary authorization layer.

Composite same-Studio foreign keys provide an additional integrity layer so a Studio-owned record cannot reference another Studio's client, appointment, service, Beauty Pack, experience, visit memory, or file metadata.

## Prototype Compatibility

The approved frontend continues to use the existing prototype/browser data stores for now.

This is intentional.

The next backend phase introduces a data-source adapter:

- Supabase unconfigured → existing prototype data
- Supabase configured → authenticated Rovei APIs

This lets development continue before cloud accounts and production credentials are connected.

## Still Pending

- frontend API adapter
- live signup/account bootstrap
- secure client-link tokens
- public client-experience submission API
- private photo storage
- Paddle billing
- Resend email
- legal acceptance flows
- privacy/export/deletion workflows
- Sentry
- production deployment
- Cloudflare edge/security configuration
