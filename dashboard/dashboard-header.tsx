import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/headers";

export function DashboardHeader() {
  return (
    <PageHeader
      eyebrow="Studio overview"
      title={
        <>
          Good morning, <span className="editorial-accent text-[var(--wine)]">Mia.</span>
        </>
      }
      description="Here’s what needs your attention before today’s appointments."
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
