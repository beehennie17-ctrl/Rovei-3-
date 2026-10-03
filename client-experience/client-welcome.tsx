import type { CSSProperties } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { formatClientAppointmentDate, formatClientAppointmentTime } from "@/lib/client-creation";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientTheme } from "@/types";
import type { NewClientDraft } from "@/types/client-creation";

export function ClientWelcome({
  draft,
  studioName,
  theme,
  onStart,
}: {
  draft: NewClientDraft;
  studioName: string;
  theme: ClientTheme;
  onStart: () => void;
}) {
  const service = getServiceCategory(draft.service)?.name ?? "Appointment";
  return (
    <div className="page-enter">
      <div
        className="shimmer-micro relative overflow-hidden rounded-[1.7rem] px-6 py-8 sm:px-8 sm:py-10"
        style={{ backgroundColor: theme.primary, color: theme.onPrimary, "--client-shimmer": theme.shimmer } as CSSProperties}
      >
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] opacity-75">{studioName}</p>
        <h1 className="mt-7 font-serif text-4xl leading-[0.98] tracking-[-0.045em] sm:text-5xl">Hi {draft.firstName}.</h1>
        <p className="mt-4 max-w-lg text-base leading-7 opacity-85">Let&apos;s get you ready for your appointment.</p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm font-bold" style={{ color: theme.text }}>{service}</p>
          <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
            <CalendarDays size={15} aria-hidden="true" />
            {formatClientAppointmentDate(draft.appointmentDate)} · {formatClientAppointmentTime(draft.appointmentTime)}
          </p>
        </div>
        <p className="text-xs font-semibold" style={{ color: theme.muted }}>No account or download required.</p>
      </div>

      <p className="mt-7 text-[0.95rem] leading-7" style={{ color: theme.muted }}>
        A few details now means your appointment can start prepared.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="focus-ring motion-soft pressable mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold sm:w-auto"
        style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
      >
        Get started <ArrowRight size={17} aria-hidden="true" />
      </button>

      <p className="mt-8 border-t pt-5 text-xs leading-5" style={{ borderColor: theme.border, color: theme.muted }}>
        Need to reschedule or cancel? Contact {studioName === "Your Studio" ? "your professional" : studioName} directly.
      </p>
    </div>
  );
}
