import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ClientLinkCompletionStatusProps = {
  status: "waiting" | "ready";
  firstName: string;
};

export function ClientLinkCompletionStatus({ status, firstName }: ClientLinkCompletionStatusProps) {
  if (status === "ready") {
    return (
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--wine-soft)] text-[var(--wine)]">
              <Sparkles size={17} aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold">Client readiness</p>
                <StatusBadge status="ready" />
              </div>
              <p className="caption mt-2">{firstName}&apos;s client experience is complete.</p>
            </div>
          </div>
          <Link
            href="/app/clients/new/result"
            className="focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--wine)] px-4 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]"
          >
            Open Client Card <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#FBF5EC] text-[var(--warning)]">
          <Clock3 size={17} aria-hidden="true" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold">Client readiness</p>
            <StatusBadge status="waiting" />
          </div>
          <p className="caption mt-2">Waiting for the client experience to be completed in this prototype session.</p>
        </div>
      </div>
    </Card>
  );
}
