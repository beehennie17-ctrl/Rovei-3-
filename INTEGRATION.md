# Rovei review changes — safe integration

The patch contains only this sprint's 37 changed files. Its preimages are the supplied Codespaces snapshot, preserved locally in commit `4278621`, based on GitHub commit `27c511c1eb97c8e7365bf719ad91347dfba60419`.

The original ZIP and its private backup remain the source of truth for the earlier uncommitted billing changes. Do not replace the working tree with a GitHub ZIP, reset Git, or switch branches in the original Codespace.

1. Keep the source backup already created. Review `rovei-launch-sprint.patch` and `changed-files.txt`.
2. Use a separate review workspace reconstructed from the matching GitHub baseline plus the supplied source ZIP. Preserve omitted assets and documents.
3. Run the preimage check against that workspace:

   ```bash
   python apply-review-patch.py /path/to/isolated/review-workspace
   ```

4. If every preimage matches, apply there:

   ```bash
   python apply-review-patch.py /path/to/isolated/review-workspace --apply
   ```

The helper refuses differences from the snapshot, including later changes to any modified file. Other files are untouched. It does not commit, push, change branches, contact Supabase or deploy.

5. In the isolated workspace, run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `NODE_ENV=production npm run test:routes`.
6. Install the Playwright browser in the Codespace (`npx playwright install chromium`) and run `npm run test:e2e`. These browser tests use explicit billing fixtures and do not prove genuine Paddle purchases or webhook delivery.

## Database coordination is mandatory

Confirm the actual Supabase project used by the private Codespaces environment. In the connected healthy project named Rovei-3-, migration history contains foundation, tenant integrity, client links, atomic bootstrap and Paddle sync. It lacks `202610110001_subscription_access` and `202610120001_support_requests`. The support table nevertheless exists, so compare its definition and policies before reconciling migration history.

The paid-access function and policies are absent in that inspected project. This is a launch blocker. Review the missing migrations and these new migrations as a coordinated change:

- `20261014155715_launch_billing_hardening.sql`
- `20261014160018_atomic_studio_and_pack_saves.sql`

The new Studio/Beauty Pack APIs require the atomic-save RPC migration; code must not be deployed without it. Use a disposable development database to rehearse first. Do not blindly push migrations over history gaps or mark a migration applied without verifying its actual objects. No connected database migration was applied in this session.

The new migrations delete/reinsert a pack's own module rows inside an atomic user-requested edit, matching the existing edit semantics. They do not run bulk deletions or remove customer records during migration.

## Sandbox configuration and integration checks

Keep all credentials in the private environment. The checkout server now verifies both configured price objects: same product, active, USD 12900/129000 minor-unit base amounts, monthly/yearly recurrence, no trial. The API key needs permission for those reads and the existing transaction/subscription operations.

Enable and verify all relevant subscription lifecycle notifications, including past due, paused, resumed, activated and trialing, alongside created/updated/canceled. The webhook receiver and SQL RPC now handle them. Existing Paddle destinations were not changed.

Test original raw body and Paddle-Signature forwarding through Hookdeck. In particular, test retries after five minutes: the current signature freshness guard remains enabled. Do not weaken it to make old replays pass; configure a verified gateway/replay strategy and test it.

Complete a genuine Sandbox purchase, signed notification, hosted subscription synchronization, correct-studio activation, failed-payment lockout, double-confirmed cancellation and retained customer data. No live billing action is authorized by this changeset.

Do not merge, enable Paddle Live or deploy production until the remaining launch gates in the report pass and explicit approval is given.
