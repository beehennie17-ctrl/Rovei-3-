import "server-only";

import {
  getPaddleSandboxConfig,
  type PaddleSandboxConfig,
} from "@/lib/billing/paddle-core";
import { BackendError } from "@/lib/backend/errors";

export function requirePaddleSandboxConfig() {
  try {
    return getPaddleSandboxConfig();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Paddle Sandbox billing is not configured.";
    throw new BackendError(503, "paddle_not_configured", message);
  }
}

export async function paddleApiRequest(
  config: PaddleSandboxConfig,
  path: string,
  options: {
    method: "GET" | "POST" | "PATCH";
    body?: Record<string, unknown>;
  },
): Promise<unknown> {
  const response = await fetch(`https://sandbox-api.paddle.com${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: "no-store",
  });

  const responseText = await response.text();
  let payload: unknown;
  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new BackendError(
      502,
      "paddle_invalid_response",
      "Paddle returned an unreadable response. Please try again.",
    );
  }

  if (!response.ok) {
    console.error("Paddle Sandbox API request failed:", response.status);
    throw new BackendError(
      502,
      "paddle_request_failed",
      "Paddle could not complete the billing request. No Studio access was changed.",
    );
  }

  return payload;
}
