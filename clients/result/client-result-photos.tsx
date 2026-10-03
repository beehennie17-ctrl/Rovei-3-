"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import type { PrototypePhotoRecord } from "@/types/client-experience";

export function ClientResultPhotos({
  title,
  kindLabel,
  photos,
  missingCount,
  skipped,
}: {
  title: string;
  kindLabel: "Inspiration" | "Current";
  photos: PrototypePhotoRecord[];
  missingCount: number;
  skipped: boolean;
}) {
  const [previewUrls, setPreviewUrls] = useState<Array<{ id: string; url: string }>>([]);

  useEffect(() => {
    if (skipped || photos.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const next = photos.map((photo) => ({ id: photo.id, url: URL.createObjectURL(photo.blob) }));
    setPreviewUrls(next);
    return () => {
      next.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [photos, skipped]);

  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">{title}</p>
      {skipped ? (
        <div className="mt-4 rounded-2xl bg-[var(--surface-muted)] p-4">
          <p className="text-sm font-semibold">No {kindLabel === "Inspiration" ? "inspiration" : "current photo"} added.</p>
        </div>
      ) : previewUrls.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previewUrls.map((preview, index) => (
            <div key={preview.id} className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)]">
              <Image
                src={preview.url}
                alt={`${kindLabel} photo ${index + 1}`}
                fill
                unoptimized
                sizes="(max-width: 640px) 45vw, 180px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[var(--surface-muted)] p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[var(--text-secondary)]">
            <ImageIcon size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Prototype photos unavailable in this browser.</p>
            <p className="caption mt-1">The structured response remains, but no matching local image Blob is available.</p>
          </div>
        </div>
      )}

      {missingCount > 0 && (
        <p className="mt-3 text-xs font-semibold leading-5 text-[var(--wine)]">
          {missingCount} prototype photo{missingCount === 1 ? " is" : "s are"} no longer available in this browser.
        </p>
      )}
    </Card>
  );
}
