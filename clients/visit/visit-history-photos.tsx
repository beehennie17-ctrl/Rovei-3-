"use client";

import { Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReconciledVisitPhotos } from "@/types/client-visit";

export function VisitHistoryPhotos({
  title,
  reconciled,
}: {
  title: "Before" | "After";
  reconciled: ReconciledVisitPhotos;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    reconciled.photos.forEach((photo) => { next[photo.id] = URL.createObjectURL(photo.blob); });
    setUrls(next);
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url));
  }, [reconciled.photos]);

  return (
    <div>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--text-secondary)]">{title}</p>
      {reconciled.photos.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={`${title} visit photos`}>
          {reconciled.photos.map((photo, index) => (
            <li key={photo.id} className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)]">
              {urls[photo.id] ? (
                <img src={urls[photo.id]} alt={`${title} photo ${index + 1}`} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center text-[var(--mauve)]" aria-hidden="true"><ImageIcon size={22} /></div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="caption mt-2">No {title.toLowerCase()} photos.</p>
      )}
      {reconciled.missingCount > 0 && (
        <p className="mt-3 text-xs font-semibold text-[var(--warning)]">
          {reconciled.missingCount} prototype visit photo{reconciled.missingCount === 1 ? " is" : "s are"} no longer available in this browser.
        </p>
      )}
    </div>
  );
}
