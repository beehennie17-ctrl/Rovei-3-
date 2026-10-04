import {
  NextResponse,
} from "next/server";

import {
  backendErrorResponse,
} from "@/lib/backend/errors";

import {
  clientExperienceProgressSchema,
} from "@/lib/backend/client-experience-schemas";

import {
  savePublicExperienceProgress,
} from "@/lib/backend/public-client-experience";

const secureHeaders = {
  "Cache-Control":
    "no-store, max-age=0",

  "Referrer-Policy":
    "no-referrer",

  "X-Content-Type-Options":
    "nosniff",
};

export async function POST(
  request: Request,

  {
    params,
  }: {
    params:
      Promise<{
        token: string;
      }>;
  },
) {
  try {
    const {
      token,
    } = await params;

    const input =
      clientExperienceProgressSchema
        .parse(
          await request.json(),
        );

    const result =
      await savePublicExperienceProgress(
        token,
        input,
        true,
      );

    return NextResponse.json(
      {
        submitted: true,
        ...result,
      },

      {
        headers:
          secureHeaders,
      },
    );
  } catch (error) {
    const response =
      backendErrorResponse(
        error,
      );

    Object.entries(
      secureHeaders,
    ).forEach(
      ([
        key,
        value,
      ]) => {
        response.headers.set(
          key,
          value,
        );
      },
    );

    return response;
  }
}
