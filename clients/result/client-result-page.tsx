"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Clock3, History, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { ClientCard, type ClientCardRow } from "@/components/clients/client-card";
import { ClientReadinessResult } from "@/components/clients/result/client-readiness-result";
import { ClientResultHeader } from "@/components/clients/result/client-result-header";
import { ClientResultPhotos } from "@/components/clients/result/client-result-photos";
import { ClientResultUnavailable } from "@/components/clients/result/client-result-unavailable";
import { ClientResultWaiting } from "@/components/clients/result/client-result-waiting";
import { ClientSubmissionDetails } from "@/components/clients/result/client-submission-details";
import { Card } from "@/components/ui/card";
import { readClientExperiencePrototype } from "@/lib/client-experience-prototype";
import { readPrototypePhotos } from "@/lib/client-experience-photo-store";
import { readClientLinkPrototype } from "@/lib/client-link-prototype";
import {
  buildClientSubmissionReadinessRows,
  buildClientSubmissionResult,
  formatPrototypeSubmissionTime,
  reconcilePrototypePhotos,
} from "@/lib/client-submission-result";
import { findVisitForCurrentAppointment, readClientVisitPrototype } from "@/lib/client-visit-prototype";
import { readNewClientDraft } from "@/lib/new-client-draft";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import type { PrototypePhotoRecord } from "@/types/client-experience";
import type {
  ClientSubmissionReadinessRow,
  ClientSubmissionResult,
  ReconciledPrototypePhotos,
} from "@/types/client-submission-result";

type ResultPageState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "waiting"; result: ClientSubmissionResult }
  | {
      status: "ready";
      result: ClientSubmissionResult;
      inspiration: ReconciledPrototypePhotos | undefined;
      current: ReconciledPrototypePhotos | undefined;
      visitComplete: boolean;
    };

function rowIcon(row: ClientSubmissionReadinessRow) {
  if (row.state === "complete") return <Check size={15} aria-hidden="true" />;
  if (row.state === "waiting") return <Clock3 size={15} aria-hidden="true" />;
  if (row.state === "unavailable") return <AlertTriangle size={15} aria-hidden="true" />;
  return <MessageSquareText size={15} aria-hidden="true" />;
}

function cardRows(rows: ClientSubmissionReadinessRow[]): ClientCardRow[] {
  return rows.map((row) => ({ id: row.id, label: row.label, value: row.value, icon: rowIcon(row) }));
}

