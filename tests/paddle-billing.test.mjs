import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  findPaddleCheckoutTransaction,
  getBillingCadenceForPrice,
  getPaddleClientToken,
  getPaddleConfigurationIssue,
  getPaddleSandboxConfig,
  isPaddleCustomDataForAccount,
  isPaddleEventOutOfOrder,
  isPaddleSignatureValid,
  normalizePaddleSubscriptionStatus,
  resolveExistingPaddleCheckout,
} from "../lib/billing/paddle-core.ts";
import { hasActiveSubscription } from "../lib/backend/subscription-access.ts";

const sandboxEnv = {
  PADDLE_ENVIRONMENT: "sandbox",
  PADDLE_API_KEY: "sandbox-api-key-fixture",
  PADDLE_WEBHOOK_SECRET: "sandbox-webhook-secret-fixture",
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: "test_client-token-fixture",
  PADDLE_PRICE_ID_MONTHLY: `pri_${"a".repeat(26)}`,
  PADDLE_PRICE_ID_ANNUAL: `pri_${"b".repeat(26)}`,
};

test("monthly and annual cadence resolve only through configured Paddle price IDs", () => {
  const config = getPaddleSandboxConfig(sandboxEnv);
  assert.equal(config.priceIds.monthly, sandboxEnv.PADDLE_PRICE_ID_MONTHLY);
  assert.equal(config.priceIds.annual, sandboxEnv.PADDLE_PRICE_ID_ANNUAL);
  assert.equal(
    getBillingCadenceForPrice(sandboxEnv.PADDLE_PRICE_ID_MONTHLY, config.priceIds),
    "monthly",
  );
  assert.equal(
    getBillingCadenceForPrice(sandboxEnv.PADDLE_PRICE_ID_ANNUAL, config.priceIds),
    "annual",
  );
  assert.equal(
    getBillingCadenceForPrice("pri_unconfigured_fixture", config.priceIds),
    null,
  );
});

test("Sandbox configuration fails closed for missing values and production mode", () => {
  assert.throws(
    () => getPaddleSandboxConfig({ ...sandboxEnv, PADDLE_ENVIRONMENT: "production" }),
    /Sandbox-only/,
  );
  assert.throws(
    () => getPaddleSandboxConfig({ ...sandboxEnv, PADDLE_PRICE_ID_ANNUAL: "" }),
    /PADDLE_PRICE_ID_ANNUAL/,
  );
  assert.equal(getPaddleClientToken({ ...sandboxEnv, PADDLE_ENVIRONMENT: "production" }), null);
  assert.match(
    getPaddleConfigurationIssue({ ...sandboxEnv, NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: "live_token" }),
    /Sandbox test_/,
  );
});

test("Paddle webhook signatures verify the raw payload and reject tampering or stale timestamps", () => {
  const now = Date.parse("2026-10-13T11:00:00.000Z");
  const timestamp = String(Math.floor(now / 1000));
  const body = '{"event_id":"evt_fixture","event_type":"subscription.updated"}';
  const digest = createHmac("sha256", "webhook-fixture")
    .update(`${timestamp}:${body}`)
    .digest("hex");
  const header = `ts=${timestamp};h1=${digest}`;

  assert.equal(isPaddleSignatureValid(body, header, "webhook-fixture", now), true);
  assert.equal(isPaddleSignatureValid(`${body} `, header, "webhook-fixture", now), false);
  assert.equal(isPaddleSignatureValid(body, null, "webhook-fixture", now), false);
  assert.equal(
    isPaddleSignatureValid(body, `ts=${timestamp - 600};h1=${digest}`, "webhook-fixture", now),
    false,
  );
  assert.equal(isPaddleSignatureValid(body, header, "wrong-secret", now), false);
});

