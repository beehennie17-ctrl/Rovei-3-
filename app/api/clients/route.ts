import { NextResponse } from "next/server";

import {
  formatInTimeZone,
  fromZonedTime,
} from "date-fns-tz";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";

import {
  newClientInputSchema,
} from "@/lib/backend/schemas";

import {
  requireStudioContext,
} from "@/lib/backend/studio-context";

import {
  getServiceCategory,
} from "@/lib/service-categories";

export async function GET() {
  try {
    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const {
      data: studio,
      error: studioError,
    } = await supabase
      .from("studios")
      .select("timezone")
      .eq("id", studioId)
      .single();

    if (studioError) {
      throw new BackendError(
        500,
        "studio_load_failed",
        "Unable to load the Studio timezone.",
      );
    }

    const timezone =
      studio.timezone || "UTC";

    const {
      data,
      error,
    } = await supabase
      .from("clients")
      .select(`
        id,
        first_name,
        last_name,
        created_at,
        appointments (
          id,
          starts_at,
          status,
          readiness_status,
          services (
            name,
            category
          )
        )
      `)
      .eq("studio_id", studioId)
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      throw new BackendError(
        500,
        "clients_load_failed",
        "Unable to load clients.",
      );
    }

    const now = Date.now();

    const clients = (
      data ?? []
    ).map((client) => {
      const appointments = [
        ...(
          client.appointments ??
          []
        ),
      ].sort(
        (a, b) =>
          Date.parse(a.starts_at) -
          Date.parse(b.starts_at),
      );

      const completed =
        appointments.filter(
          (appointment) =>
            appointment.status ===
              "completed" &&
            Date.parse(
              appointment.starts_at,
            ) < now,
        );

      const upcoming =
        appointments.find(
          (appointment) =>
            appointment.status ===
              "scheduled" &&
            Date.parse(
              appointment.starts_at,
            ) >= now,
        );

      const latestCompleted =
        completed.at(-1);

      const reference =
        upcoming ??
        latestCompleted;

      const status =
        upcoming?.readiness_status ??
        (
          latestCompleted
            ? "complete"
            : "draft"
        );

      const service =
        reference?.services as unknown as
          | { name?: string | null }
          | { name?: string | null }[]
          | null
          | undefined;

      const serviceLabel =
        Array.isArray(service)
          ? service[0]?.name ?? null
          : service?.name ?? null;

      const firstName =
        client.first_name ?? "";

      const lastName =
        client.last_name ?? "";

      const name = [
        firstName,
        lastName,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: client.id,

        name,

        initials:
          `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase(),

        primaryService:
          serviceLabel ?? "—",

        status,

        clientType:
          completed.length > 0
            ? "Returning client"
            : "New client",

        lastVisit:
          latestCompleted
            ? formatInTimeZone(
                latestCompleted.starts_at,
                timezone,
                "d MMM yyyy",
              )
            : "No visits yet",

        nextAppointment:
          upcoming
            ? formatInTimeZone(
                upcoming.starts_at,
                timezone,
                "d MMM yyyy",
              )
            : null,

        nextAppointmentTime:
          upcoming
            ? formatInTimeZone(
                upcoming.starts_at,
                timezone,
                "h:mm a",
              )
            : null,

        context:
          status === "ready"
            ? "Ready for appointment"
            : status === "waiting"
              ? "Waiting on client"
              : status === "complete"
                ? "Visit complete"
                : "Client experience draft",
      };
    });

    return NextResponse.json({
      clients,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body =
      newClientInputSchema.parse(
        await request.json(),
      );

    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const {
      data: studio,
      error: studioError,
    } = await supabase
      .from("studios")
      .select("timezone")
      .eq("id", studioId)
      .single();

    if (studioError) {
      throw new BackendError(
        500,
        "studio_load_failed",
        "Unable to load the Studio timezone.",
      );
    }

    const timezone =
      studio.timezone || "UTC";

    const {
      data: existingService,
      error: serviceLookupError,
    } = await supabase
      .from("services")
      .select("id")
      .eq(
        "studio_id",
        studioId,
      )
      .eq(
        "category",
        body.service,
      )
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (serviceLookupError) {
      throw new BackendError(
        500,
        "service_lookup_failed",
        "Unable to load this service.",
      );
    }

    let serviceId =
      existingService?.id as
        | string
        | undefined;

    if (!serviceId) {
      const category =
        getServiceCategory(
          body.service,
        );

      const {
        data: createdService,
        error: serviceCreateError,
      } = await supabase
        .from("services")
        .insert({
          studio_id:
            studioId,

          name:
            category?.name ??
            body.service,

          category:
            body.service,

          active: true,
        })
        .select("id")
        .single();

      if (
        serviceCreateError ||
        !createdService
      ) {
        throw new BackendError(
          500,
          "service_create_failed",
          "Unable to create this service.",
        );
      }

      serviceId =
        createdService.id as string;
    }

    const {
      data: client,
      error: clientError,
    } = await supabase
      .from("clients")
      .insert({
        studio_id:
          studioId,

        first_name:
          body.firstName,

        last_name:
          body.lastName,
      })
      .select("id")
      .single();

    if (clientError || !client) {
      throw new BackendError(
        500,
        "client_create_failed",
        "Unable to create the client.",
      );
    }

    const localDateTime =
      `${body.appointmentDate}T${body.appointmentTime}:00`;

    let startsAt: string;

    try {
      startsAt =
        fromZonedTime(
          localDateTime,
          timezone,
        ).toISOString();
    } catch {
      await supabase
        .from("clients")
        .delete()
        .eq("id", client.id)
        .eq(
          "studio_id",
          studioId,
        );

      throw new BackendError(
        400,
        "invalid_appointment_time",
        "The appointment time could not be interpreted in the Studio timezone.",
      );
    }

    const {
      data: appointment,
      error: appointmentError,
    } = await supabase
      .from("appointments")
      .insert({
        studio_id:
          studioId,

        client_id:
          client.id,

        service_id:
          serviceId,

        starts_at:
          startsAt,

        timezone,

        status:
          "scheduled",

        readiness_status:
          "draft",
      })
      .select("id")
      .single();

    if (
      appointmentError ||
      !appointment
    ) {
      await supabase
        .from("clients")
        .delete()
        .eq("id", client.id)
        .eq(
          "studio_id",
          studioId,
        );

      throw new BackendError(
        500,
        "appointment_create_failed",
        "Unable to create the appointment.",
      );
    }

    return NextResponse.json(
      {
        clientId:
          client.id,

        appointmentId:
          appointment.id,

        startsAt,

        timezone,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
