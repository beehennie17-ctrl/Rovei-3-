import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import type { ClientStatus } from "@/types";
import type { ClientSubmissionResult } from "@/types/client-submission-result";

export function ClientResultHeader({ result, status = result.status }: { result: ClientSubmissionResult; status?: ClientStatus }) {
  return (
    <header className="space-y-6">
      <Link
        href="/app/clients/new/link"
        className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--wine)]"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to client link
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Client result</p>
          <h1 className="page-title">{result.clientName}</h1>
          <p className="body-text mt-3">{result.clientType} · {result.service}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <StatusBadge status={status} />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            {result.appointmentDateLabel} · {result.appointmentTimeLabel}
          </p>
        </div>
      </div>
    </header>
  );
}
