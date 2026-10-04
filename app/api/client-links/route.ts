import {
  NextResponse,
} from "next/server";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";

import {
  clientLinkIssueSchema,
} from "@/lib/backend/client-experience-schemas";

import {
  createClientLinkSecret,
  getClientLinkExpiry,
} from "@/lib/backend/client-link-token";

import {
  requireStudioContext,
} from "@/lib/backend/studio-context";

import {
  isExperienceModuleId,
} from "@/lib/experience-options";

export async function POST(
  request: Request,
) {
  try {
    const {
      appointmentId,
    } =
      clientLinkIssueSchema.parse(
        await request.json(),
      );

    const {
      supabase,
      studioId,
    } =
      await requireStudioContext();

    const {
      data: appointment,
      error: appointmentError,
    } = await supabase
      .from("appointments")
      .select(
        `
          id,
          client_id,
          starts_at,
          status
        `,
      )
      .eq(
        "id",
        appointmentId,
      )
      .eq(
        "studio_id",
        studioId,
      )
      .maybeSingle();

    if (appointmentError) {
      throw new BackendError(
        500,
        "appointment_lookup_failed",
        "Unable to prepare the client experience.",
      );
    }

    if (!appointment) {
      throw new BackendError(
        404,
        "appointment_not_found",
        "Appointment not found.",
      );
    }

    if (
      appointment.status ===
      "cancelled"
    ) {
      throw new BackendError(
        409,
        "appointment_cancelled",
        "A client experience cannot be sent for a cancelled appointment.",
      );
    }

    const {
      data: settings,
      error: settingsError,
    } = await supabase
      .from(
        "studio_settings",
      )
      .select(
        "experience_modules",
      )
      .eq(
        "studio_id",
        studioId,
      )
      .maybeSingle();

    if (settingsError) {
      throw new BackendError(
        500,
        "studio_settings_load_failed",
        "Unable to prepare the client experience.",
      );
    }

    const modules =
      Array.isArray(
        settings?.experience_modules,
      )
        ? settings
            .experience_modules
            .filter(
              isExperienceModuleId,
            )
        : [];

    if (
      modules.length === 0
    ) {
      throw new BackendError(
        409,
        "client_experience_not_configured",
        "Choose at least one client experience step before creating a link.",
      );
    }

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from(
        "client_experiences",
      )
      .select(
        `
          id,
          status,
          experience_modules,
          current_step,
          sent_at
        `,
      )
      .eq(
        "studio_id",
        studioId,
      )
      .eq(
        "appointment_id",
        appointmentId,
      )
      .maybeSingle();

    if (existingError) {
      throw new BackendError(
        500,
        "client_experience_lookup_failed",
        "Unable to prepare the client experience.",
      );
    }

    if (
      existing?.status ===
      "completed"
    ) {
      throw new BackendError(
        409,
        "client_experience_completed",
        "This client experience has already been completed.",
      );
    }

    const {
      token,
      tokenHash,
    } =
      createClientLinkSecret();

    const createdAt =
      new Date()
        .toISOString();

    const expiresAt =
      getClientLinkExpiry(
        appointment.starts_at,
      );

    let clientExperienceId:
      string;

    if (existing) {
      const existingModules =
        Array.isArray(
          existing.experience_modules,
        )
          ? existing
              .experience_modules
              .filter(
                isExperienceModuleId,
              )
          : [];

      const {
        data: updated,
        error: updateError,
      } = await supabase
        .from(
          "client_experiences",
        )
        .update({
          token_hash:
            tokenHash,

          link_created_at:
            createdAt,

          token_expires_at:
            expiresAt,

          token_revoked_at:
            null,

          experience_modules:
            existingModules.length >
            0
              ? existingModules
              : modules,

          status:
            existing.status ===
            "started"
              ? "started"
              : "sent",

          sent_at:
            existing.sent_at ??
            createdAt,
        })
        .eq(
          "id",
          existing.id,
        )
        .eq(
          "studio_id",
          studioId,
        )
        .select("id")
        .single();

      if (
        updateError ||
        !updated
      ) {
        throw new BackendError(
          500,
          "client_link_issue_failed",
          "Unable to create the secure client link.",
        );
      }

      clientExperienceId =
        updated.id;
    } else {
      const {
        data: created,
        error: createError,
      } = await supabase
        .from(
          "client_experiences",
        )
        .insert({
          studio_id:
            studioId,

          client_id:
            appointment.client_id,

          appointment_id:
            appointment.id,

          status:
            "sent",

          sent_at:
            createdAt,

          experience_modules:
            modules,

          current_step:
            -1,

          token_hash:
            tokenHash,

          link_created_at:
            createdAt,

          token_expires_at:
            expiresAt,

          token_revoked_at:
            null,
        })
        .select("id")
        .single();

      if (
        createError ||
        !created
      ) {
        throw new BackendError(
          500,
          "client_link_issue_failed",
          "Unable to create the secure client link.",
        );
      }

      clientExperienceId =
        created.id;
    }

    const {
      error: readinessError,
    } = await supabase
      .from("appointments")
      .update({
        readiness_status:
          "waiting",
      })
      .eq(
        "id",
        appointment.id,
      )
      .eq(
        "studio_id",
        studioId,
      );

    if (readinessError) {
      throw new BackendError(
        500,
        "appointment_readiness_update_failed",
        "The link was created, but appointment readiness could not be updated.",
      );
    }

    return NextResponse.json(
      {
        clientExperienceId,

        clientId:
          appointment.client_id,

        appointmentId:
          appointment.id,

        link: {
          token,
          createdAt,
          expiresAt,
        },
      },

      {
        status:
          existing
            ? 200
            : 201,
      },
    );
  } catch (error) {
    return backendErrorResponse(
      error,
    );
  }
}
