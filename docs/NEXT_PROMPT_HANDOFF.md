# Backend Phase Handoff

## Frontend V1 status

**FRONTEND V1 IS FROZEN.**

Prompt 20 completed final frontend QA, targeted accessibility/interaction fixes, dead-control cleanup, documentation consolidation, and the frontend architecture freeze. Do not treat this file as a request for another frontend feature prompt.

The frozen product is Rovei: **client readiness + client memory for beauty professionals**. Beauty Packs are reusable client-experience templates. Schedule is a readiness calendar, not booking software. The public client experience requires no account/download, and client cancellation/rescheduling remains “contact the studio directly.”

## Suggested backend sequence

1. Establish the GitHub/repository baseline from the frozen ZIP.
2. Configure the Supabase project/environment.
3. Design the Postgres schema around the existing frontend contracts.
4. Add Supabase Auth for professionals.
5. Define RLS/security rules before exposing real client data.
6. Persist real professional + Studio records.
7. Persist clients and appointments.
8. Persist visits/client memory.
9. Persist Beauty Packs.
10. Replace prototype link state with server-issued client-access tokens.
11. Persist client submissions.
12. Replace local photo stores with Supabase Storage + attachment rows for inspiration/current and professional before/after photos.
13. Replace static/prototype readers with real authenticated queries while preserving presentation/view-model contracts.
14. Integrate Stripe Checkout/subscription state.
15. Add activation/paid-route gating.
16. Deploy and run production browser/security/accessibility QA.

This sequence is guidance only; no backend implementation has been started.

## Frozen route inventory

There are **24** current page routes:

`/`, `/onboarding`, `/onboarding/services`, `/onboarding/mood`, `/onboarding/experience`, `/preview`, `/signup`, `/activate`, `/activate/checkout`, `/app`, `/app/schedule`, `/app/clients`, `/app/clients/new`, `/app/clients/new/link`, `/app/clients/new/result`, `/app/clients/new/visit`, `/app/clients/new/history`, `/app/clients/[id]`, `/app/beauty-packs`, `/app/beauty-packs/new`, `/app/beauty-packs/[id]`, `/app/studio`, `/app/settings`, `/client/[token]`.

Do not casually rename/remove routes during backend wiring. `/activate/checkout` is the one deliberate payment-backend boundary, not an accidentally forgotten placeholder.

## Browser prototype → backend replacement map

- `rovei:onboarding-draft` (`localStorage`) → professional/studio configuration in Postgres.
- `rovei:beauty-packs-prototype` (`localStorage`) → `beauty_packs` persistence.
- `rovei:new-client-draft` (`sessionStorage`) → real client + appointment creation.
- `rovei:new-client-link` (`sessionStorage`) → server-issued `client_access_tokens` association.
- `rovei:client-experience-prototype` (`sessionStorage`) → client submission/appointment response records.
- IndexedDB `rovei-prototype` / `client-experience-photos` → Supabase Storage + client-submission attachment rows.
- `rovei:client-visit-prototype` (`sessionStorage`) → visits/client-memory table(s).
- IndexedDB `rovei-visit-prototype` / `visit-photos` → Supabase Storage + visit-photo rows.
- `rovei:schedule-status-overrides` (`sessionStorage`) + schedule demo data → durable appointment query/status in Postgres.
- Static Dashboard/Directory/Profile/Schedule demo data → backend queries normalized into the existing frontend view models.

Do not copy these browser stores into a second frontend state system. Replace their data source behind the frozen UI boundaries.

## Contracts to preserve

- Global `ClientStatus`: `draft | waiting | ready | complete`. `cancelled` remains Schedule appointment-local.
- READY = pre-appointment client experience complete; COMPLETE = appointment/visit complete.
- Existing `ServiceCategoryId`, `ExperienceModuleId`, and `ThemeName` unions remain canonical.
- Client-access URL remains `/client/[opaque-token]`; no PII belongs in URLs.
- Client Card silhouette/theme/row/status/footer contract is frozen. A footer is interactive only when a real `onFooterAction` exists.
- One studio theme system only; continue using `resolveClientTheme()` and `theme.onPrimary`.
- Beauty Packs do not become products/pricing/booking packages.
- Schedule must not become the booking engine without an explicit product decision.
- Public consent remains an acknowledgement, not a fabricated legal-signature system.
- Professional and client photo truthfulness rules remain: render only actual stored files; never fabricate missing thumbnails/counts.

## Navigation/accessibility freeze

Desktop AppShell order: Home → Schedule → Clients → Beauty Packs → Studio → Settings.

Mobile: Home → Clients → New → Schedule → Studio. Nested `/app/clients/new/*` routes belong to New; client directory/profile routes belong to Clients; Settings remains covered by Studio on mobile.

Personal Preview, Client Profile, and Schedule tabs support roving focus plus ArrowLeft/ArrowRight/Home/End. Actual dialogs use labelled modal semantics, focus entry/trap, Escape where appropriate, and opener-focus restoration.

## Runtime validation boundary

The final sandbox still could not complete `npm install --no-audit --no-fund`; it produced no `node_modules` or `package-lock.json`. Therefore real ESLint, Next production build, and live browser QA are still unresolved here. Prompt 20 instead performed the strongest available offline checks: strict shimmed TypeScript, syntax transpilation, route/import/dead-link audits, storage/privacy/security scans, helper/runtime checks, no-blue checks, and Prompt 19 baseline diff/hash verification.

Do **not** interpret this limitation as a successful production build. The first backend/repository step should install dependencies in a normal networked environment and run `npm run lint`, `npm run typecheck`, `npm run build`, then full browser QA at 375 / 768 / 1440px before backend changes are layered on.

See `docs/FRONTEND_V1_FREEZE.md` for the full freeze contract.
