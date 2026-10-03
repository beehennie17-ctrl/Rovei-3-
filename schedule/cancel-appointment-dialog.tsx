"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/feedback";
import type { ScheduleAppointmentView } from "@/types/schedule";

export function CancelAppointmentDialog({
  appointment,
  returnFocusTo,
  onClose,
  onConfirm,
}: {
  appointment: ScheduleAppointmentView | null;
  returnFocusTo: HTMLButtonElement | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appointment) return;
    const focusTarget = returnFocusTo;
    document.getElementById("keep-schedule-appointment")?.focus();

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
  }, [appointment, onClose, returnFocusTo]);

  if (!appointment) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 grid place-items-center bg-[#24191D]/35 p-5" role="presentation">
      <ModalShell
        title={`Mark ${appointment.name}'s appointment as cancelled?`}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button id="keep-schedule-appointment" variant="secondary" onClick={onClose}>Keep appointment</Button>
            <Button onClick={onConfirm}>Mark cancelled</Button>
          </div>
        }
      >
        <p className="body-text">This only changes the Schedule prototype in this browser session.</p>
      </ModalShell>
    </div>
  );
}
