import { createHmac, timingSafeEqual } from "node:crypto";

export type BillingCadence = "monthly" | "annual";

export type PaddleSandboxConfig = {
  environment: "sandbox";
  apiKey: string;
  clientToken: string;
  webhookSecret: string;
  priceIds: Record<BillingCadence, string>;
};

export function getPaddleSandboxConfig(
  env: NodeJS.ProcessEnv = process.env,
): PaddleSandboxConfig {
  if (env.PADDLE_ENVIRONMENT !== "sandbox") {
    throw new Error("Paddle billing is Sandbox-only. Set PADDLE_ENVIRONMENT=sandbox.");
  }

  const missing = [
    "PADDLE_API_KEY",
    "PADDLE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
    "PADDLE_PRICE_ID_MONTHLY",
    "PADDLE_PRICE_ID_ANNUAL",
  ].filter((key) => !env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required Paddle Sandbox configuration: ${missing.join(", ")}.`);
  }

  const clientToken = env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!.trim();
  const monthlyPriceId = env.PADDLE_PRICE_ID_MONTHLY!.trim();
  const annualPriceId = env.PADDLE_PRICE_ID_ANNUAL!.trim();

  if (!clientToken.startsWith("test_")) {
    throw new Error("The Paddle client token must be a Sandbox test_ token.");
  }

  if (
    !/^pri_[a-z\d]{26}$/.test(monthlyPriceId) ||
    !/^pri_[a-z\d]{26}$/.test(annualPriceId) ||
    monthlyPriceId === annualPriceId
  ) {
    throw new Error("Configure the distinct, real Paddle Sandbox monthly and annual price IDs.");
  }

  return {
    environment: "sandbox",
    apiKey: env.PADDLE_API_KEY!.trim(),
    clientToken,
    webhookSecret: env.PADDLE_WEBHOOK_SECRET!.trim(),
    priceIds: {
      monthly: monthlyPriceId,
      annual: annualPriceId,
    },
  };
}

export function getPaddleClientToken(
  env: NodeJS.ProcessEnv = process.env,
) {
  if (env.PADDLE_ENVIRONMENT !== "sandbox") return null;
  const token = env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim();
  return token?.startsWith("test_") ? token : null;
}

export function getPaddleConfigurationIssue(
  env: NodeJS.ProcessEnv = process.env,
) {
  try {
    getPaddleSandboxConfig(env);
    return null;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "Paddle Sandbox configuration is incomplete.";
  }
}

export function getBillingCadenceForPrice(
  priceId: string,
  priceIds: Record<BillingCadence, string>,
): BillingCadence | null {
  if (priceId === priceIds.monthly) return "monthly";
  if (priceId === priceIds.annual) return "annual";
  return null;
}

export function isPaddleSignatureValid(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  now = Date.now(),
  toleranceSeconds = 300,
) {
  if (!signatureHeader || !secret) return false;

  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of signatureHeader.split(";")) {
    const [key, value] = part.trim().split("=", 2);
    if (key === "ts" && value) timestamp = value;
    if (key === "h1" && value) signatures.push(value);
  }

  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) {
    return false;
  }

  const timestampSeconds = Number(timestamp);
  if (
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(Math.floor(now / 1000) - timestampSeconds) > toleranceSeconds
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}:${rawBody}`)
    .digest();

  return signatures.some((signature) => {
    if (!/^[a-f\d]{64}$/i.test(signature)) return false;
    const candidate = Buffer.from(signature, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

export function normalizePaddleSubscriptionStatus(
  status: unknown,
): "active" | "trialing" | "past_due" | "paused" | "cancelled" | null {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "paused":
      return status;
    case "canceled":
      return "cancelled";
    default:
      return null;
  }
}

export function isPaddleEventOutOfOrder(
  existingEventAt: string | null | undefined,
  incomingEventAt: string,
  existingEventId?: string | null,
  incomingEventId?: string,
) {
  if (!existingEventAt) return false;
  const existing = Date.parse(existingEventAt);
  const incoming = Date.parse(incomingEventAt);
  if (!Number.isFinite(existing) || !Number.isFinite(incoming)) return false;
  if (incoming < existing) return true;
  if (incoming > existing) return false;
  if (!existingEventId || !incomingEventId) return false;
  return incomingEventId <= existingEventId;
}

export function findPaddleCheckoutTransaction(
  value: unknown,
  checkoutAttemptId: string,
  studioId: string,
  userId: string,
): { id: string; status: string | null } | "ambiguous" | null {
  if (!value || typeof value !== "object" || !("data" in value) || !Array.isArray(value.data)) {
    return null;
  }

  let match: { id: string; status: string | null } | null = null;
  for (const transaction of value.data) {
    if (!transaction || typeof transaction !== "object") continue;
    if (!("id" in transaction) || typeof transaction.id !== "string" ||
        !/^txn_[a-z\d]{26}$/i.test(transaction.id)) {
      continue;
    }

    const customData = "custom_data" in transaction ? transaction.custom_data : null;
    if (
      !isPaddleCustomDataForAccount(customData, studioId, userId) ||
      !customData ||
      !("checkout_attempt_id" in customData) ||
      customData.checkout_attempt_id !== checkoutAttemptId
    ) {
      continue;
    }

    if (match) return "ambiguous";
    match = {
      id: transaction.id,
      status:
        "status" in transaction && typeof transaction.status === "string"
          ? transaction.status
          : null,
    };
  }

  return match;
}

export function resolveExistingPaddleCheckout(
  transactionStatus: string,
  reservedPriceId: string,
  requestedPriceId: string,
): "reuse" | "replace" | "different_plan" | "processing" {
  if (transactionStatus === "canceled") return "replace";
  if (transactionStatus === "draft" || transactionStatus === "ready") {
    return reservedPriceId === requestedPriceId ? "reuse" : "different_plan";
  }
  return "processing";
}

export function isPaddleCustomDataForAccount(
  value: unknown,
  studioId: string,
  userId: string,
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return data.studio_id === studioId && data.user_id === userId;
}

export function isBillingCadenceValue(value: unknown): value is BillingCadence {
  return value === "monthly" || value === "annual";
}
