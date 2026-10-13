import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { backendErrorResponse, BackendError, readJsonBody, requireSameOrigin } from "@/lib/backend/errors";
import {
  findPaddleCheckoutTransaction,
  resolveExistingPaddleCheckout,
} from "@/lib/billing/paddle-core";
import { paddleApiRequest, requirePaddleSandboxConfig } from "@/lib/backend/paddle-api";
import { requireStudioBillingOwner } from "@/lib/backend/paddle-billing";
import { createAdminClient } from "@/lib/supabase/admin";

const checkoutSchema = z.object({
  billing: z.enum(["monthly", "annual"]),
});

function readTransaction(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !("data" in value) ||
    !value.data ||
    typeof value.data !== "object" ||
    !("id" in value.data) ||
    typeof value.data.id !== "string" ||
    !/^txn_[a-z\d]{26}$/i.test(value.data.id)
  ) {
    return null;
  }

  return {
    id: value.data.id,
    status:
      "status" in value.data && typeof value.data.status === "string"
        ? value.data.status
        : null,
  };
}

function readReservation(value: unknown) {
  const reservation = Array.isArray(value) ? value[0] : value;
  if (!reservation || typeof reservation !== "object") return null;
  return {
    isNew: "is_new" in reservation && reservation.is_new === true,
    canReconcile: "can_reconcile" in reservation && reservation.can_reconcile === true,
    transactionId:
      "transaction_id" in reservation &&
      typeof reservation.transaction_id === "string"
        ? reservation.transaction_id
        : null,
    priceId:
      "price_id" in reservation && typeof reservation.price_id === "string"
        ? reservation.price_id
        : null,
    checkoutAttemptId:
      "checkout_attempt_id" in reservation &&
      typeof reservation.checkout_attempt_id === "string"
        ? reservation.checkout_attempt_id
        : null,
    createdAt:
      "created_at" in reservation && typeof reservation.created_at === "string"
        ? reservation.created_at
        : null,
  };
}

async function findCheckoutTransaction(
  config: ReturnType<typeof requirePaddleSandboxConfig>,
  createdAt: string,
  checkoutAttemptId: string,
  studioId: string,
  userId: string,
) {
  const cutoff = new Date(Date.parse(createdAt) - 60_000);
  if (!Number.isFinite(cutoff.getTime())) return null;

  const query = new URLSearchParams({
    origin: "api",
    "created_at[GT]": cutoff.toISOString(),
    per_page: "30",
    "order_by": "created_at[ASC]",
  });
  let path = `/transactions?${query.toString()}`;
  let match: { id: string; status: string | null } | null = null;

  for (let page = 0; page < 100; page += 1) {
    const payload = await paddleApiRequest(config, path, { method: "GET" });
    const pageMatch = findPaddleCheckoutTransaction(
      payload,
      checkoutAttemptId,
      studioId,
      userId,
    );
    if (pageMatch === "ambiguous") return null;
    if (pageMatch) {
      if (match && match.id !== pageMatch.id) return null;
      match = pageMatch;
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      !("meta" in payload) ||
      !payload.meta ||
      typeof payload.meta !== "object" ||
      !("pagination" in payload.meta) ||
      !payload.meta.pagination ||
      typeof payload.meta.pagination !== "object" ||
      !("next" in payload.meta.pagination)
    ) {
      throw new BackendError(
        502,
        "paddle_invalid_response",
        "Paddle returned invalid transaction pagination data.",
      );
    }

    if (payload.meta.pagination.next === null) return match;

    if (typeof payload.meta.pagination.next !== "string") {
      throw new BackendError(
        502,
        "paddle_invalid_response",
        "Paddle returned invalid transaction pagination data.",
      );
    }

    const nextUrl = new URL(payload.meta.pagination.next, "https://sandbox-api.paddle.com");
    if (
      nextUrl.protocol !== "https:" ||
      nextUrl.hostname !== "sandbox-api.paddle.com" ||
      nextUrl.pathname !== "/transactions"
    ) {
      throw new BackendError(
        502,
        "paddle_invalid_response",
        "Paddle returned an invalid transaction pagination URL.",
      );
    }
    path = `${nextUrl.pathname}${nextUrl.search}`;
  }

  return null;
}

