import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import type { ClientDirectoryRecord } from "@/types/clients";

function AppointmentValue({ client }: { client: ClientDirectoryRecord }) {
  if (!client.nextAppointment) return <span>—</span>;
  if (!client.nextAppointmentTime) return <span>{client.nextAppointment}</span>;
  return <span>{client.nextAppointment} · {client.nextAppointmentTime}</span>;
}

export function ClientDirectoryRow({ client }: { client: ClientDirectoryRecord }) {
  return (
    <Link
      href={`/app/clients/${client.id}`}
      aria-label={`Open ${client.name}, ${client.primaryService}, ${client.status}`}
      className="focus-ring motion-soft group block border-b border-[var(--border-soft)] bg-white p-4 last:border-b-0 hover:bg-[var(--surface-muted)] sm:p-5 lg:px-6"
    >
      <div className="lg:grid lg:grid-cols-[minmax(220px,1.45fr)_minmax(100px,.7fr)_minmax(120px,.75fr)_minmax(105px,.7fr)_minmax(155px,1fr)_24px] lg:items-center lg:gap-5">
        <div className="flex min-w-0 items-start gap-3.5">
          <Avatar initials={client.initials} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3 lg:block">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">{client.name}</p>
                <p className="caption mt-1 truncate">{client.clientType}</p>
              </div>
              <div className="shrink-0 lg:hidden"><StatusBadge status={client.status} /></div>
            </div>
          </div>
        </div>

        <div className="mt-4 lg:mt-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] lg:hidden">Service</p>
          <p className="mt-1 text-sm font-semibold lg:mt-0">{client.primaryService}</p>
        </div>

        <div className="hidden lg:block">
          <StatusBadge status={client.status} />
          <p className="mt-1.5 text-[11px] leading-4 text-[var(--text-secondary)]">{client.context}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:contents">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] lg:hidden">Last visit</p>
            <p className="mt-1 text-sm text-[var(--text-primary)] lg:mt-0">{client.lastVisit}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] lg:hidden">Next</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)] lg:mt-0"><AppointmentValue client={client} /></p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
          <p className="text-xs text-[var(--text-secondary)]">{client.context}</p>
          <ArrowRight size={16} aria-hidden className="shrink-0 text-[var(--mauve)] transition-transform group-hover:translate-x-0.5" />
        </div>

        <ArrowRight size={16} aria-hidden className="hidden text-[var(--mauve)] transition-transform group-hover:translate-x-0.5 lg:block" />
      </div>
    </Link>
  );
}