export function ClientResultPage() {
  const [state, setState] = useState<ResultPageState>({ status: "loading" });

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
      if (!response || response.token !== link.token) {
        if (!cancelled) setState({ status: "unavailable" });
        return;
      }

      const result = buildClientSubmissionResult(draft, link, response, readOnboardingDraft());
      if (!result) {
        if (!cancelled) setState({ status: "unavailable" });
        return;
      }

      if (response.status !== "complete") {
        if (!cancelled) setState({ status: "waiting", result });
        return;
      }

      let storedPhotos: PrototypePhotoRecord[] = [];
      try {
        storedPhotos = await readPrototypePhotos(link.token);
      } catch {
        storedPhotos = [];
      }

      const inspiration = result.enabledModules.includes("inspiration") && result.inspiration
        ? reconcilePrototypePhotos(link.token, "inspiration", result.inspiration.photoIds, storedPhotos)
        : undefined;
      const current = result.enabledModules.includes("current-photos") && result.currentPhotos
        ? reconcilePrototypePhotos(link.token, "current", result.currentPhotos.photoIds, storedPhotos)
        : undefined;

      const visitComplete = Boolean(findVisitForCurrentAppointment(readClientVisitPrototype(link.token), draft));
      if (!cancelled) setState({ status: "ready", result, inspiration, current, visitComplete });
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return <div className="mx-auto max-w-6xl"><Card className="min-h-80 animate-pulse p-8" aria-hidden="true" /></div>;
  }
  if (state.status === "unavailable") return <ClientResultUnavailable />;
  if (state.status === "waiting") return <ClientResultWaiting result={state.result} />;

  const { result, inspiration, current, visitComplete } = state;
  const readinessRows = buildClientSubmissionReadinessRows(result, { inspiration, current });
  const submittedLabel = formatPrototypeSubmissionTime(result.submittedAt);

  return (
    <div className="mx-auto max-w-7xl space-y-8 page-enter">
      <ClientResultHeader result={result} status={visitComplete ? "complete" : "ready"} />

      <div className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
        <p className="text-sm font-semibold text-[var(--wine)]">Prototype result</p>
        <p className="caption mt-2">This submission is available only in this browser session until the Rovei. backend is connected.</p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.12fr)] lg:items-start">
        <div>
          <ClientCard
            clientName={result.clientName}
            clientType={result.clientType}
            service={result.service}
            status={visitComplete ? "complete" : "ready"}
            themeOverride={result.theme}
            rows={cardRows(readinessRows)}
            footerLabel={visitComplete ? "Visit complete" : "Ready for appointment"}
            footerInteractive={false}
          />
        </div>
        <div className="space-y-5">
          <ClientReadinessResult rows={readinessRows} />
          <Card className="p-5 sm:p-6">
            <p className="eyebrow">Appointment</p>
            <p className="mt-4 text-lg font-bold">{result.appointmentDateLabel} · {result.appointmentTimeLabel}</p>
            <p className="caption mt-1">{result.service} · {result.clientType}</p>
            {submittedLabel && <p className="caption mt-4">Completed {submittedLabel}</p>}
          </Card>
        </div>
      </div>


      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Appointment lifecycle</p>
            <h2 className="section-title mt-2">{visitComplete ? "Appointment complete" : "Ready for the appointment"}</h2>
            <p className="caption mt-2">
              {visitComplete
                ? "Visit recorded. The current prototype client memory now includes this appointment."
                : "After the appointment, add what you did and any before/after photos."}
            </p>
          </div>
          <Link
            href={visitComplete ? "/app/clients/new/history" : "/app/clients/new/visit"}
            className="focus-ring inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]"
          >
            {visitComplete ? <>View history <History size={16} aria-hidden="true" /></> : <>Record visit <ArrowRight size={16} aria-hidden="true" /></>}
          </Link>
        </div>
      </Card>

      <ClientSubmissionDetails result={result} />

      {(result.enabledModules.includes("inspiration") || result.enabledModules.includes("current-photos")) && (
        <section className="grid gap-5 xl:grid-cols-2" aria-label="Client photos">
          {result.enabledModules.includes("inspiration") && result.inspiration && (
            <ClientResultPhotos
              title="Inspiration"
              kindLabel="Inspiration"
              photos={inspiration?.photos ?? []}
              missingCount={inspiration?.missingCount ?? result.inspiration.photoIds.length}
              skipped={result.inspiration.skipped}
            />
          )}
          {result.enabledModules.includes("current-photos") && result.currentPhotos && (
            <ClientResultPhotos
              title="Current photos"
              kindLabel="Current"
              photos={current?.photos ?? []}
              missingCount={current?.missingCount ?? result.currentPhotos.photoIds.length}
              skipped={result.currentPhotos.skipped}
            />
          )}
        </section>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border-soft)] pt-6">
        <Link href="/app/clients/new/link" className="focus-ring inline-flex h-10 items-center rounded-full border border-[var(--border-soft)] bg-white px-4 text-sm font-semibold text-[var(--wine)] hover:bg-[var(--wine-soft)]">
          Back to client link
        </Link>
        <Link href="/app/clients" className="focus-ring inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]">
          Clients
        </Link>
        <Link href="/app/clients/new" className="focus-ring inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]">
          Add another client
        </Link>
      </div>
    </div>
  );
}
