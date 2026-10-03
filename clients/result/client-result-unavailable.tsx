import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ClientResultUnavailable() {
  return (
    <div className="mx-auto max-w-3xl page-enter">
      <Card className="p-8 sm:p-10">
        <p className="eyebrow">Client result</p>
        <h1 className="page-title mt-3">No client result available.</h1>
        <p className="body-text mt-4">Complete a client experience first to preview the professional result.</p>
        <Link
          href="/app/clients/new"
          className="focus-ring mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]"
        >
          Add client <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </Card>
    </div>
  );
}
