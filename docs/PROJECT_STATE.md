# Rovei Project State

## Frontend V1 freeze status

**FROZEN — 30 September 2026.** Prompt 20 completed the final frontend QA pass. The next phase is backend integration, not another frontend product feature. See `docs/FRONTEND_V1_FREEZE.md` for the locked route, product, status, storage, Client Card, and replacement contracts.


## What was built

The frontend foundation for the authenticated Rovei application is complete in source form. It includes:

- Next.js App Router route structure.
- Responsive authenticated product shell with desktop sidebar and mobile bottom navigation.
- Readiness Schedule at `/app/schedule` with Today/Week views, deterministic demo dates, and session-only cancellation overrides.
- Locked Rovei brand tokens and typography utilities.
- Reusable UI primitives and layout components.
- Operational `/app` dashboard with Next Up, Today’s Clients, Needs Attention, Recent Client Memory, and reusable first-client/no-attention empty states.
- Clients Directory at `/app/clients`, read-only Client Profile at `/app/clients/[id]`, Add Client at `/app/clients/new`, Client Link Generation at `/app/clients/new/link`, and the public prototype client experience at `/client/[token]`.
- Signature arched `ClientCard` visual foundation with theme-ready props.
- Client-facing theme preset definitions and Studio previews, with explicit `onPrimary` contrast for every theme.
- Studio Identity onboarding Step 1 at `/onboarding`, with live client-facing preview and frontend-only draft persistence.
- Services onboarding Step 2 at `/onboarding/services`, with typed multi-select categories, live ownership preview, and autosaved selections.
- Design / Mood onboarding Step 3 at `/onboarding/mood`, with eight existing client-theme choices, a live themed client preview, and a validated Custom signature-colour option.
- Client Experience onboarding Step 4 at `/onboarding/experience`, with service-based recommended modules, fully editable typed selections, themed live preview, and autosaved intentional choices.
- Personal Studio Preview at `/preview`, with read-only draft normalization, Client View / Your View switching, a lightweight illustrative Emily client flow, and the reused signature Client Card.
- Create Account / Save Studio frontend UX at `/signup`, with local-only credential form state, calm validation, and a personalized theme-resolved studio summary.
- Activation / Paywall frontend UX at `/activate`, with one Rovei. Studio plan, Monthly/Annual local billing selection, personalized studio context, and a development-only secure-checkout boundary at `/activate/checkout`.
- Public client consultation/preferences/photos/consent/prep experience at `/client/[token]`, guarded by the current same-session prototype token and draft.
- Mock data isolated from UI components.
- Reduced-motion and keyboard-focus support.
- Signature Client Card CTA is theme-linked with `theme.primary` / `theme.onPrimary`.
- Reusable button primitives default to `type="button"` to avoid accidental form submission.
- Sidebar background uses the centralized `--sidebar-surface` token.

## What works

Source architecture, routes, components, styling tokens, mock data, and frontend-only states are implemented. Navigation is wired with `next/link`, and the authenticated shell determines active navigation from the current pathname. `/app` is now the real frontend operational home: it greets Mia, routes Add client to `/app/clients/new`, makes Emily Carter the READY Next Up appointment with a five-item readiness summary, shows the typed Today list, isolates Sarah Cole’s outstanding Consultation/Inspiration items in Needs Attention, and keeps recent client memory one tap away. The dashboard is still frontend/mock only; the existing AppShell, mobile bottom navigation, Activation, Signup, and Preview flows are unchanged. `/app/clients` is now the frontend/mock Clients Directory: it searches client name/service immediately, filters by the existing Ready/Waiting/Complete/Draft statuses, combines search + status by intersection, and links each result to the implemented read-only Client Profile without implementing CRUD. `/onboarding` implements Studio Identity: the studio name updates its mini client-experience preview live, Continue stays disabled until the trimmed name has at least two characters, then saves and navigates to `/onboarding/services`. `/onboarding/services` implements Services: selections update a live mini preview, autosave through the centralized draft utility, require at least one category before Continue is enabled, and Continue routes to `/onboarding/mood`. `/onboarding/mood` implements Design / Mood: preset choices reuse `clientThemes`, the client-facing preview changes immediately without recolouring Rovei app chrome, valid choices autosave, and Continue routes to `/onboarding/experience`. `/onboarding/experience` implements Client Experience: recommendations are derived from saved service categories only when the step has never been configured, cards remain fully editable, toggles autosave the full typed selection array, the live preview reuses the saved client theme, and **Preview my studio** routes to `/preview`. `/preview` now implements the onboarding payoff: it reads the same draft without writing configuration, normalizes missing values safely, defaults to Client View, supports an illustrative local-only Emily flow, switches to a professional preview that reuses the signature `ClientCard`, and routes **Save my studio** to `/signup`. `/signup` implements the frontend-only Save Studio account UX: it reuses the normalized preview model for the studio summary, keeps first name/email/password/Terms state local to React, never writes credentials to browser storage, and routes a frontend-valid submit to `/activate`. `/activate` now implements the frontend-only Activation / Paywall experience: Monthly defaults to $129/month, Annual is $1,290/year with a derived $258 saving and $107.50/month equivalent, both cadences include the same product, billing choice remains local React state, and Continue routes only to `/activate/checkout?billing=monthly|annual`. The checkout route is an explicit development-only boundary with no payment inputs and no activation side effects.

## What is mocked

- User profile: Mia Rhodes.
- Dashboard owner/greeting remains Mia Rhodes / Mia.
- Operational dashboard appointments, readiness items, attention items, and recent client memory are centralized in `src/lib/dashboard-demo-data.ts` and typed by `src/types/dashboard.ts`.
- Dashboard client/readiness/status values are illustrative frontend-only data; no appointment/client record is persisted.
- Schedule appointments are centralized in `src/lib/schedule-demo-data.ts` around the deterministic `SCHEDULE_DEMO_TODAY = "2026-09-30"`; cancellation overrides use `sessionStorage` key `rovei:schedule-status-overrides` and do not mutate Dashboard/Directory/Profile data.
- Clients Directory records are centralized separately in `src/lib/client-directory-demo-data.ts` and typed by the frontend-only `ClientDirectoryRecord` contract in `src/types/clients.ts`. Directory search/filter state is local React state only and is not persisted.
- Emily Carter signature Client Card data.
- Studio theme previews.
- Onboarding draft persistence uses browser `localStorage` temporarily under the exact key `rovei:onboarding-draft`; it is frontend-only and is not a backend/account record. The draft currently contains `studioName`, typed `services: ServiceCategoryId[]`, optional `theme: ThemeName`, optional validated `customPrimary`, and optional `experienceSelections: ExperienceModuleId[]`. The experience field intentionally remains optional so `undefined` means “never configured” while a saved `[]` means the user deliberately deselected every module.
- Service categories are centralized in `src/lib/service-categories.ts` with IDs `lashes`, `brows`, `nails`, `makeup`, `facials`, and `other`.
- Mood descriptions are centralized in `src/lib/theme-options.ts`; preset visual values continue to come only from `src/lib/themes.ts`. Custom themes are derived by `src/lib/theme-resolver.ts`, while `src/lib/colour-utils.ts` chooses Custom `onPrimary` from `#FFFFFF` or `#24191D` by comparing WCAG-style contrast ratios.
- Experience modules are centralized in `src/lib/experience-options.ts` using IDs `consultation`, `preferences`, `inspiration`, `consent`, `prep`, and `current-photos`; `src/lib/experience-recommendations.ts` derives a stable union of service-based starting recommendations.
- Personal Preview uses illustrative Emily / Emily Carter data only; no real client is created, stored, submitted, or added to the onboarding draft.
- `src/lib/preview-model.ts` translates the existing draft into read-only preview data, including selected service labels, resolved preset/Custom theme, experience-module rows, and graceful fallbacks.
- Signup first name, email, password, touched/error state, password visibility, and Terms acceptance are local React state only and are never added to `OnboardingDraft` or browser storage.
- Activation pricing metadata is centralized in `src/lib/pricing.ts`. Billing cadence is local UI state only and is carried to the development-only checkout boundary only through the non-sensitive `billing` query parameter.
- Add Client writes only a validated minimal `NewClientDraft` to sessionStorage under `rovei:new-client-draft` on submit. Client Link Generation stores only `{ token, createdAt }` under `rovei:new-client-link`.

