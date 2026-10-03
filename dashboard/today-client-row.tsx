import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import type { DashboardAppointment } from "@/types/dashboard";

export function TodayClientRow({ appointment }: { appointment: DashboardAppointment }) {
  const context = appointment.context ?? (appointment.status === "ready" ? "Ready for appointment" : "Client experience incomplete");

  return (
    <Link
      href={`/app/clients/${appointment.clientId}`}
      aria-label={`${appointment.name}, ${appointment.time}, ${appointment.service}, ${appointment.status}`}
      className="focus-ring motion-soft group flex items-center gap-3 p-4 hover:bg-[var(--surface-muted)] sm:gap-4 sm:p-5"
    >
      <Avatar initials={appointment.initials} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-bold">{appointment.name}</p>
          <span className="hidden text-[var(--mauve)] sm:inline" aria-hidden>·</span>
          <p className="caption hidden truncate sm:block">{appointment.service}</p>
        </div>
        <p className="caption mt-1 truncate sm:hidden">{appointment.service} · {context}</p>
        <p className="caption mt-1 hidden truncate sm:block">{context}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm font-bold">{appointment.time}</p>
        <StatusBadge status={appointment.status} />
      </div>
      <ArrowRight size={16} className="hidden shrink-0 text-[var(--mauve)] transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
    </Link>
  );
}
