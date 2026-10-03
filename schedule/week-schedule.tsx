import { getScheduleWeekDates } from "@/lib/schedule";
import { ScheduleDay } from "./schedule-day";
import type { ScheduleAppointmentView } from "@/types/schedule";

export function WeekSchedule({
  referenceDate,
  appointments,
  onRequestCancel,
  onRestore,
}: {
  referenceDate: string;
  appointments: ScheduleAppointmentView[];
  onRequestCancel: (appointment: ScheduleAppointmentView, trigger: HTMLButtonElement) => void;
  onRestore: (appointment: ScheduleAppointmentView) => void;
}) {
  const dates = getScheduleWeekDates(referenceDate);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7 xl:gap-3">
      {dates.map((date) => (
        <ScheduleDay
          key={date}
          date={date}
          appointments={appointments.filter((appointment) => appointment.date === date)}
          onRequestCancel={onRequestCancel}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}