- Public Client Experience structured answers/progress use temporary `sessionStorage` under the exact key `rovei:client-experience-prototype`. The record stores the opaque token, copied enabled-module IDs, in-progress/complete status, current step, non-medical consultation/preferences answers, photo IDs/skip choices, acknowledgement flags, and timestamps; it deliberately does not duplicate client identity/contact information.
- Inspiration/current photo Blobs use temporary IndexedDB only through `src/lib/client-experience-photo-store.ts`: database `rovei-prototype`, object store `client-experience-photos`. Records contain token/kind/opaque ID/file metadata/Blob only. Images are not encoded into sessionStorage or URLs.
- The public route reuses the studio onboarding theme through `resolveClientTheme()`. Missing onboarding module configuration derives existing service recommendations; an explicit `experienceSelections: []` remains empty.

## Known issues / environment limitations

The build environment does not have local Next.js/React dependencies installed and DNS access to `registry.npmjs.org` is unavailable. As a result:

- `npm install` could not be completed.
- `npm run lint`, `npm run typecheck`, and `npm run build` cannot execute against the real dependency graph in this sandbox.
- The Next.js app could not be launched, so Playwright/Chromium screenshots of the running app could not be produced. `docs/screenshots/` is reserved and contains only `.gitkeep`; the requested onboarding desktop/mobile screenshots therefore were not fabricated.

Fresh `npm install` attempts during Prompts 6 through 14 also timed out, so dependency-backed lint/type/build validation remains unavailable here. Offline/static checks were rerun after the Public Client Experience was implemented and are recorded below. The requested Personal Preview, Signup, Activation, Dashboard, Clients Directory, Client Profile, Add Client, Client Link, and Public Client Experience screenshots were not generated because the app cannot be launched in this environment; no screenshots were fabricated.

## Intentionally not built

No Supabase, authentication backend, Stripe/payment processing, Twilio, WhatsApp, email sending, production-secure token authorization, remote uploads, booking engine/calendar integration, analytics, AI, inventory, POS, native app, or production persistence is included. The implemented Schedule is a frontend readiness calendar only, not booking software. The professional app implements frontend/mock Add Client, opaque same-session Client Link Generation, and the public client experience, but none of these create a durable client record or remotely stored response. The Clients Directory search/filter experience is frontend-only over centralized demo records. The Activation / Paywall UI and checkout boundary are frontend-only; no card data is collected, no charge occurs, and no active/paid/subscription state exists. Personal Preview and the `/signup` account-creation UX are implemented as frontend-only illustrative/form UI, but no real account is created and the studio is not live. Client Experience is implemented as frontend-only configuration; it does not create real questionnaires, uploads, consent/legal workflows, client records, or portal data. Services remains category-level only, and Mood remains mood/signature-colour customization rather than a full brand editor; service pricing, durations, treatment management, logos, uploads, fonts, and advanced brand controls were intentionally not built.

## Prompt 14 validation notes

- `/client/[token]` route remains thin and does not use `AppShell`.
- Token shape/current-session match and a valid `NewClientDraft` are required before any client name/appointment data is rendered. Invalid/mismatched tokens receive a no-PII unavailable state.
- Prompt 13 token helpers and `NewClientDraft` contracts remain unchanged.
- Structured responses are validated before hydration and only hydrate for the current token; completed responses reopen at Complete.
- Inspiration photo limit: 3; Current photo limit: 2; image MIME required; 10 MB per-file limit.
- Raw IndexedDB calls are centralized in `client-experience-photo-store.ts`; visual components call only helper functions. Object URLs are revoked when previews are replaced/unmounted.
- Consultation remains beauty-focused/non-medical; Preferences use explicit accessible choices; Consent is acknowledgement-only; Prep is service-aware and non-medical.
- Professional Dashboard/Directory/Profile demo datasets remain unchanged.
- No backend/API/Supabase/auth/client account/booking/payment/messaging functionality is present.

## Package manifest

The project manifest currently targets these dependency ranges:

- Next.js: `^16.0.0`
- React / React DOM: `^19.2.0`
- TypeScript: `^5.7.0`
- Tailwind CSS: `^4.1.0`
- Lucide React: `^0.468.0`
- ESLint: `^9.0.0`

Because npm registry access is unavailable in this environment, these ranges were not registry-verified or installed here. The installing environment should resolve and lock exact versions in `package-lock.json`.

## How to run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/onboarding` for Studio Identity, `http://localhost:3000/onboarding/services` for Services, `http://localhost:3000/onboarding/mood` for Design / Mood, `http://localhost:3000/onboarding/experience` for Client Experience setup, `http://localhost:3000/preview` for Personal Preview, `http://localhost:3000/signup` for Create Account / Save Studio, `http://localhost:3000/activate` for Activation / Paywall, `http://localhost:3000/app` for the operational professional dashboard, or `/app/clients/new` → `/app/clients/new/link` → `/client/[generated-token]` for the current same-session Add Client → Link → Public Client Experience prototype.

Before merging, run:

```bash
npm run lint
npm run typecheck
npm run build
```

## Validation performed in this sandbox

