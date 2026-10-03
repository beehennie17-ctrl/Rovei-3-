import { CalendarDays, Check, Clock3, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getExperienceOption } from "@/lib/experience-options";
import { formatClientAppointmentDate, formatClientAppointmentTime } from "@/lib/client-creation";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientTheme } from "@/types";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

type NewClientExperienceSummaryProps = {
  firstName: string;
  lastName: string;
  service: ServiceCategoryId | "";
  appointmentDate: string;
  appointmentTime: string;
  experienceSelections: ExperienceModuleId[];
  theme: ClientTheme;
};

export function NewClientExperienceSummary({
  firstName,
  lastName,
  service,
  appointmentDate,
  appointmentTime,
  experienceSelections,
  theme,
}: NewClientExperienceSummaryProps) {
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const serviceMeta = service ? getServiceCategory(service) : undefined;
  const hasDetails = Boolean(fullName || service || appointmentDate || appointmentTime);

  if (!hasDetails) {
    return (
      <Card className="overflow-hidden p-7 sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--wine-soft)] text-[var(--wine)]">
          <Sparkles size={19} aria-hidden="true" />
        </div>
        <p className="eyebrow mt-8">Client experience</p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">Your client experience will take shape here.</h2>
        <p className="body-text mt-3 max-w-md">Add the client&apos;s details and Rovei. will prepare what you&apos;ll send before their appointment.</p>
      </Card>
    );
  }

  const visibleModules = experienceSelections
    .map((id) => getExperienceOption(id))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));

  return (
    <Card className="overflow-hidden">
      <div
        className="shimmer-micro texture-cosmetic relative px-6 py-7 sm:px-8"
        style={{
          background: theme.primary,
          color: theme.onPrimary,
          ["--client-shimmer" as string]: theme.shimmer,
        }}
      >
        <div className="relative z-[1]">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] opacity-75">Client experience</p>
          <h2 className="mt-3 font-serif text-[clamp(1.8rem,4vw,2.55rem)] leading-none tracking-[-0.035em]">{fullName || "Your client"}</h2>
          <p className="mt-3 text-sm font-semibold opacity-90">New client{serviceMeta ? ` · ${serviceMeta.name}` : ""}</p>
        </div>
      </div>

      <div className="space-y-7 bg-white p-6 sm:p-8">
        <div>
          <p className="eyebrow">Appointment</p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
              <CalendarDays size={16} className="text-[var(--wine)]" aria-hidden="true" />
              <span>{appointmentDate ? formatClientAppointmentDate(appointmentDate) : "Choose a date"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
              <Clock3 size={16} className="text-[var(--wine)]" aria-hidden="true" />
              <span>{appointmentTime ? formatClientAppointmentTime(appointmentTime) : "Choose a time"}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">They&apos;ll receive your studio experience before the appointment.</p>
          {visibleModules.length > 0 ? (
            <ul className="mt-4 grid gap-2.5" aria-label="Illustrative client experience steps">
              {visibleModules.slice(0, 6).map((module) => (
                <li key={module.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3.5 py-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]"><Check size={13} aria-hidden="true" /></span>
                  <span>{module.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="caption mt-3">A minimal pre-appointment experience is currently configured.</p>
          )}
        </div>

        <p className="caption">Preview only. No client link or permanent client record has been created.</p>
      </div>
    </Card>
  );
}
