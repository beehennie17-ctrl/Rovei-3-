import { formatClientAppointmentDate, formatClientAppointmentTime, deriveClientInitials } from "@/lib/client-creation";
import {
  getClientAppointmentFeelLabel,
  getClientFinishPreferenceLabel,
} from "@/lib/client-experience-labels";
import { isClientExperienceModuleComplete } from "@/lib/client-experience-prototype";
import { getExperienceOption } from "@/lib/experience-options";
import { getServiceCategory } from "@/lib/service-categories";
import { resolveClientTheme } from "@/lib/theme-resolver";
import type { ClientLinkPrototype } from "@/types/client-link";
import type { ClientExperiencePrototype, PrototypePhotoKind, PrototypePhotoRecord } from "@/types/client-experience";
import type { NewClientDraft } from "@/types/client-creation";
import type {
  ClientSubmissionReadinessRow,
  ClientSubmissionResult,
  ReconciledPrototypePhotos,
} from "@/types/client-submission-result";
import type { OnboardingDraft } from "@/types/onboarding";

export function buildClientSubmissionResult(
  draft: NewClientDraft,
  link: ClientLinkPrototype,
  response: ClientExperiencePrototype,
  studioDraft: Partial<OnboardingDraft>,
): ClientSubmissionResult | null {
  if (link.token !== response.token) return null;

  const service = getServiceCategory(draft.service)?.name ?? "Appointment";
  const preferences = response.preferences?.finish && response.preferences.appointmentFeel
    ? {
        finish: response.preferences.finish,
        finishLabel: getClientFinishPreferenceLabel(response.preferences.finish),
        appointmentFeel: response.preferences.appointmentFeel,
        appointmentFeelLabel: getClientAppointmentFeelLabel(response.preferences.appointmentFeel),
      }
    : undefined;

  return {
    token: link.token,
    clientName: `${draft.firstName} ${draft.lastName}`,
    initials: deriveClientInitials(draft.firstName, draft.lastName),
    clientType: "New client",
    serviceId: draft.service,
    service,
    appointmentDateLabel: formatClientAppointmentDate(draft.appointmentDate),
    appointmentTimeLabel: formatClientAppointmentTime(draft.appointmentTime),
    status: response.status === "complete" ? "ready" : "waiting",
    theme: resolveClientTheme(studioDraft.theme, studioDraft.customPrimary),
    enabledModules: [...response.modules],
    completedModuleCount: response.modules.filter((moduleId) => isClientExperienceModuleComplete(response, moduleId)).length,
    totalModuleCount: response.modules.length,
    consultation: response.consultation ? { ...response.consultation } : undefined,
    preferences,
    inspiration: response.inspiration
      ? { skipped: response.inspiration.skipped, photoIds: [...response.inspiration.photoIds] }
      : undefined,
    currentPhotos: response.currentPhotos
      ? { skipped: response.currentPhotos.skipped, photoIds: [...response.currentPhotos.photoIds] }
      : undefined,
    consent: response.consent ? { ...response.consent } : undefined,
    prep: response.prep ? { ...response.prep } : undefined,
    submittedAt: response.submittedAt,
  };
}

export function reconcilePrototypePhotos(
  token: string,
  kind: PrototypePhotoKind,
  photoIds: string[],
  storedPhotos: PrototypePhotoRecord[],
): ReconciledPrototypePhotos {
  const allowedPhotos = storedPhotos.filter((photo) => photo.token === token && photo.kind === kind);
  const byId = new Map(allowedPhotos.map((photo) => [photo.id, photo]));
  const seen = new Set<string>();
  const orderedPhotos: PrototypePhotoRecord[] = [];
  const requestedIds: string[] = [];

  photoIds.forEach((id) => {
    if (seen.has(id)) return;
    seen.add(id);
    requestedIds.push(id);
    const record = byId.get(id);
    if (record) orderedPhotos.push(record);
  });

  return {
    kind,
    requestedCount: requestedIds.length,
    photos: orderedPhotos,
    missingCount: Math.max(0, requestedIds.length - orderedPhotos.length),
  };
}

function photoRow(
  id: "inspiration" | "current-photos",
  label: string,
  answer: { skipped: boolean; photoIds: string[] } | undefined,
  photos: ReconciledPrototypePhotos | undefined,
): ClientSubmissionReadinessRow {
  if (answer?.skipped) {
    return { id, moduleId: id, label, value: "None added", state: "complete" };
  }

  if (!answer?.photoIds.length) {
    return { id, moduleId: id, label, value: "Waiting", state: "waiting" };
  }

  const available = photos?.photos.length ?? 0;
  if (available > 0) {
    return {
      id,
      moduleId: id,
      label,
      value: `${available} photo${available === 1 ? "" : "s"}`,
      state: photos?.missingCount ? "unavailable" : "complete",
    };
  }

  return { id, moduleId: id, label, value: "Unavailable in prototype", state: "unavailable" };
}

export function buildClientSubmissionReadinessRows(
  result: ClientSubmissionResult,
  photos: {
    inspiration?: ReconciledPrototypePhotos;
    current?: ReconciledPrototypePhotos;
  } = {},
): ClientSubmissionReadinessRow[] {
  const rows: ClientSubmissionReadinessRow[] = [];

  result.enabledModules.forEach((moduleId) => {
    const label = getExperienceOption(moduleId)?.name ?? moduleId;
    switch (moduleId) {
      case "consultation":
        rows.push({
          id: moduleId,
          moduleId,
          label: "Consultation",
          value: result.consultation?.goal.trim() ? "Complete" : "Waiting",
          state: result.consultation?.goal.trim() ? "complete" : "waiting",
        });
        break;
      case "preferences":
        rows.push({
          id: moduleId,
          moduleId,
          label: "Preferences",
          value: result.preferences ? "Complete" : "Waiting",
          state: result.preferences ? "complete" : "waiting",
        });
        break;
      case "inspiration":
        rows.push(photoRow("inspiration", "Inspiration photos", result.inspiration, photos.inspiration));
        break;
      case "current-photos":
        rows.push(photoRow("current-photos", "Current photos", result.currentPhotos, photos.current));
        break;
      case "consent":
        rows.push({
          id: moduleId,
          moduleId,
          label,
          value: result.consent?.acknowledged ? "Acknowledged" : "Waiting",
          state: result.consent?.acknowledged ? "complete" : "waiting",
        });
        break;
      case "prep":
        rows.push({
          id: moduleId,
          moduleId,
          label,
          value: result.prep?.acknowledged ? "Read" : "Waiting",
          state: result.prep?.acknowledged ? "complete" : "waiting",
        });
        break;
    }
  });

  rows.push({
    id: "client-notes",
    label: "Client notes",
    value: "Ready for your notes",
    state: "neutral",
  });

  return rows;
}

export function formatPrototypeSubmissionTime(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

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
