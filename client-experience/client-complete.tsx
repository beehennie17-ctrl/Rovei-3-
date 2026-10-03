import { Check } from "lucide-react";
import { formatClientAppointmentDate, formatClientAppointmentTime } from "@/lib/client-creation";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientTheme } from "@/types";
import type { NewClientDraft } from "@/types/client-creation";

export function ClientComplete({ draft, studioName, theme }: { draft: NewClientDraft; studioName: string; theme: ClientTheme }) {
  const service = getServiceCategory(draft.service)?.name ?? "Appointment";
  return (
    <div className="page-enter text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full" style={{ backgroundColor: theme.primary, color: theme.onPrimary }} aria-hidden="true">
        <Check size={22} />
      </div>
      <p className="mt-7 text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.muted }}>Complete</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">You&apos;re all set, {draft.firstName}.</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7" style={{ color: theme.muted }}>Your client experience is complete.</p>
      <div className="mx-auto mt-7 max-w-md rounded-2xl border p-5" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
        <p className="font-bold">{service}</p>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>{formatClientAppointmentDate(draft.appointmentDate)} · {formatClientAppointmentTime(draft.appointmentTime)}</p>
      </div>
      <p className="mt-7 text-sm" style={{ color: theme.muted }}>You can close this page now.</p>
      <p className="mt-8 border-t pt-5 text-xs leading-5" style={{ borderColor: theme.border, color: theme.muted }}>
        Need to reschedule or cancel? Contact {studioName === "Your Studio" ? "your professional" : studioName} directly.
      </p>
    </div>
  );
}
