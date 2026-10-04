import "server-only";

import {
  formatInTimeZone,
} from "date-fns-tz";

import {
  BackendError,
} from "@/lib/backend/errors";

import {
  hashClientLinkToken,
  isClientLinkExpired,
  isValidClientLinkToken,
} from "@/lib/backend/client-link-token";

import type {
  ClientExperienceProgressInput,
} from "@/lib/backend/client-experience-schemas";

import {
  isExperienceModuleId,
} from "@/lib/experience-options";

import {
  isServiceCategoryId,
} from "@/lib/service-categories";

import {
  DEFAULT_CUSTOM_PRIMARY,
  isThemeName,
} from "@/lib/theme-resolver";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  ExperienceModuleId,
} from "@/types/onboarding";

type JsonRecord =
  Record<string, unknown>;

type ActiveExperience = {
  id: string;
  studioId: string;
  clientId: string;
  appointmentId: string;
  status: string;
  currentStep: number;
  modules:
    ExperienceModuleId[];
  expiresAt: string;
  updatedAt: string;
  completedAt:
    string | null;
};

type ActiveAppointment = {
  id: string;
  startsAt: string;
  timezone: string;
  serviceId:
    string | null;
  status: string;
};

function isRecord(
  value: unknown,
): value is JsonRecord {
  return Boolean(
    value &&
    typeof value ===
      "object" &&
    !Array.isArray(value),
  );
}

function unavailable():
  never {
  throw new BackendError(
    404,
    "client_experience_unavailable",
    "This client experience is unavailable.",
  );
}

function normalizeModules(
  value: unknown,
): ExperienceModuleId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    isExperienceModuleId,
  );
}

export async function requireActivePublicExperience(
  token: string,
) {
  if (
    !isValidClientLinkToken(
      token,
    )
  ) {
    unavailable();
  }

  const tokenHash =
    hashClientLinkToken(
      token,
    );

  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from(
      "client_experiences",
    )
    .select(
      `
        id,
        studio_id,
        client_id,
        appointment_id,
        status,
        current_step,
        experience_modules,
        token_expires_at,
        token_revoked_at,
        updated_at,
        completed_at
      `,
    )
    .eq(
      "token_hash",
      tokenHash,
    )
    .maybeSingle();

  if (error) {
    throw new BackendError(
      500,
      "client_experience_lookup_failed",
      "Unable to load this client experience.",
    );
  }

  if (
    !data ||
    !data.appointment_id ||
    !data.token_expires_at ||
    data.token_revoked_at ||
    data.status === "expired" ||
    isClientLinkExpired(
      data.token_expires_at,
    )
  ) {
    unavailable();
  }

  const {
    data: appointment,
    error: appointmentError,
  } = await admin
    .from("appointments")
    .select(
      `
        id,
        starts_at,
        timezone,
        service_id,
        status
      `,
    )
    .eq(
      "id",
      data.appointment_id,
    )
    .eq(
      "studio_id",
      data.studio_id,
    )
    .maybeSingle();

  if (appointmentError) {
    throw new BackendError(
      500,
      "appointment_lookup_failed",
      "Unable to load this appointment.",
    );
  }

  if (
    !appointment ||
    appointment.status ===
      "cancelled"
  ) {
    unavailable();
  }

  const experience:
    ActiveExperience = {
      id:
        data.id,

      studioId:
        data.studio_id,

      clientId:
        data.client_id,

      appointmentId:
        data.appointment_id,

      status:
        data.status,

      currentStep:
        typeof data.current_step ===
          "number"
          ? data.current_step
          : -1,

      modules:
        normalizeModules(
          data.experience_modules,
        ),

      expiresAt:
        data.token_expires_at,

      updatedAt:
        data.updated_at,

      completedAt:
        data.completed_at ??
        null,
    };

  const appointmentData:
    ActiveAppointment = {
      id:
        appointment.id,

      startsAt:
        appointment.starts_at,

      timezone:
        appointment.timezone ||
        "UTC",

      serviceId:
        appointment.service_id ??
        null,

      status:
        appointment.status,
    };

  return {
    admin,
    experience,
    appointment:
      appointmentData,
  };
}

