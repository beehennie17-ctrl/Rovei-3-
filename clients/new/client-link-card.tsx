"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClientLinkCardProps = {
  url: string;
  shareTitle: string;
};

type CopyStatus = "idle" | "copied" | "failed";

export function ClientLinkCard({ url, shareTitle }: ClientLinkCardProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [canShare, setCanShare] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function scheduleReset() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyStatus("idle"), 2500);
  }

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    scheduleReset();
  }

  async function shareLink() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: shareTitle,
        text: "Your Rovei client experience is ready to preview.",
        url,
      });
    } catch {
      // Native share cancellation/failure needs no persistent error state.
    }
  }

  const statusMessage =
    copyStatus === "copied"
      ? "Link copied."
      : copyStatus === "failed"
        ? "Couldn't copy automatically. Select the link and copy it manually."
        : "";

  return (
    <section aria-labelledby="client-link-heading" className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Ready to copy</p>
          <h2 id="client-link-heading" className="section-title mt-2">Client link</h2>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden="true">
          <Copy size={17} />
        </div>
      </div>

      <label htmlFor="client-link-url" className="sr-only">Client link URL</label>
      <input
        id="client-link-url"
        type="text"
        readOnly
        value={url}
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.currentTarget.select()}
        className="focus-ring mt-5 h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text-primary)]"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={copyLink} icon={copyStatus === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} className="sm:min-w-36">
          {copyStatus === "copied" ? "Copied" : "Copy link"}
        </Button>
        {canShare && (
          <Button type="button" variant="secondary" onClick={shareLink} icon={<Share2 size={16} aria-hidden="true" />}>
            Share link
          </Button>
        )}
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-xs text-[var(--text-secondary)]">
        {statusMessage}
      </p>
    </section>
  );
}
