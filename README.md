# Rovei

Rovei is a beauty-industry SaaS focused on **client readiness + client memory** for independent beauty professionals.

This repository is the GitHub/backend starting point. It contains the complete componentized Next.js frontend from the frozen frontend build, plus the exact final approved integrated prototype under `reference/` so the landing-page and final visual polish remain the source of truth during migration.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Validate

```bash
npm run lint
npm run typecheck
npm run build
```

## Repository map

- `src/app/` — Next.js routes
- `src/components/` — product UI by feature
- `src/lib/` — prototype/business helpers
- `src/types/` — shared TypeScript contracts
- `docs/` — architecture, state, design system and backend roadmap
- `reference/Rovei_APPROVED_FINAL_FRONTEND.html` — approved final visual/source-of-truth prototype
- `supabase/` — backend migrations will be added here
- `.github/workflows/ci.yml` — GitHub validation workflow
- `.env.example` — environment variable names only; never commit real secrets

## Backend stack we are planning

Supabase + Paddle + Resend + Sentry, with ElevenLabs and a pluggable telephony provider in a later phase.

See `docs/BACKEND_ROADMAP.md` and `docs/PROGRESS_TRACKER.md` before starting backend work.

## Important

The application is still frontend/prototype-first. Browser storage and demo data are not production persistence. Do not treat current client-link or payment flows as production security boundaries until the backend phases are implemented.