- TypeScript/TSX syntax transpile check: **passed** for all Prompt 11 TS/TSX source/config files.
- Offline strict TypeScript check using temporary ambient shims for unavailable third-party packages: **passed** after Prompt 10.
- Required route-file audit: **passed**.
- Required documentation-file audit: **passed**.
- Mock-data separation audit: **passed**.
- Backend/integration package import audit: **passed**.
- Literal/utility blue source audit: **passed**; no blue-family utility was introduced.
- Experience module contract audit: **passed**; all six `ExperienceModuleId` values are centralized and storage hydration filters unknown IDs.
- Service recommendation audit: **passed**; each service matches the specified module mapping, multi-service recommendations use a duplicate-free canonical union, and no-services falls back to Consultation + Preferences.
- Experience draft semantics audit: **passed**; missing `experienceSelections` remains `undefined`, while an intentionally saved empty array hydrates as `[]` and is not replaced by recommendations.
- Experience state merge audit: **passed**; saving selections preserves Studio, Services, Theme, and Custom colour data.
- Preview/theme reuse audit: **passed**; Step 4 resolves the saved client theme through the existing `resolveClientTheme()` and does not recolour the Rovei onboarding shell.
- Personal Preview read-only audit: **passed**; preview source reads `rovei:onboarding-draft` but does not call `updateOnboardingDraft()` or create a second storage key.
- Preview normalization audit: **passed**; missing experience selections derive existing service recommendations, explicit `[]` stays empty, missing theme falls back to Wine, and an essentially empty draft produces the build-your-studio fallback.
- Personal Preview routing audit: **passed**; Edit setup targets `/onboarding/experience` and Save my studio targets the now-implemented frontend-only `/signup` UX.
- ClientCard extension audit: **passed**; optional `themeOverride` and `rows` support Personal Preview while the legacy props/default rows remain in place when the new props are absent.
- Custom preview theme audit: **passed**; Personal Preview resolves Custom through the existing `resolveClientTheme()` and passes the resolved theme into both Client View and the signature Client Card.
- Client theme contract audit: **passed**; all eight presets define `onPrimary` and satisfy `ClientTheme`.
- Light-primary contrast audit: **passed**; Blush uses `#24191D` on `#C98591` (5.88:1) and Pearl uses `#24191D` on `#D8D0CD` (11.22:1), rather than white text.
- Client-facing primary-surface text audit: **passed**; active themed surfaces consume the centralized `onPrimary` value.
- Client Card CTA theme audit: **passed**; CTA uses `theme.primary` / `theme.onPrimary`.
- Button safety audit: **passed**; reusable buttons default to `type="button"`, and standalone raw buttons explicitly use `type="button"`.
- Navigation accessibility audit: **passed**; active `NavItem` exposes `aria-current="page"`.
- Sidebar token audit: **passed**; `#FCF9FA` is centralized as `--sidebar-surface`.
- Studio Identity source audit: **passed**; blank/one-character trimmed values keep Continue disabled, valid values save the trimmed studio name and route to `/onboarding/services`.
- Onboarding draft storage runtime mock: **passed**; SSR access returns safely, invalid JSON is recovered without crashing, and `rovei:onboarding-draft` saves/reads correctly.
- Services onboarding source audit: **passed**; Step 2 uses all six typed category IDs, `aria-pressed` buttons, at-least-one selection gating, Back to `/onboarding`, and Continue to `/onboarding/mood`.
- Services persistence audit: **passed**; toggles autosave `{ services }` through the existing merge utility, preserving `studioName`, and saved valid IDs hydrate on return/refresh.
- Mood onboarding source audit: **passed**; Step 3 uses all eight existing `ThemeName` values, reuses `clientThemes`, exposes accessible `aria-pressed` selection controls, gates Continue on an explicit valid choice, routes Back to `/onboarding/services`, and routes Continue to `/onboarding/experience`.
- Mood persistence audit: **passed**; preset choices autosave `theme`, Custom autosaves `theme: "custom"` plus a validated six-digit `customPrimary`, and partial updates preserve `studioName` and `services`.
- Custom theme resolver audit: **passed**; preset `onPrimary` values remain untouched, Custom derives `primary`/`border` from the chosen colour and selects `#FFFFFF` or `#24191D` using WCAG-style relative luminance/contrast comparison outside presentation components.
- Custom input resilience audit: **passed**; incomplete hex text keeps the last valid preview colour active and disables Continue until the current text is valid.
- App-chrome isolation audit: **passed**; theme values are applied only inside the client-facing Mood preview/theme swatches, while the shared onboarding shell remains on Rovei design tokens.
- Experience route audit: **passed**; `/onboarding/experience` composes the real Step 4 component and routes into the implemented `/preview` payoff without changing Step 4 behavior.
- Onboarding preview audit: **passed**; Studio and Services retain the core Rovei palette, while Mood and Experience apply the selected client-facing theme only inside their preview surfaces.

- Signup validation helper audit: **passed**; first name requires 2–50 trimmed characters, email uses a basic trimmed email format check, and password requires at least 8 characters.
- Signup credential-storage audit: **passed**; `/signup` source contains no `localStorage` / `sessionStorage` access, no `updateOnboardingDraft()` call, no account/auth storage key, and `OnboardingDraft` has no first-name/email/password fields.
- Signup preview reuse audit: **passed**; the right-side studio snapshot consumes `buildPersonalPreviewModel()` and its resolved preset/Custom `model.theme` instead of duplicating theme/service transformation.
- Signup routing audit: **passed**; Back to preview targets `/preview`, valid frontend-only submit targets the implemented `/activate` UX, and the completed signup source remains unchanged from Prompt 7.
- Signup missing-draft audit: **passed**; an essentially empty onboarding draft renders a Build my studio fallback targeting `/onboarding` instead of redirecting or crashing.
- `npm run lint`: **blocked** (`eslint` package unavailable because dependencies cannot be installed).
- `npm run typecheck`: **blocked as a real dependency-backed check** (Next/React type packages unavailable); the offline shimmed project-side check passed.
- `npm run build`: **blocked** (`next` package unavailable because dependencies cannot be installed).
- 375px / 768px / ~1440px live browser QA: **blocked** because the Next app cannot launch without dependencies.
- `docs/screenshots/onboarding-studio-desktop.png` and `docs/screenshots/onboarding-studio-mobile.png`: **not generated** because browser execution is unavailable; no screenshots were fabricated.
- `docs/screenshots/onboarding-services-desktop.png` and `docs/screenshots/onboarding-services-mobile.png`: **not generated** because browser execution is unavailable; no screenshots were fabricated.
- `docs/screenshots/onboarding-mood-wine-desktop.png`, `docs/screenshots/onboarding-mood-blush-desktop.png`, and `docs/screenshots/onboarding-mood-mobile.png`: **not generated** because browser execution is unavailable; no screenshots were fabricated.
- `docs/screenshots/onboarding-experience-desktop.png` and `docs/screenshots/onboarding-experience-mobile.png`: **not generated** because browser execution is unavailable; no screenshots were fabricated.
- `docs/screenshots/personal-preview-client-desktop.png`, `personal-preview-professional-desktop.png`, `personal-preview-client-mobile.png`, and `personal-preview-professional-mobile.png`: **not generated** because browser execution is unavailable; no screenshots were fabricated.
- `docs/screenshots/signup-desktop.png` and `docs/screenshots/signup-mobile.png`: **not generated** because browser execution is unavailable; no screenshots were fabricated.

