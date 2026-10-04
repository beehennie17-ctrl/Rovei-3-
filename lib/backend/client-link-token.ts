import "server-only";

import {
  createHash,
  randomBytes,
} from "node:crypto";

export const CLIENT_LINK_TOKEN_PREFIX =
  "rvc_";

export const CLIENT_LINK_RANDOM_BYTES =
  32;

export const CLIENT_LINK_TOKEN_PATTERN =
  /^rvc_[A-Za-z0-9_-]{43}$/;

export const CLIENT_LINK_HASH_PATTERN =
  /^[0-9a-f]{64}$/;

const DAY_MS =
  24 * 60 * 60 * 1000;

const MINIMUM_LINK_LIFETIME_DAYS =
  7;

const DAYS_AFTER_APPOINTMENT =
  7;

export type ClientLinkSecret = {
  token: string;
  tokenHash: string;
};

export function isValidClientLinkToken(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    CLIENT_LINK_TOKEN_PATTERN.test(
      value,
    )
  );
}

export function isValidClientLinkHash(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    CLIENT_LINK_HASH_PATTERN.test(
      value,
    )
  );
}

export function generateClientLinkToken():
  string {
  const secret =
    randomBytes(
      CLIENT_LINK_RANDOM_BYTES,
    ).toString("base64url");

  const token =
    `${CLIENT_LINK_TOKEN_PREFIX}${secret}`;

  if (
    !isValidClientLinkToken(
      token,
    )
  ) {
    throw new Error(
      "Generated an invalid Rovei client-link token.",
    );
  }

  return token;
}

export function hashClientLinkToken(
  token: string,
): string {
  if (
    !isValidClientLinkToken(
      token,
    )
  ) {
    throw new Error(
      "Invalid Rovei client-link token.",
    );
  }

  const hash =
    createHash("sha256")
      .update(
        token,
        "utf8",
      )
      .digest("hex");

  if (
    !isValidClientLinkHash(
      hash,
    )
  ) {
    throw new Error(
      "Unable to hash the Rovei client-link token.",
    );
  }

  return hash;
}

export function createClientLinkSecret():
  ClientLinkSecret {
  const token =
    generateClientLinkToken();

  return {
    token,

    tokenHash:
      hashClientLinkToken(
        token,
      ),
  };
}

export function getClientLinkExpiry(
  appointmentStartsAt:
    string | null | undefined,

  now =
    new Date(),
): string {
  const minimumExpiry =
    now.getTime() +
    MINIMUM_LINK_LIFETIME_DAYS *
      DAY_MS;

  const appointmentTime =
    appointmentStartsAt
      ? Date.parse(
          appointmentStartsAt,
        )
      : Number.NaN;

  const appointmentExpiry =
    Number.isFinite(
      appointmentTime,
    )
      ? appointmentTime +
        DAYS_AFTER_APPOINTMENT *
          DAY_MS
      : minimumExpiry;

  return new Date(
    Math.max(
      minimumExpiry,
      appointmentExpiry,
    ),
  ).toISOString();
}

export function isClientLinkExpired(
  expiresAt: string,
  now = new Date(),
): boolean {
  const expiry =
    Date.parse(
      expiresAt,
    );

  return (
    !Number.isFinite(
      expiry,
    ) ||
    expiry <=
      now.getTime()
  );
}
