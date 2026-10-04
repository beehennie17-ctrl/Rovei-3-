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
  loadPublicClientExperience,
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

export async function GET(
  _request: Request,

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

    const experience =
      await loadPublicClientExperience(
        token,
      );

    return NextResponse.json(
      {
        experience,
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

export async function PUT(
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
        false,
      );

    return NextResponse.json(
      {
        saved: true,
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
