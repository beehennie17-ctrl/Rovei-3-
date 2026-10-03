# Rovei Component Inventory

| Component | Location | Purpose | Key props | Reusable | Used in foundation |
|---|---|---|---|---|---|
| `Button` | `components/ui/button.tsx` | Primary/secondary/ghost action; defaults to `type="button"` | `variant`, `size`, `icon`, native button props | Yes | Add client form, Studio Identity |
| `Card` | `components/ui/card.tsx` | Standard content surface | native div props | Yes | Dashboard, clients, studio |
| `Badge` | `components/ui/badge.tsx` | Neutral pill | native span props | Yes | Base for statuses |
| `StatusBadge` | `components/ui/badge.tsx` | Readiness/state pill | `status` | Yes | Dashboard, clients |
| `Avatar` | `components/ui/avatar.tsx` | Initials avatar | `initials`, `size` | Yes | Shell, dashboard, clients |
| `DashboardHeader` | `components/dashboard/dashboard-header.tsx` | Operational greeting and Add client navigation | none | Dashboard-specific | `/app` |
| `NextClientCard` | `components/dashboard/next-client-card.tsx` | Dominant next-appointment readiness summary without duplicating the full Client Card | `appointment` | Yes within dashboard | `/app` |
| `TodayClients` | `components/dashboard/today-clients.tsx` | Today section composition over typed appointments | `appointments` | Yes within dashboard | `/app` |
| `TodayClientRow` | `components/dashboard/today-client-row.tsx` | Accessible navigable appointment/readiness row | `appointment` | Yes within dashboard | Today |
| `NeedsAttention` | `components/dashboard/needs-attention.tsx` | Actionable outstanding-readiness section with zero-state support | `appointments` | Yes within dashboard | `/app` |
| `RecentClients` | `components/dashboard/recent-clients.tsx` | Recent Client Memory list and View all navigation | `clients` | Yes within dashboard | `/app` |
| `DashboardEmptyState` | `components/dashboard/dashboard-empty-state.tsx` | First-client empty foundation with Add first client route | none | Yes within dashboard | Future empty `/app` state |
| `AttentionEmptyState` | `components/dashboard/dashboard-empty-state.tsx` | Reusable “Everyone is ready” state for no outstanding appointments | none | Yes within dashboard | `NeedsAttention` empty state |
| `ClientsDirectory` | `components/clients/clients-directory.tsx` | Client-side directory composition with local search/status state, result count, responsive records, and empty-state switching | none | Route-specific composition | `/app/clients` |
| `ClientsToolbar` | `components/clients/clients-toolbar.tsx` | Accessible `type="search"` control plus exact All/Ready/Waiting/Complete/Draft filters | `search`, `status`, change callbacks | Yes within directory | `/app/clients` |
| `ClientDirectoryRow` | `components/clients/client-directory-row.tsx` | Fully navigable responsive client-memory row/card with status, visit, appointment, and context | `client` | Yes within directory | `/app/clients` |
| `ClientDirectoryNoResults` | `components/clients/client-directory-empty.tsx` | Search/filter no-results state with local reset actions | `search`, `status`, reset callbacks | Yes within directory | Filtered `/app/clients` |
| `ClientDirectoryEmptyState` | `components/clients/client-directory-empty.tsx` | Future zero-client account state linking to Add first client | none | Yes within directory | Future empty `/app/clients` |

