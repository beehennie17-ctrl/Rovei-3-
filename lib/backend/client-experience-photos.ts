import "server-only";

import {
  randomUUID,
} from "node:crypto";

import sharp from "sharp";

import {
  BackendError,
} from "@/lib/backend/errors";

import {
  requireActivePublicExperience,
} from "@/lib/backend/public-client-experience";

import type {
  PrototypePhotoKind,
} from "@/types/client-experience";

export const CLIENT_PHOTO_BUCKET =
  "client-experience-photos";

export const CLIENT_PHOTO_MAX_SOURCE_BYTES =
  10 * 1024 * 1024;

const SIGNED_URL_SECONDS =
  5 * 60;

const ALLOWED_SOURCE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

function maxForKind(
  kind:
    PrototypePhotoKind,
) {
  return kind ===
    "inspiration"
    ? 3
    : 2;
}

export function isClientPhotoKind(
  value: unknown,
): value is PrototypePhotoKind {
  return (
    value ===
      "inspiration" ||
    value ===
      "current"
  );
}

async function signedPhoto(
  admin:
    Awaited<
      ReturnType<
        typeof requireActivePublicExperience
      >
    >["admin"],

  row: {
    id: string;
    kind:
      PrototypePhotoKind;
    mime_type:
      string | null;
    size_bytes:
      number | null;
    object_path:
      string;
    created_at:
      string;
  },
) {
  const {
    data,
    error,
  } =
    await admin.storage
      .from(
        CLIENT_PHOTO_BUCKET,
      )
      .createSignedUrl(
        row.object_path,
        SIGNED_URL_SECONDS,
      );

  if (
    error ||
    !data?.signedUrl
  ) {
    throw new BackendError(
      500,
      "photo_preview_failed",
      "Unable to load this photo.",
    );
  }

  return {
    id:
      row.id,

    kind:
      row.kind,

    name:
      "Rovei photo",

    type:
      row.mime_type ??
      "image/webp",

    size:
      row.size_bytes ??
      0,

    previewUrl:
      data.signedUrl,

    createdAt:
      row.created_at,
  };
}

export async function listPublicClientPhotos(
  token: string,
  kind:
    PrototypePhotoKind,
) {
  const {
    admin,
    experience,
  } =
    await requireActivePublicExperience(
      token,
    );

  const {
    data,
    error,
  } = await admin
    .from("file_assets")
    .select(
      `
        id,
        kind,
        mime_type,
        size_bytes,
        object_path,
        created_at
      `,
    )
    .eq(
      "studio_id",
      experience.studioId,
    )
    .eq(
      "client_experience_id",
      experience.id,
    )
    .eq(
      "kind",
      kind,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new BackendError(
      500,
      "photo_list_failed",
      "Unable to load client photos.",
    );
  }

  return Promise.all(
    (
      data ?? []
    ).map(
      (row) =>
        signedPhoto(
          admin,
          {
            ...row,
            kind,
          },
        ),
    ),
  );
}

