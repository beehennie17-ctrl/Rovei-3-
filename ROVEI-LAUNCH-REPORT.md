# Rovei launch sprint — verified results and release decision

**Decision: NO-GO for paying customers.** This session produced a tested engineering changeset. Genuine Sandbox billing, hosted workflow tests, visual regression and production prerequisites still prevent a launch candidate sign-off.

**Date:** October 14, 2026. **Target:** October 18 launch candidate, subject to the gates below.

## Source and design protection

- GitHub branch `frontend/exact-locked-shell` matched baseline commit `27c511c1eb97c8e7365bf719ad91347dfba60419`.
- The supplied archive SHA-256 is `4d1da8cf3f161f8d73a47428391deca325f9ce4b015a74357bc0f9c2d269c5ba`.
- All 312 archive entries were inspected/extracted safely; included source bytes matched exactly. The private backup was reported in the supplied handoff; it was deliberately not accessed.
- The exact uncommitted billing/manage, locked-shell, backend bridge, next-env, cancellation script and cancellation tests were preserved in isolated snapshot commit `4278621`. The omitted support installer remains outside this source export; it was not treated as a deletion.
- Omitted documentation and five public JPEG assets were restored from the matching GitHub baseline. Other unchanged omitted supporting files remain in the cloned baseline.
- No changes to the approved HTML, public homepage, showcase assets, branding or global CSS. `design-protection.json` records protected hashes. Functional state restoration reuses the approved HTML and markup.
- No original Codespace access/write, Git reset, force push, protected-branch update, merge, deployment, hosted database write, live payment, real cancellation/refund or customer-data deletion occurred.
- New checkout styling is isolated in `activation/checkout-experience.module.css`.

## Implementation audit and completed work

| Area | Existing implementation | Work delivered | Outstanding launch proof |
|---|---|---|---|
| Paddle checkout | Authenticated owner API, server transactions, reservations and uncertain-outcome reconciliation | Catalog verification for both prices; premium two-column inline checkout; owner email; Paddle event tax/currency/total/renewal display; duplicate UI request guard; API timeout | Genuine monthly and annual purchases; actual price permissions/product match; supported regional methods and tax presentation |
| Subscription synchronization | Raw-body HMAC, three subscription events, service-only RPC, deduplication and ordering | Additional lifecycle events; first subscription must match server checkout marker and price; terminal canceled subscription cannot be resurrected; studio lock serializes absent-row synchronization | Signed Paddle → Hookdeck → app → hosted Supabase delivery and replay |
| Cancellation | Supplied immediate-cancel API and approved-shell double confirmation | Separate checkout now uses the same immediate policy with two confirmations; waits for canceled plus access=false; scheduled cancellation can also be ended immediately | Real Sandbox cancellation, sync delay, retry and retained-data checks |
| Subscription access | API membership/access checks; migration for paid RLS in source | Missing/invalid period fails closed in code and new SQL; local paid/unpaid and tenant tests; privileged helper hardening | Apply reviewed missing/new migrations to the confirmed target and repeat hosted isolation checks |
| Studio and Beauty Packs | CRUD APIs plus local-only approved-shell actions; Studio PUT and Pack PUT used multiple non-atomic writes | Invoker RPCs make saves atomic under RLS; preserve pack response timestamps; bridge saves Beauty Packs, services, themes, modules, name, availability and preferences | Hosted save/reload, concurrent preference changes and account restoration |
| Account | Existing signup, confirmation, recovery, password and signout APIs | Account-name/email API; real settings password/account actions and signout bridge; email changes remain pending confirmation | Delivered confirmation/recovery emails, returning login and expired sessions |
| Shell data | Server restored Studio/account but reset clients/packs/visits to empty arrays | Paginated server restoration adapts stored clients, appointments, responses, packs and visit records into existing shell state | Actual multi-session core workflow and photo rendering tests |
| Production | CI typecheck/lint/build; development reset route exposed | CI now runs tests and covers PRs to the working branch; cross-origin guards for additional mutations; reset endpoint disabled in production | Hosting, HTTPS, SMTP, redirects, monitoring, recovery and approved live billing |

The protected UI still contains prototype-only reusable intake, visit completion/photo memory, parts of scheduling and disclosure copy. Existing per-appointment public client-experience APIs do not complete the approved reusable `#intake` workflow by themselves. No new real reusable link/booking backend or durable visit-photo workflow was delivered. Notification preferences can be saved; notification delivery was not implemented. Service categories can be persisted; a complete service/pricing editor is not established by this work.

## Connected Supabase findings (read-only)

I inspected the connected healthy project named **Rovei-3-**. The private Codespaces environment was omitted, so its exact target-project mapping must be confirmed before integration.