| `ClientProfile` | `components/clients/profile/client-profile.tsx` | Read-only profile composition with signature Client Card and local profile tabs | `client` | Route-specific composition | `/app/clients/[id]` |
| `ClientProfileHeader` | `components/clients/profile/client-profile-header.tsx` | Client identity, shared status, appointment context, and Back to Clients link | `client` | Yes within profile | Client Profile |
| `ClientProfileTabs` | `components/clients/profile/client-profile-tabs.tsx` | Accessible local-only Overview/Visits/Photos/Forms/Notes tab state and panels | `client` | Yes within profile | Client Profile |
| `ClientOverview` | `components/clients/profile/client-overview.tsx` | Appointment, readiness, preferences, and latest studio-note summary | `client` | Yes within profile | Overview tab |
| `ClientVisits` | `components/clients/profile/client-visits.tsx` | Concise visit-memory timeline plus first-visit empty state | `client` | Yes within profile | Visits tab |
| `ClientPhotos` | `components/clients/profile/client-photos.tsx` | Non-photographic visual memory placeholders and no-photos state | `client` | Yes within profile | Photos tab |
| `ClientForms` | `components/clients/profile/client-forms.tsx` | Read-only pre-appointment record statuses derived from profile readiness data | `client` | Yes within profile | Forms tab |
| `ClientNotes` | `components/clients/profile/client-notes.tsx` | Private studio-note history presentation | `client` | Yes within profile | Notes tab |
| `ClientProfileNotFound` | `components/clients/profile/client-profile-not-found.tsx` | Safe unknown-client state with Back to clients navigation | none | Yes within profile | Unknown `/app/clients/[id]` |
| `Input` | `components/ui/form-controls.tsx` | Text input | native input props | Yes | Add client, Studio Identity |
| `Textarea` | `components/ui/form-controls.tsx` | Multiline input | native textarea props | Yes | Add client |
| `Select` | `components/ui/form-controls.tsx` | Select input | native select props | Yes | Add client |
| `Checkbox` | `components/ui/form-controls.tsx` | Labeled checkbox | `label` + input props | Yes | Ready for future screens |
| `RadioCard` | `components/ui/form-controls.tsx` | Branded radio choice | `name`, `value`, `title`, `description` | Yes | Ready for onboarding |
| `Field` | `components/ui/form-controls.tsx` | Input label/hint wrapper | `label`, `htmlFor`, `hint` | Yes | Add client, Studio Identity |
| `PageHeader` | `components/ui/headers.tsx` | Page title hierarchy | `eyebrow`, `title`, `description`, `action` | Yes | Authenticated pages |
| `SectionHeader` | `components/ui/headers.tsx` | Section title hierarchy | `title`, `description`, `action` | Yes | Dashboard, studio, client detail |
| `Skeleton` | `components/ui/feedback.tsx` | Loading placeholder | `className` | Yes | Ready for future data states |
| `ModalShell` | `components/ui/feedback.tsx` | Accessible modal shell with unique labelled title | `title`, `children`, `footer` | Yes | Beauty Pack delete, Schedule cancellation |
| `ClientCard` | `components/clients/client-card.tsx` | Signature Rovei client card; theme/dynamic rows plus semantically guarded footer | `theme`, optional `themeOverride`, client/service/status, optional legacy row values, optional `rows`, `footerLabel`, `footerInteractive`, optional `onFooterAction` | Yes | Client Profile, Personal Preview, Result, History |
| `NavItem` | `components/layout/nav-item.tsx` | Desktop/mobile navigation item | `href`, `label`, `icon`, `active`, `compact` | Yes | App shell |
| `OnboardingShell` | `components/onboarding/onboarding-shell.tsx` | Reusable responsive onboarding composition with form and preview regions | `currentStep`, `totalSteps`, `children`, `preview` | Yes | Studio Identity, Services, Mood, Experience |
| `OnboardingProgress` | `components/onboarding/onboarding-progress.tsx` | Accessible reusable setup progress indicator | `currentStep`, `totalSteps`, optional `labels` | Yes | Studio Identity, Services, Mood, Experience |
| `StudioIdentityStep` | `components/onboarding/studio-identity-step.tsx` | Step 1 interaction, local draft hydration/save, validation, navigation | none | Step-specific | `/onboarding` |
| `StudioMiniPreview` | `components/onboarding/studio-mini-preview.tsx` | Live early client-experience preview driven by studio name | `studioName`, `delight` | Yes within onboarding | Studio Identity |
| `ServicesStep` | `components/onboarding/services-step.tsx` | Step 2 hydration, multi-select state, autosave, validation, Back/Continue navigation | none | Step-specific | `/onboarding/services` |
| `ServiceCard` | `components/onboarding/service-card.tsx` | Accessible tactile service-category toggle | `category`, `selected`, `onToggle` | Yes within onboarding | Services |
| `ServicesMiniPreview` | `components/onboarding/services-mini-preview.tsx` | Live ownership preview of studio name and selected service categories | `studioName`, `services` | Yes within onboarding | Services |
| `MoodStep` | `components/onboarding/mood-step.tsx` | Step 3 hydration, theme selection, Custom colour state, autosave, and Back/Continue navigation | none | Step-specific | `/onboarding/mood` |
| `ThemeChoiceCard` | `components/onboarding/theme-choice-card.tsx` | Accessible premium theme choice using real `ClientTheme` values and Rovei selection chrome | `themeName`, `theme`, `description`, `selected`, `onSelect` | Yes within onboarding | Mood |
| `CustomThemeControl` | `components/onboarding/custom-theme-control.tsx` | Synchronized native colour + six-digit hex controls with restrained validation | `textValue`, `activeColour`, `showError`, change callbacks | Yes within onboarding | Mood Custom option |
| `MoodMiniPreview` | `components/onboarding/mood-mini-preview.tsx` | Live themed client-facing preview using studio, services, and resolved `ClientTheme` | `studioName`, `services`, `theme`, `hasSelection` | Yes within onboarding | Mood |
| `ExperienceStep` | `components/onboarding/experience-step.tsx` | Step 4 hydration, recommendation defaults, module toggles/autosave, themed preview, and Back/Preview navigation | none | Step-specific | `/onboarding/experience` |
| `ExperienceOptionCard` | `components/onboarding/experience-option-card.tsx` | Accessible premium pre-appointment module toggle with selected and Recommended states | `option`, `selected`, `recommended`, `onToggle` | Yes within onboarding | Experience |
| `ExperienceMiniPreview` | `components/onboarding/experience-mini-preview.tsx` | Live client-facing preview driven by Studio, Services, resolved Theme, and current module selections | `studioName`, `services`, `selections`, `theme` | Yes within onboarding | Experience |
| `PersonalPreview` | `components/preview/personal-preview.tsx` | Dedicated payoff-page composition; hydrates read-only preview model, owns perspective tab state, routes Edit/Save actions | none | Route-specific composition | `/preview` |
| `PreviewViewToggle` | `components/preview/preview-view-toggle.tsx` | Accessible Client View / Your View segmented tab control | `value`, `onChange` | Yes within preview | Personal Preview |
| `ClientExperiencePreview` | `components/preview/client-experience-preview.tsx` | Theme-aware illustrative Emily client portal with local Welcome → Flow → Complete stages | `model` | Yes within preview | Client View |
| `ProfessionalExperiencePreview` | `components/preview/professional-experience-preview.tsx` | Professional payoff view using preview appointment context plus the reused signature Client Card | `model` | Yes within preview | Your View |
| `PreviewSummary` | `components/preview/preview-summary.tsx` | Compact ownership summary for studio, service count, theme, and client-step count | `model` | Yes within preview | Personal Preview |
| `PreviewConversion` | `components/preview/preview-conversion.tsx` | Final Save my studio / Edit setup conversion area without payment pressure | `onSave`, `onEdit` | Yes within preview | Personal Preview |
| `SignupPage` | `components/signup/signup-page.tsx` | Dedicated Save Studio route composition; reads existing draft into preview model and owns routing only | none | Route-specific composition | `/signup` |
| `SignupForm` | `components/signup/signup-form.tsx` | Local-only first name/email/password/Terms form with calm frontend validation and accessible password toggle | `onValidSubmit` | Yes within signup | `/signup` |
| `SignupStudioPreview` | `components/signup/signup-studio-preview.tsx` | Compact theme-resolved ownership snapshot built from the existing normalized preview model | `model` | Yes within signup | `/signup` |
| `ActivationPage` | `components/activation/activation-page.tsx` | Dedicated Activation / Paywall composition; hydrates read-only studio model, owns local billing cadence, routes to checkout boundary | none | Route-specific composition | `/activate` |
| `BillingToggle` | `components/activation/billing-toggle.tsx` | Accessible Monthly/Annual segmented control with announced pressed state and restrained annual saving | `value`, `onChange` | Yes within activation | `/activate` |
| `PricingPanel` | `components/activation/pricing-panel.tsx` | Activation messaging, centralized cadence price display, trust copy, and checkout-boundary CTA | `billing`, `onBillingChange`, `onContinue` | Yes within activation | `/activate` |
| `ActivationStudioPreview` | `components/activation/activation-studio-preview.tsx` | Personalized preview-mode studio ownership panel using resolved `PersonalPreviewModel.theme` | `model` | Yes within activation | `/activate` |
| `IncludedFeatures` | `components/activation/included-features.tsx` | Semantic single-plan feature list shared by both billing cadences | none | Yes within activation | `/activate` |
| `ActivationComparison` | `components/activation/activation-comparison.tsx` | Concise Design mode vs After activation value explanation | none | Yes within activation | `/activate` |
| `Wordmark` | `components/branding/wordmark.tsx` | Rovei wordmark | `compact` | Yes | App/public shells |
| `AppShell` | `components/layout/app-shell.tsx` | Responsive authenticated shell | `children` | Yes | All `/app/*` routes |

