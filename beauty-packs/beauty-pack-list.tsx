import { BeautyPackCard } from "@/components/beauty-packs/beauty-pack-card";
import type { BeautyPack } from "@/types/beauty-pack";

export function BeautyPackList({ packs }: { packs: BeautyPack[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {packs.map((pack) => <BeautyPackCard key={pack.id} pack={pack} />)}
    </div>
  );
}
