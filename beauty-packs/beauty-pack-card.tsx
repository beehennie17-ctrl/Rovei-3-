import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import { formatBeautyPackUpdatedAt } from "@/lib/beauty-pack";
import { getServiceCategory } from "@/lib/service-categories";
import type { BeautyPack } from "@/types/beauty-pack";

export function BeautyPackCard({ pack }: { pack: BeautyPack }) {
  const service = getServiceCategory(pack.service);
  const moduleNames = pack.modules
    .map((id) => EXPERIENCE_OPTIONS.find((option) => option.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const preview = moduleNames.slice(0, 3);
  const moreCount = Math.max(0, moduleNames.length - preview.length);

  return (
    <Card className="card-lift motion-soft overflow-hidden p-0">
      <Link href={`/app/beauty-packs/${pack.id}`} className="focus-ring block rounded-[var(--radius-lg)] p-6 sm:p-7" aria-label={`Edit ${pack.name} Beauty Pack`}>
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden="true">
                <Layers3 size={18} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-[-0.025em]">{pack.name}</h2>
                <p className="caption mt-1">{service?.name ?? "Service"}</p>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--blush)] bg-[var(--wine-soft)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--wine)]">
            {pack.modules.length} client step{pack.modules.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-6 border-t border-[var(--border-soft)] pt-5">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {preview.join(" · ")}{moreCount > 0 ? ` · +${moreCount} more` : ""}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="caption">{formatBeautyPackUpdatedAt(pack.updatedAt)}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--wine)]">
              Edit
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
