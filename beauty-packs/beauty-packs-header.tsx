import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/headers";

export function BeautyPacksHeader() {
  return (
    <PageHeader
      eyebrow="Client experiences"
      title="Beauty Packs"
      description="Build a client experience once, then reuse it for the appointments you offer most."
      action={
        <Link
          href="/app/beauty-packs/new"
          className="focus-ring motion-soft pressable inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--wine)] bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]"
        >
          <Plus size={16} aria-hidden="true" />
          Create Beauty Pack
        </Link>
      }
    />
  );
}