## Prompt 12 additions

| Component / utility | Location | Purpose | Key contract | Reusable |
| --- | --- | --- | --- | --- |
| `AddClientPage` | `components/clients/new/add-client-page.tsx` | Composes Add Client header, form, optional onboarding personalization, and live summary; routes valid drafts to link boundary | no props | Route composition |
| `AddClientForm` | `components/clients/new/add-client-form.tsx` | Accessible five-field client draft form with touched/submit-gated validation | `initialDraft`, `onDraftChange`, `onValidSubmit` | Yes within client creation |
| `NewClientExperienceSummary` | `components/clients/new/new-client-experience-summary.tsx` | Live theme-aware preview of entered client/appointment details and illustrative configured/recommended client-experience steps | names, service, date/time, `experienceSelections`, `theme` | Yes within client creation |
| `NewClientDraft` | `types/client-creation.ts` | Minimal prototype handoff contract: first/last name, service, date, time | reuses `ServiceCategoryId` | Shared workflow type |
| Client creation helpers | `lib/client-creation.ts` | Pure name/draft validation plus timezone-safe date-only and time display formatting | framework-independent | Yes |
| New client draft storage | `lib/new-client-draft.ts` | Sole SSR-safe `sessionStorage` access for `rovei:new-client-draft` | read/write/clear complete valid draft only | Temporary prototype infrastructure |
## Prompt 13 additions / changes

