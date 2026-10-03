# Rovei Backend Roadmap

This repo starts from the frozen frontend v1 codebase plus the approved final integrated HTML reference.

## Production stack

- Next.js + TypeScript — application
- Supabase — PostgreSQL, Auth, Google OAuth, private Storage, Row Level Security
- Paddle — subscriptions / Merchant of Record / billing portal / webhooks
- Resend — transactional email
- Sentry — production error monitoring
- Vercel or Netlify — deployment (choose during deployment phase)
- ElevenLabs — AI voice layer, later phase
- Telephony provider — pluggable; Twilio, Telnyx or Plivo can be selected by country/cost

## Large implementation chunks

### Chunk 1 — Production foundation
Convert/align the approved frontend with the Next.js repository, normalize routes, environment handling, CI, and deployment-safe configuration.

### Chunk 2 — Supabase data model + RLS
Create migrations for studios, memberships, settings, clients, appointments, Beauty Packs, responses, visits, subscriptions, privacy/legal records and audit events. Enforce tenant isolation with RLS.

### Chunk 3 — Authentication
Email/password, email verification, password reset, Google OAuth, sessions, protected app routes and server-side authorization.

### Chunk 4 — Persistent Rovei data
Replace local/session browser persistence for Studio, Schedule, Clients, Beauty Packs and settings with real database reads/writes while preserving UX.

### Chunk 5 — Secure client links + private photos
Database-backed opaque links, hashed tokens, expiry/revocation, rate limits, client submissions, private Storage and signed access.

### Chunk 6 — Paddle billing
Monthly/annual checkout, signed webhook verification, idempotent subscription synchronization, billing portal, cancellation and paid-access enforcement.

### Chunk 7 — Email + privacy/legal backend
Transactional email, versioned Terms acceptance, privacy requests, deletion/export workflow, retention jobs and subprocessor/security surfaces.

### Chunk 8 — Voice/telephony integration
ElevenLabs with a pluggable telephony provider. Do not hard-code Twilio; choose provider/country based on pricing and number availability.

### Chunk 9 — Hardening + tests + deployment
Security headers, rate limits, abuse protection if needed, audit coverage, automated tests, Sentry, CI, production deployment and final security review.
