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