| Component / type / utility | Location | Purpose | Key contract | Reusable |
| --- | --- | --- | --- | --- |
| `ClientLinkPage` | `components/clients/new/client-link-page.tsx` | Composes generated prototype link UX, draft context, no-draft state, WAITING/READY projection, prototype notice, and next steps | no props; reads validated draft/link helpers | Route composition |
| `ClientLinkCard` | `components/clients/new/client-link-card.tsx` | Read-only absolute client URL with Copy feedback and optional native Share | `url`, `shareTitle` | Yes within link workflow |
| `ClientLinkNextSteps` | `components/clients/new/client-link-next-steps.tsx` | Explains the future send → complete → Client Card product loop | no props | Yes |
| `ClientLinkPrototype` | `types/client-link.ts` | Minimal link-state contract containing only opaque token and prototype creation timestamp | `token`, `createdAt` | Shared workflow type |
| Client link prototype helper | `lib/client-link-prototype.ts` | Sole SSR-safe/session-only link-state access, 128-bit Web Crypto token generation, validation, clear/reuse/match helpers | key `rovei:new-client-link`; no client PII | Temporary prototype infrastructure |
| `AddClientPage` | `components/clients/new/add-client-page.tsx` | Existing Add Client composition plus required old-link invalidation before successful new-draft handoff | clears link state → writes draft → routes | Route composition |

## Prompt 14 additions

