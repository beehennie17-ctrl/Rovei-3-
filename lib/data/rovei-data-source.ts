import {
  fetchBackendJson,
  getBackendMode,
  getBrowserTimezone,
  type BackendMode,
} from "@/lib/backend/api-client";

import {
  clientDirectoryDemoData,
} from "@/lib/client-directory-demo-data";

import {
  scheduleDemoAppointments,
} from "@/lib/schedule-demo-data";

import {
  markScheduleAppointmentCancelled,
  readScheduleStatusOverrides,
  restoreScheduleAppointment,
} from "@/lib/schedule-status-prototype";

import {
  createBeautyPack,
  deleteBeautyPack,
  getBeautyPackById,
  readBeautyPackStore,
  updateBeautyPack,
} from "@/lib/beauty-pack-prototype";

import {
  sortBeautyPacksByUpdatedAt,
} from "@/lib/beauty-pack";

import {
  readOnboardingDraft,
} from "@/lib/onboarding-storage";

import {
  buildStudioSettingsState,
  saveStudioSettings,
  type StudioSettingsState,
} from "@/lib/studio-settings";

import type {
  ClientDirectoryRecord,
} from "@/types/clients";

import type {
  NewClientDraft,
} from "@/types/client-creation";

import type {
  BeautyPack,
  BeautyPackInput,
} from "@/types/beauty-pack";

import type {
  ClientStatus,
} from "@/types";

import type {
  ScheduleAppointment,
  ScheduleStatusOverride,
} from "@/types/schedule";

export type RoveiDataSourceResult<T> = {
  mode: BackendMode;
  data: T;
};

export type ScheduleData = {
  appointments:
    ScheduleAppointment[];

  cancelledAppointmentIds:
    string[];
};

type CloudScheduleAppointment = {
  id: string;
  clientId: string;
  name: string;
  initials: string;
  service: string;
  date: string;
  time: string;
  displayTime: string;
  status:
    | "scheduled"
    | "completed"
    | "cancelled";
  readinessStatus:
    ClientStatus;
  timezone: string;
};

type CloudStudioSettings =
  StudioSettingsState & {
    timezone: string;
  };

type StudioData = {
  settings:
    StudioSettingsState;

  timezone: string;
};

function prototypeCancelledIds(
  overrides:
    ScheduleStatusOverride[],
) {
  return overrides.map(
    (override) =>
      override.appointmentId,
  );
}

function mapCloudScheduleAppointment(
  appointment:
    CloudScheduleAppointment,
): ScheduleAppointment {
  const status:
    ClientStatus =
      appointment.status ===
      "completed"
        ? "complete"
        : appointment
            .readinessStatus;

  return {
    id:
      appointment.id,

    clientId:
      appointment.clientId,

    name:
      appointment.name,

    initials:
      appointment.initials,

    service:
      appointment.service,

    date:
      appointment.date,

    time:
      appointment.displayTime,

    status,

    context:
      status === "ready"
        ? "Ready for appointment"
        : status === "waiting"
          ? "Waiting on client"
          : status === "complete"
            ? "Visit complete"
            : "Client experience draft",
  };
}

/* ========================================================
   CLIENTS
   ======================================================== */

export async function loadClients():
  Promise<
    RoveiDataSourceResult<
      ClientDirectoryRecord[]
    >
  > {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,
      data:
        clientDirectoryDemoData,
    };
  }

  const response =
    await fetchBackendJson<{
      clients:
        ClientDirectoryRecord[];
    }>("/api/clients");

  return {
    mode,
    data:
      response.clients,
  };
}

export type CreatedClientData = {
  clientId: string | null;
  appointmentId: string | null;
  startsAt: string | null;
  timezone: string | null;
};

export async function createClientData(
  draft: NewClientDraft,
): Promise<
  RoveiDataSourceResult<
    CreatedClientData
  >
> {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      data: {
        clientId: null,
        appointmentId: null,
        startsAt: null,
        timezone:
          getBrowserTimezone(),
      },
    };
  }

  const response =
    await fetchBackendJson<{
      clientId: string;
      appointmentId: string;
      startsAt: string;
      timezone: string;
    }>(
      "/api/clients",
      {
        method: "POST",

        body:
          JSON.stringify(
            draft,
          ),
      },
    );

  return {
    mode,

    data: {
      clientId:
        response.clientId,

      appointmentId:
        response.appointmentId,

      startsAt:
        response.startsAt,

      timezone:
        response.timezone,
    },
  };
}

/* ========================================================
   SCHEDULE
   ======================================================== */

export async function loadSchedule(
  from?: string,
  to?: string,
): Promise<
  RoveiDataSourceResult<
    ScheduleData
  >
> {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    const statusStore =
      readScheduleStatusOverrides();

    return {
      mode,

      data: {
        appointments:
          scheduleDemoAppointments,

        cancelledAppointmentIds:
          prototypeCancelledIds(
            statusStore.overrides,
          ),
      },
    };
  }

  const params =
    new URLSearchParams();

  if (from) {
    params.set(
      "from",
      from,
    );
  }

  if (to) {
    params.set(
      "to",
      to,
    );
  }

  const query =
    params.size > 0
      ? `?${params.toString()}`
      : "";

  const response =
    await fetchBackendJson<{
      appointments:
        CloudScheduleAppointment[];
    }>(
      `/api/appointments${query}`,
    );

  return {
    mode,

    data: {
      appointments:
        response.appointments.map(
          mapCloudScheduleAppointment,
        ),

      cancelledAppointmentIds:
        response.appointments
          .filter(
            (appointment) =>
              appointment.status ===
              "cancelled",
          )
          .map(
            (appointment) =>
              appointment.id,
          ),
    },
  };
}

