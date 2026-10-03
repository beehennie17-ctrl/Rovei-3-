# Rovei App Architecture

## Folder structure

```text
src/
  app/
    app/                    # Authenticated application routes
      clients/
      schedule/               # Readiness calendar (Today/Week, no booking)
      beauty-packs/
      studio/
      settings/
    onboarding/             # Steps 1–4 implemented
    preview/                # Implemented Personal Studio Preview payoff
    signup/                 # Implemented frontend-only Create Account / Save Studio UX
    activate/               # Activation / Paywall plus development-only checkout boundary
    client/[token]/         # Implemented public prototype client experience
    globals.css
    layout.tsx
  components/
    onboarding/             # Reusable shell/progress plus Steps 1–4 components
    preview/                # Personal Preview composition, view switcher, client/professional previews
    signup/                 # Signup form, route composition, personalized studio snapshot
    activation/             # Activation pricing, studio panel, feature/value explanation
    dashboard/              # Operational /app dashboard sections and empty states
    schedule/               # Readiness calendar, date controls, appointment/status/cancellation UI
    branding/               # Wordmark and theme preview components
    clients/                # Signature ClientCard + Directory + Client Profile components
    layout/                 # Authenticated AppShell + navigation
    ui/                     # Reusable primitives
  lib/
    dashboard-demo-data.ts  # Centralized typed operational dashboard demo data
    schedule-demo-data.ts   # Deterministic readiness-calendar appointments anchored to 2026-09-30
    schedule.ts             # Pure date/week/grouping/readiness/effective-status helpers
    schedule-status-prototype.ts # Session-only cancellation overrides
    client-directory-demo-data.ts # Canonical Clients Directory demo records
    client-directory.ts      # Pure directory search/status filtering helpers
    client-profile-demo-data.ts # Profile-only memory details keyed by canonical directory IDs
    client-profile.ts      # Directory record + profile details normalization
    onboarding-storage.ts   # Temporary browser-only onboarding draft persistence
    service-categories.ts   # Centralized typed Services category data
    experience-options.ts    # Canonical typed pre-appointment module metadata
    experience-recommendations.ts # Service-to-module starting recommendation helper
    preview-model.ts         # Read-only onboarding draft → Personal Preview/signup studio normalization
    signup-validation.ts    # Pure frontend-only first name/email/password validation
    pricing.ts              # Single-plan Monthly/Annual pricing metadata + pure cadence helpers
    colour-utils.ts          # Non-visual hex/luminance/contrast helpers for Custom themes
    theme-options.ts         # Mood labels/descriptions keyed by existing ThemeName values
    theme-resolver.ts        # Preset reuse + derived Custom ClientTheme resolution
    themes.ts
  types/
    index.ts
    onboarding.ts
    dashboard.ts            # DashboardAppointment / ReadinessItem / RecentClientMemory
    schedule.ts             # ScheduleAppointment + appointment-level cancelled status
    clients.ts              # Frontend-only ClientDirectoryRecord + local filter type
    client-profile.ts      # Frontend-only profile/readiness/visit/photo/form/note view models
```

## Component architecture

The application uses four layers:

1. **Design tokens and global utilities** in `src/app/globals.css`.
2. **UI primitives** in `src/components/ui/` that do not know product business logic.
3. **Domain components** such as `ClientCard` in `src/components/clients/`.
4. **Route compositions** in `src/app/` that combine primitives, mock data, and domain components.

The authenticated shell is centralized in `src/app/app/layout.tsx` + `src/components/layout/app-shell.tsx`, so future authenticated screens should not duplicate navigation or page chrome.

## State strategy

There is intentionally no global state library in the foundation. Current state is either:

- route-derived (`usePathname` for active navigation),
- local React state,
- temporary browser-only onboarding draft persistence,
- static component props, or
- imported mock data.

