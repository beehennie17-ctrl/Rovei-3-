import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import type { ClientSubmissionResult } from "@/types/client-submission-result";

export function ClientHistoryHeader({ result, complete }: { result: ClientSubmissionResult; complete: boolean }) {
  return (
    <header className="space-y-6">
      <Link href="/app/clients/new/result" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--wine)]">
        <ArrowLeft size={16} aria-hidden="true" /> Client result
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Client memory</p>
          <h1 className="page-title">{result.clientName}</h1>
          <p className="body-text mt-3">{result.clientType} · {result.service}</p>
        </div>
        {complete && <StatusBadge status="complete" />}
      </div>
    </header>
  );
}
