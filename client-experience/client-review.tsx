import { getExperienceOption } from "@/lib/experience-options";
import { getClientAppointmentFeelLabel, getClientFinishPreferenceLabel } from "@/lib/client-experience-labels";
import { formatClientAppointmentDate, formatClientAppointmentTime } from "@/lib/client-creation";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientExperiencePrototype } from "@/types/client-experience";
import type { ClientTheme } from "@/types";
import type { NewClientDraft } from "@/types/client-creation";
import type { ExperienceModuleId } from "@/types/onboarding";

function valueForModule(record: ClientExperiencePrototype, moduleId: ExperienceModuleId) {
  switch (moduleId) {
    case "consultation": return record.consultation?.goal || "—";
    case "preferences": return record.preferences?.finish && record.preferences?.appointmentFeel ? `${getClientFinishPreferenceLabel(record.preferences.finish)} · ${getClientAppointmentFeelLabel(record.preferences.appointmentFeel)}` : "—";
    case "inspiration": return record.inspiration?.skipped ? "No inspiration added" : `${record.inspiration?.photoIds.length ?? 0} photo${record.inspiration?.photoIds.length === 1 ? "" : "s"}`;
    case "current-photos": return record.currentPhotos?.skipped ? "No current photo added" : `${record.currentPhotos?.photoIds.length ?? 0} photo${record.currentPhotos?.photoIds.length === 1 ? "" : "s"}`;
    case "consent": return record.consent?.acknowledged ? "Acknowledged" : "—";
    case "prep": return record.prep?.acknowledged ? "Read" : "—";
  }
}

export function ClientReview({ draft, record, theme }: { draft: NewClientDraft; record: ClientExperiencePrototype; theme: ClientTheme }) {
  const service = getServiceCategory(draft.service)?.name ?? "Appointment";
  return (
    <div className="page-enter">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.muted }}>Review</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">Review your experience</h1>
      <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
        <p className="font-bold">{draft.firstName} {draft.lastName}</p>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>{service} · {formatClientAppointmentDate(draft.appointmentDate)} · {formatClientAppointmentTime(draft.appointmentTime)}</p>
      </div>

      {record.modules.length === 0 ? (
        <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
          <p className="font-bold">Your studio has kept this experience intentionally minimal.</p>
          <p className="mt-2 text-sm leading-6" style={{ color: theme.muted }}>There are no additional pre-appointment steps to review.</p>
        </div>
      ) : (
        <dl className="mt-6 space-y-3">
          {record.modules.map((moduleId) => (
            <div key={moduleId} className="rounded-2xl border p-4" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
              <dt className="text-sm font-bold">{getExperienceOption(moduleId)?.name ?? moduleId}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-6" style={{ color: theme.muted }}>{valueForModule(record, moduleId)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
