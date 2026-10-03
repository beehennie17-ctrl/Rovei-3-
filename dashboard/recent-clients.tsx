import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/headers";
import type { RecentClientMemory } from "@/types/dashboard";

export function RecentClients({ clients }: { clients: RecentClientMemory[] }) {
  return (
    <section className="space-y-4" aria-labelledby="recent-clients-heading">
      <SectionHeader
        title={<span id="recent-clients-heading">Recent client memory</span>}
        description="People you’ve seen recently, kept close."
        action={
          <Link href="/app/clients" className="focus-ring motion-soft inline-flex items-center gap-1.5 text-xs font-bold text-[var(--wine)] hover:gap-2">
            View all clients <ArrowRight size={14} aria-hidden />
          </Link>
        }
      />
      <Card className="divide-y divide-[var(--border-soft)] overflow-hidden">
        {clients.map((client) => (
          <Link
            href={`/app/clients/${client.clientId}`}
            key={client.id}
            aria-label={`Open ${client.name}, last visit ${client.lastVisit}`}
            className="focus-ring motion-soft group flex items-center gap-4 p-4 hover:bg-[var(--surface-muted)] sm:p-5"
          >
            <Avatar initials={client.initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{client.name}</p>
              <p className="caption mt-1 truncate">{client.service}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="caption">Last visit</p>
              <p className="mt-0.5 text-xs font-bold text-[var(--text-primary)]">{client.lastVisit}</p>
            </div>
            <ArrowRight size={16} className="hidden shrink-0 text-[var(--mauve)] transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
          </Link>
        ))}
      </Card>
    </section>
  );
}