test("Paddle lifecycle states map conservatively to Rovei access", () => {
  assert.equal(normalizePaddleSubscriptionStatus("active"), "active");
  assert.equal(normalizePaddleSubscriptionStatus("trialing"), "trialing");
  assert.equal(normalizePaddleSubscriptionStatus("past_due"), "past_due");
  assert.equal(normalizePaddleSubscriptionStatus("paused"), "paused");
  assert.equal(normalizePaddleSubscriptionStatus("canceled"), "cancelled");
  assert.equal(normalizePaddleSubscriptionStatus("unknown"), null);

  const now = Date.parse("2026-10-13T11:00:00.000Z");
  assert.equal(hasActiveSubscription("active", "2026-10-14T11:00:00.000Z", now), true);
  assert.equal(hasActiveSubscription("trialing", null, now), true);
  assert.equal(hasActiveSubscription("past_due", null, now), false);
  assert.equal(hasActiveSubscription("paused", null, now), false);
  assert.equal(hasActiveSubscription("cancelled", null, now), false);
  assert.equal(hasActiveSubscription("active", "2026-10-12T11:00:00.000Z", now), false);
});

test("webhook ordering rejects stale events and orders distinct equal-time events deterministically", () => {
  const stored = "2026-10-13T10:00:00.000Z";
  assert.equal(isPaddleEventOutOfOrder(stored, "2026-10-13T09:59:59.000Z"), true);
  assert.equal(isPaddleEventOutOfOrder(stored, stored), false);
  assert.equal(isPaddleEventOutOfOrder(stored, stored, "evt_002", "evt_001"), true);
  assert.equal(isPaddleEventOutOfOrder(stored, stored, "evt_001", "evt_002"), false);
  assert.equal(isPaddleEventOutOfOrder(stored, stored, "evt_001", "evt_001"), true);
  assert.equal(isPaddleEventOutOfOrder(stored, "2026-10-13T10:00:01.000Z"), false);
  assert.equal(isPaddleEventOutOfOrder(null, "2026-10-13T10:00:01.000Z"), false);
});

test("checkout reservation recovery renews the lease only for Paddle reconciliation", async () => {
  const migration = await readFile(
    new URL("../supabase/migrations/202610130001_paddle_subscription_sync.sql", import.meta.url),
    "utf8",
  );
  const reservationFunction = migration.slice(
    migration.indexOf("create or replace function public.reserve_paddle_checkout"),
    migration.indexOf("create or replace function public.set_paddle_checkout_transaction"),
  );

  assert.match(migration, /checkout_attempt_id uuid not null default gen_random_uuid/);
  assert.match(reservationFunction, /for update/);
  assert.match(reservationFunction, /lease_expires_at <= pg_catalog\.now\(\)/);
  assert.match(reservationFunction, /lease_id = p_lease_id/);
  assert.match(reservationFunction, /attempt\.checkout_attempt_id::text/);
  assert.match(reservationFunction, /lease_expires_at = pg_catalog\.now\(\) \+ interval '5 minutes'/);
  assert.match(reservationFunction, /return query select false, true, null::text/);
});

test("checkout SQL fences transaction writes and cleanup by reservation ownership", async () => {
  const migration = await readFile(
    new URL("../supabase/migrations/202610130001_paddle_subscription_sync.sql", import.meta.url),
    "utf8",
  );
  const setFunction = migration.slice(
    migration.indexOf("create or replace function public.set_paddle_checkout_transaction"),
    migration.indexOf("create or replace function public.release_paddle_checkout"),
  );
  const releaseFunction = migration.slice(
    migration.indexOf("create or replace function public.release_paddle_checkout"),
    migration.indexOf("create or replace function public.apply_paddle_subscription_event"),
  );

  assert.match(setFunction, /and lease_id = p_lease_id/);
  assert.match(setFunction, /and checkout_attempt_id = p_checkout_attempt_id/);
  assert.match(setFunction, /transaction_id is null/);
  assert.match(releaseFunction, /and transaction_id = p_transaction_id/);
});

