"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import {
  deletePrototypePhoto,
  readPrototypePhotos,
  savePrototypePhotos,
} from "@/lib/client-experience-photo-store";
import type { PrototypePhotoKind, PrototypePhotoRecord } from "@/types/client-experience";
import type { ClientTheme } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function PhotoStep({
  token,
  kind,
  title,
  description,
  maxFiles,
  skipLabel,
  photoIds,
  skipped,
  theme,
  showError,
  onChange,
}: {
  token: string;
  kind: PrototypePhotoKind;
  title: string;
  description: string;
  maxFiles: number;
  skipLabel: string;
  photoIds: string[];
  skipped: boolean;
  theme: ClientTheme;
  showError: boolean;
  onChange: (value: { skipped: boolean; photoIds: string[] }) => void;
}) {
  const [photos, setPhotos] = useState<PrototypePhotoRecord[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    readPrototypePhotos(token, kind)
      .then((records) => {
        if (!active) return;
        setPhotos(records);
        const actualIds = records.map((record) => record.id);
        if (actualIds.join("|") !== photoIds.join("|")) {
          onChange({ skipped: skipped && actualIds.length === 0, photoIds: actualIds });
        }
      })
      .catch(() => {
        if (active) setFeedback("Photo previews aren't available in this browser right now. You can skip this step instead.");
      });
    return () => { active = false; };
    // Hydrate once for this token/kind. Parent updates should not re-read IndexedDB.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, kind]);

  useEffect(() => {
    const next: Record<string, string> = {};
    photos.forEach((photo) => {
      next[photo.id] = URL.createObjectURL(photo.blob);
    });
    setPreviewUrls(next);
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  const invalid = showError && photos.length === 0 && !skipped;
  const remaining = Math.max(0, maxFiles - photos.length);
  const inputId = `photo-input-${kind}`;
  const skippedId = `photo-skip-${kind}`;
  const feedbackId = `photo-feedback-${kind}`;
  const errorId = `photo-error-${kind}`;
  const summary = useMemo(() => `${photos.length} of ${maxFiles} selected`, [photos.length, maxFiles]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || remaining === 0) return;
    setFeedback("");
    const requested = Array.from(files);
    const valid: File[] = [];
    const rejected: string[] = [];

    requested.forEach((file) => {
      if (!file.type.startsWith("image/")) rejected.push(`${file.name} is not an image.`);
      else if (file.size > MAX_FILE_SIZE) rejected.push(`${file.name} is larger than 10 MB.`);
      else if (valid.length < remaining) valid.push(file);
    });
    if (requested.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE).length > remaining) {
      rejected.push(`You can add up to ${maxFiles} photos here.`);
    }
    if (valid.length === 0) {
      setFeedback(rejected[0] ?? "Choose an image to continue.");
      return;
    }

    setBusy(true);
    try {
      const saved = await savePrototypePhotos(token, kind, valid);
      const next = [...photos, ...saved].slice(0, maxFiles);
      setPhotos(next);
      onChange({ skipped: false, photoIds: next.map((photo) => photo.id) });
      if (rejected.length > 0) setFeedback(rejected[0]);
    } catch {
      setFeedback("Couldn't add that photo in this browser. Try again or choose the no-photo option.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto(photo: PrototypePhotoRecord) {
    setFeedback("");
    try {
      const removed = await deletePrototypePhoto(photo.id, token);
      if (!removed) throw new Error("Photo could not be removed.");
      const next = photos.filter((item) => item.id !== photo.id);
      setPhotos(next);
      onChange({ skipped: false, photoIds: next.map((item) => item.id) });
    } catch {
      setFeedback("Couldn't remove that photo. Please try again.");
    }
  }

  async function handleSkip(checked: boolean) {
    setFeedback("");
    if (!checked) {
      onChange({ skipped: false, photoIds: photos.map((photo) => photo.id) });
      return;
    }
    setBusy(true);
    try {
      await Promise.all(photos.map((photo) => deletePrototypePhoto(photo.id, token)));
      setPhotos([]);
      onChange({ skipped: true, photoIds: [] });
    } catch {
      setFeedback("Couldn't update this choice. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-enter">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.muted }}>{kind === "inspiration" ? "Your inspiration" : "Your current look"}</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>{description}</p>
      <p className="mt-2 text-xs font-semibold" style={{ color: theme.muted }}>Up to {maxFiles} images · 10 MB max each</p>

      <div className="mt-7">
        <label
          htmlFor={inputId}
          className="focus-within:ring-2 focus-within:ring-[var(--wine)] focus-within:ring-offset-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-5 py-6 text-center transition"
          style={{ borderColor: theme.border, backgroundColor: theme.background }}
        >
          <span className="grid size-10 place-items-center rounded-2xl" style={{ backgroundColor: theme.secondary, color: theme.text }} aria-hidden="true">
            <ImagePlus size={18} />
          </span>
          <span className="mt-3 text-sm font-bold">{remaining > 0 ? "Choose photos" : "Photo limit reached"}</span>
          <span className="mt-1 text-xs" style={{ color: theme.muted }}>{summary}</span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            disabled={busy || remaining === 0 || skipped}
            className="sr-only"
            aria-invalid={invalid || undefined}
            aria-describedby={`${feedbackId} ${errorId}`}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              void handleFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {photos.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={`${title} selected photos`}>
          {photos.map((photo, index) => (
            <li key={photo.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
              {previewUrls[photo.id] && (
                <img src={previewUrls[photo.id]} alt={`${kind === "inspiration" ? "Inspiration" : "Current"} photo ${index + 1}`} className="aspect-square w-full object-cover" />
              )}
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="min-w-0 truncate text-xs" style={{ color: theme.muted }}>{photo.name}</span>
                <button type="button" onClick={() => void removePhoto(photo)} className="focus-ring grid size-8 shrink-0 place-items-center rounded-full" aria-label={`Remove ${kind === "inspiration" ? "inspiration" : "current"} photo ${index + 1}`} style={{ color: theme.text }}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6">
        <input id={skippedId} type="checkbox" checked={skipped} disabled={busy} aria-describedby={`${feedbackId} ${errorId}`} onChange={(event: ChangeEvent<HTMLInputElement>) => void handleSkip(event.target.checked)} className="mt-1 size-4 accent-[var(--wine)]" />
        <span>{skipLabel}</span>
      </label>

      {feedback && <p id={feedbackId} className="mt-4 text-xs font-semibold text-[var(--warning)]">{feedback}</p>}
      <p id={errorId} className="mt-2 text-xs font-semibold text-[var(--warning)]" hidden={!invalid}>Add at least one photo or choose the no-photo option before continuing.</p>
    </div>
  );
}
