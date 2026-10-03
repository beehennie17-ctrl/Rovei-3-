import type { ClientLinkPrototype } from "@/types/client-link";

export const NEW_CLIENT_LINK_KEY = "rovei:new-client-link";
const TOKEN_PREFIX = "rv_";
const RANDOM_BYTE_LENGTH = 16;
const TOKEN_PATTERN = /^rv_[A-Za-z0-9_-]{22}$/;

function canUseSessionStorage() {
  if (typeof window === "undefined") return false;
  try {
    return typeof window.sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

export function isValidPrototypeClientToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}

function isValidCreatedAt(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 20 || value.length > 40) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

export function isValidClientLinkPrototype(value: unknown): value is ClientLinkPrototype {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 2 || !keys.includes("token") || !keys.includes("createdAt")) return false;

  return isValidPrototypeClientToken(record.token) && isValidCreatedAt(record.createdAt);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function generatePrototypeClientToken(): string {
  if (typeof window === "undefined" || !window.crypto?.getRandomValues) {
    throw new Error("Prototype token generation requires the browser Web Crypto API.");
  }

  const bytes = new Uint8Array(RANDOM_BYTE_LENGTH);
  window.crypto.getRandomValues(bytes);
  return `${TOKEN_PREFIX}${bytesToBase64Url(bytes)}`;
}

export function readClientLinkPrototype(): ClientLinkPrototype | null {
  if (!canUseSessionStorage()) return null;

  try {
    const stored = window.sessionStorage.getItem(NEW_CLIENT_LINK_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!isValidClientLinkPrototype(parsed)) {
      window.sessionStorage.removeItem(NEW_CLIENT_LINK_KEY);
      return null;
    }

    return parsed;
  } catch {
    try {
      window.sessionStorage.removeItem(NEW_CLIENT_LINK_KEY);
    } catch {
      // Prototype-only persistence is best effort.
    }
    return null;
  }
}

export function writeClientLinkPrototype(record: ClientLinkPrototype): boolean {
  if (!canUseSessionStorage() || !isValidClientLinkPrototype(record)) return false;

  try {
    window.sessionStorage.setItem(NEW_CLIENT_LINK_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearClientLinkPrototype(): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(NEW_CLIENT_LINK_KEY);
  } catch {
    // Prototype-only persistence is best effort.
  }
}

export function createClientLinkPrototype(): ClientLinkPrototype {
  return {
    token: generatePrototypeClientToken(),
    createdAt: new Date().toISOString(),
  };
}

export function getOrCreateClientLinkPrototype(): ClientLinkPrototype | null {
  const existing = readClientLinkPrototype();
  if (existing) return existing;

  try {
    const next = createClientLinkPrototype();
    return writeClientLinkPrototype(next) ? next : null;
  } catch {
    return null;
  }
}

export function doesPrototypeClientTokenMatch(value: string): boolean {
  if (!isValidPrototypeClientToken(value)) return false;
  return readClientLinkPrototype()?.token === value;
}
