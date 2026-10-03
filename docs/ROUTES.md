# Rovei Routes

| Route | Current purpose | Status | Future purpose |
|---|---|---|---|
| `/` | Redirect to the professional app at `/app` | Implemented | Entry routing can later become auth-aware |
| `/app` | Operational professional home with Next Up, Today, Needs Attention, and Recent Client Memory | Implemented frontend dashboard with centralized mock data | Backend-powered client readiness home |
| `/app/schedule` | Client-readiness Schedule with local Today/Week navigation and session-only cancellation overrides | Implemented frontend/mock readiness calendar; not booking | Backend appointment/readiness queries and durable appointment status |
| `/app/clients` | Operational client-memory directory with live name/service search, status filters, result context, responsive client rows, and empty-state foundations | Implemented frontend/mock directory | Backend-powered persistent searchable client index |
| `/app/clients/new` | Five-field Add Client workflow with live experience summary and validated session draft handoff | Implemented frontend prototype | Backend client creation will replace temporary draft persistence |
| `/app/clients/new/link` | Generated same-session client link plus professional WAITING/READY projection from the current prototype response | Implemented frontend prototype; no live tracking | Backend client link/status state |
| `/app/clients/new/result` | Read-only professional projection of the current prototype client submission with signature Client Card, exact answers, acknowledgements, and locally available photos | Implemented frontend prototype | Backend-powered client readiness/result record |
| `/app/clients/new/visit` | Record the current prototype appointment with required visit summary plus optional professional Before/After photos | Implemented frontend prototype | Backend visit creation and durable professional memory |
| `/app/clients/new/history` | Read-only same-session client memory with COMPLETE Client Card and chronological prototype visit history | Implemented frontend prototype | Backend-powered persistent client/visit history |
| `/app/clients/[id]` | Read-only Client Profile with signature Client Card, memory tabs, and canonical demo data | Implemented frontend/mock | Future backend persistence, editing, real forms/photos/visits |
| `/app/beauty-packs` | Beauty Pack directory for reusable client-experience templates, sorted by most recently updated | Implemented frontend prototype with localStorage persistence | Backend Studio configuration / reusable appointment templates |
| `/app/beauty-packs/new` | Create Beauty Pack editor with service recommendations, module selection, and live client preview | Implemented frontend prototype | Backend Beauty Pack creation |
| `/app/beauty-packs/[id]` | Edit/delete an existing prototype Beauty Pack | Implemented frontend prototype | Backend Beauty Pack editing/deletion |
| `/app/studio` | Professional Studio editor for identity, services, client theme/Custom colour, and default client-experience modules with explicit Save/Discard and live preview | Implemented frontend Studio management using the existing onboarding draft | Backend Studio configuration persistence and appointment snapshots |
| `/app/settings` | Small Account, Plan & billing, and Workspace shortcuts page | Implemented frontend/demo Settings; no account or billing backend | Authenticated account profile and real billing management |
| `/onboarding` | Studio Identity Step 1 with live preview + temporary draft persistence | Implemented frontend Step 1 | First step of guided onboarding |
| `/onboarding/services` | Services Step 2 with typed multi-select cards, live preview, and draft autosave | Implemented frontend Step 2 | Category-level service selection before Design / Mood |
| `/onboarding/mood` | Design / Mood Step 3 with preset + Custom theme selection, live themed client preview, and draft autosave | Implemented frontend Step 3 | Client-facing mood/signature-colour customization before Experience |
| `/onboarding/experience` | Client Experience Step 4 with service-based recommendations, editable modules, themed live preview, and draft autosave | Implemented frontend Step 4 | Final onboarding configuration step before Personal Preview |
| `/preview` | Personalized payoff screen with Client View / Your View, illustrative Emily flow, read-only setup summary, and Save/Edit routing | Implemented frontend Personal Preview | Pre-signup studio review before account creation |
| `/signup` | Create Account / Save Studio frontend form with local-only credentials and personalized studio summary | Implemented frontend UX; no real account | Backend authentication/account creation before activation |
| `/activate` | Personalized Activation / Paywall with one plan, Monthly/Annual cadence, included features, preview-mode explanation, and checkout handoff | Implemented frontend purchase UX; no payment/activation | Future backend-created hosted checkout entry |
| `/activate/checkout` | Deliberate development-only payment boundary; reads validated `billing` query and shows selected price without collecting payment data | Intentional frontend/backend boundary | Replace with backend-created Stripe Checkout redirect / success-cancel handling |
| `/client/[token]` | Public Client Experience with current-session token validation, themed consultation/preferences/photo/consent/prep flow, review and completion | Implemented frontend prototype; no backend authorization | Backend token resolution, Postgres responses and Storage-backed photos |

