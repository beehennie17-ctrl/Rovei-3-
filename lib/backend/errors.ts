import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class BackendError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

export async function readJsonBody(
  request: Request,
): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new BackendError(
      400,
      "invalid_json",
      "The request body must contain valid JSON.",
    );
  }
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  let originMatches = true;

  if (origin) {
    try {
      originMatches =
        new URL(origin).origin === new URL(request.url).origin;
    } catch {
      originMatches = false;
    }
  }

  if (
    fetchSite === "cross-site" ||
    !originMatches
  ) {
    throw new BackendError(
      403,
      "cross_origin_request",
      "This request must come from Rovei.",
    );
  }
}

export function backendErrorResponse(
  error: unknown,
) {
  if (error instanceof BackendError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
      },
      {
        status: error.status,
      },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "invalid_request",

        message:
          "The request data is invalid.",

        fields:
          error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  console.error(
    "Unexpected Rovei backend error:",
    error,
  );

  return NextResponse.json(
    {
      error: "internal_error",

      message:
        "Something went wrong.",
    },
    {
      status: 500,
    },
  );
}
