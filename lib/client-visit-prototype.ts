import { isValidPrototypeClientToken } from "@/lib/client-link-prototype";
import { isValidCompletedAt, isValidPrototypeVisitRecord, visitMatchesCurrentAppointment } from "@/lib/client-visit";
import type { NewClientDraft } from "@/types/client-creation";
import type { ClientVisitPrototype, PrototypeVisitRecord } from "@/types/client-visit";

export const CLIENT_VISIT_PROTOTYPE_KEY = "rovei:client-visit-prototype";

function canUseSessionStorage() {
  if (typeof window === "undefined") return false;
  try {
    return typeof window.sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

export function isValidClientVisitPrototype(value: unknown): value is ClientVisitPrototype {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 3 || !keys.includes("token") || !keys.includes("visits") || !keys.includes("updatedAt")) return false;
  if (!isValidPrototypeClientToken(record.token) || !Array.isArray(record.visits) || !record.visits.every(isValidPrototypeVisitRecord) || !isValidCompletedAt(record.updatedAt)) return false;
  const visits = record.visits as PrototypeVisitRecord[];
  return new Set(visits.map((visit) => visit.id)).size === visits.length;
}

export function readClientVisitPrototype(expectedToken?: string): ClientVisitPrototype | null {
  if (!canUseSessionStorage()) return null;
  try {
    const stored = window.sessionStorage.getItem(CLIENT_VISIT_PROTOTYPE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!isValidClientVisitPrototype(parsed)) {
      window.sessionStorage.removeItem(CLIENT_VISIT_PROTOTYPE_KEY);
      return null;
    }
    if (expectedToken && parsed.token !== expectedToken) return null;
    return parsed;
  } catch {
    try {
      window.sessionStorage.removeItem(CLIENT_VISIT_PROTOTYPE_KEY);
    } catch {
      // Prototype-only persistence is best effort.
    }
    return null;
  }
}

export function writeClientVisitPrototype(record: ClientVisitPrototype): boolean {
  if (!canUseSessionStorage() || !isValidClientVisitPrototype(record)) return false;
  try {
    window.sessionStorage.setItem(CLIENT_VISIT_PROTOTYPE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearClientVisitPrototype(): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(CLIENT_VISIT_PROTOTYPE_KEY);
  } catch {
    // Prototype-only persistence is best effort.
  }
}

export function findVisitForCurrentAppointment(
  prototype: ClientVisitPrototype | null,
  draft: NewClientDraft,
): PrototypeVisitRecord | null {
  if (!prototype) return null;
  return prototype.visits.find((visit) => visitMatchesCurrentAppointment(visit, draft)) ?? null;
}

export function appendCompletedVisit(token: string, visit: PrototypeVisitRecord): boolean {
  if (!isValidPrototypeClientToken(token) || !isValidPrototypeVisitRecord(visit)) return false;

  const existing = readClientVisitPrototype(token);
  if (existing?.visits.some((candidate) =>
    candidate.service === visit.service &&
    candidate.appointmentDate === visit.appointmentDate &&
    candidate.appointmentTime === visit.appointmentTime
  )) {
    return false;
  }

  const next: ClientVisitPrototype = {
    token,
    visits: [...(existing?.visits ?? []), { ...visit, summary: visit.summary.trim() }],
    updatedAt: new Date().toISOString(),
  };
  return writeClientVisitPrototype(next);
}