- Recorded migrations: foundation, tenant integrity, secure client links, atomic bootstrap, Paddle subscription sync.
- `202610110001_subscription_access` and `202610120001_support_requests` are absent from migration history.
- The support table exists despite the absent history entry; compare its actual definition/policies before history reconciliation.
- The paid-access function is absent and paid-data policy count is zero. Public tables have RLS enabled, but current membership policies do not supply the intended paid-data restrictions. This is a launch blocker even when API routes enforce billing.
- Paddle subscription-sync RPC exists.
- Security advisors report mutable search_path on an update trigger helper, broad execution grants on privileged helpers, and disabled leaked-password protection. New reviewed SQL hardens the relevant helpers locally; hosted settings/grants remain unchanged.
- Internal Paddle tables intentionally have no browser policies and have browser grants revoked. Advisor notices about no policies are not, by themselves, a reason to open these tables.
- Performance advisors reported 31 foreign-key index notices, eight RLS initplan warnings and one multiple-permissive-policy warning. These remain review items; no speculative index changes were applied.

## Test evidence

| Check | Status | Result / limits |
|---|---|---|
| Archive reconstruction | PASS | Exact included-file hashes; branch/commit verified |
| Original `npm test` | PASS | 42/42 before engineering changes |
| Final `npm test` (Node 24) | PASS | 64/64; 22 added tests |
| Final Node 22 suite | PASS | 64/64; used a writable TMPDIR in this sandbox |
| Local PostgreSQL migrations/RLS | PASS | PGlite runs all source migrations; synthetic Auth/Storage catalog and two fixture tenants; real SQL execution, no hosted Auth/Storage claims |
| Data reconnection | PASS locally | Fixture records survive closing/reopening local PostgreSQL; hosted cross-session persistence is BLOCKED |
| DOM bridge regressions | PASS | Actual approved form markup and JS executed in jsdom; successful remote save, failed save, rejected service update and valid Studio payload |
| `npm run typecheck` | PASS | Final source checked |
| `npm run lint` | PASS | Zero errors; nine existing warnings |
| Standard `npm run build` | BLOCKED here | Sandbox cannot read process RSS: `uv_resident_set_memory` ENOENT |
| Build with QA memory compatibility preload | PASS, conditional | Compiles, checks types and generates routes; preload uses available V8/OS metrics and is outside Rovei. Run unmodified build in Codespace/CI before release |
| `NODE_ENV=production npm run test:routes` | PASS | Five compiled-handler checks: cross-origin checkout 403, unsigned webhook 401, unconfigured billing 503, production reset 404, exact public homepage bytes |
| Browser E2E / responsive screenshots | BLOCKED | Browser download/launch unavailable; bundled headless Chromium exits SIGTRAP. Six fixture-based Playwright checks supplied, not reported passed |
| Genuine Sandbox purchase/webhooks/cancellation | BLOCKED | Private billing configuration and a reachable authenticated integration environment were not available |
| Hosted tenant/persistence/signup/email tests | BLOCKED | No test-session credentials/environment supplied; no customer accounts/data accessed |
| Patch preimages/application | PASS | Checked and applied to a fresh preserved-snapshot worktree; all 37 resulting file hashes matched |
| Protected design file hashes | PASS | No source changes; rendered screenshot equivalence remains untested |

Commands and logs are included alongside the patch. Route checks invoke compiled Next handlers; they are not hosted HTTP tests. Paddle/JSON/browser fixtures are not evidence of provider delivery or a paid subscription.

## Progress by phase and section

Percentages measure passed verification checks in a declared checklist; untested code earns no credit. They measure verification coverage rather than estimated feature implementation.

| Phase | Finished / verified | Files changed | Tests / blockers | Section | Overall release gates |
|---|---|---|---|---:|---:|
| Reconstruction | Baseline, archive, inherited work and assets preserved | Isolated snapshot only | Source hashes PASS; no product tests yet | 100% (4/4 preservation checks) | 8% (1/12) |
| Audit | Billing/bridge/migration/access audit and initial static checks | None | 42 tests, typecheck/lint PASS; hosted gates open | Audit of launch-critical areas completed | 17% (2/12) |
| Engineering | Billing/checkout, atomic saves, hydration and account bridge | 37 files below | New local SQL and DOM tests PASS; hosted/visual gates open | See section table | 25% (3/12) |
| Final QA / review | 64 tests, compiled routes, conditional build, protected hashes and checked patch | Tests/CI/integration artifacts included | No unresolved automated-test failures; browser and live gates BLOCKED | See section table | 25% (3/12) |

| Product section | Verified check coverage | Passed checks | Remaining checks |
|---|---:|---|---|
| Billing | 50% (6/12) | Sandbox guard; reservations/recovery; signatures; dedup/order; lifecycle handling; cancellation retention/terminal guard locally | Real prices, purchases, gateway delivery, hosted sync/access, delayed/abandoned provider outcomes |
| Checkout | 38% (3/8) | Catalog arithmetic; currency/tax parsing; component compilation | Real fields/methods/taxes, responsive visuals, browser error/duplicate/pending/cancel flows |
| Database / tenant safeguards | 60% (6/10) | Catalog audit, RLS enabled, migration execution, cross-tenant isolation, paid restrictions, privileged RPC denial locally | Confirm target; reconcile/apply schema; hosted role tests; hosted configuration hardening |
| Studio persistence | 25% (3/12) | Pack DOM saves/failures; Studio save payload/atomicity; restoration adapters/local reconnection | Reusable intake, scheduling conflicts/CRUD, visits/photos, notification delivery, hosted session restoration and remaining module workflows |
| Authentication | 33% (2/6) | Existing confirmation/redirect unit checks | Hosted signup, email/recovery, returning account access, expiration/account edit tests |
| Production preparation | 20% (1/5) | CI coverage and production reset guard checked | Hosting/domain/redirects; SMTP; operational monitoring/recovery; approved live billing and smoke checks |

