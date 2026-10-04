import { NextResponse } from "next/server";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";

import {
  appointmentStatusSchema,
} from "@/lib/backend/schemas";

import {
  requireStudioContext,
} from "@/lib/backend/studio-context";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    const {
      status,
    } =
      appointmentStatusSchema.parse(
        await request.json(),
      );

    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const {
      data,
      error,
    } = await supabase
      .from("appointments")
      .update({
        status,
      })
      .eq("id", id)
      .eq("studio_id", studioId)
      .select(
        "id, status",
      )
      .maybeSingle();

    if (error) {
      throw new BackendError(
        500,
        "appointment_update_failed",
        "Unable to update this appointment.",
      );
    }

    if (!data) {
      throw new BackendError(
        404,
        "appointment_not_found",
        "Appointment not found.",
      );
    }

    return NextResponse.json({
      appointment: data,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
