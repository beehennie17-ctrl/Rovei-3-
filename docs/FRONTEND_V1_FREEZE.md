# Rovei Frontend V1 Freeze

## Status

**FRONTEND V1 STATUS: FROZEN**  
Freeze context: Prompt 20 final frontend QA, 30 September 2026.

Frontend V1 is the completed prototype/presentation contract for the backend phase. Future work may replace data sources, connect actions, add real authorization/loading/error handling, wire payment, and deploy. It should not casually redesign established product flows or semantics.

## Locked product definitions

- **Rovei:** client readiness + client memory for beauty professionals; not POS, CRM, payment, or booking software.
- **Beauty Packs:** reusable client-experience templates; not products, prepaid packages, memberships, pricing bundles, or aftercare PDFs.
- **Schedule:** client-readiness calendar; not availability/booking/staff/resource scheduling.
- **Client access:** opaque `/client/[token]` experience with no client account/download requirement.
- **Cancellation/rescheduling:** public client experience tells the client to contact the studio directly. Professional Schedule may reflect appointment `CANCELLED` locally/prototypically.

## Implemented route inventory — 24 routes

- `/`
- `/onboarding`
- `/onboarding/services`
- `/onboarding/mood`
- `/onboarding/experience`
- `/preview`
- `/signup`
- `/activate`
- `/activate/checkout`
- `/app`
- `/app/schedule`
- `/app/clients`
- `/app/clients/new`
- `/app/clients/new/link`
- `/app/clients/new/result`
- `/app/clients/new/visit`
- `/app/clients/new/history`
- `/app/clients/[id]`
- `/app/beauty-packs`
- `/app/beauty-packs/new`
- `/app/beauty-packs/[id]`
- `/app/studio`
- `/app/settings`
- `/client/[token]`

`/activate/checkout` is intentionally a development-only payment boundary. It is not a forgotten frontend placeholder and must not fake payment success.

## Design-system rules

Professional Rovei chrome remains:

- Deep Wine `#560F1F`
- Soft Blush `#E7BDC3`
- White `#FFFFFF`
- Dusty Mauve `#D2C5CE`
- Rose Milk `#EECBD1`

No static blue-family styling belongs in Rovei chrome. Client-facing Custom theme values may naturally be blue because they are user-selected. Existing CSS variables, radii, shadows, typography, focus-ring, restrained motion, and reduced-motion behavior should be reused rather than replaced with a second design system.

Client-facing themes remain exactly Blush, Noir, Pearl, Wine, Mocha, Sage, Lilac, Custom. Continue using the current theme resolver and contrast-safe `onPrimary`; do not assume primary text is white.

## Signature Client Card contract

`src/components/clients/client-card.tsx` is the signature card and should not be casually redesigned. Preserve the arched silhouette, theme-coloured upper section/border, restrained shimmer, readable lower rows, and themed footer.

Frozen behavioral contract:

- shared client/service/status inputs;
- existing legacy detail props + dynamic `rows`;
- `theme` and optional `themeOverride`;
- optional `footerLabel`;
- optional `footerInteractive`;
- optional real `onFooterAction`;
- footer renders as a real button only when an actual action exists;
- otherwise it is a non-focusable status surface and does not display an action chevron.

## Status meanings

- `DRAFT`: unfinished client/professional experience workflow.
- `WAITING`: pre-appointment client experience is incomplete.
- `READY`: client completed what is needed before the appointment.
- `COMPLETE`: appointment/visit has happened and the professional visit record is complete.
- `CANCELLED`: Schedule appointment status only; **not** part of global `ClientStatus`.

Do not use COMPLETE for pre-appointment form completion and do not add CANCELLED to global `ClientStatus`.

## Canonical demo-client facts

The deterministic frontend context is anchored by Schedule at `2026-09-30`:

- Emily Carter — Lashes — New client — READY — Today / 2:00 PM.
- Sarah Cole — Brows — Returning — WAITING — Today / 4:30 PM — 2 outstanding.
- Naomi Brooks — Makeup — Returning — READY — Today / 6:00 PM.
- Ava James — Lashes — COMPLETE recent visit — Yesterday (29 Sep 2026).
- Nina Patel — Brows — COMPLETE recent visit — Monday (28 Sep 2026).
- Lucy Hall — Lashes — DRAFT — Not scheduled.

Dashboard, Directory, Client Profile, and Schedule frontend view models must stay conceptually consistent until backend queries replace them.

## Browser storage-key inventory

### localStorage

- `rovei:onboarding-draft` — onboarding + Studio configuration.
- `rovei:beauty-packs-prototype` — reusable Beauty Pack configuration.

### sessionStorage

- `rovei:new-client-draft` — minimal Add Client handoff.
- `rovei:new-client-link` — `{ token, createdAt }` prototype client link.
- `rovei:client-experience-prototype` — structured public-client progress/submission.
- `rovei:client-visit-prototype` — token-scoped visit-history array.
- `rovei:schedule-status-overrides` — appointment-ID cancellation overrides only.