export async function savePublicClientPhoto(
  token: string,
  kind:
    PrototypePhotoKind,
  file: File,
) {
  if (
    !ALLOWED_SOURCE_TYPES.has(
      file.type,
    )
  ) {
    throw new BackendError(
      400,
      "unsupported_photo_type",
      "Use a JPEG, PNG, or WebP image.",
    );
  }

  if (
    file.size <= 0 ||
    file.size >
      CLIENT_PHOTO_MAX_SOURCE_BYTES
  ) {
    throw new BackendError(
      400,
      "invalid_photo_size",
      "Photos must be 10 MB or smaller.",
    );
  }

  const {
    admin,
    experience,
  } =
    await requireActivePublicExperience(
      token,
    );

  const {
    count,
    error:
      countError,
  } = await admin
    .from("file_assets")
    .select(
      "id",
      {
        count:
          "exact",
        head:
          true,
      },
    )
    .eq(
      "studio_id",
      experience.studioId,
    )
    .eq(
      "client_experience_id",
      experience.id,
    )
    .eq(
      "kind",
      kind,
    );

  if (countError) {
    throw new BackendError(
      500,
      "photo_count_failed",
      "Unable to add this photo.",
    );
  }

  if (
    (
      count ?? 0
    ) >= maxForKind(
      kind,
    )
  ) {
    throw new BackendError(
      409,
      "photo_limit_reached",
      "The photo limit for this step has been reached.",
    );
  }

  let processed:
    Buffer;

  try {
    const input =
      Buffer.from(
        await file.arrayBuffer(),
      );

    processed =
      await sharp(input)
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement:
            true,
        })
        .webp({
          quality: 86,
        })
        .toBuffer();
  } catch {
    throw new BackendError(
      400,
      "invalid_photo",
      "Rovei could not process this image.",
    );
  }

  const photoId =
    randomUUID();

  const objectPath =
    `${experience.studioId}/${experience.id}/${kind}/${photoId}.webp`;

  const {
    error:
      uploadError,
  } =
    await admin.storage
      .from(
        CLIENT_PHOTO_BUCKET,
      )
      .upload(
        objectPath,
        processed,
        {
          contentType:
            "image/webp",

          upsert:
            false,

          cacheControl:
            "3600",
        },
      );

  if (uploadError) {
    throw new BackendError(
      500,
      "photo_upload_failed",
      "Unable to upload this photo.",
    );
  }

  const {
    data: asset,
    error:
      assetError,
  } = await admin
    .from("file_assets")
    .insert({
      id:
        photoId,

      studio_id:
        experience.studioId,

      client_id:
        experience.clientId,

      client_experience_id:
        experience.id,

      bucket:
        CLIENT_PHOTO_BUCKET,

      object_path:
        objectPath,

      kind,

      mime_type:
        "image/webp",

      size_bytes:
        processed.byteLength,
    })
    .select(
      `
        id,
        kind,
        mime_type,
        size_bytes,
        object_path,
        created_at
      `,
    )
    .single();

  if (
    assetError ||
    !asset
  ) {
    await admin.storage
      .from(
        CLIENT_PHOTO_BUCKET,
      )
      .remove([
        objectPath,
      ]);

    throw new BackendError(
      500,
      "photo_metadata_failed",
      "Unable to save this photo.",
    );
  }

  return signedPhoto(
    admin,
    {
      ...asset,
      kind,
    },
  );
}

export async function deletePublicClientPhoto(
  token: string,
  photoId: string,
) {
  const {
    admin,
    experience,
  } =
    await requireActivePublicExperience(
      token,
    );

  const {
    data: asset,
    error,
  } = await admin
    .from("file_assets")
    .select(
      `
        id,
        bucket,
        object_path
      `,
    )
    .eq(
      "id",
      photoId,
    )
    .eq(
      "studio_id",
      experience.studioId,
    )
    .eq(
      "client_experience_id",
      experience.id,
    )
    .maybeSingle();

  if (error) {
    throw new BackendError(
      500,
      "photo_lookup_failed",
      "Unable to remove this photo.",
    );
  }

  if (!asset) {
    throw new BackendError(
      404,
      "photo_not_found",
      "Photo not found.",
    );
  }

  const {
    error:
      storageError,
  } =
    await admin.storage
      .from(
        asset.bucket,
      )
      .remove([
        asset.object_path,
      ]);

  if (storageError) {
    throw new BackendError(
      500,
      "photo_delete_failed",
      "Unable to remove this photo.",
    );
  }

  const {
    error:
      metadataError,
  } = await admin
    .from("file_assets")
    .delete()
    .eq(
      "id",
      asset.id,
    )
    .eq(
      "studio_id",
      experience.studioId,
    );

  if (metadataError) {
    throw new BackendError(
      500,
      "photo_metadata_delete_failed",
      "The photo was removed, but its metadata could not be cleaned up.",
    );
  }

  return true;
}
