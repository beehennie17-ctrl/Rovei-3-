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
- creates a Supabase Auth user through the server signup endpoint
- stores the user's display name and validated Studio setup in auth metadata
- supports email-confirmation redirects and resumes Studio setup in the callback
- signs in with email/password through a server endpoint and restores membership from Supabase

If Supabase requires email confirmation, Rovei waits for the user to confirm instead of pretending authentication succeeded.

Sign-out is handled server-side and scoped to the current session. Authenticated session checks use Supabase `getUser`; expired or missing sessions do not authorize protected APIs. Password recovery email and password update endpoints are available, but no password-reset UI has been added.

## Studio bootstrap

The activation screen now ensures that an authenticated Supabase user has a Studio before checkout.

The Studio is built from the onboarding draft and persists:

- Studio name
- services
- theme
- custom primary colour
- client-experience modules
- browser IANA timezone

`202610060001_atomic_studio_bootstrap.sql` adds an authenticated RPC that serializes concurrent bootstrap attempts per user and creates the Studio, settings, services, and owner membership in one transaction. Repeated requests return the existing membership rather than creating duplicate Studios. The migration must be applied to the target Supabase project before this RPC is available.

Returning users hydrate Studio settings from `GET /api/studio`; the browser onboarding draft is only a fallback for an unfinished new signup.

## Auth redirect safety

The auth callback only accepts local relative `next` paths.

External, protocol-relative, and backslash-based redirect targets fall back to `/app`.

## Phase 3 boundary

Phase 3 connects the authenticated application frontend to the Rovei data layer.

Still intentionally deferred:

- secure production client-link tokens
- client-experience public submissions
- private photo storage
- Paddle billing
- legal acceptance persistence
- transactional email