| Component / type / utility | Location | Purpose | Key contract | Reusable |
| --- | --- | --- | --- | --- |
| `ClientExperiencePage` | `components/client-experience/client-experience-page.tsx` | Validates current prototype route/session, hydrates/resumes response, orchestrates Welcome → modules → Review → Complete | `token` | Route orchestrator |
| `ClientExperienceShell` | `components/client-experience/client-experience-shell.tsx` | Public studio-themed canvas without professional AppShell | `studioName`, `theme`, `children` | Yes within client experience |
| `ClientExperienceUnavailable` | `components/client-experience/client-experience-unavailable.tsx` | Safe no-PII invalid/mismatched-token state | none | Yes |
| `ClientWelcome` | `components/client-experience/client-welcome.tsx` | Studio/client/appointment welcome and Get started action | draft, studio/theme, `onStart` | Yes within flow |
| `ClientProgress` | `components/client-experience/client-progress.tsx` | Module-only adaptive progress | `current`, `total`, `theme` | Yes |
| `ConsultationStep` | `components/client-experience/consultation-step.tsx` | Required non-medical beauty goal textarea | value/change/error/theme | Yes |
| `PreferencesStep` | `components/client-experience/preferences-step.tsx` | Required finish + appointment-feel radio groups | finish, appointmentFeel, change handlers | Yes |
| `PhotoStep` | `components/client-experience/photo-step.tsx` | Reusable local image picker/preview/removal/skip UI for Inspiration and Current photos | token, kind, maxFiles, photo IDs/skip state | Yes |
| `AcknowledgementStep` | `components/client-experience/acknowledgement-step.tsx` | Shared Consent/Prep acknowledgement surface | copy, acknowledged, theme, `onChange` | Yes |
| `ClientReview` | `components/client-experience/client-review.tsx` | Concise enabled-module review with no internal IDs/paths | draft, response, theme | Yes |
| `ClientComplete` | `components/client-experience/client-complete.tsx` | Completed same-session experience state | draft, studioName, theme | Yes |
| `ClientExperiencePrototype` | `types/client-experience.ts` | Structured frontend response contract without duplicated client identity | token/modules/status/progress/module answers/timestamps | Shared prototype type |
| Client experience persistence | `lib/client-experience-prototype.ts` | Sole sessionStorage boundary for `rovei:client-experience-prototype`, hydration validation, module-completion helpers | current token only | Temporary prototype infrastructure |
| Prototype photo store | `lib/client-experience-photo-store.ts` | Sole raw IndexedDB Blob persistence layer | DB `rovei-prototype`; store `client-experience-photos` | Temporary prototype infrastructure |
| Client prep copy | `lib/client-prep-copy.ts` | Centralized brief non-medical prep copy by service category | existing `ServiceCategoryId` | Yes |

## Prompt 15 additions / changes

| Component / type / utility | Location | Purpose | Key contract | Reusable |
| --- | --- | --- | --- | --- |
| `ClientLinkCompletionStatus` | `components/clients/new/client-link-completion-status.tsx` | Projects current same-session client response as WAITING or READY and exposes result navigation only when complete | `status`, `firstName` | Yes within link workflow |
| `ClientResultPage` | `components/clients/result/client-result-page.tsx` | Browser-only professional result orchestrator; validates existing prototype contracts, handles unavailable/waiting/ready states, loads photo Blobs | no props | Route composition |
| `ClientResultHeader` | `components/clients/result/client-result-header.tsx` | Client identity, service, appointment context, and textual READY status | `result` | Yes within result |
| `ClientReadinessResult` | `components/clients/result/client-readiness-result.tsx` | Textual enabled-module readiness summary including missing-prototype-photo state | `rows` | Yes within result |
| `ClientSubmissionDetails` | `components/clients/result/client-submission-details.tsx` | Exact consultation, readable preferences, consent and prep result panels | `result` | Yes within result |
| `ClientResultPhotos` | `components/clients/result/client-result-photos.tsx` | Renders only reconciled real local Blob thumbnails and missing-Blob notices; revokes object URLs | photos/missing/skipped props | Yes for result photo kinds |
| `ClientResultWaiting` | `components/clients/result/client-result-waiting.tsx` | Safe in-progress professional state showing only completed-step count, not partial answers | `result` | Yes |
| `ClientResultUnavailable` | `components/clients/result/client-result-unavailable.tsx` | Graceful state when required draft/link/response contract is absent or mismatched | none | Yes |
| `ClientSubmissionResult` | `types/client-submission-result.ts` | Presentation-only professional projection contract; shared `ClientStatus` ready/waiting, exact answers, photo ID references, resolved theme | pure frontend view type | Shared projection type |
| Client submission projection | `lib/client-submission-result.ts` | Pure draft/link/response/theme normalization, readiness-row mapping, timestamp formatting, and ordered Blob-ID reconciliation | no persistence | Shared helper |
| Client experience labels | `lib/client-experience-labels.ts` | Shared readable labels for stored finish/appointment-feel IDs used by public Review and professional result | pure label helpers | Yes |
| `ClientReview` | `components/client-experience/client-review.tsx` | Existing Prompt 14 Review now consumes the shared label helper with unchanged stored values/output semantics | existing props unchanged | Existing public flow |


