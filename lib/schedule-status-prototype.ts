import { cancellableScheduleAppointmentIds, scheduleAppointmentIds } from "@/lib/schedule-demo-data";
import type { ScheduleStatusOverride, ScheduleStatusPrototype } from "@/types/schedule";

export const SCHEDULE_STATUS_PROTOTYPE_KEY = "rovei:schedule-status-overrides";
const KNOWN_APPOINTMENT_IDS = new Set(scheduleAppointmentIds);
const CANCELLABLE_APPOINTMENT_IDS = new Set(cancellableScheduleAppointmentIds);

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

function isValidOverride(value: unknown): value is ScheduleStatusOverride {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return hasExactKeys(record, ["appointmentId", "status"])
    && typeof record.appointmentId === "string"
    && CANCELLABLE_APPOINTMENT_IDS.has(record.appointmentId)
    && record.status === "cancelled";
}

export function isValidScheduleStatusPrototype(value: unknown): value is ScheduleStatusPrototype {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!hasExactKeys(record, ["overrides", "updatedAt"]) || !Array.isArray(record.overrides) || !isIsoDate(record.updatedAt)) return false;
  if (!record.overrides.every(isValidOverride)) return false;
  const ids = record.overrides.map((override) => override.appointmentId);
  return new Set(ids).size === ids.length;
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readScheduleStatusOverrides(): ScheduleStatusPrototype {
  const storage = getSessionStorage();
  const empty: ScheduleStatusPrototype = { overrides: [], updatedAt: new Date(0).toISOString() };
  if (!storage) return empty;
  let raw: string | null;
  try {
    raw = storage.getItem(SCHEDULE_STATUS_PROTOTYPE_KEY);
  } catch {
    return empty;
  }
  if (!raw) return empty;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidScheduleStatusPrototype(parsed)) return parsed;
  } catch {
    // Corrupt prototype state is discarded below.
  }
  try { storage.removeItem(SCHEDULE_STATUS_PROTOTYPE_KEY); } catch { /* no-op */ }
  return empty;
}

function writeScheduleStatusOverrides(overrides: ScheduleStatusOverride[]): ScheduleStatusPrototype | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  const next: ScheduleStatusPrototype = { overrides, updatedAt: new Date().toISOString() };
  if (!isValidScheduleStatusPrototype(next)) return null;
  try {
    if (overrides.length === 0) {
      storage.removeItem(SCHEDULE_STATUS_PROTOTYPE_KEY);
    } else {
      storage.setItem(SCHEDULE_STATUS_PROTOTYPE_KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return null;
  }
}

export function markScheduleAppointmentCancelled(appointmentId: string): ScheduleStatusPrototype | null {
  if (!CANCELLABLE_APPOINTMENT_IDS.has(appointmentId)) return null;
  const current = readScheduleStatusOverrides();
  const overrides = current.overrides.some((override) => override.appointmentId === appointmentId)
    ? current.overrides
    : [...current.overrides, { appointmentId, status: "cancelled" as const }];
  return writeScheduleStatusOverrides(overrides);
}

export function restoreScheduleAppointment(appointmentId: string): ScheduleStatusPrototype | null {
  if (!KNOWN_APPOINTMENT_IDS.has(appointmentId)) return null;
  const current = readScheduleStatusOverrides();
  return writeScheduleStatusOverrides(current.overrides.filter((override) => override.appointmentId !== appointmentId));
}
