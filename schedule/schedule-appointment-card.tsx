import Link from "next/link";
import type { MouseEvent } from "react";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ScheduleStatusBadge } from "./schedule-status-badge";
import type { ScheduleAppointmentView } from "@/types/schedule";

export function ScheduleAppointmentCard({
  appointment,
  compact = false,
  onRequestCancel,
  onRestore,
}: {
  appointment: ScheduleAppointmentView;
  compact?: boolean;
  onRequestCancel: (appointment: ScheduleAppointmentView, trigger: HTMLButtonElement) => void;
  onRestore: (appointment: ScheduleAppointmentView) => void;
}) {
  const canCancel = appointment.effectiveStatus === "ready" || appointment.effectiveStatus === "waiting" || appointment.effectiveStatus === "draft";
  const isCancelled = appointment.effectiveStatus === "cancelled";

  return (
    <article className={`rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white shadow-[var(--shadow-card)] ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className={`flex ${compact ? "items-start gap-2.5" : "items-start gap-3 sm:gap-4"}`}>
        <Avatar initials={appointment.initials} size={compact ? "sm" : undefined} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/app/clients/${appointment.clientId}`}
              className="focus-ring rounded-md text-sm font-bold text-[var(--text-primary)] hover:text-[var(--wine)]"
              aria-label={`Open ${appointment.name}'s client profile`}
            >
              {appointment.name}
            </Link>
            <ScheduleStatusBadge status={appointment.effectiveStatus} />
          </div>
          <p className="caption mt-1.5">{appointment.service}{appointment.clientType ? ` · ${appointment.clientType}` : ""}</p>
          {appointment.context && <p className={`mt-2 text-xs leading-5 ${isCancelled ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{appointment.context}</p>}
        </div>
      </div>

      <div className={`mt-4 flex ${compact ? "flex-col items-start gap-2" : "flex-wrap items-center justify-between gap-3"}`}>
        <Link
          href={`/app/clients/${appointment.clientId}`}
          className="focus-ring motion-soft inline-flex items-center gap-1.5 rounded-full text-xs font-bold text-[var(--wine)] hover:gap-2"
        >
          Open client <ArrowRight size={14} aria-hidden />
        </Link>
        {canCancel && (
          <button
            type="button"
            onClick={(event: MouseEvent<HTMLButtonElement>) => onRequestCancel(appointment, event.currentTarget)}
            className="focus-ring motion-soft inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"
          >
            <X size={13} aria-hidden /> Mark cancelled
          </button>
        )}
        {isCancelled && (
          <button
            type="button"
            onClick={() => onRestore(appointment)}
            className="focus-ring motion-soft inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-[var(--wine)] hover:bg-[var(--wine-soft)]"
          >
            <RotateCcw size={13} aria-hidden /> Restore appointment
          </button>
        )}
      </div>
    </article>
  );
}
