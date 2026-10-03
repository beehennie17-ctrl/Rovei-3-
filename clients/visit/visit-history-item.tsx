import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatClientAppointmentDate, formatClientAppointmentTime } from "@/lib/client-creation";
import { formatVisitCompletedAt } from "@/lib/client-visit";
import { getServiceCategory } from "@/lib/service-categories";
import type { PrototypeVisitRecord, ReconciledVisitPhotos } from "@/types/client-visit";
import { VisitHistoryPhotos } from "@/components/clients/visit/visit-history-photos";

export function VisitHistoryItem({
  visit,
  before,
  after,
}: {
  visit: PrototypeVisitRecord;
  before: ReconciledVisitPhotos;
  after: ReconciledVisitPhotos;
}) {
  const service = getServiceCategory(visit.service)?.name ?? "Appointment";
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{formatClientAppointmentDate(visit.appointmentDate)}</p>
          <h3 className="mt-2 text-lg font-bold">{service}</h3>
          <p className="caption mt-1">{formatClientAppointmentTime(visit.appointmentTime)}</p>
        </div>
        <StatusBadge status="complete" />
      </div>
      <p className="mt-5 whitespace-pre-wrap text-sm font-semibold leading-6">{visit.summary}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <VisitHistoryPhotos title="Before" reconciled={before} />
        <VisitHistoryPhotos title="After" reconciled={after} />
      </div>
      <p className="caption mt-6">Completed {formatVisitCompletedAt(visit.completedAt)}</p>
    </Card>
  );
}
