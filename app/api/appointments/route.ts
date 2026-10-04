import { NextResponse } from "next/server";

import {
  formatInTimeZone,
} from "date-fns-tz";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";

import {
  requireStudioContext,
} from "@/lib/backend/studio-context";

export async function GET(request: Request) {
  try {
    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const url =
      new URL(request.url);

    const now =
      new Date();

    const defaultFrom =
      new Date(
        now.getTime() -
          1000 *
          60 *
          60 *
          24 *
          30,
      );

    const defaultTo =
      new Date(
        now.getTime() +
          1000 *
          60 *
          60 *
          24 *
          90,
      );

    const from =
      url.searchParams.get(
        "from",
      ) ??
      defaultFrom.toISOString();

    const to =
      url.searchParams.get(
        "to",
      ) ??
      defaultTo.toISOString();

    if (
      Number.isNaN(
        Date.parse(from),
      ) ||
      Number.isNaN(
        Date.parse(to),
      )
    ) {
      throw new BackendError(
        400,
        "invalid_date_range",
        "Invalid appointment date range.",
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("appointments")
      .select(`
        id,
        client_id,
        starts_at,
        timezone,
        status,
        readiness_status,
        clients (
          first_name,
          last_name
        ),
        services (
          name,
          category
        )
      `)
      .eq("studio_id", studioId)
      .gte("starts_at", from)
      .lt("starts_at", to)
      .order("starts_at");

    if (error) {
      throw new BackendError(
        500,
        "appointments_load_failed",
        "Unable to load appointments.",
      );
    }

    const appointments =
      (
        data ?? []
      ).map(
        (appointment) => {
          const clientRelation =
            appointment.clients as unknown as
              | {
                  first_name?: string | null;
                  last_name?: string | null;
                }
              | {
                  first_name?: string | null;
                  last_name?: string | null;
                }[]
              | null
              | undefined;

          const serviceRelation =
            appointment.services as unknown as
              | {
                  name?: string | null;
                  category?: string | null;
                }
              | {
                  name?: string | null;
                  category?: string | null;
                }[]
              | null
              | undefined;

          const client =
            Array.isArray(clientRelation)
              ? clientRelation[0]
              : clientRelation;

          const service =
            Array.isArray(serviceRelation)
              ? serviceRelation[0]
              : serviceRelation;

          const firstName =
            client?.first_name ?? "";

          const lastName =
            client?.last_name ?? "";

          const timezone =
            appointment.timezone ||
            "UTC";

          return {
            id:
              appointment.id,

            clientId:
              appointment.client_id,

            name: [
              firstName,
              lastName,
            ]
              .filter(Boolean)
              .join(" "),

            initials:
              `${firstName.charAt(0)}${lastName.charAt(0)}`
                .toUpperCase(),

            service:
              service?.name ?? "—",

            date:
              formatInTimeZone(
                appointment.starts_at,
                timezone,
                "yyyy-MM-dd",
              ),

            time:
              formatInTimeZone(
                appointment.starts_at,
                timezone,
                "HH:mm",
              ),

            displayTime:
              formatInTimeZone(
                appointment.starts_at,
                timezone,
                "h:mm a",
              ),

            status:
              appointment.status,

            readinessStatus:
              appointment.readiness_status,

            timezone,
          };
        },
      );

    return NextResponse.json({
      appointments,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
