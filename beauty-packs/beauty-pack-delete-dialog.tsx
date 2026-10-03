"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/feedback";

export function BeautyPackDeleteDialog({
  packName,
  open,
  onClose,
  onConfirm,
}: {
  packName: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const focusTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.getElementById("keep-beauty-pack")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => focusTarget?.focus());
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 grid place-items-center bg-[#24191D]/35 p-5" role="presentation">
      <ModalShell
        title={`Delete ${packName}?`}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button id="keep-beauty-pack" variant="secondary" onClick={onClose}>Keep Beauty Pack</Button>
            <Button onClick={onConfirm}>Delete</Button>
          </div>
        }
      >
        <p className="body-text">This removes this prototype Beauty Pack from this browser.</p>
      </ModalShell>
    </div>
  );
}
