"use client";

import { useEffect, useState } from "react";
import { BeautyPacksHeader } from "@/components/beauty-packs/beauty-packs-header";
import { BeautyPackEmpty } from "@/components/beauty-packs/beauty-pack-empty";
import { BeautyPackList } from "@/components/beauty-packs/beauty-pack-list";
import { formatBeautyPackCount, sortBeautyPacksByUpdatedAt } from "@/lib/beauty-pack";
import { readBeautyPackStore } from "@/lib/beauty-pack-prototype";
import type { BeautyPack } from "@/types/beauty-pack";

export function BeautyPacksPage() {
  const [packs, setPacks] = useState<BeautyPack[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPacks(sortBeautyPacksByUpdatedAt(readBeautyPackStore().packs));
    setHydrated(true);
  }, []);

  return (
    <div className="space-y-8 lg:space-y-10 page-enter">
      <BeautyPacksHeader />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
        <p className="caption">{hydrated ? formatBeautyPackCount(packs.length) : "Loading Beauty Packs…"}</p>
        <p className="caption"><span className="font-semibold text-[var(--wine)]">Prototype setup</span> · Saved in this browser until Rovei&apos;s backend is connected.</p>
      </div>

      {hydrated && (packs.length === 0 ? <BeautyPackEmpty /> : <BeautyPackList packs={packs} />)}
    </div>
  );
}
