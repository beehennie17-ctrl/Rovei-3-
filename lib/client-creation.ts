import { isServiceCategoryId } from "@/lib/service-categories";
import type { NewClientDraft } from "@/types/client-creation";

export const CLIENT_NAME_MIN_LENGTH = 2;
export const CLIENT_NAME_MAX_LENGTH = 50;

export function isValidClientNamePart(value: string): boolean {
  const normalized = value.trim();
  return normalized.length >= CLIENT_NAME_MIN_LENGTH && normalized.length <= CLIENT_NAME_MAX_LENGTH;
}

export function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isValidTimeOnly(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidNewClientDraft(value: unknown): value is NewClientDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as Record<string, unknown>;
  const allowedKeys = new Set(["firstName", "lastName", "service", "appointmentDate", "appointmentTime"]);
  if (Object.keys(draft).some((key) => !allowedKeys.has(key)) || Object.keys(draft).length !== allowedKeys.size) return false;

  return (
    typeof draft.firstName === "string" &&
    isValidClientNamePart(draft.firstName) &&
    typeof draft.lastName === "string" &&
    isValidClientNamePart(draft.lastName) &&
    isServiceCategoryId(draft.service) &&
    typeof draft.appointmentDate === "string" &&
    isValidDateOnly(draft.appointmentDate) &&
    typeof draft.appointmentTime === "string" &&
    isValidTimeOnly(draft.appointmentTime)
  );
}

export function formatClientAppointmentDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || !isValidDateOnly(value)) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatClientAppointmentTime(value: string): string {
  if (!isValidTimeOnly(value)) return value;
  const [hoursText, minutes] = value.split(":");
  const hours = Number(hoursText);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${period}`;
}

export function deriveClientInitials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}