Studio Identity, Services, Mood, and Client Experience share `src/lib/onboarding-storage.ts` using the single `localStorage` key `rovei:onboarding-draft`. The typed `OnboardingDraft` supports `studioName`, `services: ServiceCategoryId[]`, optional `theme: ThemeName`, optional `customPrimary`, and optional `experienceSelections: ExperienceModuleId[]`. The optional Experience field preserves a deliberate semantic distinction: `undefined` means the step has never been configured, while `[]` means the user intentionally deselected everything. Services, Mood, and Experience autosave by merging partial updates so earlier answers are preserved. Reads guard server rendering, invalid JSON, invalid service/module IDs, invalid theme IDs, invalid custom hex values, and storage failures; visual components do not access storage directly. This is temporary frontend persistence only and should later be replaced or reconciled with authenticated backend state. Personal Preview is intentionally read-only with respect to this draft: it calls `readOnboardingDraft()` and derives a normalized preview model without adding fields, clearing data, or persisting its local Client View stage/tab state. Signup also reads this same draft only to build the personalized studio summary; first name, email, password, Terms acceptance, touched/error state, and password visibility remain local React state and are never persisted. Activation similarly reads the draft only through `buildPersonalPreviewModel()` for personalization; Monthly/Annual cadence is local React state only and is never written to the onboarding draft or browser storage. The Clients Directory also uses local React state only for search and status filtering; those controls are intentionally not written to URL params, browser storage, or onboarding state. No global state library is introduced.

## Future Supabase integration

Supabase should enter through a dedicated data-access boundary, not directly inside visual components. Recommended future structure:

```text
src/lib/supabase/
  client.ts
  server.ts
src/data/
  clients.ts
  consultations.ts
  visits.ts
```

Route/server layers should fetch typed data and pass clean props into components. Domain demo/prototype sources should be replaced progressively by real queries without rewriting presentation components. Dashboard-specific view types live in `src/types/dashboard.ts`. The Clients Directory uses its own frontend view model in `src/types/clients.ts` and centralized demo records in `src/lib/client-directory-demo-data.ts`; future backend integration can replace those records without turning the view model into a database schema. Shared client/theme contracts remain in `src/types/`.

## Architectural decisions

- App Router is used for route/layout composition.
- Authenticated UI is namespaced under `/app` and shares one permanent shell.
- `/app` is now the operational Rovei home: a thin route composes reusable Dashboard components for Next Up, Today, Needs Attention, and Recent Client Memory while leaving `AppShell` unchanged.
- Dashboard navigation remains link-only into the implemented client/add-client routes; it introduces no analytics/revenue or independent booking behavior.
- `/app/clients` is now a thin route over `ClientsDirectory`. Search and the exact All/Ready/Waiting/Complete/Draft filters are local-only UI state, with pure intersection logic in `src/lib/client-directory.ts`. Client rows remain semantic links to the implemented read-only `/app/clients/[id]` profile; no edit/delete/bulk CRM behavior is introduced.
- Directory records are intentionally centralized separately from Dashboard demo data for now. Overlapping Emily/Sarah/Naomi facts are kept consistent, while a later backend/data-access layer can normalize the shared source.
- Mobile uses purpose-built bottom navigation rather than compressing the desktop sidebar.
- Client-facing theme presets are separate from the locked Rovei product palette.
- `ClientCard` is prop-driven and theme-ready but deliberately contains no persistence or workflow logic. Existing theme/row props remain supported. Footer semantics are frozen so a button renders only when `footerInteractive` is true **and** a real `onFooterAction` exists; otherwise the themed footer is a non-focusable read-only status surface without an action chevron.
- No generic UI framework is introduced; components are custom to Rovei.
- Motion is CSS-based, restrained, and disabled for reduced-motion preferences.
- Onboarding page files stay thin: reusable shell/progress/preview/step logic lives under `src/components/onboarding/`.
- `/onboarding/services` is implemented as Step 2; it reuses the shared shell/progress, reads the existing studio name, autosaves typed category selections, and routes forward to implemented `/onboarding/mood`.
- `/onboarding/mood` is implemented as Step 3; it reuses the shared shell/progress, reads Studio + Services context, reuses the existing `clientThemes` presets, autosaves Mood/Custom choices, and routes forward to `/onboarding/experience`.
- `/onboarding/experience` is implemented as Step 4; it derives editable starting recommendations from saved service IDs only when `experienceSelections` is absent, autosaves the full typed array after interaction, reuses the saved client theme in its live preview, and routes forward to `/preview`.
- `/preview` is a dedicated payoff layout rather than another onboarding step. `src/lib/preview-model.ts` converts the existing draft to safe read-only display data; missing experience selections reuse the existing recommendation helper, while a saved empty array remains intentionally empty.
- Personal Preview keeps Client View stage/tab state local to React, uses the existing theme resolver for preset/Custom themes, and reuses `ClientCard` for Your View. It never writes configuration. `/signup` implements the frontend-only Save Studio account UX, reuses `buildPersonalPreviewModel()` for its ownership panel, stores no credentials, and routes only frontend-valid submissions to `/activate`. `/activate` reuses the same normalized studio model, keeps billing cadence local, and routes only to the explicit `/activate/checkout` development boundary. The checkout development boundary must later be replaced by backend-created hosted checkout rather than expanded into fake card handling.
- `src/lib/experience-options.ts` owns the six canonical module IDs/metadata, while `src/lib/experience-recommendations.ts` owns service-to-module recommendation logic and stable union ordering outside React.
- Custom theme derivation is isolated in `src/lib/theme-resolver.ts`; preset objects are returned unchanged, while Custom overrides only the signature primary/border and computed `onPrimary`. `src/lib/colour-utils.ts` contains the non-visual six-digit-hex and WCAG-style contrast logic.
- The Rovei onboarding shell does not consume selected client-theme colours; only Mood choice swatches and the dedicated client-facing preview do.
- Services category metadata is centralized in `src/lib/service-categories.ts`; UI components consume IDs/labels/descriptions rather than duplicating category definitions.
- Service cards use native buttons with `aria-pressed`; selection state is local React state hydrated from the centralized draft and autosaved through the storage boundary.

