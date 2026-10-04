import {
  NextResponse,
} from "next/server";

import {
  z,
} from "zod";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";

import {
  requireStudioContext,
} from "@/lib/backend/studio-context";

const idSchema =
  z.string().uuid();

export async function DELETE(
  _request: Request,

  {
    params,
  }: {
    params:
      Promise<{
        id: string;
      }>;
  },
) {
  try {
    const {
      id: rawId,
    } = await params;

    const id =
      idSchema.parse(
        rawId,
      );

    const {
      supabase,
      studioId,
    } =
      await requireStudioContext();

    const revokedAt =
      new Date()
        .toISOString();

    const {
      data,
      error,
    } = await supabase
      .from(
        "client_experiences",
      )
      .update({
        token_revoked_at:
          revokedAt,
      })
      .eq(
        "id",
        id,
      )
      .eq(
        "studio_id",
        studioId,
      )
      .not(
        "token_hash",
        "is",
        null,
      )
      .select(
        `
          id,
          appointment_id,
          status
        `,
      )
      .maybeSingle();

    if (error) {
      throw new BackendError(
        500,
        "client_link_revoke_failed",
        "Unable to revoke this client link.",
      );
    }

    if (!data) {
      throw new BackendError(
        404,
        "client_experience_not_found",
        "Client experience not found.",
      );
    }

    if (
      data.appointment_id &&
      data.status !==
        "completed"
    ) {
      await supabase
        .from("appointments")
        .update({
          readiness_status:
            "draft",
        })
        .eq(
          "id",
          data.appointment_id,
        )
        .eq(
          "studio_id",
          studioId,
        );
    }

    return NextResponse.json({
      revoked: true,
      revokedAt,
    });
  } catch (error) {
    return backendErrorResponse(
      error,
    );
  }
}