- Activation pricing-model audit: **passed**; `src/lib/pricing.ts` centralizes the single plan, Monthly $129, Annual $1,290, derived $1,548 twelve-month monthly total, $258 annual saving, and $107.50/month annual equivalent.
- Activation state audit: **passed**; billing cadence exists only as local React state on `/activate` and is carried forward only through the `billing=monthly|annual` query parameter. No billing field was added to `OnboardingDraft`.
- Payment-boundary audit: **passed**; `/activate/checkout` accepts only Monthly/Annual (invalid values display Monthly), contains no card/CVV/expiry inputs, and explicitly states that no payment or activation occurs.
- Activation storage/security audit: **passed**; activation source contains no onboarding writes, local/session billing persistence, fake paid/active/subscription state, Stripe package/API key/session/webhook/payment-intent logic, or route into `/app`.
- Activation missing-draft audit: **passed**; `/activate` renders a Build my studio fallback and does not show pricing for an essentially empty draft.
- Activation screenshot status: **not generated** because the app cannot be launched in this environment; `activation-monthly-desktop.png`, `activation-annual-desktop.png`, and `activation-mobile.png` were not fabricated.
- Professional Dashboard architecture audit: **passed**; `/app/page.tsx` is thin and composes reusable dashboard sections while `AppShell` remains untouched.
- Dashboard demo-data audit: **passed**; appointments/readiness/attention/recent-memory literals are centralized in `src/lib/dashboard-demo-data.ts` with types in `src/types/dashboard.ts`, not scattered through React components.
- Next Up audit: **passed**; Emily Carter is the 2:00 PM Lashes New client, READY, with Consultation/Preferences/Inspiration/Consent/Prep readiness and an Open Client Card link to `/app/clients/emily-carter`.
- Today / Needs Attention audit: **passed**; Today contains Emily READY, Sarah WAITING, and Naomi READY; Sarah’s Consultation + Inspiration photos are isolated as actionable outstanding items linking to `/app/clients/sarah-cole`.
- Recent Client Memory audit: **passed**; Ava James, Nina Patel, and Lucy Hall use client-memory/last-visit language only and link to existing client routes; no financial metrics are present.
- Dashboard empty-state audit: **passed**; reusable first-client and no-attention states exist without introducing a demo/empty toggle.
- Dashboard navigation audit: **passed**; Add client, Open Client Card, client rows, View client, and View all clients target the intended client routes; those destinations were subsequently implemented in later prompts.
- Payment/auth separation audit: **passed**; dashboard source adds no checkout→app path, auth/paid/active state, Supabase, Stripe, or backend package use. Activation, checkout, Signup, and Preview source remain unchanged.
- Dashboard no-analytics/no-blue audit: **passed**; no revenue/analytics/chart UI or static blue-family styling was introduced.
- Dashboard screenshots: **not generated** because the Next app cannot launch in this environment; `dashboard-desktop.png`, `dashboard-tablet.png`, and `dashboard-mobile.png` were not fabricated.

- Clients Directory architecture audit: **passed**; `/app/clients/page.tsx` is thin and composes the client-side directory feature while `AppShell`, Dashboard, ClientCard, Add Client, and Client Profile routes remain untouched.
- Client Directory demo-data audit: **passed**; the six canonical client records live only in `src/lib/client-directory-demo-data.ts` and use the existing shared `ClientStatus` through `src/types/clients.ts`.
- Client Directory filtering runtime audit: **passed**; search is trimmed/case-insensitive across name + primary service, status filtering supports exactly All/Ready/Waiting/Complete/Draft, and combined filtering intersects correctly.
- Client Directory consistency audit: **passed**; Emily (READY · Lashes · 2:00 PM), Sarah (WAITING · Brows · 4:30 PM), and Naomi (READY · Makeup · 6:00 PM) align with Prompt 9 dashboard demo facts.
- Client Directory state/security audit: **passed**; search/status filters are local React state only with no URL, localStorage, onboarding-draft, backend, auth, or payment persistence.
- Client Directory CRM-scope audit: **passed**; no bulk selection, delete, CSV export, campaigns, tags, revenue fields, mass messaging, or other CRM behavior was added.
- Client Directory accessibility/static audit: **passed**; search has a real label and `type="search"`, status controls use `aria-pressed`, result counts/statuses are textual, rows are semantic Links with accessible names, and no nested row actions were introduced.
- Clients Directory screenshots: **not generated** because the Next app cannot launch in this environment; `clients-directory-desktop.png`, `clients-directory-mobile.png`, and `clients-directory-filtered.png` were not fabricated.


## Prompt 11 — Client Profile

- `/app/clients/[id]` now resolves all six canonical Directory IDs through the modern async App Router params signature and renders a read-only Client Profile; unknown IDs render an in-shell Client not found state.
- Shared identity, service, status, visit/appointment facts continue to come from `src/lib/client-directory-demo-data.ts`. Profile-only readiness, preferences, forms, visits, photo placeholders, and studio notes live in `src/lib/client-profile-demo-data.ts` and are merged by `buildClientProfileModel()` in `src/lib/client-profile.ts`.
- The profile exposes exactly Overview, Visits, Photos, Forms, and Notes as local-only accessible tabs. Emily correctly shows a first-visit/no-history state; returning clients have concise demo visit memory. Photo tiles are intentionally non-photographic placeholders and no upload behavior exists.
- `ClientCard` supports `footerLabel`, `footerInteractive`, and an optional real `onFooterAction`. Prompt 20 hardened the semantic guard: the footer renders as a button only when an actual footer action exists; otherwise it is a non-focusable status surface with no action chevron. Client Profile, Result, History, and Personal Preview all render read-only footers without implying a fake action.
- Client Profile is mock/frontend-only and does not add edit/delete actions, contact/medical data, real forms, uploads, note editing, visit creation, backend persistence, auth, or payment behavior.
- Prompt 11 screenshots were not generated because the Next app still cannot launch in this environment; no screenshots were fabricated.

### Prompt 11 validation addendum

- `npm install`: **blocked**; a fresh attempt timed out and dependencies remain unavailable.
- `npm run lint`: **blocked** with `eslint: not found`.
- `npm run typecheck`: **blocked against the real dependency graph** because React/Next/Lucide packages and types are not installed.
- `npm run build`: **blocked** with `next: not found`.
- Offline strict TypeScript project check using temporary third-party ambient shims: **passed** after the final Prompt 11 changes.
- TypeScript/TSX syntax transpilation: **passed for all 107 source TS/TSX files**.
- Client Profile runtime-model audit: **passed**; all six canonical IDs resolve, Emily remains READY/Lashes/Today 2:00 PM with no previous visits, Sarah remains WAITING/Brows/Today 4:30 PM with Consultation + Inspiration outstanding, Lucy remains DRAFT with no scheduled appointment, and unknown IDs resolve to `null`.
- ClientCard regression audit: **passed**; the default label remains `Ready for appointment`, existing callers required no workflow redesign, and Prompt 20 later made the footer semantically read-only unless a real `onFooterAction` is supplied.
- Static scope audit: **passed**; no backend/auth/payment imports, photo uploads, fake human imagery, edit/delete actions, contact/medical expansion, revenue fields, or static blue styling were introduced.
- Baseline preservation audit: **passed**; Dashboard, Clients Directory, Add Client route (then still a placeholder), AppShell/navigation, onboarding, Preview, Signup, Activation, pricing, storage, and theme files remain unchanged from Prompt 10.
- Prompt 11 browser screenshots (`client-profile-emily-desktop.png`, `client-profile-emily-mobile.png`, `client-profile-sarah-waiting.png`, `client-profile-visits.png`) were **not generated** because the Next app cannot launch without installed dependencies; they were not fabricated.

## Prompt 12 — Add Client / temporary client-experience draft