## Prompt 16 additions / changes

| Component / type / utility | Location | Purpose | Key contract | Reusable |
| --- | --- | --- | --- | --- |
| `ClientVisitPage` | `components/clients/visit/client-visit-page.tsx` | Gates READY prototype state, blocks duplicate visits, composes visit context + form | no props | Route composition |
| `ClientVisitForm` | `components/clients/visit/client-visit-form.tsx` | Local visit summary/photo staging, validated completion, Blob persistence + visit append | `token`, `draft`, `result` | Current prototype appointment |
| `VisitPhotoPicker` | `components/clients/visit/visit-photo-picker.tsx` | One reusable optional professional image picker for Before/After | `kind`, `files`, `onChange` | Yes |
| `VisitClientContext` | `components/clients/visit/visit-client-context.tsx` | Read-only reminder of exact client consultation/preferences while recording visit | `result` | Yes within visit workflow |
| `ClientHistoryPage` | `components/clients/visit/client-history-page.tsx` | Browser-only history orchestrator, visit/client-photo reconciliation, COMPLETE Client Card | no props | Route composition |
| `ClientHistoryHeader` | `components/clients/visit/client-history-header.tsx` | Client memory heading and COMPLETE status | `result`, `complete` | Yes |
| `ClientMemorySummary` | `components/clients/visit/client-memory-summary.tsx` | Visits/last-visit plus reusable client preference memory | result/count/date props | Yes |
| `VisitHistoryList` / `VisitHistoryItem` | `components/clients/visit/visit-history-list.tsx`, `visit-history-item.tsx` | Newest-first read-only visit memory | reconciled visit entries | Yes |
| `VisitHistoryPhotos` | `components/clients/visit/visit-history-photos.tsx` | Renders only real visit Blob thumbnails and honest missing-Blob notices | `ReconciledVisitPhotos` | Yes |
| `ClientVisitUnavailable` | `components/clients/visit/client-visit-unavailable.tsx` | Safe missing-state treatment for Visit/History routes | optional copy | Yes |
| `ClientVisitPrototype` / `PrototypeVisitRecord` | `types/client-visit.ts` | Token-scoped visit-array contract and professional photo record types | frontend prototype only | Shared visit contract |
| Visit prototype storage | `lib/client-visit-prototype.ts` | Exact-key sessionStorage validation/read/write/append/duplicate prevention | `rovei:client-visit-prototype` | Shared |
| Visit photo store | `lib/client-visit-photo-store.ts` | Separate IndexedDB Blob persistence for professional Before/After images | DB `rovei-visit-prototype`, store `visit-photos` | Shared |
| Visit pure helpers | `lib/client-visit.ts` | Summary validation, Web Crypto IDs, appointment matching, ordering, photo reconciliation | no persistence | Shared |
| `ClientResultHeader` | `components/clients/result/client-result-header.tsx` | Backward-compatible optional effective status override for post-visit COMPLETE projection | `status?` defaults to `result.status` | Existing result |
| `ClientResultPage` | `components/clients/result/client-result-page.tsx` | Minimal lifecycle extension: Record visit before visit, View history + COMPLETE after visit | existing projection + visit lookup | Existing result |