- Activation pricing is centralized in `src/lib/pricing.ts`: Rovei has one product plan with Monthly and Annual cadences, identical included features, and derived annual savings/equivalent-monthly values.
- `/activate/checkout` is intentionally a development-only replacement boundary. Future billing integration should create a checkout session on the backend and redirect to the real payment provider; no fake activation state is modeled in the frontend.

- `/app/clients/[id]` is a thin async dynamic route. It awaits `{ id }`, calls `buildClientProfileModel(id)`, and renders either the domain `ClientProfile` or the in-shell not-found state.
- Client Profile deliberately keeps `ClientDirectoryRecord` as the canonical shared identity/appointment view model and enriches it with separate profile presentation data rather than turning either model into a backend schema.
- Profile tab state is local React state only; it is not persisted and is not encoded in URL query state.

## Add Client frontend draft architecture (Prompt 12)

`/app/clients/new` composes `AddClientPage`, which owns temporary local form/summary state and delegates validation to the pure `src/lib/client-creation.ts` helpers. The five-field form uses existing Rovei UI primitives and the centralized `SERVICE_CATEGORIES` metadata.

`src/lib/new-client-draft.ts` is the only layer allowed to access the temporary `sessionStorage` key `rovei:new-client-draft`. It exposes `readNewClientDraft()`, `writeNewClientDraft()`, and `clearNewClientDraft()`, is guarded for server rendering, validates hydrated data before returning it, and clears malformed stored values. This is explicitly prototype-only transport between `/app/clients/new` and `/app/clients/new/link`; backend client creation must replace it later.

The live summary may read the existing onboarding draft only for optional visual personalization. It never writes onboarding state and does not require onboarding state to function: experience steps fall back to `getRecommendedExperienceModules([service])` and theme falls back through `resolveClientTheme()` to Wine.
## Client Link prototype architecture (Prompt 13)

`/app/clients/new/link` now composes `ClientLinkPage`. It reads the existing `NewClientDraft` through `src/lib/new-client-draft.ts`; the link feature does not add fields to or duplicate that client draft.

`src/lib/client-link-prototype.ts` is the sole owner of the separate `rovei:new-client-link` `sessionStorage` record. Its `ClientLinkPrototype` contract is exactly `{ token: string; createdAt: string }`. Hydration validates exact fields, token format, and ISO timestamp, removing malformed stored state safely.