**Overall customer-ready verification: 25% (3/12 release gates passed).** This score replaces the earlier informal estimates with explicit evidence. The twelve overall gates are preservation; static checks; automated local SQL/DOM/handler checks; standard production build; visual/browser regression; hosted signup/recovery/login; genuine Sandbox checkout; signed Hookdeck/Supabase sync; hosted activation/failure/cancellation; complete hosted core persistence; hosted two-tenant/storage isolation; production/live/email/operations readiness. Only the first three fully pass here. Standard build is conditional here and the other gates remain open.

## Launch blockers and fastest safe next steps

1. **Integrate and review the patch in an isolated workspace.** It must remain coordinated with its SQL migrations. Original uncommitted work is the preimage, not an older GitHub version.
2. **Confirm the actual Supabase target and reconcile migration gaps.** Rehearse in a disposable database. Apply only reviewed changes, then run hosted paid/unpaid/two-tenant tests.
3. **Complete the approved reusable client intake and durable visit/photo workflows.** Shareable links must work in a fresh browser, enforce availability/conflicts server-side, save private records, and reload for the owner. Local `#intake` and browser photo memory are insufficient.
4. **Run the six supplied browser fixtures and capture visual regression evidence.** Test desktop and 320/390px viewports, original activation connection and every protected journey. Checkout cancellation needs keyboard/focus QA as well.
5. **Use the private Sandbox environment for genuine billing tests.** Verify actual price objects and required permissions; configure/verify additional lifecycle events; finish a Sandbox purchase and trace its signed event to the correct hosted studio.
6. **Resolve Hookdeck delayed replay behavior without weakening signature validation.** Current code accepts a five-minute freshness window; original timestamp passthrough can make later retries expire. Verify raw body/header preservation and an authenticated replay/gateway strategy.
7. **Verify email and production operations.** Signup/recovery delivery, redirect allowlist, HTTPS/domain, rate limits/abuse controls, logs/alerts, backups and recovery exercises remain unverified. Leaked-password protection requires configuration review.
8. **Approve live billing and production deployment only after all critical gates pass.** No live switch was made. The current implementation remains Sandbox-only by design.

Prototype disclosure wording inside the protected UI still needs a separately approved resolution before real users are onboarded. No protected text/layout edits were made to resolve it during this sprint.

## Changed files

- `.github/workflows/ci.yml`
- `activation/checkout-experience.module.css`
- `activation/checkout-experience.tsx`
- `activation/payment-confirmation.tsx`
- `app/api/appointments/[id]/route.ts`
- `app/api/auth/account/route.ts`
- `app/api/beauty-packs/[id]/route.ts`
- `app/api/beauty-packs/route.ts`
- `app/api/billing/checkout/route.ts`
- `app/api/billing/manage/route.ts`
- `app/api/billing/subscription/route.ts`
- `app/api/client-links/route.ts`
- `app/api/clients/route.ts`
- `app/api/studio/route.ts`
- `app/api/test-reset/route.ts`
- `app/api/webhooks/paddle/route.ts`
- `app/route.ts`
- `lib/auth/locked-shell.ts`
- `lib/backend/locked-studio-state.ts`
- `lib/backend/paddle-api.ts`
- `lib/backend/schemas.ts`
- `lib/backend/subscription-access.ts`
- `lib/billing/checkout-events.ts`
- `package-lock.json`
- `package.json`
- `playwright.config.ts`
- `public/rovei-studio-persistence.js`
- `supabase/migrations/20261014155715_launch_billing_hardening.sql`
- `supabase/migrations/20261014160018_atomic_studio_and_pack_saves.sql`
- `tests/auth-backend.test.mjs`
- `tests/checkout-events.test.mjs`
- `tests/database-integration.test.mjs`
- `tests/e2e/checkout.spec.ts`
- `tests/locked-studio-state.test.mjs`
- `tests/paddle-billing.test.mjs`
- `tests/route-smoke.mjs`
- `tests/studio-persistence.test.mjs`

## References used for implementation verification

- Paddle inline checkout: https://developer.paddle.com/build/checkout/build-branded-inline-checkout/
- Paddle checkout event totals: https://developer.paddle.com/paddle-js/events/checkout-loaded/
- Paddle signatures: https://developer.paddle.com/webhooks/about/signature-verification/
- Hookdeck timestamp retries: https://hookdeck.com/docs/use-cases/test-debug-localhost
- Supabase grants and RLS: https://supabase.com/docs/guides/api/securing-your-api
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- The installed Next.js 16.3.8 route, Script and CSS guides were read locally.

The Supabase changelog Markdown fetch was attempted but rejected by the web reader's content-type handling; current official Supabase documentation was retrieved via its connected documentation tool instead.
