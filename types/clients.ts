import type { ClientStatus } from "@/types";

/**
 * Frontend-only view model for the Clients Directory.
 * Backend persistence/schema decisions intentionally live outside this type.
 */
export type ClientDirectoryRecord = {
  id: string;
  name: string;
  initials: string;
  primaryService: string;
  status: ClientStatus;
  clientType: string;
  lastVisit: string;
  nextAppointment: string | null;
  nextAppointmentTime?: string | null;
  context: string;
};

export type ClientStatusFilter = "all" | ClientStatus;
