"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/headers";
import { clientDirectoryDemoData } from "@/lib/client-directory-demo-data";
import { filterClientDirectory, formatClientResultCount } from "@/lib/client-directory";
import type { ClientStatusFilter } from "@/types/clients";
import { ClientsToolbar } from "./clients-toolbar";
import { ClientDirectoryRow } from "./client-directory-row";
import { ClientDirectoryEmptyState, ClientDirectoryNoResults } from "./client-directory-empty";

export function ClientsDirectory() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClientStatusFilter>("all");

  const clients = useMemo(
    () => filterClientDirectory(clientDirectoryDemoData, { search, status }),
    [search, status],
  );

  const resultLabel = formatClientResultCount(clients.length, search, status);

  return (
    <div className="space-y-8 lg:space-y-10">
      <PageHeader
        eyebrow="Client memory"
        title="Clients"
        description="Every consultation, preference and visit — remembered in one place."
        action={
          <Link
            href="/app/clients/new"
            className="focus-ring motion-soft pressable inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--wine)] bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]"
          >
            <Plus size={16} aria-hidden />
            Add client
          </Link>
        }
      />

      {clientDirectoryDemoData.length === 0 ? (
        <ClientDirectoryEmptyState />
      ) : (
        <>
          <ClientsToolbar
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
          />

          <section aria-labelledby="client-directory-heading" className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="client-directory-heading" className="section-title">Client directory</h2>
                <p className="caption mt-1.5">{resultLabel}</p>
              </div>
            </div>

            {clients.length === 0 ? (
              <ClientDirectoryNoResults
                search={search}
                status={status}
                onClearSearch={() => setSearch("")}
                onViewAll={() => { setSearch(""); setStatus("all"); }}
              />
            ) : (
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white shadow-[var(--shadow-card)]">
                <div
                  aria-hidden
                  className="hidden grid-cols-[minmax(220px,1.45fr)_minmax(100px,.7fr)_minmax(120px,.75fr)_minmax(105px,.7fr)_minmax(155px,1fr)_24px] gap-5 border-b border-[var(--border-soft)] bg-[var(--surface-muted)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] lg:grid"
                >
                  <span>Client</span>
                  <span>Service</span>
                  <span>Status</span>
                  <span>Last visit</span>
                  <span>Next appointment</span>
                  <span />
                </div>
                <div>
                  {clients.map((client) => <ClientDirectoryRow key={client.id} client={client} />)}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
