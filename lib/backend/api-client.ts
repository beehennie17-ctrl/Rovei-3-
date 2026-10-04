export type BackendMode =
  | "prototype"
  | "supabase";

export type BackendStatus = {
  ok: boolean;
  backend: BackendMode;
  configured: boolean;
};

type BackendErrorPayload = {
  error?: string;
  message?: string;
};

export class RoveiApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "RoveiApiError";
  }
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value),
  );
}

async function readJsonSafely(
  response: Response,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchBackendJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,

      credentials: "same-origin",

      cache: "no-store",

      headers: {
        ...(init.body &&
        !(
          typeof FormData !==
            "undefined" &&
          init.body instanceof
            FormData
        )
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...init.headers,
      },
    });
  } catch {
    throw new RoveiApiError(
      0,
      "backend_unreachable",
      "Rovei could not reach its backend.",
    );
  }

  const payload =
    await readJsonSafely(response);

  if (!response.ok) {
    const errorPayload =
      isObject(payload)
        ? (payload as BackendErrorPayload)
        : {};

    throw new RoveiApiError(
      response.status,

      typeof errorPayload.error ===
        "string"
        ? errorPayload.error
        : "request_failed",

      typeof errorPayload.message ===
        "string"
        ? errorPayload.message
        : `Rovei request failed with status ${response.status}.`,
    );
  }

  return payload as T;
}

let cachedBackendStatus:
  | Promise<BackendStatus>
  | null = null;

export function resetBackendStatusCache() {
  cachedBackendStatus = null;
}

export async function getBackendStatus(
  force = false,
): Promise<BackendStatus> {
  if (
    force ||
    !cachedBackendStatus
  ) {
    cachedBackendStatus =
      fetchBackendJson<BackendStatus>(
        "/api/backend/status",
      ).catch((error) => {
        cachedBackendStatus = null;
        throw error;
      });
  }

  return cachedBackendStatus;
}

export async function getBackendMode():
  Promise<BackendMode> {
  const status =
    await getBackendStatus();

  return status.backend;
}

export function getBrowserTimezone() {
  try {
    return (
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || "UTC"
    );
  } catch {
    return "UTC";
  }
}