Prototype token generation is browser-only and uses `crypto.getRandomValues()` with 16 random bytes before base64url encoding and adding the `rv_` prefix. The helper exposes token validation/matching functions so Prompt 14 can distinguish the current same-session prototype token from random input. Strong randomness here does not provide production authorization; a backend must later persist/token-resolve the real client association.

The absolute link is presentation state built from `window.location.origin + "/client/" + token`; no client identity, service, appointment, or responses are encoded into the URL. Copy/share behavior uses native browser APIs only.

Successful Add Client submission performs the one Prompt 12 extension required by this flow: clear existing link prototype state, write the validated new-client draft, then navigate to the link route. The canonical Dashboard/Directory/Profile datasets remain untouched.

## Public Client Experience prototype (Prompt 14)

`src/app/client/[token]/page.tsx` remains a thin async App Router route and passes the route token into `ClientExperiencePage`. The client component validates the token shape and current-session token match **before** reading/displaying `NewClientDraft` identity or appointment data. It does not use `AppShell`.

Structured response state is presentation/prototype state, not a backend schema. `src/types/client-experience.ts` defines `ClientExperiencePrototype`, beauty-preference unions, and token-associated photo records. `src/lib/client-experience-prototype.ts` is the sole sessionStorage boundary for `rovei:client-experience-prototype`; it validates hydrated records, distinguishes current token from stale token data, persists progress, validates module completion, and preserves completed state on reopen.

Photo Blob persistence is deliberately separate. `src/lib/client-experience-photo-store.ts` owns all raw IndexedDB access to database `rovei-prototype` / store `client-experience-photos`. Blob records contain only opaque ID, prototype token, kind (`inspiration` or `current`), file metadata, and Blob. UI receives records through helper functions and renders local object URLs that are revoked when no longer needed. No base64 image payload is placed in sessionStorage or URLs.

The UI is split across `src/components/client-experience/`: shell, unavailable state, welcome, progress, Consultation, Preferences, reusable photo step, acknowledgement/prep, Review, and Complete. The orchestrator owns local screen state and persists meaningful response changes through the centralized helper. Enabled modules are canonicalized from existing `EXPERIENCE_OPTIONS`; if onboarding selections are undefined, existing service recommendations are used, while an intentional empty array is preserved.

Studio personalization reuses `readOnboardingDraft()` and `resolveClientTheme()`. The selected client theme applies only to the public experience; no new theme system exists. `src/lib/client-prep-copy.ts` centralizes short, non-medical prep copy by existing `ServiceCategoryId`.

This architecture is intentionally replaceable: Supabase/Postgres should eventually own client/appointment/response records and token authorization, while Supabase Storage should replace prototype IndexedDB photo persistence.

## Professional client-submission projection (Prompt 15)

Prompt 15 closes the frontend prototype loop without introducing a second response store or pretending a durable client record exists. The professional projection reuses the existing browser contracts exactly:

- `rovei:new-client-draft` through `src/lib/new-client-draft.ts`
- `rovei:new-client-link` through `src/lib/client-link-prototype.ts`
- `rovei:client-experience-prototype` through `src/lib/client-experience-prototype.ts`
- IndexedDB database `rovei-prototype`, object store `client-experience-photos`, through `src/lib/client-experience-photo-store.ts`

`src/lib/client-submission-result.ts` is a pure normalization layer. It merges the validated draft, current link, matching client response, and read-only onboarding studio theme into a presentation-focused `ClientSubmissionResult`. It does not persist or mutate professional state. A completed client experience projects to shared `ClientStatus = "ready"`; an in-progress experience projects to `"waiting"`.

Photo truth is deliberately split between the structured response and Blob storage. `reconcilePrototypePhotos()` follows the structured response photo-ID order, matches only actual token/kind IndexedDB records, and reports missing IDs. Professional UI renders only real matching Blobs and reports missing prototype photos explicitly rather than inventing thumbnails or claiming the structured count is accessible.

