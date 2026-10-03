import { Check, Clock3 } from "lucide-react";
import { ClientCard, type ClientCardRow } from "@/components/clients/client-card";
import { ClientProfileHeader } from "@/components/clients/profile/client-profile-header";
import { ClientProfileTabs } from "@/components/clients/profile/client-profile-tabs";
import { Card } from "@/components/ui/card";
import { getClientProfileFooterLabel } from "@/lib/client-profile";
import type { ClientProfileViewModel } from "@/types/client-profile";

export function ClientProfile({ client }: { client: ClientProfileViewModel }) {
  const rows: ClientCardRow[] = [
    ...client.readinessItems.map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      icon: item.complete ? <Check key={`${item.id}-check`} size={15} /> : <Clock3 key={`${item.id}-clock`} size={15} />,
    })),
    { id: "client-notes", label: "Client notes", value: client.clientType === "New client" ? "Ready for your notes" : client.notes.length ? `${client.notes.length} saved ${client.notes.length === 1 ? "note" : "notes"}` : "Ready for your notes" },
  ];

  return <div className="space-y-8">
    <ClientProfileHeader client={client} />
    <section className="grid gap-7 xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] xl:items-start">
      <ClientCard theme="wine" clientName={client.name} clientType={client.clientType} service={client.primaryService} status={client.status} rows={rows} footerLabel={getClientProfileFooterLabel(client.status)} footerInteractive={false} />
      <Card className="p-5 sm:p-7">
        <p className="eyebrow">Client memory</p>
        <h2 className="section-title mt-3">Everything worth remembering, close by.</h2>
        <p className="body-text mt-3 max-w-2xl">Readiness, preferences, visits, photos, forms and studio notes stay together so you can walk into the appointment prepared.</p>
        <dl className="mt-6 grid gap-5 sm:grid-cols-3">
          <div><dt className="eyebrow">Last visit</dt><dd className="mt-2 text-sm font-bold">{client.lastVisit}</dd></div>
          <div><dt className="eyebrow">Readiness</dt><dd className="mt-2 text-sm font-bold capitalize">{client.status}</dd></div>
          <div><dt className="eyebrow">Service</dt><dd className="mt-2 text-sm font-bold">{client.primaryService}</dd></div>
        </dl>
      </Card>
    </section>
    <ClientProfileTabs client={client} />
  </div>;
}
