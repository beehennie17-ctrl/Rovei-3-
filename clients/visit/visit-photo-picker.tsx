"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function VisitPhotoPicker({
  kind,
  title,
  description,
  files,
  onChange,
}: {
  kind: "before" | "after";
  title: string;
  description: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const inputId = `visit-photo-${kind}`;

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const remaining = Math.max(0, MAX_FILES - files.length);
  const summary = useMemo(() => `${files.length} of ${MAX_FILES} selected`, [files.length]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || remaining === 0) return;
    const requested = Array.from(fileList);
    const valid: File[] = [];
    const rejected: string[] = [];

    requested.forEach((file) => {
      if (!file.type.startsWith("image/")) rejected.push(`${file.name} is not an image.`);
      else if (file.size > MAX_FILE_SIZE) rejected.push(`${file.name} is larger than 10 MB.`);
      else if (valid.length < remaining) valid.push(file);
    });
    if (requested.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE).length > remaining) {
      rejected.push(`You can add up to ${MAX_FILES} ${kind} photos.`);
    }

    if (valid.length) onChange([...files, ...valid].slice(0, MAX_FILES));
    setFeedback(rejected[0] ?? "");
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="caption mt-1">{description}</p>
        </div>
        <span className="caption shrink-0">{summary}</span>
      </div>

      <label
        htmlFor={inputId}
        className="focus-within:ring-2 focus-within:ring-[var(--wine)] focus-within:ring-offset-2 mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)] px-5 py-5 text-center transition hover:border-[var(--blush)]"
      >
        <span className="grid size-10 place-items-center rounded-2xl bg-white text-[var(--wine)] shadow-sm" aria-hidden="true"><ImagePlus size={18} /></span>
        <span className="mt-3 text-sm font-bold">{remaining ? `Add ${kind} photos` : "Photo limit reached"}</span>
        <span className="caption mt-1">Optional · up to 3 images · 10 MB max each</span>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          disabled={remaining === 0}
          className="sr-only"
          aria-describedby={`${inputId}-feedback`}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={`${title} selected photos`}>
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}-${index}`} className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white">
              {previewUrls[index] && <img src={previewUrls[index]} alt={`${kind === "before" ? "Before" : "After"} photo ${index + 1}`} className="aspect-square w-full object-cover" />}
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="min-w-0 truncate text-xs text-[var(--text-secondary)]">{file.name}</span>
                <button
                  type="button"
                  className="focus-ring grid size-8 shrink-0 place-items-center rounded-full text-[var(--wine)] hover:bg-[var(--wine-soft)]"
                  aria-label={`Remove ${kind} photo ${index + 1}`}
                  onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p id={`${inputId}-feedback`} className="mt-3 text-xs font-semibold text-[var(--warning)]" hidden={!feedback}>{feedback}</p>
    </section>
  );
}
