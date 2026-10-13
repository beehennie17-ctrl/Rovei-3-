import { NextResponse } from "next/server";

import {
  isPaddleCustomDataForAccount,
  isPaddleSignatureValid,
  normalizePaddleSubscriptionStatus,
} from "@/lib/billing/paddle-core";
import { backendErrorResponse, BackendError } from "@/lib/backend/errors";
import { requirePaddleSandboxConfig } from "@/lib/backend/paddle-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function dateTime(value: unknown) {
  const candidate = text(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : null;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > 1_000_000) {
      throw new BackendError(413, "webhook_too_large", "The Paddle webhook payload is too large.");
    }

    const config = requirePaddleSandboxConfig();
    if (!isPaddleSignatureValid(
      rawBody,
      request.headers.get("paddle-signature"),
      config.webhookSecret,
    )) {
      throw new BackendError(401, "invalid_paddle_signature", "Paddle webhook signature is invalid.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new BackendError(400, "invalid_webhook", "The Paddle webhook payload is invalid.");
    }

    const event = record(parsed);
    const data = record(event?.data);
    const eventId = text(event?.event_id);
    const eventType = text(event?.event_type);
    const occurredAt = dateTime(event?.occurred_at);

    if (
      !event ||
      !data ||
      !eventId ||
      eventId.length > 100 ||
      !eventType ||
      !occurredAt
    ) {
      throw new BackendError(400, "invalid_webhook", "The Paddle webhook event is incomplete.");
    }

    if (![
      "subscription.created",
      "subscription.updated",
      "subscription.canceled",
    ].includes(eventType)) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const status = normalizePaddleSubscriptionStatus(data.status);
    const subscriptionId = text(data.id);
    const customerId = text(data.customer_id);
    if (
      !status ||
      !subscriptionId ||
      !/^sub_[a-z\d]{26}$/i.test(subscriptionId) ||
      !customerId ||
      !/^ctm_[a-z\d]{26}$/i.test(customerId)
    ) {
      throw new BackendError(400, "invalid_subscription_event", "Paddle sent invalid subscription details.");
    }

    const admin = createAdminClient();
    const { data: existing, error: existingError } = await admin
      .from("subscriptions")
      .select("studio_id, price_id")
      .eq("provider_subscription_id", subscriptionId)
      .maybeSingle();

    if (existingError) {
      console.error("Unable to find Paddle subscription mapping:", existingError);
      throw new BackendError(500, "subscription_lookup_failed", "Unable to verify the Paddle subscription mapping.");
    }

    const customData = record(data.custom_data);
    const customStudioId = text(customData?.studio_id);
    const customUserId = text(customData?.user_id);
    const studioId = existing?.studio_id ?? customStudioId;

    if (!studioId || !/^[a-f\d-]{36}$/i.test(studioId)) {
      throw new BackendError(400, "subscription_account_missing", "Paddle subscription is not associated with a Rovei Studio.");
    }

    const { data: studio, error: studioError } = await admin
      .from("studios")
      .select("owner_user_id")
      .eq("id", studioId)
      .maybeSingle();

    if (studioError) {
      console.error("Unable to verify Paddle subscription Studio:", studioError);
      throw new BackendError(500, "studio_lookup_failed", "Unable to verify the Paddle subscription Studio.");
    }

    const userId = studio?.owner_user_id;
    if (!userId) {
      throw new BackendError(400, "subscription_account_missing", "Paddle subscription is not associated with a Rovei Studio owner.");
    }

    if (
      (customStudioId && customStudioId !== studioId) ||
      (customUserId && !isPaddleCustomDataForAccount(data.custom_data, studioId, userId))
    ) {
      throw new BackendError(403, "subscription_account_mismatch", "Paddle subscription account association does not match.");
    }

    const items = Array.isArray(data.items) ? data.items : [];
    const firstItem = record(items[0]);
    const price = record(firstItem?.price);
    const priceId = text(price?.id) ?? existing?.price_id ?? null;
    if (!priceId) {
      throw new BackendError(400, "subscription_price_missing", "Paddle subscription has no recognized price.");
    }

    const configuredPrice =
      priceId === config.priceIds.monthly || priceId === config.priceIds.annual;
    if (!configuredPrice) {
      throw new BackendError(400, "subscription_price_unrecognized", "Paddle subscription price is not configured for Rovei.");
    }

    const period = record(data.current_billing_period);
    const scheduledChange = record(data.scheduled_change);
    const scheduledCancelAt =
      scheduledChange?.action === "cancel"
        ? dateTime(scheduledChange.effective_at)
        : null;

    const { error: syncError } = await admin.rpc("apply_paddle_subscription_event", {
      p_event_id: eventId,
      p_event_type: eventType,
      p_occurred_at: occurredAt,
      p_studio_id: studioId,
      p_user_id: userId,
      p_subscription_id: subscriptionId,
      p_customer_id: customerId,
      p_price_id: priceId,
      p_status: status,
      p_current_period_start: dateTime(period?.starts_at),
      p_current_period_end: dateTime(period?.ends_at),
      p_scheduled_cancel_at: scheduledCancelAt,
    });

    if (syncError) {
      console.error("Unable to synchronize verified Paddle subscription:", syncError.message);
      throw new BackendError(500, "subscription_sync_failed", "Paddle subscription could not be synchronized.");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
