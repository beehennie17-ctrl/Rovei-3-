import { isValidNewClientDraft } from "@/lib/client-creation";
import type { NewClientDraft } from "@/types/client-creation";

export const NEW_CLIENT_DRAFT_KEY = "rovei:new-client-draft";

function canUseSessionStorage() {
  if (typeof window === "undefined") return false;
  try {
    return typeof window.sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readNewClientDraft(): NewClientDraft | null {
  if (!canUseSessionStorage()) return null;

  try {
    const stored = window.sessionStorage.getItem(NEW_CLIENT_DRAFT_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!isValidNewClientDraft(parsed)) {
      window.sessionStorage.removeItem(NEW_CLIENT_DRAFT_KEY);
      return null;
    }

    return {
      firstName: parsed.firstName.trim(),
      lastName: parsed.lastName.trim(),
      service: parsed.service,
      appointmentDate: parsed.appointmentDate,
      appointmentTime: parsed.appointmentTime,
    };
  } catch {
    try {
      window.sessionStorage.removeItem(NEW_CLIENT_DRAFT_KEY);
    } catch {
      // Prototype-only persistence is best effort.
    }
    return null;
  }
}

export function writeNewClientDraft(draft: NewClientDraft): boolean {
  if (!canUseSessionStorage() || !isValidNewClientDraft(draft)) return false;

  try {
    window.sessionStorage.setItem(NEW_CLIENT_DRAFT_KEY, JSON.stringify({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      service: draft.service,
      appointmentDate: draft.appointmentDate,
      appointmentTime: draft.appointmentTime,
    }));
    return true;
  } catch {
    return false;
  }
}

export function clearNewClientDraft(): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(NEW_CLIENT_DRAFT_KEY);
  } catch {
    // Prototype-only persistence is best effort.
  }
}
