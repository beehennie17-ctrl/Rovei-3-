import type { ClientStatus } from "@/types";

export type ReadinessItem = {
  id: string;
  label: string;
  value: string;
  complete: boolean;
};

export type DashboardAppointment = {
  id: string;
  clientId: string;
  name: string;
  initials: string;
  service: string;
  time: string;
  status: ClientStatus;
  clientType?: string;
  readinessItems?: ReadinessItem[];
  outstandingItems?: string[];
  context?: string;
};

export type RecentClientMemory = {
  id: string;
  clientId: string;
  name: string;
  initials: string;
  service: string;
  lastVisit: string;
};
