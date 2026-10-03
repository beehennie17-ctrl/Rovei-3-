"use client";

import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { useEffect, useState } from "react";
import { ClientVisitForm } from "@/components/clients/visit/client-visit-form";
import { VisitClientContext } from "@/components/clients/visit/visit-client-context";
import { ClientVisitUnavailable } from "@/components/clients/visit/client-visit-unavailable";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { readClientExperiencePrototype } from "@/lib/client-experience-prototype";
import { readClientLinkPrototype } from "@/lib/client-link-prototype";
import { buildClientSubmissionResult } from "@/lib/client-submission-result";
import { findVisitForCurrentAppointment, readClientVisitPrototype } from "@/lib/client-visit-prototype";
import { readNewClientDraft } from "@/lib/new-client-draft";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import type { NewClientDraft } from "@/types/client-creation";
import type { ClientSubmissionResult } from "@/types/client-submission-result";

type VisitPageState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "complete"; result: ClientSubmissionResult }
  | { status: "ready"; token: string; draft: NewClientDraft; result: ClientSubmissionResult };

export function ClientVisitPage() {
  const [state, setState] = useState<VisitPageState>({ status: "loading" });

  useEffect(() => {
    const draft = readNewClientDraft();
    const link = readClientLinkPrototype();
    if (!draft || !link) {
      setState({ status: "unavailable" });
      return;
    }

    const response = readClientExperiencePrototype(link.token);
    if (!response || response.token !== link.token || response.status !== "complete") {
      setState({ status: "unavailable" });
      return;
    }

    const result = buildClientSubmissionResult(draft, link, response, readOnboardingDraft());
    if (!result) {
      setState({ status: "unavailable" });
      return;
    }

    const existing = findVisitForCurrentAppointment(readClientVisitPrototype(link.token), draft);
    if (existing) {
      setState({ status: "complete", result });
      return;
    }

    setState({ status: "ready", token: link.token, draft, result });
  }, []);

  if (state.status === "loading") {
    return <div className="mx-auto max-w-6xl"><Card className="min-h-80 animate-pulse p-8" aria-hidden="true" /></div>;
  }
  if (state.status === "unavailable") return <ClientVisitUnavailable />;
  if (state.status === "complete") {
    return (
      <div className="mx-auto max-w-3xl page-enter">
        <Card className="p-8 sm:p-10">
          <p className="eyebrow">Visit</p>
          <h1 className="page-title mt-3">This visit is already complete.</h1>
          <p className="body-text mt-4">{state.result.clientName}&apos;s current appointment already has a completed prototype visit record.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/app/clients/new/history" className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]">
              View client history <History size={16} aria-hidden="true" />
            </Link>
            <Link href="/app/clients/new/result" className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-semibold text-[var(--wine)] hover:bg-[var(--wine-soft)]">
              Back to client result
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { token, draft, result } = state;
  return (
    <div className="mx-auto max-w-7xl space-y-7 page-enter">
      <header className="space-y-6">
        <Link href="/app/clients/new/result" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--wine)]">
          <ArrowLeft size={16} aria-hidden="true" /> Client result
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Visit</p>
            <h1 className="page-title">Record {draft.firstName}&apos;s visit.</h1>
            <p className="body-text mt-3">Capture what happened today so it&apos;s here the next time you see them.</p>
          </div>
          <StatusBadge status="ready" />
        </div>
      </header>

      <Card className="p-5 sm:p-6">
        <p className="text-lg font-bold">{result.clientName}</p>
        <p className="caption mt-1">{result.service} · {result.appointmentDateLabel} · {result.appointmentTimeLabel}</p>
      </Card>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] xl:items-start">
        <ClientVisitForm token={token} draft={draft} />
        <VisitClientContext result={result} />
      </div>
    </div>
  );
}