The professional result UI lives under `src/components/clients/result/`. `/app/clients/new/result` remains a thin route inside the existing AppShell. The existing link page uses a focused `ClientLinkCompletionStatus` component to read the current response once on mount/revisit and show WAITING or READY; there is no polling or cross-device synchronization claim.

`src/lib/client-experience-labels.ts` centralizes the human labels for finish and appointment-feel values. Prompt 14's public Review and Prompt 15's professional result both reuse the same mapping while preserving stored values.

Backend integration should later replace these prototype readers with authenticated client/appointment/response queries and Storage-backed photos. The current projection must not be mistaken for durable client persistence.


## Prompt 16 visit/history architecture

Prompt 16 adds a separate professional-memory prototype layer without changing the existing client draft/link/response contracts or canonical demo datasets. `src/types/client-visit.ts` defines `PrototypeVisitRecord`, token-scoped `ClientVisitPrototype`, and visit-photo view records. `src/lib/client-visit-prototype.ts` is the only sessionStorage owner for `rovei:client-visit-prototype`; it validates exact fields, token association, service/date/time values, photo IDs, timestamps, and duplicate current-appointment writes.

Professional visit Blobs deliberately use a second IndexedDB database through `src/lib/client-visit-photo-store.ts`: database `rovei-visit-prototype`, store `visit-photos`. Prompt 14's `rovei-prototype` / `client-experience-photos` helper remains unchanged. `src/lib/client-visit.ts` owns pure summary validation, opaque visit-ID generation, current-appointment matching, newest-first ordering, completed-time formatting, and ordered Blob reconciliation.

The professional route sequence is now `/app/clients/new/result` (READY) → `/app/clients/new/visit` → `/app/clients/new/history` (COMPLETE). The READY client response is not rewritten; result/history components derive the broader appointment lifecycle from whether a matching completed visit exists. Route files remain thin and browser-state access stays inside client/domain helpers.


## Beauty Packs architecture (Prompt 17)

Beauty Packs are a separate professional configuration domain, intentionally isolated from the same-session client lifecycle. `src/types/beauty-pack.ts` defines `BeautyPack` and `BeautyPackPrototypeStore`; `src/lib/beauty-pack.ts` owns pure name/module ordering/sorting helpers; and `src/lib/beauty-pack-prototype.ts` is the sole direct owner of Beauty Pack localStorage under `rovei:beauty-packs-prototype`.

The domain reuses `ServiceCategoryId`, `SERVICE_CATEGORIES`, `ExperienceModuleId`, `EXPERIENCE_OPTIONS`, and `getRecommendedExperienceModules()` rather than creating parallel service/module models. Pack module arrays are stored in canonical `EXPERIENCE_OPTIONS` order with no duplicates. Opaque pack IDs come from Web Crypto (`crypto.randomUUID()` with a `getRandomValues()` fallback); `Math.random()` is not used.

Presentation is split across `src/components/beauty-packs/*`: directory/header/list/card/empty-state components, a shared editor/form/module-card system for create and edit, a theme-resolved client preview, explicit delete confirmation, and a not-found state. Route files remain thin. The editor optionally reads `readOnboardingDraft()` only to personalize the miniature client preview; it never changes onboarding or client workflow state.

Beauty Pack → client/appointment linkage is deliberately deferred. When a real backend exists, an appointment/client workflow can reference a persisted `beauty_pack_id`; Prompt 17 does not add that field to `NewClientDraft` or alter Prompt 12–16 contracts.


## Studio management architecture (Prompt 18)

Studio management deliberately reuses onboarding as the frontend source of truth instead of creating parallel settings state. `src/lib/studio-settings.ts` normalizes `readOnboardingDraft()` into a `StudioSettingsState`, canonicalizes services/modules using the existing metadata order, validates the editable fields, compares persisted/editor state for dirty tracking, and persists/verifies all five Studio fields through the existing `updateOnboardingDraft()` + `readOnboardingDraft()` helpers. The `OnboardingDraft` type is unchanged.

