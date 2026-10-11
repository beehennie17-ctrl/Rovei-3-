# Rovei

Rovei is a beauty-industry SaaS focused on **client readiness + client memory** for independent beauty professionals.

This repository is the GitHub/backend starting point. It contains the complete componentized Next.js frontend from the frozen frontend build, plus the exact final approved integrated prototype under `reference/` so the landing-page and final visual polish remain the source of truth during migration.

## Run locally

```bash
npm install
npm run dev
```

The development server listens on `0.0.0.0:3100`, including in GitHub Codespaces.
Open `http://localhost:3100` locally, or open port `3100` from the Codespaces
Ports panel. Keep the forwarded port private; GitHub may require you to sign in
before opening its forwarded URL. The app does not change port visibility.

Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin used to open the app.
Email confirmation links require this value and will not fall back to an
internal host, `localhost`, or `0.0.0.0`.

Supabase's default email confirmation can return the authenticated session in
the URL fragment. Rovei consumes it in the browser that opens the email link,
removes the fragment from browser history, and then asks the server to restore
the Studio and decide paywall versus dashboard. A session cannot be transferred
to a different browser or device that did not open the link.

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

Paddle is the selected billing provider in the database schema, but checkout
and verified webhook processing are not implemented. The checkout route is a
non-paying placeholder and must not be treated as a successful purchase.
Subscription rows can only be changed by trusted server-side integration. Apply
the new subscription-access migration before relying on RLS to gate direct
Supabase access to client and appointment data.