## Beauty Packs (Prompt 17)

| Component | Path | Purpose | Key inputs/state | Reusable | Used by |
|---|---|---|---|---|---|
| `BeautyPacksPage` | `components/beauty-packs/beauty-packs-page.tsx` | Hydrates/sorts the prototype Beauty Pack directory and switches between list/empty states | local hydrated pack list | Route composition | `/app/beauty-packs` |
| `BeautyPacksHeader` | `components/beauty-packs/beauty-packs-header.tsx` | Directory title/copy and Create Beauty Pack navigation | none | Yes | Beauty Packs directory |
| `BeautyPackList` | `components/beauty-packs/beauty-pack-list.tsx` | Responsive pack-card collection | `packs` | Yes | Beauty Packs directory |
| `BeautyPackCard` | `components/beauty-packs/beauty-pack-card.tsx` | Pack name/service/module summary/updated context and Edit navigation | `pack` | Yes | Beauty Packs directory |
| `BeautyPackEmpty` | `components/beauty-packs/beauty-pack-empty.tsx` | Brand-new Beauty Pack empty state | none | Yes | Beauty Packs directory |
| `BeautyPackEditor` | `components/beauty-packs/beauty-pack-editor.tsx` | Shared create/edit orchestration, recommendation behavior, persistence and deletion | `mode`, optional `packId` | Domain reusable | New/Edit routes |
| `BeautyPackForm` | `components/beauty-packs/beauty-pack-form.tsx` | Semantic name/service/module editor | controlled form values/errors/callbacks | Yes within Beauty Packs | `BeautyPackEditor` |
| `BeautyPackModuleCard` | `components/beauty-packs/beauty-pack-module-card.tsx` | Accessible module multi-select card with Recommended state | option/selected/recommended/toggle | Yes within Beauty Packs | `BeautyPackForm` |
| `BeautyPackPreview` | `components/beauty-packs/beauty-pack-preview.tsx` | Mini client-facing template preview using resolved studio theme and selected modules | studio/pack/service/modules/theme | Yes within Beauty Packs | `BeautyPackEditor` |
| `BeautyPackDeleteDialog` | `components/beauty-packs/beauty-pack-delete-dialog.tsx` | Accessible delete confirmation with focus entry/trap/Escape and opener-focus restoration | pack/open/close/confirm | Yes within Beauty Packs | Edit route |
| `BeautyPackNotFound` | `components/beauty-packs/beauty-pack-not-found.tsx` | Safe dynamic-route unknown-ID state | none | Yes | Edit route |


## Prompt 18 — Studio + Settings

| Component | File | Purpose | Reuse |
|---|---|---|---|
| `StudioPage` | `components/studio/studio-page.tsx` | Hydrates shared Studio config into local editor state; dirty/save/discard orchestration | `/app/studio` composition |
| `StudioIdentitySection` | `components/studio/studio-identity-section.tsx` | Studio-name editor and validation surface | Studio domain |
| `StudioServicesSection` | `components/studio/studio-services-section.tsx` | Existing canonical service multi-select using `ServiceCard` | Studio domain |
| `StudioThemeSection` | `components/studio/studio-theme-section.tsx` | Existing theme cards + Custom control | Studio domain |
| `StudioExperienceSection` | `components/studio/studio-experience-section.tsx` | Default experience modules, textual recommendations, explicit recommendation reset | Studio domain |
| `StudioClientPreview` | `components/studio/studio-client-preview.tsx` | Live client-facing preview using current local editor state and resolved theme | Studio domain |
| `StudioSaveActions` | `components/studio/studio-save-actions.tsx` | Save/Discard/dirty/success/error controls | Studio domain |
| `SettingsPage` | `components/settings/settings-page.tsx` | Small Account + Plan + Workspace composition | `/app/settings` |
| `AccountSettingsCard` | `components/settings/account-settings-card.tsx` | Read-only Mia Rhodes frontend account identity | Settings domain |
| `PlanSettingsCard` | `components/settings/plan-settings-card.tsx` | Shared-pricing summary and Activation link; no billing state | Settings domain |
| `WorkspaceShortcuts` | `components/settings/workspace-shortcuts.tsx` | Real navigation to Studio, Beauty Packs, Activation | Settings domain |

