import { formatScheduleDay } from "@/lib/schedule";
import { ScheduleAppointmentCard } from "./schedule-appointment-card";
import type { ScheduleAppointmentView } from "@/types/schedule";

export function ScheduleDay({
  date,
  appointments,
  onRequestCancel,
  onRestore,
}: {
  date: string;
  appointments: ScheduleAppointmentView[];
  onRequestCancel: (appointment: ScheduleAppointmentView, trigger: HTMLButtonElement) => void;
  onRestore: (appointment: ScheduleAppointmentView) => void;
}) {
  const formatted = formatScheduleDay(date);
  return (
    <section className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3 sm:p-4 xl:border-0 xl:bg-transparent xl:p-0" aria-labelledby={`schedule-day-${date}`}>
      <div className="mb-3 border-b border-[var(--border-soft)] pb-3 xl:min-h-[66px]">
        <h3 id={`schedule-day-${date}`} className="text-xs font-black uppercase tracking-[0.1em] text-[var(--text-primary)]">{formatted.shortLabel}</h3>
        <p className="caption mt-1">{appointments.length === 0 ? "No appointments" : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"}`}</p>
      </div>
      {appointments.length === 0 ? (
        <p className="py-4 text-xs leading-5 text-[var(--text-secondary)] xl:py-2">No clients scheduled.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id}>
              <p className="mb-1.5 text-[11px] font-bold text-[var(--text-secondary)]">{appointment.time}</p>
              <ScheduleAppointmentCard appointment={appointment} compact onRequestCancel={onRequestCancel} onRestore={onRestore} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