test("uncertain transaction recovery matches exactly one account-bound attempt marker", () => {
  const transaction = {
    id: `txn_${"a".repeat(26)}`,
    status: "ready",
    custom_data: {
      studio_id: "studio-1",
      user_id: "owner-1",
      checkout_attempt_id: "attempt-1",
    },
  };
  const page = { data: [transaction] };

  assert.deepEqual(
    findPaddleCheckoutTransaction(page, "attempt-1", "studio-1", "owner-1"),
    { id: transaction.id, status: "ready" },
  );
  assert.equal(findPaddleCheckoutTransaction(page, "attempt-2", "studio-1", "owner-1"), null);
  assert.equal(findPaddleCheckoutTransaction(page, "attempt-1", "studio-2", "owner-1"), null);
  assert.equal(
    findPaddleCheckoutTransaction({ data: [transaction, transaction] }, "attempt-1", "studio-1", "owner-1"),
    "ambiguous",
  );
});

test("checkout does not send a client-supplied Paddle idempotency header or retry unknown POSTs", async () => {
  const route = await readFile(
    new URL("../app/api/billing/checkout/route.ts", import.meta.url),
    "utf8",
  );
  const paddleApi = await readFile(
    new URL("../lib/backend/paddle-api.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(paddleApi, /Paddle-Request-Id/);
  assert.match(route, /checkout_attempt_id: reservation\.checkoutAttemptId/);
  assert.match(route, /findCheckoutTransaction\(/);
  assert.match(route, /checkout_outcome_unknown/);
  assert.match(route, /Rovei will not create another transaction automatically/);
  assert.equal((route.match(/paddleApiRequest\(config, "\/transactions"/g) ?? []).length, 1);
});

test("webhook SQL deduplicates event IDs and applies timestamp plus event-ID ordering atomically", async () => {
  const migration = await readFile(
    new URL("../supabase/migrations/202610130001_paddle_subscription_sync.sql", import.meta.url),
    "utf8",
  );
  const eventFunction = migration.slice(
    migration.indexOf("create or replace function public.apply_paddle_subscription_event"),
    migration.indexOf("revoke all on function public.reserve_paddle_checkout"),
  );

  assert.match(migration, /event_id text primary key/);
  assert.match(eventFunction, /on conflict \(event_id\) do nothing/);
  assert.match(eventFunction, /p_occurred_at < existing_subscription\.last_event_at/);
  assert.match(eventFunction, /p_event_id collate "C" <= existing_subscription\.last_event_id collate "C"/);
  assert.match(eventFunction, /excluded\.last_event_id collate "C" > public\.subscriptions\.last_event_id collate "C"/);
  assert.match(eventFunction, /if inserted_event_count = 0 then\s+return false;/);
  assert.match(eventFunction, /lease_expires_at <= pg_catalog\.now\(\)/);
});

test("duplicate checkout requests reuse the same transaction or block unsafe replacements", () => {
  const requested = sandboxEnv.PADDLE_PRICE_ID_MONTHLY;
  const reserved = sandboxEnv.PADDLE_PRICE_ID_ANNUAL;
  assert.equal(resolveExistingPaddleCheckout("ready", requested, requested), "reuse");
  assert.equal(resolveExistingPaddleCheckout("draft", reserved, requested), "different_plan");
  assert.equal(resolveExistingPaddleCheckout("completed", requested, requested), "processing");
  assert.equal(resolveExistingPaddleCheckout("canceled", reserved, requested), "replace");
});

test("subscription custom data must match both authenticated Studio and owner", () => {
  const ownerMetadata = { studio_id: "studio-1", user_id: "owner-1" };
  assert.equal(isPaddleCustomDataForAccount(ownerMetadata, "studio-1", "owner-1"), true);
  assert.equal(isPaddleCustomDataForAccount(ownerMetadata, "studio-2", "owner-1"), false);
  assert.equal(isPaddleCustomDataForAccount(ownerMetadata, "studio-1", "user-2"), false);
  assert.equal(isPaddleCustomDataForAccount(null, "studio-1", "owner-1"), false);
});
