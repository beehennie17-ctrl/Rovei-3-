# Rovei Backend Phase 3 — Frontend Data Switchboard

Phase 3 connects the approved frontend to Rovei's backend without removing prototype mode.

## Selection rule

The frontend asks:

`GET /api/backend/status`

If Supabase is not configured:

- Clients use demo data
- Schedule uses demo/session data
- Beauty Packs use localStorage
- Studio uses onboarding/localStorage

If Supabase is configured:

- Clients use `/api/clients`
- Schedule uses `/api/appointments`
- Beauty Packs use `/api/beauty-packs`
- Studio uses `/api/studio`

## Failure rule

Rovei only uses prototype mode when the backend explicitly reports that Supabase is not configured.

If Supabase is configured but an API request fails, the application should surface the backend error instead of silently switching to browser data.

This prevents hidden divergence between production data and prototype data.

## Timezones

Prototype mode uses the browser IANA timezone.

Cloud mode uses the Studio timezone stored in Supabase.

## Next step

The remaining Phase 3 work replaces direct prototype imports in the UI with this data-source adapter.

## Add Client

The Add Client workflow now uses the same data-source adapter.

Prototype mode:
- keeps the existing browser/session workflow
- prepares the temporary prototype client link

Supabase mode:
- creates the client in Supabase
- creates the initial appointment
- stores appointment time in the Studio timezone
- continues into the existing client-link preview

Secure production client links are intentionally deferred to the next backend phase.

## Signup

Signup now follows the same environment rule.

Prototype mode:
- validates the form
- continues through the existing activation prototype

Supabase mode:
- creates a Supabase Auth user
- stores the user's display name in auth metadata
- supports email-confirmation redirects
- continues to `/activate` when a session is immediately available

If Supabase requires email confirmation, Rovei waits for the user to confirm instead of pretending authentication succeeded.

## Studio bootstrap

The activation screen now ensures that an authenticated Supabase user has a Studio before checkout.

The Studio is built from the onboarding draft and persists:

- Studio name
- services
- theme
- custom primary colour
- client-experience modules
- browser IANA timezone

The bootstrap endpoint remains idempotent for users who already belong to a Studio.

## Auth redirect safety

The auth callback only accepts local relative `next` paths.

External or protocol-relative redirect targets fall back to `/app`.

## Phase 3 boundary

Phase 3 connects the authenticated application frontend to the Rovei data layer.

Still intentionally deferred:

- secure production client-link tokens
- client-experience public submissions
- private photo storage
- Paddle billing
- legal acceptance persistence
- transactional email
