import { NextResponse } from "next/server";

import { backendErrorResponse, BackendError } from "@/lib/backend/errors";
import { getBillingCadenceForPrice } from "@/lib/billing/paddle-core";
import { hasActiveSubscription } from "@/lib/backend/subscription-access";
import { requireStudioBillingOwner } from "@/lib/backend/paddle-billing";

export async function GET() {
  try {
    const { supabase, studioId } = await requireStudioBillingOwner();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, price_id, current_period_start, current_period_end, scheduled_cancel_at")
      .eq("studio_id", studioId)
      .maybeSingle();

    if (error) {
      console.error("Unable to load Studio billing status:", error);
      throw new BackendError(
        500,
        "subscription_lookup_failed",
        "Unable to load your billing details.",
      );
    }

    const monthlyPriceId = process.env.PADDLE_PRICE_ID_MONTHLY;
    const annualPriceId = process.env.PADDLE_PRICE_ID_ANNUAL;
    const billing =
      data?.price_id && monthlyPriceId && annualPriceId
        ? getBillingCadenceForPrice(data.price_id, {
            monthly: monthlyPriceId,
            annual: annualPriceId,
          })
        : null;

    return NextResponse.json(
      {
        status: data?.status ?? "inactive",
        billing,
        currentPeriodStart: data?.current_period_start ?? null,
        currentPeriodEnd: data?.current_period_end ?? null,
        scheduledCancelAt: data?.scheduled_cancel_at ?? null,
        accessActive: hasActiveSubscription(
          data?.status,
          data?.current_period_end,
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
