import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ClientVisitUnavailable({
  title = "Visit isn't available yet.",
  description = "Complete the client experience first, then return here to record the appointment.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl page-enter">
      <Card className="p-8 sm:p-10">
        <p className="eyebrow">Visit</p>
        <h1 className="page-title mt-3">{title}</h1>
        <p className="body-text mt-4">{description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/app/clients/new/result" className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-semibold text-[var(--wine)] hover:bg-[var(--wine-soft)]">
            <ArrowLeft size={16} aria-hidden="true" /> Client result
          </Link>
          <Link href="/app/clients/new" className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]">
            Add client <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