function progressResponses(
  input:
    ClientExperienceProgressInput,
) {
  const rows: Array<{
    moduleType:
      ExperienceModuleId;
    payload:
      JsonRecord;
  }> = [];

  if (
    input.consultation !==
    undefined
  ) {
    rows.push({
      moduleType:
        "consultation",

      payload:
        input.consultation,
    });
  }

  if (
    input.preferences !==
    undefined
  ) {
    rows.push({
      moduleType:
        "preferences",

      payload:
        input.preferences,
    });
  }

  if (
    input.inspiration !==
    undefined
  ) {
    rows.push({
      moduleType:
        "inspiration",

      payload:
        input.inspiration,
    });
  }

  if (
    input.currentPhotos !==
    undefined
  ) {
    rows.push({
      moduleType:
        "current-photos",

      payload:
        input.currentPhotos,
    });
  }

  if (
    input.consent !==
    undefined
  ) {
    rows.push({
      moduleType:
        "consent",

      payload:
        input.consent,
    });
  }

  if (
    input.prep !==
    undefined
  ) {
    rows.push({
      moduleType:
        "prep",

      payload:
        input.prep,
    });
  }

  return rows;
}

function moduleIsComplete(
  moduleType:
    ExperienceModuleId,

  payload:
    unknown,
): boolean {
  if (!isRecord(payload)) {
    return false;
  }

  switch (moduleType) {
    case "consultation":
      return (
        typeof payload.goal ===
          "string" &&
        payload.goal.trim()
          .length > 0
      );

    case "preferences":
      return (
        typeof payload.finish ===
          "string" &&
        typeof payload.appointmentFeel ===
          "string"
      );

    case "inspiration":
    case "current-photos":
      return (
        payload.skipped ===
          true ||
        (
          Array.isArray(
            payload.photoIds,
          ) &&
          payload.photoIds
            .length > 0
        )
      );

    case "consent":
    case "prep":
      return (
        payload.acknowledged ===
        true
      );
  }
}

