"use client";

import {
  fetchBackendJson,
} from "@/lib/backend/api-client";

import type {
  ClientExperiencePrototype,
  CloudClientPhoto,
  PublicClientExperienceData,
  PrototypePhotoKind,
} from "@/types/client-experience";

import type {
  IssuedClientExperienceLink,
} from "@/types/client-link";

export async function issueSecureClientLink(
  appointmentId: string,
) {
  return fetchBackendJson<
    IssuedClientExperienceLink
  >(
    "/api/client-links",
    {
      method: "POST",

      body:
        JSON.stringify({
          appointmentId,
        }),
    },
  );
}

export async function loadCloudClientExperience(
  token: string,
) {
  const result =
    await fetchBackendJson<{
      experience:
        PublicClientExperienceData;
    }>(
      `/api/public/client-experience/${encodeURIComponent(
        token,
      )}`,
    );

  return result.experience;
}

function progressPayload(
  record:
    ClientExperiencePrototype,
) {
  return {
    currentStep:
      record.currentStep,

    ...(record.consultation
      ? {
          consultation:
            record.consultation,
        }
      : {}),

    ...(record.preferences
      ? {
          preferences:
            record.preferences,
        }
      : {}),

    ...(record.inspiration
      ? {
          inspiration:
            record.inspiration,
        }
      : {}),

    ...(record.currentPhotos
      ? {
          currentPhotos:
            record.currentPhotos,
        }
      : {}),

    ...(record.consent
      ? {
          consent:
            record.consent,
        }
      : {}),

    ...(record.prep
      ? {
          prep:
            record.prep,
        }
      : {}),
  };
}

export async function saveCloudClientExperience(
  token: string,
  record:
    ClientExperiencePrototype,
) {
  return fetchBackendJson<{
    saved: boolean;
    completed: boolean;
  }>(
    `/api/public/client-experience/${encodeURIComponent(
      token,
    )}`,
    {
      method: "PUT",

      body:
        JSON.stringify(
          progressPayload(
            record,
          ),
        ),
    },
  );
}

export async function submitCloudClientExperience(
  token: string,
  record:
    ClientExperiencePrototype,
) {
  return fetchBackendJson<{
    submitted: boolean;
    completed: boolean;
    completedAt?: string;
  }>(
    `/api/public/client-experience/${encodeURIComponent(
      token,
    )}/submit`,
    {
      method: "POST",

      body:
        JSON.stringify(
          progressPayload(
            record,
          ),
        ),
    },
  );
}

export async function loadCloudPhotos(
  token: string,
  kind:
    PrototypePhotoKind,
) {
  const response =
    await fetchBackendJson<{
      photos:
        CloudClientPhoto[];
    }>(
      `/api/public/client-experience/${encodeURIComponent(
        token,
      )}/photos?kind=${encodeURIComponent(
        kind,
      )}`,
    );

  return response.photos;
}

export async function uploadCloudPhoto(
  token: string,
  kind:
    PrototypePhotoKind,
  file: File,
) {
  const form =
    new FormData();

  form.set(
    "kind",
    kind,
  );

  form.set(
    "file",
    file,
  );

  const response =
    await fetchBackendJson<{
      photo:
        CloudClientPhoto;
    }>(
      `/api/public/client-experience/${encodeURIComponent(
        token,
      )}/photos`,
      {
        method: "POST",
        body: form,
      },
    );

  return response.photo;
}

export async function deleteCloudPhoto(
  token: string,
  photoId: string,
) {
  return fetchBackendJson<{
    deleted: boolean;
  }>(
    `/api/public/client-experience/${encodeURIComponent(
      token,
    )}/photos/${encodeURIComponent(
      photoId,
    )}`,
    {
      method:
        "DELETE",
    },
  );
}