- `/app/clients/new` now implements the frontend-only Add Client workflow with exactly first name, last name, service, appointment date, and appointment time.
- `NewClientDraft` lives in `src/types/client-creation.ts` and contains only `firstName`, `lastName`, `service`, `appointmentDate`, and `appointmentTime`; `service` reuses the existing `ServiceCategoryId` contract.
- The temporary handoff uses **sessionStorage only** through `src/lib/new-client-draft.ts` with the exact key `rovei:new-client-draft`. The helper is SSR-safe, rejects malformed/invalid drafts, and removes corrupt stored data rather than crashing.
- No email, phone, address, birthday, medical data, health history, notes, tokens, links, or other sensitive/free-text client data are stored in the prototype draft.
- Form state is local while editing. A complete validated draft is written only when **Create client experience** is submitted; returning from the link boundary or refreshing in the same tab prepopulates the valid stored draft.
- The live summary reuses `SERVICE_CATEGORIES`, existing experience metadata/recommendations, `readOnboardingDraft()`, and `resolveClientTheme()`. Saved onboarding experience selections are used when explicitly present (including `[]`); otherwise the selected service's existing recommendation set is used. Wine is the theme fallback.
- Prompt 12 originally handed the validated draft to `/app/clients/new/link`; Prompt 13 has since replaced that boundary with the current same-session Client Link Generation experience. Direct access without a valid draft still renders a safe **No client draft found** state.
- Directory, Dashboard, Client Profile demo data are not mutated by Add Client. No permanent client record is created.
- Dependency installation remains unavailable in this sandbox, so real Next.js lint/type/build/browser QA and requested screenshots remain blocked; no screenshots were fabricated.
- Prompt 12 strict offline TypeScript project check with temporary third-party ambient declarations: **passed**.
- Prompt 12 TS/TSX syntax transpilation: **passed across 115 source files**.
- Prompt 12 runtime validation/storage tests: **passed** for name/date/time validation, timezone-safe `12 Oct 2026` formatting, `14:00 → 2:00 PM`, exact-key privacy validation, valid session write/read, corrupt draft clearing, explicit clear, and SSR-safe access.
- Prompt 12 privacy/static audit: **24/24 passed** for the Add Client feature at that prompt boundary; visual components contained no direct `sessionStorage`, the draft used no `localStorage`, no email/phone/medical fields existed, canonical mock datasets were untouched, and route pages were thin. Prompt 13 subsequently added the separate prototype token/link layer without changing the `NewClientDraft` contract.
- Prompt 12 dependency-backed validation remains blocked: `npm install` timed out; `npm run lint` cannot find `eslint`; normal `npm run typecheck` cannot resolve unavailable Next/React/Lucide dependencies; `npm run build` cannot find `next`.
- `docs/screenshots/add-client-desktop.png`, `add-client-mobile.png`, and `add-client-link-boundary.png`: **not generated** because the Next app cannot launch without dependencies; no screenshots were fabricated.
## Prompt 13 — Client Link Generation

- `/app/clients/new/link` now implements the frontend-only Client Link experience using the existing validated `NewClientDraft`.
- Link state is a separate `ClientLinkPrototype` containing only `token` and `createdAt`; it never duplicates client identity, service, appointment, responses, or contact information.
- The exact temporary session key is `rovei:new-client-link`. Only `src/lib/client-link-prototype.ts` accesses this link record in `sessionStorage`.
- Prototype tokens are generated client-side with `crypto.getRandomValues()` using 16 random bytes (128 bits) and a stable `rv_` URL-safe prefix. This is cryptographically random prototype state, not a production-secure access system.
- The professional link URL is derived from the current browser origin and has the form `/client/[opaque-token]`; no client data is encoded in its path/query.
- A valid existing link record is reused across same-tab refresh/navigation. Successful Add Client resubmission clears the old link state before writing the new draft, causing the next link-screen load to create a fresh token.
- Copy uses the native Clipboard API with honest failure feedback and selectable URL fallback. Native Web Share is shown only when supported; there are no SMS, WhatsApp, email, or other messaging integrations.
- Prompt 13 left `/client/[token]` as the handoff boundary; Prompt 14 now implements the current frontend Public Client Experience there. Backend token resolution, durable client records, remote status tracking, and production authorization still do not exist.
- The prototype notice on the link screen must be removed/reworked before production.
- Dependency-backed Next.js validation/screenshots remain blocked in this sandbox if packages cannot be installed; no runtime screenshots should be fabricated.

- Prompt 13 offline validation: full TS/TSX syntax transpilation passed across 119 source files.
- Prompt 13 offline TypeScript project check with temporary ambient declarations: passed.
- Prompt 13 runtime prototype-link tests: passed for token format, exact-record validation, same-session reuse, corrupt-state clearing, current-token matching, explicit clearing, and fresh-token creation.
- Prompt 13 static security/privacy audit: passed; Web Crypto is used, `Math.random`/`localStorage` are absent from the new link feature, the URL contains no client PII, no tracking/backend/messaging integration was added, and no link is generated without a valid `NewClientDraft`.
- Prompt 13 preservation audit (historical boundary): ClientCard, AppShell, canonical Directory/Dashboard/Profile demo data, and Prompt 12 draft type/validation/form/summary remained unchanged. Prompt 14 intentionally replaces only the previously reserved `/client/[token]` route while preserving the Prompt 13 token/link helpers.
- Prompt 13 dependency-backed validation remains blocked: `npm install` timed out; `npm run lint` cannot find `eslint`; normal `npm run typecheck` lacks installed Next/React types; `npm run build` cannot find `next`.
- `docs/screenshots/client-link-desktop.png`, `client-link-copied.png`, and `client-link-mobile.png`: not generated because the Next app cannot launch without dependencies; no screenshots were fabricated.
## Prompt 14 — Public Client Experience

- `/client/[token]` now implements the public, mobile-first Rovei client experience without professional `AppShell` chrome.
- Route access is fail-closed in the frontend prototype: token shape must be valid, the token must match `rovei:new-client-link` in the current session, and `rovei:new-client-draft` must hydrate as a valid `NewClientDraft` before client identity or appointment details render.
- Enabled modules come from the existing onboarding `experienceSelections` when explicitly present; `[]` stays intentionally empty; `undefined` derives the existing recommendation set for the draft service. Canonical ordering comes from `EXPERIENCE_OPTIONS`.
- The flow is Welcome → configured modules → Review → Complete. Module validation blocks Continue only for enabled modules. A completed same-session response reopens directly at Complete.
- Structured response/progress state uses the exact session key `rovei:client-experience-prototype` through `src/lib/client-experience-prototype.ts`. It contains no duplicated client identity, contact information, medical data, or URL-embedded answers.
- Consultation is a required beauty-goal textarea (500 character max). Preferences require explicit finish and appointment-feel choices. Consent is acknowledgement-only and is not a signature/legal-sufficiency system. Prep copy is centralized by service and remains non-medical.
- Inspiration uses the reusable photo step with up to 3 `image/*` files; Current photos uses the same component with up to 2. Each file is capped at 10 MB, and either at least one photo or an explicit no-photo choice is required.
- Photo Blob persistence uses IndexedDB database `rovei-prototype`, object store `client-experience-photos`; structured state stores only opaque photo IDs. Local object URLs are used for thumbnails and revoked by the component. No base64 photo data enters sessionStorage or the URL.
- Welcome/Complete reschedule language tells the client to contact the studio/professional directly; no booking/cancel/reschedule engine exists.
- The public experience reuses `resolveClientTheme()` including Custom `onPrimary`; no new theme system or static Rovei-blue styling was introduced.
- Professional Dashboard, Clients Directory, Client Profile demo data, ClientCard, AppShell, and Prompt 13 professional link UI remain unchanged. Prompt 15 is responsible for projecting this prototype completion back onto the professional side.
- The development footer **Preview mode · Your responses currently stay in this browser.** and the consent prototype wording must be reviewed/removed before production backend/legal integration.
- Supabase/Postgres/Storage should replace sessionStorage/IndexedDB prototype persistence; production token authorization must be server-backed.


