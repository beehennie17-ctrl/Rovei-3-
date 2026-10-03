import { isValidDateOnly, isValidTimeOnly } from "@/lib/client-creation";
import { isServiceCategoryId } from "@/lib/service-categories";
import type { NewClientDraft } from "@/types/client-creation";
import type {
  PrototypeVisitPhotoKind,
  PrototypeVisitPhotoRecord,
  PrototypeVisitRecord,
  ReconciledVisitPhotos,
} from "@/types/client-visit";

export const VISIT_SUMMARY_MIN_LENGTH = 2;
export const VISIT_SUMMARY_MAX_LENGTH = 1000;
const OPAQUE_ID_PATTERN = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

export function isValidVisitSummary(value: string): boolean {
  const normalized = value.trim();
  return normalized.length >= VISIT_SUMMARY_MIN_LENGTH && normalized.length <= VISIT_SUMMARY_MAX_LENGTH;
}

export function isValidPrototypeVisitId(value: unknown): value is string {
  return typeof value === "string" && OPAQUE_ID_PATTERN.test(value);
}

export function generatePrototypeVisitId(): string {
  if (typeof window === "undefined" || !window.crypto) {
    throw new Error("Prototype visit IDs require the browser Web Crypto API.");
  }
  if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  if (!window.crypto.getRandomValues) throw new Error("Prototype visit IDs require Web Crypto randomness.");

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isValidCompletedAt(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

export function isValidPrototypeVisitRecord(value: unknown): value is PrototypeVisitRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const allowed = new Set([
    "id",
    "service",
    "appointmentDate",
    "appointmentTime",
    "summary",
    "beforePhotoIds",
    "afterPhotoIds",
    "completedAt",
  ]);
  const keys = Object.keys(record);
  if (keys.length !== allowed.size || keys.some((key) => !allowed.has(key))) return false;

  const validPhotoIds = (candidate: unknown) =>
    Array.isArray(candidate) &&
    candidate.length <= 3 &&
    new Set(candidate).size === candidate.length &&
    candidate.every((id) => typeof id === "string" && isValidPrototypeVisitId(id));

  return (
    isValidPrototypeVisitId(record.id) &&
    isServiceCategoryId(record.service) &&
    typeof record.appointmentDate === "string" &&
    isValidDateOnly(record.appointmentDate) &&
    typeof record.appointmentTime === "string" &&
    isValidTimeOnly(record.appointmentTime) &&
    typeof record.summary === "string" &&
    isValidVisitSummary(record.summary) &&
    validPhotoIds(record.beforePhotoIds) &&
    validPhotoIds(record.afterPhotoIds) &&
    isValidCompletedAt(record.completedAt)
  );
}

export function visitMatchesCurrentAppointment(visit: PrototypeVisitRecord, draft: NewClientDraft): boolean {
  return (
    visit.service === draft.service &&
    visit.appointmentDate === draft.appointmentDate &&
    visit.appointmentTime === draft.appointmentTime
  );
}

export function reconcileVisitPhotos(
  token: string,
  visitId: string,
  kind: PrototypeVisitPhotoKind,
  photoIds: string[],
  storedPhotos: PrototypeVisitPhotoRecord[],
): ReconciledVisitPhotos {
  const allowed = storedPhotos.filter(
    (photo) => photo.token === token && photo.visitId === visitId && photo.kind === kind,
  );
  const byId = new Map(allowed.map((photo) => [photo.id, photo]));
  const seen = new Set<string>();
  const photos: PrototypeVisitPhotoRecord[] = [];
  const requested: string[] = [];

  photoIds.forEach((id) => {
    if (seen.has(id)) return;
    seen.add(id);
    requested.push(id);
    const photo = byId.get(id);
    if (photo) photos.push(photo);
  });

  return {
    kind,
    requestedCount: requested.length,
    photos,
    missingCount: Math.max(0, requested.length - photos.length),
  };
}

export function sortVisitsNewestFirst(visits: PrototypeVisitRecord[]): PrototypeVisitRecord[] {
  return [...visits].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
}

export function formatVisitCompletedAt(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\bam\b/i, "AM")
    .replace(/\bpm\b/i, "PM");
}