async function releaseCheckoutReservation(
  admin: ReturnType<typeof createAdminClient>,
  studioId: string,
  userId: string,
  transactionId: string,
) {
  const { error } = await admin.rpc("release_paddle_checkout", {
    p_studio_id: studioId,
    p_user_id: userId,
    p_transaction_id: transactionId,
  });
  if (error) {
    console.error("Unable to release Paddle checkout reservation:", error.message);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { billing } = checkoutSchema.parse(await readJsonBody(request));
    const { supabase, user, studioId } = await requireStudioBillingOwner();
    const config = requirePaddleSandboxConfig();
    const requestedPriceId = config.priceIds[billing];

    const { data: existing, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("status, provider_subscription_id")
      .eq("studio_id", studioId)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Unable to check for an existing Studio subscription:", subscriptionError);
      throw new BackendError(
        500,
        "subscription_lookup_failed",
        "Unable to verify your current subscription.",
      );
    }

    if (
      existing &&
      (
        ["active", "trialing", "past_due", "paused"].includes(existing.status) ||
        (existing.provider_subscription_id && existing.status !== "cancelled")
      )
    ) {
      throw new BackendError(
        409,
        "subscription_already_exists",
        "This Studio already has a Paddle subscription. Review its billing status before starting another.",
      );
    }

    const admin = createAdminClient();
    let activeLeaseId = randomUUID();
    const { data: reservationData, error: reservationError } = await admin.rpc(
      "reserve_paddle_checkout",
      {
        p_studio_id: studioId,
        p_user_id: user.id,
        p_price_id: requestedPriceId,
        p_lease_id: activeLeaseId,
      },
    );

    if (reservationError) {
      console.error("Unable to reserve a unique Paddle checkout:", reservationError.message);
      throw new BackendError(
        500,
        "checkout_reservation_failed",
        "Rovei could not safely reserve a checkout. Please try again.",
      );
    }

    let reservation = readReservation(reservationData);
    if (!reservation) {
      throw new BackendError(
        500,
        "checkout_reservation_failed",
        "Rovei could not safely reserve a checkout. Please try again.",
      );
    }

    if (!reservation.isNew) {
      let existingTransaction: ReturnType<typeof readTransaction> = null;
      if (reservation.transactionId) {
        existingTransaction = readTransaction(
          await paddleApiRequest(
            config,
            `/transactions/${encodeURIComponent(reservation.transactionId)}`,
            { method: "GET" },
          ),
        );
      } else if (
        reservation.canReconcile &&
        reservation.checkoutAttemptId &&
        reservation.createdAt
      ) {
        existingTransaction = await findCheckoutTransaction(
          config,
          reservation.createdAt,
          reservation.checkoutAttemptId,
          studioId,
          user.id,
        );
        if (!existingTransaction) {
          throw new BackendError(
            409,
            "checkout_outcome_unknown",
            "Paddle has not yet confirmed the result of this checkout request. Rovei will not create another transaction automatically. Please wait and retry, or contact Support if this remains unresolved.",
          );
        }

        const { data: saved, error: saveError } = await admin.rpc(
          "set_paddle_checkout_transaction",
          {
            p_studio_id: studioId,
            p_user_id: user.id,
            p_lease_id: activeLeaseId,
            p_checkout_attempt_id: reservation.checkoutAttemptId,
            p_transaction_id: existingTransaction.id,
          },
        );
        if (saveError || saved !== true) {
          if (saveError) {
            console.error("Unable to store reconciled Paddle transaction:", saveError.message);
          }
          throw new BackendError(
            409,
            "checkout_reservation_changed",
            "The checkout reservation changed while Paddle was being reconciled. Please retry the billing status check.",
          );
        }
      } else if (!reservation.transactionId) {
        throw new BackendError(
          409,
          "checkout_in_progress",
          reservation.priceId !== requestedPriceId
            ? "A checkout for a different billing option is being prepared for this Studio. Please wait and try again."
            : "A secure checkout is already being prepared for this Studio. Please wait a moment and try again.",
        );
      }

      if (!existingTransaction) {
        throw new BackendError(
          502,
          "paddle_invalid_response",
          "Paddle did not return a valid checkout transaction.",
        );
      }

      const resolution = resolveExistingPaddleCheckout(
        existingTransaction.status ?? "",
        reservation.priceId ?? "",
        requestedPriceId,
      );

      if (resolution === "reuse") {
        return NextResponse.json(
          { transactionId: existingTransaction.id },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      if (resolution === "different_plan") {
        throw new BackendError(
          409,
          "checkout_plan_already_selected",
          "A Paddle checkout for another billing option is already open. Continue that checkout or contact Support if you need to change the plan.",
        );
      }

      if (resolution === "processing") {
        throw new BackendError(
          409,
          "checkout_confirmation_pending",
          "This checkout is already being processed. Rovei will update your Studio when Paddle confirms its status.",
        );
      }

      await releaseCheckoutReservation(
        admin,
        studioId,
        user.id,
        existingTransaction.id,
      );
      activeLeaseId = randomUUID();

      const { data: nextReservationData, error: nextReservationError } = await admin.rpc(
        "reserve_paddle_checkout",
        {
          p_studio_id: studioId,
          p_user_id: user.id,
          p_price_id: requestedPriceId,
          p_lease_id: activeLeaseId,
        },
      );
      const replacementReservation = readReservation(nextReservationData);
      if (
        nextReservationError ||
        !replacementReservation?.isNew ||
        !replacementReservation.checkoutAttemptId
      ) {
        if (nextReservationError) {
          console.error("Unable to reserve replacement Paddle checkout:", nextReservationError.message);
        }
        throw new BackendError(
          409,
          "checkout_in_progress",
          "A billing update is already being processed for this Studio. Please refresh your billing status.",
        );
      }
      reservation = replacementReservation;
    }

    if (!reservation.checkoutAttemptId || !reservation.priceId) {
      throw new BackendError(
        500,
        "checkout_reservation_failed",
        "Rovei could not safely prepare the checkout. Please try again.",
      );
    }

    const transaction = await paddleApiRequest(config, "/transactions", {
      method: "POST",
      body: {
        items: [{ price_id: reservation.priceId, quantity: 1 }],
        collection_mode: "automatic",
        custom_data: {
          studio_id: studioId,
          user_id: user.id,
          billing_cadence: billing,
          checkout_attempt_id: reservation.checkoutAttemptId,
        },
      },
    });

    const createdTransaction = readTransaction(transaction);
    if (!createdTransaction) {
      throw new BackendError(
        502,
        "paddle_invalid_response",
        "Paddle did not return a valid checkout transaction. Please try again.",
      );
    }

    const { data: saved, error: saveError } = await admin.rpc(
      "set_paddle_checkout_transaction",
      {
        p_studio_id: studioId,
        p_user_id: user.id,
        p_lease_id: activeLeaseId,
        p_checkout_attempt_id: reservation.checkoutAttemptId,
        p_transaction_id: createdTransaction.id,
      },
    );

    if (saveError || saved !== true) {
      if (saveError) {
        console.error("Unable to store Paddle checkout transaction:", saveError.message);
      }
      throw new BackendError(
        500,
        "checkout_reservation_failed",
        "Rovei could not safely prepare the checkout. Please try again.",
      );
    }

    return NextResponse.json(
      { transactionId: createdTransaction.id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
