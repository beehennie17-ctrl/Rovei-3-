"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { ClientLinkCard } from "@/components/clients/new/client-link-card";
import { ClientLinkCompletionStatus } from "@/components/clients/new/client-link-completion-status";
import { ClientLinkNextSteps } from "@/components/clients/new/client-link-next-steps";
import { Card } from "@/components/ui/card";
import { formatClientAppointmentDate, formatClientAppointmentTime } from "@/lib/client-creation";
import { readClientExperiencePrototype } from "@/lib/client-experience-prototype";
import { getOrCreateClientLinkPrototype } from "@/lib/client-link-prototype";
import { readNewClientDraft } from "@/lib/new-client-draft";
import { getServiceCategory } from "@/lib/service-categories";
import type { NewClientDraft } from "@/types/client-creation";
import type { ClientLinkPrototype } from "@/types/client-link";

type LinkPageState =
  | { status: "loading" }
  | { status: "missing-draft" }
  | { status: "ready"; draft: NewClientDraft; link: ClientLinkPrototype; absoluteUrl: string; completionStatus: "waiting" | "ready" }
  | { status: "unavailable"; draft: NewClientDraft };

export function ClientLinkPage() {
  const [state, setState] = useState<LinkPageState>({ status: "loading" });

  useEffect(() => {
    const draft = readNewClientDraft();
    if (!draft) {
      setState({ status: "missing-draft" });
      return;
    }

    const link = getOrCreateClientLinkPrototype();
    if (!link) {
      setState({ status: "unavailable", draft });
      return;
    }

    setState({
      status: "ready",
      draft,
      link,
      absoluteUrl: `${window.location.origin}/client/${link.token}`,
      completionStatus: readClientExperiencePrototype(link.token)?.status === "complete" ? "ready" : "waiting",
    });
  }, []);

  if (state.status === "loading") {
    return <div className="mx-auto max-w-5xl"><Card className="min-h-72 animate-pulse p-8" aria-hidden="true" /></div>;
  }

  if (state.status === "missing-draft") {
    return (
      <div className="mx-auto max-w-3xl page-enter">
        <Card className="p-8 sm:p-10">
          <p className="eyebrow">Client experience</p>
          <h1 className="page-title mt-3">No client draft found.</h1>
          <p className="body-text mt-4">Add a client first to prepare their experience.</p>
          <Link href="/app/clients/new" className="focus-ring mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]">
            Add client <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Card>
      </div>
    );
  }

  const draft = state.draft;
  const service = getServiceCategory(draft.service);
  const fullName = `${draft.firstName} ${draft.lastName}`;

  return (
    <div className="mx-auto max-w-6xl space-y-8 page-enter">
      <Link href="/app/clients/new" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-[var(--wine)] hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Edit client details</span>
      </Link>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] lg:items-start">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white shadow-[var(--shadow-card)]">
            <div className="bg-[var(--wine)] px-7 py-8 text-white sm:px-9">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10"><Link2 size={18} aria-hidden="true" /></div>
              <p className="mt-7 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--rose-milk)]">Client experience</p>
              <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">{draft.firstName}&apos;s client experience is ready.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Copy the link and send it wherever you normally speak to your client.</p>
            </div>

            <div className="grid gap-5 p-7 sm:grid-cols-3 sm:p-9">
              <div><p className="caption">Client</p><p className="mt-1 font-semibold">{fullName}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">New client</p></div>
              <div><p className="caption">Service</p><p className="mt-1 font-semibold">{service?.name ?? "Service"}</p></div>
              <div><p className="caption">Appointment</p><p className="mt-1 font-semibold">{formatClientAppointmentDate(draft.appointmentDate)}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{formatClientAppointmentTime(draft.appointmentTime)}</p></div>
            </div>
          </section>

          {state.status === "ready" ? (
            <>
              <ClientLinkCard url={state.absoluteUrl} shareTitle={`${draft.firstName}'s Rovei client experience`} />
              <ClientLinkCompletionStatus status={state.completionStatus} firstName={draft.firstName} />
            </>
          ) : (
            <Card className="p-6 sm:p-7">
              <p className="eyebrow">Prototype link</p>
              <h2 className="section-title mt-2">Link unavailable in this browser.</h2>
              <p className="body-text mt-3">This frontend prototype needs the browser Web Crypto and session storage APIs to create its temporary link.</p>
            </Card>
          )}

          <div className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
            <p className="text-sm font-semibold text-[var(--wine)]">No account or download required for your client.</p>
            <p className="caption mt-2"><strong className="text-[var(--text-primary)]">Prototype link:</strong> this currently works only as a frontend preview in this browser session. Don&apos;t send it to a real client yet.</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-7">
          <ClientLinkNextSteps />
        </div>
      </div>
    </div>
  );
}
