import { Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClientProfileViewModel } from "@/types/client-profile";

export function ClientPhotos({ client }: { client: ClientProfileViewModel }) {
  if (client.photos.length === 0) {
    return (
      <Card className="p-7 sm:p-9">
        <span className="grid size-10 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]"><ImageIcon size={18} aria-hidden /></span>
        <h3 className="section-title mt-5">No photos yet.</h3>
        <p className="body-text mt-2">Client and visit photos will stay together here.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {client.photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <div className="grid aspect-[4/3] place-items-center bg-[linear-gradient(145deg,var(--surface-muted),#FFFFFF)]">
            <span className="grid size-12 place-items-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--wine)] shadow-sm"><ImageIcon size={20} aria-hidden /></span>
          </div>
          <div className="p-4">
            <p className="text-sm font-bold">{photo.type}</p>
            <p className="caption mt-1">{photo.context}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