Settings creates no storage key. Schedule Today/Week/date navigation is not persisted.

### IndexedDB

- Database `rovei-prototype`, store `client-experience-photos` — temporary client inspiration/current photo Blobs.
- Database `rovei-visit-prototype`, store `visit-photos` — temporary professional Before/After visit photo Blobs.

Image Blobs/base64 payloads must not be moved into localStorage/sessionStorage. Token/photo records must not duplicate client identity.

## Prototype-only limitations

Frontend V1 still has no production backend, Supabase, professional auth/authorization, RLS, durable clients/appointments/visits, cross-device synchronization, remote photo storage, production-secure token resolution, real subscription state, Stripe completion, booking engine, reminder delivery, SMS/email, or client account system.

Prototype notices should remain truthful and restrained. Browser/session state must never be described as remotely submitted, synced, securely cloud-stored, or production authorized.

## Backend replacement map

- `rovei:onboarding-draft` → professional/studio configuration records.
- `rovei:beauty-packs-prototype` → `beauty_packs` persistence.
- `rovei:new-client-draft` → real client + appointment creation.
- `rovei:new-client-link` → server-issued client-access-token association.
- `rovei:client-experience-prototype` → client submission/appointment response persistence.
- `rovei-prototype` / `client-experience-photos` → Supabase Storage + attachment metadata.
- `rovei:client-visit-prototype` → visit/client-memory persistence.
- `rovei-visit-prototype` / `visit-photos` → Supabase Storage + visit-photo metadata.
- Schedule demo data + `rovei:schedule-status-overrides` → durable appointment queries/status.
- Dashboard/Directory/Profile static demo sources → authenticated backend queries mapped into the current presentation models.

This is an integration map, not a frozen SQL schema.

## Frozen navigation + accessibility behaviors

Professional desktop navigation: Home → Schedule → Clients → Beauty Packs → Studio → Settings.

Mobile: Home → Clients → New → Schedule → Studio. `/app/clients/new/*` belongs to New; client directory/profile routes belong to Clients; Settings remains represented by Studio.

Personal Preview, Client Profile, and Schedule tab systems use semantic tab/tablist/panel relationships, roving tab focus, and ArrowLeft/ArrowRight/Home/End keyboard navigation.

Actual dialogs follow the V1 baseline: `role="dialog"`, `aria-modal="true"`, unique labelled title ID, focus entry/trap, Escape dismissal where appropriate, and focus restoration to the opener. The current dialogs are Beauty Pack deletion and Schedule cancellation.

## Product surfaces that should not be casually redesigned

- onboarding four-step composition and Personal Preview payoff;
- signature Client Card silhouette/semantics;
- operational Dashboard hierarchy;
- Clients Directory and read-only Client Profile information architecture;
- Add Client → client link → public client experience → professional result → visit → history loop;
- Beauty Pack definition/editor architecture;
- Studio editor and single theme system;
- Schedule as readiness visibility rather than booking;
- AppShell desktop/mobile navigation model.

Backend integration should replace data sources and connect real actions behind these boundaries. Material product changes require an explicit product decision rather than incidental backend implementation.

## Prompt 20 QA fixes included in the freeze

- Full keyboard behavior for Schedule, Client Profile, and Personal Preview tab systems.
- Read-only Personal Preview Client Card footer; general ClientCard action guard and read-only chevron removal.
- Beauty Pack delete opener-focus restoration.
- Unique ModalShell title IDs.
- Dead AppShell Help & support control removal.
- Mobile nested Add Client workflow active-navigation correction.
- Removal of unused `PlaceholderPage`, `PublicPlaceholder`, inert generic `Tabs`, `IconButton`, `ThemePreview`, `ThemeSwatch`, obsolete unused `mock-data.ts`, and unused feedback-shell exports (`EmptyState`, `ToastShell`, `DrawerShell`).
- Current-route/dead-link/import/storage/privacy/object-URL/status/demo-fact/no-static-blue audits.

## Remaining runtime/browser QA boundary

The final sandbox could not complete dependency installation. `node_modules` and `package-lock.json` are absent. Therefore real `npm run lint`, dependency-backed `npm run typecheck`, `npm run build`, and live browser QA at 375 / 768 / 1440px remain unresolved here. Requested final screenshots were not fabricated.

Before backend changes, use a normal networked environment to install dependencies and run lint/typecheck/build, then keyboard/mouse/touch/refresh/back-forward/storage/IndexedDB/clipboard/Custom-theme/dialog QA across the frozen flows. Any runtime issue found should be fixed as a defect without reopening V1 product scope.

## Freeze rule

Future backend work may replace data sources, connect actions, add real loading/error states, enforce auth/permissions, add secure storage, and wire payment.

It should **not** casually redesign flows, rename core statuses, redefine Beauty Packs, turn Schedule into booking, replace the Client Card silhouette, create a second theme system, or change the core client experience without a product decision.

**FRONTEND V1 FROZEN.**
