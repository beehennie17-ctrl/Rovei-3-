import {
  NextResponse,
} from "next/server";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";

import {
  isClientPhotoKind,
  listPublicClientPhotos,
  savePublicClientPhoto,
} from "@/lib/backend/client-experience-photos";

const secureHeaders = {
  "Cache-Control":
    "no-store, max-age=0",

  "Referrer-Policy":
    "no-referrer",

  "X-Content-Type-Options":
    "nosniff",
};

function secureError(
  error: unknown,
) {
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

export async function GET(
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

    const url =
      new URL(
        request.url,
      );

    const kind =
      url.searchParams.get(
        "kind",
      );

    if (
      !isClientPhotoKind(
        kind,
      )
    ) {
      throw new BackendError(
        400,
        "invalid_photo_kind",
        "Invalid client photo type.",
      );
    }

    const photos =
      await listPublicClientPhotos(
        token,
        kind,
      );

    return NextResponse.json(
      {
        photos,
      },
      {
        headers:
          secureHeaders,
      },
    );
  } catch (error) {
    return secureError(
      error,
    );
  }
}

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

    const form =
      await request.formData();

    const kind =
      form.get(
        "kind",
      );

    const file =
      form.get(
        "file",
      );

    if (
      !isClientPhotoKind(
        kind,
      )
    ) {
      throw new BackendError(
        400,
        "invalid_photo_kind",
        "Invalid client photo type.",
      );
    }

    if (
      !(file instanceof File)
    ) {
      throw new BackendError(
        400,
        "photo_missing",
        "Choose an image to upload.",
      );
    }

    const photo =
      await savePublicClientPhoto(
        token,
        kind,
        file,
      );

    return NextResponse.json(
      {
        photo,
      },
      {
        status: 201,
        headers:
          secureHeaders,
      },
    );
  } catch (error) {
    return secureError(
      error,
    );
  }
}
