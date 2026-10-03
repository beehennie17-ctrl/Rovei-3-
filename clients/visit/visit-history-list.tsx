import { VisitHistoryItem } from "@/components/clients/visit/visit-history-item";
import type { PrototypeVisitRecord, ReconciledVisitPhotos } from "@/types/client-visit";

export type VisitHistoryEntry = {
  visit: PrototypeVisitRecord;
  before: ReconciledVisitPhotos;
  after: ReconciledVisitPhotos;
};

export function VisitHistoryList({ entries }: { entries: VisitHistoryEntry[] }) {
  return (
    <section>
      <h2 className="section-title">Visit history</h2>
      <p className="caption mt-1.5">Professional memory from completed prototype appointments.</p>
      <div className="mt-5 space-y-5">
        {entries.map((entry) => <VisitHistoryItem key={entry.visit.id} {...entry} />)}
      </div>
    </section>
  );
}
