import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ClientSubmissionResult } from "@/types/client-submission-result";

export function ClientResultWaiting({ result }: { result: ClientSubmissionResult }) {
  return (
    <div className="mx-auto max-w-4xl space-y-7 page-enter">
      <Link
        href="/app/clients/new/link"
        className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--wine)]"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to client link
      </Link>

      <div>
        <p className="eyebrow mb-3">Client result</p>
        <h1 className="page-title">{result.clientName}</h1>
        <p className="body-text mt-3">{result.clientType} · {result.service}</p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#FBF5EC] text-[var(--warning)]">
              <Clock3 size={18} aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="section-title">Client experience not complete yet.</h2>
                <StatusBadge status="waiting" />
              </div>
              <p className="body-text mt-3">
                Completed {result.completedModuleCount} of {result.totalModuleCount} step{result.totalModuleCount === 1 ? "" : "s"} in this browser prototype.
              </p>
              <p className="caption mt-2">Partial answers stay private until the experience is complete.</p>
            </div>
          </div>
          <p className="shrink-0 text-sm font-semibold text-[var(--text-secondary)]">
            {result.appointmentDateLabel} · {result.appointmentTimeLabel}
          </p>
        </div>
      </Card>

      <div className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
        <p className="text-sm font-semibold text-[var(--wine)]">Prototype result</p>
        <p className="caption mt-2">This is the current same-browser prototype state. There is no live remote tracking or cross-device synchronization yet.</p>
      </div>
    </div>
  );
}
