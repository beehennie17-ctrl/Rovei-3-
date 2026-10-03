# Rovei Backend Phase 1

## Added

- Supabase browser client
- Supabase server client
- server-only service-role client
- Next.js 16 proxy session refresh
- protected professional `/app` area
- password login foundation
- Google OAuth foundation
- OAuth callback
- initial production database schema
- multi-tenant Studio ownership
- Row Level Security foundation

## Database model

Core records:

- profiles
- studios
- studio_members
- studio_settings
- services
- clients
- appointments
- beauty_packs
- beauty_pack_modules
- client_experiences
- client_experience_responses
- visit_memories
- file_assets
- subscriptions
- legal_acceptances
- privacy_requests
- audit_events

## Not yet production-wired

- signup form -> Supabase Auth
- onboarding -> database
- client directory -> database
- schedule -> database
- Beauty Packs -> database
- Studio/settings -> database
- secure public client tokens
- Storage policies / photo upload
- Paddle
- Resend
- ElevenLabs / telephony
- Sentry

## Security rules

- all Studio-owned rows contain a `studio_id`
- RLS is enabled on all application tables
- users can only access Studios they belong to
- subscription mutations are server-only
- audit event mutations are server-only
- service-role key must never reach browser code
