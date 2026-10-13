import { NextResponse } from "next/server";
import { z } from "zod";

import { backendErrorResponse, BackendError, readJsonBody, requireSameOrigin } from "@/lib/backend/errors";
import { paddleApiRequest, requirePaddleSandboxConfig } from "@/lib/backend/paddle-api";
import { requireStudioBillingOwner } from "@/lib/backend/paddle-billing";

const manageSchema = z.object({
  action: z.enum(["cancel", "reactivate"]),
});

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { action } = manageSchema.parse(await readJsonBody(request));
    const { supabase, studioId } = await requireStudioBillingOwner();
    const config = requirePaddleSandboxConfig();
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("status, provider_subscription_id, scheduled_cancel_at")
      .eq("studio_id", studioId)
      .maybeSingle();

    if (error) {
      console.error("Unable to load subscription for billing change:", error);
      throw new BackendError(
        500,
        "subscription_lookup_failed",
        "Unable to verify your current subscription.",
      );
    }

    if (!subscription?.provider_subscription_id) {
      throw new BackendError(
        409,
        "subscription_not_found",
        "There is no Paddle subscription to update.",
      );
    }

    const canScheduleCancellation =
      subscription.status === "active" || subscription.status === "trialing";

    if (action === "cancel" && (!canScheduleCancellation || subscription.scheduled_cancel_at)) {
      throw new BackendError(
        409,
        "cancellation_unavailable",
        "This subscription cannot be scheduled for cancellation in its current state.",
      );
    }

    if (
      action === "reactivate" &&
      (!canScheduleCancellation || !subscription.scheduled_cancel_at)
    ) {
      throw new BackendError(
        409,
        "reactivation_unavailable",
        "Only a subscription scheduled to cancel can be reactivated. Canceled subscriptions require a new checkout.",
      );
    }

    await paddleApiRequest(
      config,
      action === "cancel"
        ? `/subscriptions/${encodeURIComponent(subscription.provider_subscription_id)}/cancel`
        : `/subscriptions/${encodeURIComponent(subscription.provider_subscription_id)}`,
      {
        method: action === "cancel" ? "POST" : "PATCH",
        body: action === "cancel"
          ? { effective_from: "next_billing_period" }
          : { scheduled_change: null },
      },
    );

    return NextResponse.json(
      {
        requested: action,
        message: action === "cancel"
          ? "Cancellation was requested for the end of the current billing period. Paddle will confirm the updated status."
          : "Reactivation was requested. Paddle will confirm the updated status.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