export async function setScheduleCancelled(
  appointmentId: string,
  cancelled: boolean,
) {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    const result =
      cancelled
        ? markScheduleAppointmentCancelled(
            appointmentId,
          )
        : restoreScheduleAppointment(
            appointmentId,
          );

    return {
      mode,
      saved:
        Boolean(result),
    };
  }

  await fetchBackendJson<{
    appointment: {
      id: string;
      status: string;
    };
  }>(
    `/api/appointments/${encodeURIComponent(
      appointmentId,
    )}`,
    {
      method: "PATCH",

      body:
        JSON.stringify({
          status:
            cancelled
              ? "cancelled"
              : "scheduled",
        }),
    },
  );

  return {
    mode,
    saved: true,
  };
}

/* ========================================================
   BEAUTY PACKS
   ======================================================== */

export async function loadBeautyPacks():
  Promise<
    RoveiDataSourceResult<
      BeautyPack[]
    >
  > {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      data:
        sortBeautyPacksByUpdatedAt(
          readBeautyPackStore()
            .packs,
        ),
    };
  }

  const response =
    await fetchBackendJson<{
      packs: BeautyPack[];
    }>("/api/beauty-packs");

  return {
    mode,

    data:
      sortBeautyPacksByUpdatedAt(
        response.packs,
      ),
  };
}

export async function loadBeautyPack(
  id: string,
): Promise<
  RoveiDataSourceResult<
    BeautyPack | null
  >
> {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      data:
        getBeautyPackById(id),
    };
  }

  const response =
    await fetchBackendJson<{
      pack: BeautyPack;
    }>(
      `/api/beauty-packs/${encodeURIComponent(
        id,
      )}`,
    );

  return {
    mode,
    data:
      response.pack,
  };
}

export async function createBeautyPackData(
  input: BeautyPackInput,
): Promise<
  RoveiDataSourceResult<
    BeautyPack | null
  >
> {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,
      data:
        createBeautyPack(input),
    };
  }

  const response =
    await fetchBackendJson<{
      pack: BeautyPack;
    }>(
      "/api/beauty-packs",
      {
        method: "POST",
        body:
          JSON.stringify(input),
      },
    );

  return {
    mode,
    data:
      response.pack,
  };
}

export async function updateBeautyPackData(
  id: string,
  input: BeautyPackInput,
): Promise<
  RoveiDataSourceResult<
    BeautyPack | null
  >
> {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      data:
        updateBeautyPack(
          id,
          input,
        ),
    };
  }

  const response =
    await fetchBackendJson<{
      pack: BeautyPack;
    }>(
      `/api/beauty-packs/${encodeURIComponent(
        id,
      )}`,
      {
        method: "PUT",
        body:
          JSON.stringify(input),
      },
    );

  return {
    mode,
    data:
      response.pack,
  };
}

export async function deleteBeautyPackData(
  id: string,
) {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      deleted:
        deleteBeautyPack(id),
    };
  }

  await fetchBackendJson<{
    deleted: boolean;
  }>(
    `/api/beauty-packs/${encodeURIComponent(
      id,
    )}`,
    {
      method: "DELETE",
    },
  );

  return {
    mode,
    deleted: true,
  };
}

/* ========================================================
   STUDIO
   ======================================================== */

export async function loadStudio():
  Promise<
    RoveiDataSourceResult<
      StudioData
    >
  > {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      data: {
        settings:
          buildStudioSettingsState(
            readOnboardingDraft(),
          ),

        timezone:
          getBrowserTimezone(),
      },
    };
  }

  const response =
    await fetchBackendJson<
      CloudStudioSettings
    >("/api/studio");

  const {
    timezone,
    ...settings
  } = response;

  return {
    mode,

    data: {
      settings,
      timezone,
    },
  };
}

export async function saveStudio(
  settings:
    StudioSettingsState,

  timezone =
    getBrowserTimezone(),
) {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      saved:
        saveStudioSettings(
          settings,
        ),
    };
  }

  await fetchBackendJson<{
    saved: boolean;
  }>(
    "/api/studio",
    {
      method: "PUT",

      body:
        JSON.stringify({
          ...settings,
          timezone,
        }),
    },
  );

  return {
    mode,
    saved: true,
  };
}

export async function bootstrapStudio(
  settings:
    StudioSettingsState,

  timezone =
    getBrowserTimezone(),
) {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,

      studioId: null,

      alreadyExists:
        false,

      saved:
        saveStudioSettings(
          settings,
        ),
    };
  }

  const response =
    await fetchBackendJson<{
      studioId: string;
      alreadyExists: boolean;
    }>(
      "/api/studio/bootstrap",
      {
        method: "POST",

        body:
          JSON.stringify({
            ...settings,
            timezone,
          }),
      },
    );

  return {
    mode,

    studioId:
      response.studioId,

    alreadyExists:
      response.alreadyExists,

    saved: true,
  };
}
