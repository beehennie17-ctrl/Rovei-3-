import type { DashboardAppointment, RecentClientMemory } from "@/types/dashboard";

export const nextAppointment: DashboardAppointment = {
  id: "today-emily-carter",
  clientId: "emily-carter",
  name: "Emily Carter",
  initials: "EC",
  service: "Lashes",
  time: "2:00 PM",
  status: "ready",
  clientType: "New client",
  context: "Everything is complete before the appointment.",
  readinessItems: [
    { id: "consultation", label: "Consultation", value: "Complete", complete: true },
    { id: "preferences", label: "Preferences", value: "Complete", complete: true },
    { id: "inspiration", label: "Inspiration", value: "3 photos", complete: true },
    { id: "consent", label: "Consent", value: "Complete", complete: true },
    { id: "prep", label: "Prep", value: "Viewed", complete: true },
  ],
};

export const todayAppointments: DashboardAppointment[] = [
  nextAppointment,
  {
    id: "today-sarah-cole",
    clientId: "sarah-cole",
    name: "Sarah Cole",
    initials: "SC",
    service: "Brows",
    time: "4:30 PM",
    status: "waiting",
    context: "Waiting on 2 items",
    outstandingItems: ["Consultation", "Inspiration photos"],
  },
  {
    id: "today-naomi-brooks",
    clientId: "naomi-brooks",
    name: "Naomi Brooks",
    initials: "NB",
    service: "Makeup",
    time: "6:00 PM",
    status: "ready",
    context: "Client experience complete",
  },
];

export const attentionAppointments: DashboardAppointment[] = todayAppointments.filter(
  (appointment) => appointment.status === "waiting" && appointment.outstandingItems?.length,
);

export const recentClientMemories: RecentClientMemory[] = [
  {
    id: "recent-ava-james",
    clientId: "ava-james",
    name: "Ava James",
    initials: "AJ",
    service: "Lashes",
    lastVisit: "Yesterday",
  },
  {
    id: "recent-nina-patel",
    clientId: "nina-patel",
    name: "Nina Patel",
    initials: "NP",
    service: "Brows",
    lastVisit: "Monday",
  },
  {
    id: "recent-lucy-hall",
    clientId: "lucy-hall",
    name: "Lucy Hall",
    initials: "LH",
    service: "Lashes",
    lastVisit: "Friday",
  },
];
