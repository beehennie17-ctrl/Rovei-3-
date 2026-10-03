import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import type { ClientProfileViewModel } from "@/types/client-profile";

export function ClientProfileHeader({ client }: { client: ClientProfileViewModel }) {
  const next = client.nextAppointment
    ? [client.nextAppointment, client.nextAppointmentTime].filter(Boolean).join(" · ")
    : null;

  return (
    <header className="space-y-6">
      <Link href="/app/clients" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--wine)]">
        <ArrowLeft size={16} aria-hidden /> Clients
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Client profile</p>
          <h1 className="page-title">{client.name}</h1>
          <p className="body-text mt-3">{client.clientType} · {client.primaryService}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <StatusBadge status={client.status} />
          {next && <p className="text-sm font-semibold text-[var(--text-secondary)]">{next}</p>}
        </div>
      </div>
    </header>
  );
}
