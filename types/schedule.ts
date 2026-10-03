import type { ClientStatus } from "@/types";

export type ScheduleAppointmentStatus = ClientStatus | "cancelled";

export type ScheduleAppointment = {
  id: string;
  clientId: string;
  name: string;
  initials: string;
  service: string;
  date: string;
  time: string;
  status: ClientStatus;
  clientType?: string;
  context?: string;
};

export type ScheduleAppointmentView = ScheduleAppointment & {
  effectiveStatus: ScheduleAppointmentStatus;
};

export type ScheduleStatusOverride = {
  appointmentId: string;
  status: "cancelled";
};

export type ScheduleStatusPrototype = {
  overrides: ScheduleStatusOverride[];
  updatedAt: string;
};
