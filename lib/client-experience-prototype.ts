import { EXPERIENCE_OPTIONS, isExperienceModuleId } from "@/lib/experience-options";
import { isValidPrototypeClientToken } from "@/lib/client-link-prototype";
import type {
  ClientAppointmentFeel,
  ClientExperiencePrototype,
  ClientFinishPreference,
} from "@/types/client-experience";
import type { ExperienceModuleId } from "@/types/onboarding";

export const CLIENT_EXPERIENCE_PROTOTYPE_KEY = "rovei:client-experience-prototype";

const FINISH_VALUES = new Set<ClientFinishPreference>(["natural", "soft", "defined", "glam", "not-sure"]);
const APPOINTMENT_FEEL_VALUES = new Set<ClientAppointmentFeel>(["quiet", "chatty", "no-preference"]);

function canUseSessionStorage() {
  if (typeof window === "undefined") return false;
  try {
    return typeof window.sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

function hasExactKeys(value: Record<string, unknown>, allowed: string[], required: string[]) {
  const allowedSet = new Set(allowed);
  return Object.keys(value).every((key) => allowedSet.has(key)) && required.every((key) => key in value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isConsultation(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return hasExactKeys(record, ["goal"], ["goal"]) && typeof record.goal === "string" && record.goal.length <= 500;
}

function isPreferences(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!hasExactKeys(record, ["finish", "appointmentFeel"], [])) return false;
  if (record.finish !== undefined && (typeof record.finish !== "string" || !FINISH_VALUES.has(record.finish as ClientFinishPreference))) return false;
  if (record.appointmentFeel !== undefined && (typeof record.appointmentFeel !== "string" || !APPOINTMENT_FEEL_VALUES.has(record.appointmentFeel as ClientAppointmentFeel))) return false;
  return record.finish !== undefined || record.appointmentFeel !== undefined;
}

function isPhotoAnswer(value: unknown, maxFiles: number) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    hasExactKeys(record, ["skipped", "photoIds"], ["skipped", "photoIds"]) &&
    typeof record.skipped === "boolean" &&
    isStringArray(record.photoIds) &&
    record.photoIds.length <= maxFiles &&
    !(record.skipped && record.photoIds.length > 0) &&
    record.photoIds.every((id) => id.length >= 8 && id.length <= 128)
  );
}

function isAcknowledgement(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return hasExactKeys(record, ["acknowledged"], ["acknowledged"]) && typeof record.acknowledged === "boolean";
}

export function isValidClientExperiencePrototype(value: unknown): value is ClientExperiencePrototype {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const allowed = [
    "token",
    "modules",
    "status",
    "currentStep",
    "consultation",
    "preferences",
    "inspiration",
    "currentPhotos",
    "consent",
    "prep",
    "updatedAt",
    "submittedAt",
  ];
  if (!hasExactKeys(record, allowed, ["token", "modules", "status", "currentStep", "updatedAt"])) return false;
  if (!isValidPrototypeClientToken(record.token)) return false;
  if (!Array.isArray(record.modules) || !record.modules.every(isExperienceModuleId)) return false;
  const modules = record.modules as ExperienceModuleId[];
  if (new Set(modules).size !== modules.length) return false;
  const selectedModules = new Set(modules);
  const canonicalModules = EXPERIENCE_OPTIONS.filter((option) => selectedModules.has(option.id)).map((option) => option.id);
  if (canonicalModules.some((moduleId, index) => moduleId !== modules[index])) return false;
  if (record.status !== "in-progress" && record.status !== "complete") return false;
  if (!Number.isInteger(record.currentStep) || (record.currentStep as number) < -1 || (record.currentStep as number) > record.modules.length) return false;
  if (!isIsoDate(record.updatedAt)) return false;
  if (record.submittedAt !== undefined && !isIsoDate(record.submittedAt)) return false;
  if (record.status === "in-progress" && record.submittedAt !== undefined) return false;
  if (record.status === "complete" && (record.submittedAt === undefined || record.currentStep !== modules.length)) return false;
  if (record.consultation !== undefined && !isConsultation(record.consultation)) return false;
  if (record.preferences !== undefined && !isPreferences(record.preferences)) return false;
  if (record.inspiration !== undefined && !isPhotoAnswer(record.inspiration, 3)) return false;
  if (record.currentPhotos !== undefined && !isPhotoAnswer(record.currentPhotos, 2)) return false;
  if (record.consent !== undefined && !isAcknowledgement(record.consent)) return false;
  if (record.prep !== undefined && !isAcknowledgement(record.prep)) return false;
  if (record.status === "complete" && !record.modules.every((moduleId) => isClientExperienceModuleComplete(record as ClientExperiencePrototype, moduleId))) return false;
  return true;
}

export function createClientExperiencePrototype(
  token: string,
  modules: ExperienceModuleId[],
): ClientExperiencePrototype {
  return {
    token,
    modules: [...modules],
    status: "in-progress",
    currentStep: -1,
    updatedAt: new Date().toISOString(),
  };
}

export function readClientExperiencePrototype(token: string): ClientExperiencePrototype | null {
  if (!canUseSessionStorage() || !isValidPrototypeClientToken(token)) return null;

  try {
    const stored = window.sessionStorage.getItem(CLIENT_EXPERIENCE_PROTOTYPE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!isValidClientExperiencePrototype(parsed)) {
      window.sessionStorage.removeItem(CLIENT_EXPERIENCE_PROTOTYPE_KEY);
      return null;
    }
    return parsed.token === token ? parsed : null;
  } catch {
    try {
      window.sessionStorage.removeItem(CLIENT_EXPERIENCE_PROTOTYPE_KEY);
    } catch {
      // Prototype persistence is best effort.
    }
    return null;
  }
}

export function writeClientExperiencePrototype(record: ClientExperiencePrototype): boolean {
  if (!canUseSessionStorage() || !isValidClientExperiencePrototype(record)) return false;
  try {
    window.sessionStorage.setItem(CLIENT_EXPERIENCE_PROTOTYPE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearClientExperiencePrototype(): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(CLIENT_EXPERIENCE_PROTOTYPE_KEY);
  } catch {
    // Prototype persistence is best effort.
  }
}

export function isClientExperienceModuleComplete(
  record: ClientExperiencePrototype,
  moduleId: ExperienceModuleId,
): boolean {
  switch (moduleId) {
    case "consultation":
      return Boolean(record.consultation?.goal.trim());
    case "preferences":
      return Boolean(record.preferences?.finish && record.preferences?.appointmentFeel);
    case "inspiration":
      return Boolean(record.inspiration?.skipped || record.inspiration?.photoIds.length);
    case "current-photos":
      return Boolean(record.currentPhotos?.skipped || record.currentPhotos?.photoIds.length);
    case "consent":
      return record.consent?.acknowledged === true;
    case "prep":
      return record.prep?.acknowledged === true;
  }
}

export function areAllClientExperienceModulesComplete(record: ClientExperiencePrototype): boolean {
  return record.modules.every((moduleId) => isClientExperienceModuleComplete(record, moduleId));
}
