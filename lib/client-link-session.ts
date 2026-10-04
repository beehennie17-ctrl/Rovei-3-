"use client";

import type {
  IssuedClientExperienceLink,
} from "@/types/client-link";

export const CLOUD_CLIENT_CONTEXT_KEY =
  "rovei:cloud-client-context";

export const SECURE_CLIENT_LINK_SESSION_KEY =
  "rovei:secure-client-link-session";

const SECURE_TOKEN_PATTERN =
  /^rvc_[A-Za-z0-9_-]{43}$/;

export type CloudClientContext = {
  clientId: string;
  appointmentId: string;
  createdAt: string;
};

function getStorage():
  Storage | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  try {
    return window
      .sessionStorage;
  } catch {
    return null;
  }
}

function isIsoDate(
  value: unknown,
): value is string {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const parsed =
    Date.parse(value);

  return (
    Number.isFinite(
      parsed,
    ) &&
    new Date(
      parsed,
    ).toISOString() ===
      value
  );
}

function isContext(
  value: unknown,
): value is CloudClientContext {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  return (
    typeof record.clientId ===
      "string" &&
    record.clientId.length >
      0 &&
    typeof record.appointmentId ===
      "string" &&
    record.appointmentId.length >
      0 &&
    isIsoDate(
      record.createdAt,
    )
  );
}

function isIssuedLink(
  value: unknown,
): value is IssuedClientExperienceLink {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  if (
    typeof record.clientExperienceId !==
      "string" ||
    typeof record.clientId !==
      "string" ||
    typeof record.appointmentId !==
      "string" ||
    !record.link ||
    typeof record.link !==
      "object" ||
    Array.isArray(
      record.link,
    )
  ) {
    return false;
  }

  const link =
    record.link as Record<
      string,
      unknown
    >;

  return (
    typeof link.token ===
      "string" &&
    SECURE_TOKEN_PATTERN.test(
      link.token,
    ) &&
    isIsoDate(
      link.createdAt,
    ) &&
    isIsoDate(
      link.expiresAt,
    )
  );
}

export function writeCloudClientContext(
  context:
    CloudClientContext,
) {
  const storage =
    getStorage();

  if (
    !storage ||
    !isContext(context)
  ) {
    return false;
  }

  try {
    storage.setItem(
      CLOUD_CLIENT_CONTEXT_KEY,
      JSON.stringify(
        context,
      ),
    );

    storage.removeItem(
      SECURE_CLIENT_LINK_SESSION_KEY,
    );

    return true;
  } catch {
    return false;
  }
}

export function readCloudClientContext():
  CloudClientContext | null {
  const storage =
    getStorage();

  if (!storage) {
    return null;
  }

  try {
    const raw =
      storage.getItem(
        CLOUD_CLIENT_CONTEXT_KEY,
      );

    if (!raw) {
      return null;
    }

    const parsed:
      unknown =
      JSON.parse(raw);

    if (
      !isContext(parsed)
    ) {
      storage.removeItem(
        CLOUD_CLIENT_CONTEXT_KEY,
      );

      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeSecureClientLinkSession(
  value:
    IssuedClientExperienceLink,
) {
  const storage =
    getStorage();

  if (
    !storage ||
    !isIssuedLink(value)
  ) {
    return false;
  }

  try {
    storage.setItem(
      SECURE_CLIENT_LINK_SESSION_KEY,
      JSON.stringify(
        value,
      ),
    );

    return true;
  } catch {
    return false;
  }
}

export function readSecureClientLinkSession():
  IssuedClientExperienceLink | null {
  const storage =
    getStorage();

  if (!storage) {
    return null;
  }

  try {
    const raw =
      storage.getItem(
        SECURE_CLIENT_LINK_SESSION_KEY,
      );

    if (!raw) {
      return null;
    }

    const parsed:
      unknown =
      JSON.parse(raw);

    if (
      !isIssuedLink(parsed)
    ) {
      storage.removeItem(
        SECURE_CLIENT_LINK_SESSION_KEY,
      );

      return null;
    }

    if (
      Date.parse(
        parsed.link.expiresAt,
      ) <= Date.now()
    ) {
      storage.removeItem(
        SECURE_CLIENT_LINK_SESSION_KEY,
      );

      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearSecureClientLinkSession() {
  const storage =
    getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(
      SECURE_CLIENT_LINK_SESSION_KEY,
    );
  } catch {
    // Browser session storage is best effort.
  }
}
