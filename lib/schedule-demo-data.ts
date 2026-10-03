import type { ScheduleAppointment } from "@/types/schedule";

export const SCHEDULE_DEMO_TODAY = "2026-09-30";

export const scheduleDemoAppointments: ScheduleAppointment[] = [
  {
    id: "schedule-nina-patel-2026-09-28",
    clientId: "nina-patel",
    name: "Nina Patel",
    initials: "NP",
    service: "Brows",
    date: "2026-09-28",
    time: "—",
    status: "complete",
    clientType: "Returning client",
    context: "Visit complete",
  },
  {
    id: "schedule-ava-james-2026-09-29",
    clientId: "ava-james",
    name: "Ava James",
    initials: "AJ",
    service: "Lashes",
    date: "2026-09-29",
    time: "—",
    status: "complete",
    clientType: "Returning client",
    context: "Visit complete",
  },
  {
    id: "schedule-emily-carter-2026-09-30",
    clientId: "emily-carter",
    name: "Emily Carter",
    initials: "EC",
    service: "Lashes",
    date: SCHEDULE_DEMO_TODAY,
    time: "2:00 PM",
    status: "ready",
    clientType: "New client",
    context: "Client experience complete",
  },
  {
    id: "schedule-sarah-cole-2026-09-30",
    clientId: "sarah-cole",
    name: "Sarah Cole",
    initials: "SC",
    service: "Brows",
    date: SCHEDULE_DEMO_TODAY,
    time: "4:30 PM",
    status: "waiting",
    clientType: "Returning client",
    context: "2 items outstanding",
  },
  {
    id: "schedule-naomi-brooks-2026-09-30",
    clientId: "naomi-brooks",
    name: "Naomi Brooks",
    initials: "NB",
    service: "Makeup",
    date: SCHEDULE_DEMO_TODAY,
    time: "6:00 PM",
    status: "ready",
    clientType: "Returning client",
    context: "Client experience complete",
  },
];

export const scheduleAppointmentIds = scheduleDemoAppointments.map((appointment) => appointment.id);
export const cancellableScheduleAppointmentIds = scheduleDemoAppointments
  .filter((appointment) => appointment.status !== "complete")
  .map((appointment) => appointment.id);
