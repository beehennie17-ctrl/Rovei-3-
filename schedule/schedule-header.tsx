import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/headers";

export function ScheduleHeader() {
  return (
    <PageHeader
      eyebrow="Schedule"
      title={<>Your <span className="editorial-accent text-[var(--wine)]">week.</span></>}
      description="See who's coming in and whether everything is ready before they arrive."
      action={
        <Link
          href="/app/clients/new"
          className="focus-ring motion-soft pressable inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--wine)] bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]"
        >
          <Plus size={16} aria-hidden />
          Add client
        </Link>
      }
    />
  );
}