### Prompt 14 validation addendum

- `npm install`: **blocked**; a fresh attempt timed out and no `node_modules` or `package-lock.json` artifact was left behind.
- `npm run lint`: **blocked** with `eslint: not found`.
- `npm run typecheck`: **blocked against the real dependency graph** because Next/React/Lucide packages and types are not installed.
- `npm run build`: **blocked** with `next: not found`.
- Prompt 14 strict TypeScript graph check with temporary ambient declarations for unavailable third-party packages: **passed**.
- TypeScript/TSX syntax transpilation: **passed across 135 source/config files**.
- Client experience response runtime tests: **20/20 passed** for initial/partial/completed records, current-token isolation, corrupt-state clearing, canonical module order, photo-count limits, empty-module completion, and completed-record validation.
- Prototype photo ID Web Crypto runtime check: **20/20 generated IDs passed**.
- Prompt 14 privacy/architecture/static audit: **43/43 passed**, including token-before-draft validation, no AppShell, centralized session/IndexedDB access, no base64 photo persistence, no URL/client PII, theme/recommendation reuse, no medical/booking/backend additions, and protected professional-data hashes.
- Protected Prompt 13 token/link contracts and professional Dashboard/Directory/Profile/ClientCard/AppShell sources remain byte-for-byte unchanged from the Prompt 13 input project.
- Real browser/IndexedDB/Clipboard/Web Share QA remains unverified because Next.js cannot launch in this sandbox. The requested `client-welcome-mobile.png`, `client-consultation-mobile.png`, `client-photos-mobile.png`, `client-review-mobile.png`, `client-complete-mobile.png`, and `client-experience-desktop.png` screenshots were **not generated** and were not fabricated.

## Prompt 15 — Client Submission → Professional Result

- `/app/clients/new/link` now projects the current same-session client response as **WAITING** until `ClientExperiencePrototype.status === "complete"`, then as **READY** with an **Open Client Card** action to `/app/clients/new/result`.
- `/app/clients/new/result` is implemented inside the existing professional AppShell. It requires a valid `NewClientDraft`, current `ClientLinkPrototype`, matching `ClientExperiencePrototype`, and current token before rendering client result data.
- `src/lib/client-submission-result.ts` builds a presentation-only professional projection from the existing draft/link/response plus studio theme configuration. It maps completed pre-appointment responses to shared `ClientStatus = "ready"` and in-progress responses to `"waiting"`; it does not write those states into canonical app data.
- The result reuses the signature `ClientCard` without API changes. It passes the resolved studio theme, actual enabled-module rows, a non-interactive footer, and status-aware text.
- Consultation text is displayed exactly as submitted. Preference IDs reuse the shared labels in `src/lib/client-experience-labels.ts`, which is also used by the public client Review screen so the two sides cannot drift.
- Professional photo results rehydrate actual Blob records through the existing `client-experience-photo-store.ts` helper. Structured photo IDs are reconciled against real IndexedDB records in stored selection order; missing Blobs are never fabricated or counted as accessible photos.
- If the current result is still in progress, `/app/clients/new/result` shows only trustworthy progress (`Completed N of M steps`) and does not expose partial answers as final. Missing required prototype state shows a safe **No client result available** state.
- This remains a same-browser/session frontend projection only. No remote submission, live tracking, durable client record, Directory/Dashboard/Profile insertion, Supabase, auth, or backend API was added.
- Canonical `client-directory-demo-data.ts`, `dashboard-demo-data.ts`, and `client-profile-demo-data.ts` remain unchanged.

### Prompt 15 validation addendum

- Dependency-backed install/runtime validation remains unavailable in this sandbox; a fresh `npm install` attempt timed out and the real Next/React/Lucide dependency graph is still not installed.
- The Prompt 15 TypeScript graph passes a strict `tsc` check using temporary ambient declarations for the unavailable framework packages.
- Professional result projection, photo reconciliation, WAITING/READY mapping, unavailable-state gating, and canonical-data preservation are covered by offline/static checks.
- Requested Prompt 15 screenshots were not fabricated because the Next app cannot be launched here.

### Prompt 15 final validation results

- `npm install --no-audit --no-fund`: **blocked**; timed out again, with no `node_modules` or `package-lock.json` left behind.
- `npm run lint`: **blocked** with `eslint: not found`.
- `npm run typecheck`: **blocked against the real dependency graph** because installed Next/React/Lucide packages/types are unavailable.
- `npm run build`: **blocked** with `next: not found`.
- Prompt 15 strict TypeScript dependency graph with temporary ambient declarations: **passed**.
- Project TypeScript/TSX syntax transpilation: **147/147 passed**.
- Actual `client-submission-result.ts` runtime projection/reconciliation checks: **20/20 passed**.
- Prompt 15 static/privacy/architecture checks: **50/50 passed**.
- Canonical Dashboard/Directory/Profile demo data, ClientCard, AppShell, Prompt 13 token helper, Prompt 14 response helper, and Prompt 14 photo store were hash-compared against the uploaded Prompt 14 baseline and remain unchanged.
- Live screenshots (`client-result-ready-desktop.png`, `client-result-ready-mobile.png`, `client-result-photos.png`, `client-link-ready.png`) were **not generated** because the Next app cannot run without its dependencies; they were not fabricated.


## Prompt 16 — Visit + Client History

- `/app/clients/new/visit` now records the current READY prototype appointment inside the existing AppShell. Access requires a valid `NewClientDraft`, current `ClientLinkPrototype`, matching completed `ClientExperiencePrototype`, and no existing completed visit for the same service/date/time.
- Visit metadata uses the exact session key `rovei:client-visit-prototype` through `src/lib/client-visit-prototype.ts`. `ClientVisitPrototype` is token-scoped and stores a `visits` array so the prototype contract already reflects future multi-visit client memory without exposing a generic Add Visit UI.
- Each `PrototypeVisitRecord` stores only opaque visit ID, service ID, appointment date/time, trimmed professional summary, Before/After photo IDs, and `completedAt`. It does not duplicate client identity, contact details, consultation answers, or preferences.
- Visit summaries are required, trimmed, 2–1000 characters, and remain non-medical beauty-service memory. Client consultation/preferences shown beside the form are read-only.
- Professional Before/After photos are optional. They are staged locally while editing and written only on successful completion through `src/lib/client-visit-photo-store.ts`, using the separate IndexedDB database `rovei-visit-prototype` and object store `visit-photos`. This intentionally avoids any version/schema risk to Prompt 14's `rovei-prototype` / `client-experience-photos` store.
- Before and After each accept at most 3 `image/*` files, 10 MB maximum per file. Blob records contain only photo ID, token, visit ID, kind, file metadata, and Blob; no client identity or appointment details are duplicated into photo records.
- Completing a visit stores all selected Blobs, appends one validated visit, and routes to `/app/clients/new/history`. If persistence fails, the page does not navigate and performs best-effort cleanup of staged visit-photo records.
- Duplicate current-appointment visits are prevented both when the visit route hydrates and when `appendCompletedVisit()` writes. Reopening `/app/clients/new/visit` after completion shows **This visit is already complete** with History/Result navigation.
- `/app/clients/new/result` now derives an appointment-level effective status: the completed client experience still projects **READY**, but a matching completed visit projects the professional appointment as **COMPLETE**. Before the visit it shows **Record visit**; afterward it shows **View history**. The underlying Prompt 14/15 response remains unchanged.
- `/app/clients/new/history` is read-only. It reuses the signature Client Card with status `complete`, footer **Visit complete**, resolved studio theme, and non-interactive footer. Visit records render newest-first with exact professional summary and actual Before/After local Blob thumbnails.
- Visit-photo reconciliation preserves stored ID order and renders only actual matching IndexedDB Blob records. Missing referenced Blobs produce a restrained prototype notice and are never fabricated or counted as available.
- Canonical Dashboard, Directory, and static Client Profile demo datasets remain unchanged; the temporary prototype client is still not inserted into those datasets.
- The full visit/history flow remains same-browser/session-only. There is no Supabase, backend API, auth, remote photo storage, durable client record, cross-device sync, booking/calendar system, visit editing/deletion, or generic new-visit workflow.


