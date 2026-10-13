# Paddle Sandbox setup

Rovei's billing integration is intentionally Sandbox-only. Live Paddle billing is disabled; the backend refuses non-Sandbox configuration. Never paste API keys, webhook secrets, or client tokens into Copilot Chat, an issue, or a commit.

## Configure Rovei

Use the ignored `.env.local` file for this Codespace. Add the following names and copy the matching values directly from Paddle Sandbox:

```dotenv
PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
PADDLE_PRICE_ID_MONTHLY=
PADDLE_PRICE_ID_ANNUAL=
```

Use the client-side token, server API key, endpoint-specific notification secret, and the actual IDs of the existing $129/month and $1,290/year Sandbox prices. Price IDs are not present in this repository and must not be guessed. Keep the `PADDLE_WEBHOOK_SECRET` blank until the notification destination is created.

For a deployed Codespace rather than local development, add these same names under **GitHub repository Settings → Secrets and variables → Codespaces**, then restart the Codespace. Do not add them as browser-visible variables except for `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, which is designed by Paddle to be public; Rovei still supplies it only to its isolated checkout page.

## Paddle Sandbox dashboard

1. Confirm the active product has the monthly and annual recurring prices, each with quantity one and no trial. Copy the exact `pri_...` IDs into the two price variables above.
2. Create or copy the Sandbox client-side token and server API key under Paddle's authentication/API-key settings. Put each in its matching variable above. Never use a live key or live price ID here.
3. Make the Rovei app reachable at a public HTTPS URL. Paddle cannot call `localhost` or a private Codespaces URL.
4. In **Paddle → Developer tools → Notifications**, add an HTTPS destination with this exact endpoint:

   ```text
   https://YOUR_PUBLIC_ROVEI_HOST/api/webhooks/paddle
   ```

   Subscribe it to `subscription.created`, `subscription.updated`, and `subscription.canceled`. `subscription.updated` carries subsequent billing-period, payment-state, pause/resume, and scheduled-change updates. Copy this destination's signing secret into `PADDLE_WEBHOOK_SECRET`.
5. In **Paddle → Checkout → Checkout settings**, set the default payment link to the public Rovei checkout host as required by Paddle Checkout. Apply the Rovei logo and available brand-color settings there; Rovei opens Paddle's supported light checkout theme. Test only with Paddle Sandbox test payment methods.
6. Restart the app after adding variables. Verify a successful Sandbox payment reaches the completion page only after the signed webhook has updated the subscription. A browser checkout callback alone never grants Studio access.

For the provider behavior implemented here, see Paddle's [overlay checkout guide](https://developer.paddle.com/build/checkout/build-overlay-checkout), [transaction creation API](https://developer.paddle.com/api-reference/transactions/create-transaction), [webhook signature verification](https://developer.paddle.com/webhooks/signature-verification), [cancel subscription API](https://developer.paddle.com/api-reference/subscriptions/cancel-subscription), and [update subscription API](https://developer.paddle.com/api-reference/subscriptions/update-subscription).

## Database migration

Review `supabase/migrations/202610130001_paddle_subscription_sync.sql` alongside the existing subscription-access migration. It adds period start, scheduled cancellation, event ordering, a webhook deduplication table, and a service-role-only synchronization function. This repository change does not apply the migration to any Supabase project. Obtain approval and use the team's normal migration process before applying it, especially in production.

## Current limitations

- This implementation accepts only Sandbox credentials and `test_` client tokens. It does not support live prices or production charges.
- Cancellation is scheduled for the end of the current billing period. A scheduled cancellation can be withdrawn by clearing Paddle's scheduled change. An already canceled subscription must be started again with a new checkout; Paddle cannot reinstate canceled subscriptions.
- Paused and past-due subscriptions are not silently resumed and cannot start a second checkout. Resolve those states through Support/Paddle before retrying.
- Sandbox price IDs, keys, and the notification destination still need to be supplied/configured by an account administrator before checkout can be tested end to end.