`src/components/studio/studio-page.tsx` owns only local editor state. Focused sections reuse generic onboarding controls (`ServiceCard`, `ThemeChoiceCard`, `CustomThemeControl`, `ExperienceOptionCard`) without modifying their contracts. The client-facing `StudioClientPreview` resolves the current theme through `resolveClientTheme()` and honors `theme.onPrimary`; professional Studio chrome is never recoloured by the selected client theme. No direct localStorage access exists in Studio presentation components.

Service recommendation changes are derived from `getRecommendedExperienceModules(currentServices)` and rendered as textual Recommended states. They do not mutate `experienceSelections`; only the explicit Apply recommendations action does. Missing configuration fallbacks are editor-only until the user explicitly saves.

## Settings architecture (Prompt 18)

Settings is read-only/navigational in this frontend phase. `src/components/settings/*` renders the existing Mia Rhodes demo identity, imports `pricing`, `annualSavings`, and `formatUsd` from `src/lib/pricing.ts`, and provides real Links to Studio, Beauty Packs, and Activation. There is no Settings storage/helper because Prompt 18 introduces no Settings persistence or fake account/billing state.


## Schedule / readiness calendar architecture (Prompt 19)

Schedule is intentionally a professional operational projection, not appointment CRUD. `src/types/schedule.ts` defines a frontend `ScheduleAppointment` whose base status reuses `ClientStatus`; only the Schedule presentation adds appointment-level `"cancelled"` through `ScheduleAppointmentStatus`. Global `ClientStatus` remains unchanged.

`src/lib/schedule-demo-data.ts` owns immutable demo appointments and the single `SCHEDULE_DEMO_TODAY = "2026-09-30"` anchor. `src/lib/schedule.ts` provides date-only-safe local parsing/formatting, day/week navigation, Monday-start ranges, chronological sorting/grouping, readiness summaries and effective-status application. React components never mutate the imported demo array.

Manual professional cancellation is the only persisted Schedule interaction. `src/lib/schedule-status-prototype.ts` is the sole owner of `sessionStorage` key `rovei:schedule-status-overrides`; its record stores only known appointment IDs with `status: "cancelled"` plus `updatedAt`. Restore deletes the override rather than replacing the underlying READY/WAITING/DRAFT status. COMPLETE base appointments are not cancellable. Dashboard, Directory, Client Profiles and the public client route are deliberately not synchronized with this frontend-only override.

`src/components/schedule/*` separates page orchestration, Today/Week tabs, period controls, summaries, timeline/day rendering, appointment cards, cancelled-status presentation and the confirmation dialog. The dialog owns keyboard focus trapping, Escape handling and trigger-focus restoration. `/app/schedule/page.tsx` stays thin. AppShell changes are limited to adding Schedule in the required desktop/mobile navigation positions.


## Frontend V1 freeze architecture (Prompt 20)

Frontend V1 is frozen. Prompt 20 did not add a domain; it tightened interaction semantics and removed confidently dead foundation code. The 24 page routes remain App Router compositions over the same domain boundaries. `AppShell` remains the single professional shell; public `/client/[token]` remains outside it.

All tab systems in the frozen product—Personal Preview, Client Profile, and Schedule—use local state with accessible tab roles, roving focus, ArrowLeft/ArrowRight/Home/End keyboard behavior, and linked tab panels. The two actual dialogs—Beauty Pack delete and Schedule cancellation—share the `ModalShell` baseline of `role="dialog"`, `aria-modal`, unique `useId()`-backed labels, focus entry/trapping, Escape dismissal, and opener-focus restoration.

The active mobile navigation mapping is frozen as Home / Clients / New / Schedule / Studio. Nested `/app/clients/new/*` workflow routes belong to New; client directory/profile routes belong to Clients; `/app/settings` remains covered by Studio on mobile. Desktop remains Home / Schedule / Clients / Beauty Packs / Studio / Settings.

Prototype persistence remains centralized in domain helpers; visual components do not call localStorage/sessionStorage/IndexedDB directly. The backend phase should replace these data sources behind the existing presentation contracts rather than create parallel frontend state systems. See `FRONTEND_V1_FREEZE.md` for the exact replacement map and non-redesign rules.
