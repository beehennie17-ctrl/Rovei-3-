import type { ScheduleAppointmentView } from "@/types/schedule";
import { summarizeScheduleAppointments } from "@/lib/schedule";

function countLabel(value: number, singular: string) {
  return `${value} ${singular}${value === 1 ? "" : "s"}`;
}

export function ScheduleReadinessSummary({ appointments, week = false }: { appointments: ScheduleAppointmentView[]; week?: boolean }) {
  const summary = summarizeScheduleAppointments(appointments);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-secondary)]" aria-label="Schedule readiness summary">
      <span className="font-bold text-[var(--text-primary)]">{week ? `${summary.total} appointment${summary.total === 1 ? "" : "s"} this week` : countLabel(summary.total, "appointment")}</span>
      {!week && summary.ready > 0 && <><span aria-hidden>·</span><span>{summary.ready} ready</span></>}
      {!week && summary.waiting > 0 && <><span aria-hidden>·</span><span>{summary.waiting} waiting</span></>}
      {!week && summary.cancelled > 0 && <><span aria-hidden>·</span><span>{summary.cancelled} cancelled</span></>}
    </div>
  );
}