### Prompt 16 validation addendum

- `npm install --no-audit --no-fund`: **blocked**; timed out again and left no `node_modules` or `package-lock.json` artifact.
- `npm run lint`: **blocked** with `eslint: not found`.
- `npm run typecheck`: **blocked against the real dependency graph** because Next/React/Lucide packages/types are not installed.
- `npm run build`: **blocked** with `next: not found`.
- Prompt 16 strict TypeScript graph check for the Visit, History, and updated Result routes using temporary ambient declarations: **passed**.
- TypeScript/TSX syntax transpilation: **164/164 source/config files passed** with zero syntax diagnostics.
- Visit/session/runtime helper suite: **20/20 passed**, covering exact key, Web Crypto IDs, summary bounds, exact record validation, token isolation, visit-array persistence, duplicate current-appointment prevention, newest-first ordering, corrupt-state clearing, and ordered missing-Blob reconciliation.
- Visit-photo Web Crypto check: **20/20 IDs unique and valid**; database/store constants are exactly `rovei-visit-prototype` / `visit-photos`.
- Prompt 16 privacy/architecture/static audit: **40/40 passed**, including centralized sessionStorage/IndexedDB access, optional-photo limits, no `Math.random`, no base64 photo persistence, no backend/auth/booking additions, no visit editing/deletion, thin route files, READY → COMPLETE presentation lifecycle, ClientCard reuse, and no static blue styling.
- Protected canonical files (`client-directory-demo-data.ts`, `dashboard-demo-data.ts`, `client-profile-demo-data.ts`) plus Prompt 14 client-photo storage, Prompt 15 projection helpers, ClientCard, and AppShell hash-match the uploaded Prompt 15 baseline.
- The project now contains **21 page routes**, including `/app/clients/new/visit` and `/app/clients/new/history`.
- Live screenshots (`record-visit-desktop.png`, `record-visit-mobile.png`, `client-history-desktop.png`, `client-history-photos.png`, `client-result-complete.png`) were **not generated** because the Next app cannot run without installed dependencies; no screenshots were fabricated.


## Prompt 17 — Beauty Packs

Beauty Pack management is now implemented at `/app/beauty-packs`, `/app/beauty-packs/new`, and `/app/beauty-packs/[id]`. The locked product definition is **reusable client-experience templates**: each pack has a professional-facing name, one existing `ServiceCategoryId`, and one or more existing `ExperienceModuleId` values. The obsolete aftercare-only placeholder definition has been removed. Beauty Packs have no pricing, duration, stock, booking availability, payment, product, membership, or aftercare-document model.

Prototype configuration persists under the exact localStorage key `rovei:beauty-packs-prototype` through `src/lib/beauty-pack-prototype.ts` only. This deliberately differs from client/session prototype data because Beauty Pack metadata is non-sensitive professional configuration and is expected to survive a browser restart. Hydration validates exact fields, opaque Web Crypto IDs, valid service/module IDs, canonical module order, timestamps, and unique pack IDs; corrupt state is ignored/removed safely.

Create mode seeds the current service's existing `getRecommendedExperienceModules()` result until the professional manually customizes module selection. After customization, service changes update only the visible **Recommended** badges and do not silently re-enable modules; **Apply recommendations** is the explicit reset. A valid pack requires a trimmed 2–60 character name, a service, and at least one module. Edit preserves `id` and `createdAt`, changes `updatedAt`, supports restrained Saved feedback, and deletion requires explicit modal confirmation.

The client-facing Beauty Pack preview reads the existing onboarding studio identity/theme, resolves Custom themes through `resolveClientTheme()`, and renders only the current selected modules using canonical `EXPERIENCE_OPTIONS` labels. Professional editor chrome remains the locked Rovei palette. Beauty Packs are **not** connected to `NewClientDraft`, Client Link, Public Client Experience, Professional Result, Visit, or History. Future backend integration may attach a `beauty_pack_id` to real client/appointment records without rewriting the completed Prompt 12–16 prototype contracts.

Prompt 18 should build Studio + Settings while preserving Beauty Pack storage/types/components and the completed client lifecycle.

## Prompt 17 validation boundary

Dependency-backed execution is still unavailable in this sandbox. A fresh `npm install --no-audit --no-fund` attempt timed out without producing an install; `npm run lint` therefore exits with `eslint: not found`, `npm run build` exits with `next: not found`, and the normal project typecheck cannot resolve the absent Next/React/Lucide dependencies. Prompt 17 nevertheless passes a strict Beauty Pack dependency-graph TypeScript check using temporary framework declarations, 180-file TS/TSX syntax transpilation, 30/30 Beauty Pack runtime storage/validation checks, 52/52 static architecture/privacy checks, two SSR storage-safety checks, and 55/55 protected Prompt 12–16/core-file hash checks. Real 375/768/1440 browser QA and the requested Beauty Pack screenshots remain unverified and were not fabricated.


## Prompt 18 — Studio + Settings implemented

`/app/studio` is now the professional editor for the same configuration originally created during onboarding. It reuses the exact `rovei:onboarding-draft` key and unchanged `OnboardingDraft` contract; no `rovei:studio*` key exists. The page hydrates saved identity/services/theme/Custom colour/client-experience modules, keeps edits local, previews them live, tracks dirty state, supports **Discard changes**, and persists only on explicit **Save studio changes** through `updateOnboardingDraft()`. `src/lib/studio-settings.ts` validates/normalizes the editor state and verifies the written values by reading the shared draft back before the UI reports **Saved**.

Studio validation requires a trimmed 2–60 character name, at least one existing `ServiceCategoryId`, a valid existing `ThemeName`, a valid `#RRGGBB` colour when Custom is selected, and at least one existing `ExperienceModuleId`. Missing experience configuration receives an unsaved recommendation baseline; recommendations update with selected services but never overwrite the current professional selection unless **Apply recommendations** is explicitly used. Dormant valid Custom colour is preserved when the professional temporarily uses a preset theme.