`src/lib/studio-settings.ts` is the pure/centralized Studio normalization, validation, dirty-comparison, save and read-back verification helper. No new Studio or Settings storage key exists.


## Prompt 19 — Schedule / Readiness Calendar

| Component/helper | File | Purpose | Key state/input |
|---|---|---|---|
| `SchedulePage` | `components/schedule/schedule-page.tsx` | Today/Week orchestration, local selected period, override hydration and cancel/restore actions | view/date local state + session override projection |
| `ScheduleHeader` | `components/schedule/schedule-header.tsx` | Readiness-calendar header and real Add client navigation | none |
| `ScheduleViewToggle` | `components/schedule/schedule-view-toggle.tsx` | Accessible Today/Week tabs with roving focus + Arrow/Home/End keyboard selection | local `ScheduleView` |
| `ScheduleDateNavigation` | `components/schedule/schedule-date-navigation.tsx` | Previous/next day/week plus return to demo Today | current period |
| `ScheduleReadinessSummary` | `components/schedule/schedule-readiness-summary.tsx` | Quiet appointment/readiness counts derived from effective statuses | appointment views |
| `TodaySchedule` | `components/schedule/today-schedule.tsx` | Chronological vertical time rail for an actual day | effective appointments |
| `WeekSchedule` / `ScheduleDay` | `components/schedule/week-schedule.tsx`, `schedule-day.tsx` | Monday–Sunday sparse week, vertical on small screens and seven columns at wide desktop | reference date + appointments |
| `ScheduleAppointmentCard` | `components/schedule/schedule-appointment-card.tsx` | Client memory link, service/context/status and professional cancel/restore action | appointment view |
| `ScheduleStatusBadge` | `components/schedule/schedule-status-badge.tsx` | Reuses `StatusBadge` and adds muted Schedule-only CANCELLED treatment | effective status |
| `CancelAppointmentDialog` | `components/schedule/cancel-appointment-dialog.tsx` | Confirm cancellation with focus entry/trap/Escape/trigger restoration | target appointment + trigger |
| `ScheduleEmpty` | `components/schedule/schedule-empty.tsx` | Clear-day state with Add client link | none |
| Schedule types/data/helpers | `types/schedule.ts`, `lib/schedule-demo-data.ts`, `lib/schedule.ts` | Immutable demo view model + date/grouping/status projection | deterministic demo anchor |
| Schedule override storage | `lib/schedule-status-prototype.ts` | Exact-key SSR-safe sessionStorage validation/mark/restore | `rovei:schedule-status-overrides` |


## Prompt 20 — final QA / freeze changes

| Component | Freeze change |
|---|---|
| `ClientCard` | Footer is focusable/actionable only with a real `onFooterAction`; read-only footer has no chevron |
| `ProfessionalExperiencePreview` | Explicit read-only ClientCard footer |
| `ClientProfileTabs` | Roving focus + ArrowLeft/ArrowRight/Home/End |
| `PreviewViewToggle` | Roving focus + ArrowLeft/ArrowRight/Home/End |
| `ScheduleViewToggle` | Roving focus + ArrowLeft/ArrowRight/Home/End |
| `BeautyPackDeleteDialog` | Restores focus to opener on Keep/Delete/Escape |
| `ModalShell` | Unique `useId()` title relationship |
| `AppShell` | Dead Help control removed; nested New workflow mobile active state corrected |

Unused `PlaceholderPage`, `PublicPlaceholder`, the inert generic `Tabs` primitive, `IconButton`, `ThemePreview`, `ThemeSwatch`, obsolete `src/lib/mock-data.ts`, and unused feedback-shell exports (`EmptyState`, `ToastShell`, `DrawerShell`) were removed after confirming no runtime imports.
