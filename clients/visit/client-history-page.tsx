"use client";

import Link from "next/link";
import { ArrowRight, Check, Images, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { ClientCard, type ClientCardRow } from "@/components/clients/client-card";
import { ClientHistoryHeader } from "@/components/clients/visit/client-history-header";
import { ClientMemorySummary } from "@/components/clients/visit/client-memory-summary";
import { ClientVisitUnavailable } from "@/components/clients/visit/client-visit-unavailable";
import { VisitHistoryList, type VisitHistoryEntry } from "@/components/clients/visit/visit-history-list";
import { Card } from "@/components/ui/card";
import { formatClientAppointmentDate } from "@/lib/client-creation";
import { readClientExperiencePrototype } from "@/lib/client-experience-prototype";
import { readPrototypePhotos } from "@/lib/client-experience-photo-store";
import { readClientLinkPrototype } from "@/lib/client-link-prototype";
import {
  buildClientSubmissionReadinessRows,
  buildClientSubmissionResult,
  reconcilePrototypePhotos,
} from "@/lib/client-submission-result";
import { readClientVisitPrototype } from "@/lib/client-visit-prototype";
import { readPrototypeVisitPhotos } from "@/lib/client-visit-photo-store";
import { reconcileVisitPhotos, sortVisitsNewestFirst } from "@/lib/client-visit";
import { readNewClientDraft } from "@/lib/new-client-draft";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import type { ClientSubmissionReadinessRow, ClientSubmissionResult } from "@/types/client-submission-result";

type HistoryPageState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "empty"; result: ClientSubmissionResult }
  | { status: "ready"; result: ClientSubmissionResult; entries: VisitHistoryEntry[]; cardRows: ClientCardRow[] };

function toClientCardRows(rows: ClientSubmissionReadinessRow[]): ClientCardRow[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
    icon: row.id === "client-notes" ? <MessageSquareText size={15} aria-hidden="true" /> : row.id.includes("photo") || row.id === "inspiration" ? <Images size={15} aria-hidden="true" /> : <Check size={15} aria-hidden="true" />,
  }));
}

export function ClientHistoryPage() {
  const [state, setState] = useState<HistoryPageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const draft = readNewClientDraft();
      const link = readClientLinkPrototype();
      if (!draft || !link) {
        if (!cancelled) setState({ status: "unavailable" });
        return;
      }
      const response = readClientExperiencePrototype(link.token);
      if (!response || response.token !== link.token || response.status !== "complete") {
        if (!cancelled) setState({ status: "unavailable" });
        return;
      }
      const result = buildClientSubmissionResult(draft, link, response, readOnboardingDraft());
      if (!result) {
        if (!cancelled) setState({ status: "unavailable" });
        return;
      }

      const history = readClientVisitPrototype(link.token);
      if (!history || history.visits.length === 0) {
        if (!cancelled) setState({ status: "empty", result });
        return;
      }

      const visits = sortVisitsNewestFirst(history.visits);
      let visitPhotos = [] as Awaited<ReturnType<typeof readPrototypeVisitPhotos>>;
      let clientPhotos = [] as Awaited<ReturnType<typeof readPrototypePhotos>>;
      try { visitPhotos = await readPrototypeVisitPhotos(link.token); } catch { visitPhotos = []; }
      try { clientPhotos = await readPrototypePhotos(link.token); } catch { clientPhotos = []; }

      const entries: VisitHistoryEntry[] = visits.map((visit) => ({
        visit,
        before: reconcileVisitPhotos(link.token, visit.id, "before", visit.beforePhotoIds, visitPhotos),
        after: reconcileVisitPhotos(link.token, visit.id, "after", visit.afterPhotoIds, visitPhotos),
      }));

      const inspiration = result.enabledModules.includes("inspiration") && result.inspiration
        ? reconcilePrototypePhotos(link.token, "inspiration", result.inspiration.photoIds, clientPhotos)
        : undefined;
      const current = result.enabledModules.includes("current-photos") && result.currentPhotos
        ? reconcilePrototypePhotos(link.token, "current", result.currentPhotos.photoIds, clientPhotos)
        : undefined;
      const cardRows = toClientCardRows(buildClientSubmissionReadinessRows(result, { inspiration, current }));

      if (!cancelled) setState({ status: "ready", result, entries, cardRows });
    }

    void hydrate();
    return () => { cancelled = true; };
  }, []);

  if (state.status === "loading") return <div className="mx-auto max-w-6xl"><Card className="min-h-80 animate-pulse p-8" aria-hidden="true" /></div>;
  if (state.status === "unavailable") return <ClientVisitUnavailable title="Client history isn't available." description="Complete the current client experience before opening this prototype history." />;

  if (state.status === "empty") {
    return (
      <div className="mx-auto max-w-5xl space-y-7 page-enter">
        <ClientHistoryHeader result={state.result} complete={false} />
        <Card className="p-8 sm:p-10">
          <p className="eyebrow">Visit history</p>
          <h2 className="page-title mt-3">No completed visits yet.</h2>
          <p className="body-text mt-4">Record the current appointment when it&apos;s finished and Rovei. will keep that memory here in this browser prototype.</p>
          <Link href="/app/clients/new/visit" className="focus-ring mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]">
            Record visit <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Card>
      </div>
    );
  }

  const { result, entries, cardRows } = state;
  const latest = entries[0].visit;
  return (
    <div className="mx-auto max-w-7xl space-y-8 page-enter">
      <ClientHistoryHeader result={result} complete />

      <div className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
        <p className="text-sm font-semibold text-[var(--wine)]">Prototype client history</p>
        <p className="caption mt-2">This visit memory exists only in this browser session until the Rovei. backend is connected.</p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.12fr)] lg:items-start">
        <ClientCard
          clientName={result.clientName}
          clientType={result.clientType}
          service={result.service}
          status="complete"
          themeOverride={result.theme}
          rows={cardRows}
          footerLabel="Visit complete"
          footerInteractive={false}
        />
        <ClientMemorySummary
          result={result}
          visitCount={entries.length}
          lastVisitLabel={formatClientAppointmentDate(latest.appointmentDate)}
        />
      </div>

      <VisitHistoryList entries={entries} />

      <div className="flex flex-wrap gap-3 border-t border-[var(--border-soft)] pt-6">
        <Link href="/app/clients/new/result" className="focus-ring inline-flex h-10 items-center rounded-full border border-[var(--border-soft)] bg-white px-4 text-sm font-semibold text-[var(--wine)] hover:bg-[var(--wine-soft)]">Client result</Link>
        <Link href="/app/clients" className="focus-ring inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]">Clients</Link>
      </div>
    </div>
  );
}