export async function savePublicExperienceProgress(
  token: string,

  input:
    ClientExperienceProgressInput,

  complete = false,
) {
  const {
    admin,
    experience,
  } =
    await requireActivePublicExperience(
      token,
    );

  if (
    experience.status ===
    "completed"
  ) {
    if (complete) {
      return {
        completed: true,
      };
    }

    throw new BackendError(
      409,
      "client_experience_completed",
      "This client experience has already been completed.",
    );
  }

  if (
    input.currentStep >
    experience.modules.length
  ) {
    throw new BackendError(
      400,
      "invalid_experience_step",
      "The client experience step is invalid.",
    );
  }

  const selected =
    new Set(
      experience.modules,
    );

  const provided =
    progressResponses(
      input,
    );

  for (
    const response of
    provided
  ) {
    if (
      !selected.has(
        response.moduleType,
      )
    ) {
      throw new BackendError(
        400,
        "module_not_enabled",
        "This client experience module is not enabled.",
      );
    }
  }

  for (
    const response of
    provided
  ) {
    if (
      response.moduleType !==
        "inspiration" &&
      response.moduleType !==
        "current-photos"
    ) {
      continue;
    }

    const photoIds =
      Array.isArray(
        response.payload.photoIds,
      )
        ? response.payload.photoIds.filter(
            (
              value,
            ): value is string =>
              typeof value ===
              "string",
          )
        : [];

    if (
      photoIds.length === 0
    ) {
      continue;
    }

    const expectedKind =
      response.moduleType ===
      "inspiration"
        ? "inspiration"
        : "current";

    const {
      data:
        matchingAssets,
      error:
        photoError,
    } = await admin
      .from("file_assets")
      .select(
        "id, kind",
      )
      .eq(
        "studio_id",
        experience.studioId,
      )
      .eq(
        "client_experience_id",
        experience.id,
      )
      .in(
        "id",
        photoIds,
      );

    if (
      photoError ||
      !matchingAssets ||
      matchingAssets.length !==
        photoIds.length ||
      matchingAssets.some(
        (asset) =>
          asset.kind !==
          expectedKind,
      )
    ) {
      throw new BackendError(
        400,
        "invalid_photo_reference",
        "One or more submitted photos do not belong to this client experience.",
      );
    }
  }

  if (
    provided.length > 0
  ) {
    const {
      error:
        responseError,
    } = await admin
      .from(
        "client_experience_responses",
      )
      .upsert(
        provided.map(
          (response) => ({
            studio_id:
              experience.studioId,

            client_experience_id:
              experience.id,

            module_type:
              response.moduleType,

            payload:
              response.payload,
          }),
        ),

        {
          onConflict:
            "client_experience_id,module_type",
        },
      );

    if (responseError) {
      throw new BackendError(
        500,
        "experience_progress_save_failed",
        "Unable to save client experience progress.",
      );
    }
  }

  if (!complete) {
    const {
      error:
        updateError,
    } = await admin
      .from(
        "client_experiences",
      )
      .update({
        status:
          "started",

        current_step:
          input.currentStep,
      })
      .eq(
        "id",
        experience.id,
      );

    if (updateError) {
      throw new BackendError(
        500,
        "experience_progress_save_failed",
        "Unable to save client experience progress.",
      );
    }

    return {
      completed: false,
    };
  }

  const {
    data:
      storedResponses,
    error:
      storedError,
  } = await admin
    .from(
      "client_experience_responses",
    )
    .select(
      "module_type, payload",
    )
    .eq(
      "client_experience_id",
      experience.id,
    );

  if (storedError) {
    throw new BackendError(
      500,
      "experience_response_lookup_failed",
      "Unable to verify this client experience.",
    );
  }

  const responseMap =
    new Map<
      ExperienceModuleId,
      unknown
    >();

  for (
    const row of
    storedResponses ?? []
  ) {
    if (
      isExperienceModuleId(
        row.module_type,
      )
    ) {
      responseMap.set(
        row.module_type,
        row.payload,
      );
    }
  }

  const incomplete =
    experience.modules.filter(
      (moduleType) =>
        !moduleIsComplete(
          moduleType,
          responseMap.get(
            moduleType,
          ),
        ),
    );

  if (
    incomplete.length > 0
  ) {
    throw new BackendError(
      400,
      "client_experience_incomplete",
      "Complete every required client experience step before submitting.",
    );
  }

  const completedAt =
    new Date()
      .toISOString();

  const {
    error:
      completionError,
  } = await admin
    .from(
      "client_experiences",
    )
    .update({
      status:
        "completed",

      current_step:
        experience.modules
          .length,

      completed_at:
        completedAt,
    })
    .eq(
      "id",
      experience.id,
    );

  if (completionError) {
    throw new BackendError(
      500,
      "experience_completion_failed",
      "Unable to complete this client experience.",
    );
  }

  const {
    error:
      readinessError,
  } = await admin
    .from("appointments")
    .update({
      readiness_status:
        "ready",
    })
    .eq(
      "id",
      experience.appointmentId,
    )
    .eq(
      "studio_id",
      experience.studioId,
    );

  if (readinessError) {
    throw new BackendError(
      500,
      "appointment_readiness_update_failed",
      "The client experience was completed, but appointment readiness could not be updated.",
    );
  }

  return {
    completed: true,
    completedAt,
  };
}

function responseStateFromRows(
  rows:
    Array<{
      module_type:
        string;
      payload:
        unknown;
    }>,
) {
  const result:
    JsonRecord = {};

  for (
    const row of rows
  ) {
    if (
      !isRecord(
        row.payload,
      )
    ) {
      continue;
    }

    switch (
      row.module_type
    ) {
      case "consultation":
        result.consultation =
          row.payload;
        break;

      case "preferences":
        result.preferences =
          row.payload;
        break;

      case "inspiration":
        result.inspiration =
          row.payload;
        break;

      case "current-photos":
        result.currentPhotos =
          row.payload;
        break;

      case "consent":
        result.consent =
          row.payload;
        break;

      case "prep":
        result.prep =
          row.payload;
        break;
    }
  }

  return result;
}

