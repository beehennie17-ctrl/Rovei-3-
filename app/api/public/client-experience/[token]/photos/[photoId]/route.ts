import {
  NextResponse,
} from "next/server";

import {
  z,
} from "zod";

import {
  backendErrorResponse,
} from "@/lib/backend/errors";

import {
  deletePublicClientPhoto,
} from "@/lib/backend/client-experience-photos";

const photoIdSchema =
  z.string().uuid();

const secureHeaders = {
  "Cache-Control":
    "no-store, max-age=0",

  "Referrer-Policy":
    "no-referrer",

  "X-Content-Type-Options":
    "nosniff",
};

export async function DELETE(
  _request: Request,

  {
    params,
  }: {
    params:
      Promise<{
        token: string;
        photoId: string;
      }>;
  },
) {
  try {
    const {
      token,
      photoId:
        rawPhotoId,
    } = await params;

    const photoId =
      photoIdSchema.parse(
        rawPhotoId,
      );

    await deletePublicClientPhoto(
      token,
      photoId,
    );

    return NextResponse.json(
      {
        deleted: true,
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