The live Studio preview uses the editor's current values and the existing `resolveClientTheme()` / contrast-safe `onPrimary` behavior. Only that client-facing preview receives studio theme colours; the professional editor stays on Rovei chrome. Saving Studio never deletes or rewrites Beauty Packs and does not migrate/alter completed Prompt 12–16 prototype client response/result/visit state.

`/app/settings` is also implemented and remains intentionally small. Account is read-only (`Mia Rhodes`, `Studio owner`) until Auth exists. Plan & billing imports the centralized `src/lib/pricing.ts` values and clearly shows **Preview mode · Not activated**; no active subscription or billing-management claim exists. Workspace shortcuts link only to `/app/studio`, `/app/beauty-packs`, and `/activate`. Settings adds no localStorage/sessionStorage key and exposes no fake password/email/notification/security controls.

Prompt 19 should implement Schedule / Calendar while preserving Studio's shared onboarding-draft contract, Beauty Packs, the complete client lifecycle, Settings, pricing, AppShell, and existing navigation conventions.

## Prompt 18 validation boundary

The sandbox still cannot install the project dependencies: `npm install --no-audit --no-fund` timed out and left no `node_modules` or lockfile. As a result, `npm run lint` is blocked by `eslint: not found`, normal `npm run typecheck` stops on missing Next/React/Lucide packages, and `npm run build` is blocked by `next: not found`. The Prompt 18 Studio/Settings dependency graph passes strict TypeScript checking with temporary external-package declarations; all 191 TS/TSX source files pass syntax transpilation; Studio normalization/save/readback runtime tests pass 21/21; Prompt 18 static storage/architecture checks pass 44/44; and protected Beauty Pack/client/AppShell/pricing/onboarding contracts match the Prompt 17 baseline. Real 375/768/1440 browser, Custom-theme visual, keyboard, and cross-route Beauty Pack preview QA remain required in a dependency-enabled environment. No screenshots were fabricated.


## Prompt 19 — Schedule / Readiness Calendar implemented

- `/app/schedule` is now the professional readiness calendar. It defaults to **Today** on the deterministic anchor date `2026-09-30`, with local-only Today/Week switching and previous/next period navigation.
- `src/types/schedule.ts` keeps appointment cancellation separate from global `ClientStatus`: `ScheduleAppointmentStatus = ClientStatus | "cancelled"`. Base appointments remain immutable frontend presentation data.
- `src/lib/schedule-demo-data.ts` centralizes Emily Carter (READY · Lashes · 2:00 PM), Sarah Cole (WAITING · Brows · 4:30 PM), Naomi Brooks (READY · Makeup · 6:00 PM), Nina Patel (COMPLETE · Monday), and Ava James (COMPLETE · Tuesday). Lucy Hall remains unscheduled, matching the canonical Directory/Profile contract.
- `src/lib/schedule.ts` owns date-only-safe parsing/formatting, day/week navigation, Monday-start week calculation, chronological sorting/grouping, readiness summaries, and effective-status projection. No date library was added.
- Professional cancellation is a Schedule-only frontend override under the exact `sessionStorage` key `rovei:schedule-status-overrides`, centralized in `src/lib/schedule-status-prototype.ts`. Override records store only appointment ID + `cancelled`; restore removes the override so the immutable base READY/WAITING/DRAFT state returns. COMPLETE appointments cannot be cancelled.
- The cancellation dialog traps focus, closes on Escape, and returns focus to the original **Mark cancelled** trigger after close/cancel/confirm.
- AppShell desktop navigation is now Home → Schedule → Clients → Beauty Packs → Studio → Settings. Mobile is exactly Home → Clients → New → Schedule → Studio with five columns; Studio continues to cover Settings on mobile.
- Schedule never reads onboarding/Studio theme or Beauty Pack data and does not mutate Dashboard, Directory, Client Profiles, or the public client route. Client-side reschedule/cancellation wording remains “contact the studio directly.”
- This remains same-browser/session-only prototype state. Backend appointment records will later replace Schedule demo data/overrides; there is no booking creation, availability, calendar sync, reminder, payment, or client cancellation workflow.

### Prompt 19 validation boundary

Dependency-backed Next.js execution remains unavailable because a fresh `npm install --no-audit --no-fund` timed out without creating `node_modules` or a lockfile. Real lint/build/browser QA therefore remain blocked. Prompt 19 passes the strict shimmed TypeScript project check, 209/209 TS/TSX syntax transpilation, 26/26 Schedule runtime/storage checks, 49/49 static architecture/accessibility/storage checks, and 202/202 protected baseline hashes. The project now has 24 `page.tsx` routes. Requested Schedule screenshots were not fabricated.


## Prompt 20 — Final frontend QA + freeze

Prompt 20 introduced no product feature. It audited the integrated 24-route frontend and made only verified freeze-quality fixes:

- Schedule Today/Week tabs, Client Profile tabs, and Personal Preview Client/Your View tabs now use roving `tabIndex` plus ArrowLeft/ArrowRight/Home/End keyboard selection.
- Personal Preview explicitly renders the signature Client Card footer as read-only. `ClientCard` itself now renders a focusable footer button only when a real `onFooterAction` exists; non-interactive footers retain the themed status surface but no misleading chevron.
- Beauty Pack delete now restores focus to the opening Delete Beauty Pack control after Keep/Delete/Escape, matching the Schedule cancellation dialog standard.
- `ModalShell` now uses `useId()` for unique `aria-labelledby` title IDs.
- The dead AppShell Help & support button was removed rather than inventing a fake support destination.
- Mobile AppShell active state now treats `/app/clients/new/*` as the New workflow and excludes those routes from Clients, so nested creation/link/result/visit/history routes have one sensible active mobile destination.
- Unused foundation `PlaceholderPage`, `PublicPlaceholder`, generic inert `Tabs`, `IconButton`, `ThemePreview`, `ThemeSwatch`, stale `src/lib/mock-data.ts`, and unused feedback-shell exports (`EmptyState`, `ToastShell`, `DrawerShell`) were removed after confirming they had no runtime imports.
- Static route/link, storage/privacy, object-URL, status/data-consistency, no-blue, import-resolution, and dead-control audits were performed before freeze.

The frontend product definitions remain locked: Rovei is client readiness + client memory for beauty professionals; Beauty Packs are reusable client-experience templates; Schedule is readiness visibility rather than booking; the client portal requires no account/download; client cancellation/rescheduling remains contact-the-studio behavior.

The complete browser storage inventory remains exactly: `rovei:onboarding-draft` and `rovei:beauty-packs-prototype` in localStorage; `rovei:new-client-draft`, `rovei:new-client-link`, `rovei:client-experience-prototype`, `rovei:client-visit-prototype`, and `rovei:schedule-status-overrides` in sessionStorage; client photo Blobs in IndexedDB `rovei-prototype` / `client-experience-photos`; visit photo Blobs in IndexedDB `rovei-visit-prototype` / `visit-photos`. Settings and Schedule view/date selection create no storage key.

Dependency-backed execution remains unavailable in this sandbox: the final `npm install --no-audit --no-fund` attempt stalled/timed out without producing `node_modules` or `package-lock.json`. Real ESLint/Next build/browser QA therefore remains unverified and is explicitly carried into the backend/deployment phase. No screenshots were fabricated.

**FRONTEND V1 FROZEN.**