export async function loadPublicClientExperience(
  token: string,
) {
  const {
    admin,
    experience,
    appointment,
  } =
    await requireActivePublicExperience(
      token,
    );

  const [
    studioResult,
    settingsResult,
    clientResult,
    responseResult,
  ] =
    await Promise.all([
      admin
        .from("studios")
        .select("name")
        .eq(
          "id",
          experience.studioId,
        )
        .maybeSingle(),

      admin
        .from(
          "studio_settings",
        )
        .select(
          `
            theme_name,
            primary_colour
          `,
        )
        .eq(
          "studio_id",
          experience.studioId,
        )
        .maybeSingle(),

      admin
        .from("clients")
        .select(
          `
            first_name,
            last_name
          `,
        )
        .eq(
          "id",
          experience.clientId,
        )
        .eq(
          "studio_id",
          experience.studioId,
        )
        .maybeSingle(),

      admin
        .from(
          "client_experience_responses",
        )
        .select(
          "module_type, payload",
        )
        .eq(
          "client_experience_id",
          experience.id,
        ),
    ]);

  if (
    studioResult.error ||
    settingsResult.error ||
    clientResult.error ||
    responseResult.error
  ) {
    throw new BackendError(
      500,
      "client_experience_load_failed",
      "Unable to load this client experience.",
    );
  }

  if (
    !studioResult.data ||
    !clientResult.data
  ) {
    throw new BackendError(
      500,
      "client_experience_data_missing",
      "This client experience is incomplete.",
    );
  }

  let serviceCategory:
    string = "other";

  if (
    appointment.serviceId
  ) {
    const {
      data: service,
      error: serviceError,
    } = await admin
      .from("services")
      .select(
        "category",
      )
      .eq(
        "id",
        appointment.serviceId,
      )
      .eq(
        "studio_id",
        experience.studioId,
      )
      .maybeSingle();

    if (serviceError) {
      throw new BackendError(
        500,
        "service_lookup_failed",
        "Unable to load this client experience.",
      );
    }

    if (
      isServiceCategoryId(
        service?.category,
      )
    ) {
      serviceCategory =
        service.category;
    }
  }

  if (
    !isServiceCategoryId(
      serviceCategory,
    )
  ) {
    serviceCategory =
      "other";
  }

  const themeName =
    isThemeName(
      settingsResult.data
        ?.theme_name,
    )
      ? settingsResult.data
          .theme_name
      : "wine";

  const customPrimary =
    typeof settingsResult.data
      ?.primary_colour ===
      "string"
      ? settingsResult.data
          .primary_colour
      : DEFAULT_CUSTOM_PRIMARY;

  const storedState =
    responseStateFromRows(
      responseResult.data ??
      [],
    );

  const currentStep =
    Math.min(
      Math.max(
        experience.currentStep,
        -1,
      ),
      experience.modules
        .length,
    );

  return {
    clientExperienceId:
      experience.id,

    studioName:
      studioResult.data.name,

    draft: {
      firstName:
        clientResult.data
          .first_name,

      lastName:
        clientResult.data
          .last_name ?? "",

      service:
        serviceCategory,

      appointmentDate:
        formatInTimeZone(
          appointment.startsAt,
          appointment.timezone,
          "yyyy-MM-dd",
        ),

      appointmentTime:
        formatInTimeZone(
          appointment.startsAt,
          appointment.timezone,
          "HH:mm",
        ),
    },

    theme:
      themeName,

    customPrimary,

    response: {
      modules:
        experience.modules,

      status:
        experience.status ===
          "completed"
          ? "complete"
          : "in-progress",

      currentStep,

      ...storedState,

      updatedAt:
        experience.updatedAt,

      ...(experience.completedAt
        ? {
            submittedAt:
              experience.completedAt,
          }
        : {}),
    },

    expiresAt:
      experience.expiresAt,
  };
}
