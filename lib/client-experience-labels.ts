import type { ClientAppointmentFeel, ClientFinishPreference } from "@/types/client-experience";

const FINISH_LABELS: Record<ClientFinishPreference, string> = {
  natural: "Natural",
  soft: "Soft",
  defined: "Defined",
  glam: "Glam",
  "not-sure": "Not sure yet",
};

const APPOINTMENT_FEEL_LABELS: Record<ClientAppointmentFeel, string> = {
  quiet: "Quiet & relaxed",
  chatty: "Happy to chat",
  "no-preference": "No preference",
};

export function getClientFinishPreferenceLabel(value: ClientFinishPreference): string {
  return FINISH_LABELS[value];
}

export function getClientAppointmentFeelLabel(value: ClientAppointmentFeel): string {
  return APPOINTMENT_FEEL_LABELS[value];
}