## Current client-creation route details

| Route | Current purpose | Status | Future purpose |
| --- | --- | --- | --- |
| `/app/clients/new` | Add Client frontend draft workflow; successful resubmit invalidates any previous prototype link before storing the current draft | Implemented frontend-only | Backend client creation will replace prototype draft/link invalidation |
| `/app/clients/new/link` | Frontend Client Link Generation with same-session opaque token, absolute URL, copy/native-share UX, client context, and WAITING/READY result projection on revisit | Implemented frontend prototype; no live tracking | Backend creates/stores production token association, status and client URL |
| `/app/clients/new/result` | Professional same-session result projection; validates draft/link/response state, shows WAITING progress or READY Client Card/results, and rehydrates actual local photo Blobs | Implemented frontend prototype | Durable backend client result / readiness view |
| `/app/clients/new/visit` | READY-only professional visit form; records a validated summary and optional Before/After Blob references without editing client answers | Implemented frontend prototype | Durable visit creation |
| `/app/clients/new/history` | Current prototype client history; renders visit array newest-first, reconciles real local visit-photo Blobs, and projects appointment lifecycle as COMPLETE | Implemented frontend prototype | Persistent client history |
| `/client/[token]` | Public Client Experience; validates the current prototype token before reading client draft data, resumes structured answers from sessionStorage, stores local photo blobs in prototype IndexedDB, and reopens completed submissions at Complete | Implemented frontend prototype | Backend authorization, durable responses/photo storage and production client portal |


## Beauty Pack route details (Prompt 17)

Beauty Packs are **reusable client-experience templates**, not aftercare documents, retail products, booking packages, prepaid bundles, memberships, or pricing plans. `/app/beauty-packs` reads the prototype store from `rovei:beauty-packs-prototype`, `/app/beauty-packs/new` creates a validated pack, and `/app/beauty-packs/[id]` edits/deletes a stored pack or renders a safe not-found state. Beauty Packs are not wired into Add Client in this frontend phase.


## Studio + Settings route details (Prompt 18)

`/app/studio` edits the exact existing `rovei:onboarding-draft` configuration created during onboarding. It hydrates `studioName`, `services`, `theme`, dormant `customPrimary`, and `experienceSelections` into local editor state, previews edits immediately, and writes only on **Save studio changes** through the existing onboarding-storage helper. Service-aware module recommendations are suggestions only; **Apply recommendations** is the only action that replaces the current module selection. Saving Studio does not delete Beauty Packs or rewrite completed client prototype response/visit state.

`/app/settings` is deliberately read-only/navigational in the frontend phase: Mia Rhodes / Studio owner, centralized `pricing.ts` plan options with Preview mode / Not activated status, and links to Studio, Beauty Packs, and Activation. Prompt 18 adds no Settings browser-storage key.


## Schedule route details (Prompt 19)

`/app/schedule` is a **client-readiness calendar**, not a booking engine. Today/Week and period navigation are local React state only and reset to the deterministic demo anchor `2026-09-30` when the route is reopened. Base appointments live in `src/lib/schedule-demo-data.ts`; Schedule-specific cancellation is projected through the exact session key `rovei:schedule-status-overrides` without mutating those appointments or Dashboard/Directory/Profile datasets. COMPLETE appointments cannot be cancelled, and restoring an appointment removes the override so its original readiness state returns. Client names continue to route to `/app/clients/[id]`; there is no appointment-detail route, booking creation, availability, reschedule workflow, calendar integration, or client-side cancellation action.


## Frontend V1 route audit (Prompt 20)

All **24** current `page.tsx` routes were inventoried at freeze. No working route was removed, no unintended foundation placeholder remains visible, and all statically declared internal `href` destinations resolve to an existing route pattern. Dynamic client and Beauty Pack links continue to target their implemented dynamic routes, which retain safe unknown-ID handling.

The only intentional development boundary is `/activate/checkout`; it remains explicit about no payment occurring and contains no fake card fields or success path. `/client/[token]` is an implemented public prototype experience, not a reserved placeholder.

Frontend V1 route inventory is frozen as the table above. Backend integration may make entry/auth/data behavior real without casually renaming or redesigning these routes.
