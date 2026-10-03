import { ScheduleAppointmentCard } from "./schedule-appointment-card";
import { ScheduleEmpty } from "./schedule-empty";
import type { ScheduleAppointmentView } from "@/types/schedule";

export function TodaySchedule({
  appointments,
  onRequestCancel,
  onRestore,
}: {
  appointments: ScheduleAppointmentView[];
  onRequestCancel: (appointment: ScheduleAppointmentView, trigger: HTMLButtonElement) => void;
  onRestore: (appointment: ScheduleAppointmentView) => void;
}) {
  if (appointments.length === 0) return <ScheduleEmpty />;

  return (
    <div className="relative space-y-4 before:absolute before:bottom-6 before:left-[52px] before:top-6 before:w-px before:bg-[var(--border-soft)] sm:before:left-[76px]">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="relative grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-4">
          <div className="pt-5 text-right text-xs font-bold text-[var(--text-primary)]">{appointment.time}</div>
          <span className="absolute left-[48px] top-7 size-2.5 rounded-full border-2 border-white bg-[var(--wine)] shadow-[0_0_0_1px_var(--blush)] sm:left-[72px]" aria-hidden />
          <ScheduleAppointmentCard appointment={appointment} onRequestCancel={onRequestCancel} onRestore={onRestore} />
        </div>
      ))}
    </div>
  );
}
