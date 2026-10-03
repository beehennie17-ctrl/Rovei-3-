import type { ReactNode } from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";

export function StudioMiniPreview({ studioName, delight = false }: { studioName: string; delight?: boolean }) {
  const displayName = studioName.length > 0 ? studioName : "Your Studio";

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <div className="mb-5 flex items-center justify-between gap-4 px-1">
        <p className="eyebrow">Client experience</p>
        <p className="caption">Powered by Rovei.</p>
      </div>

      <div
        className={`texture-cosmetic relative overflow-hidden rounded-[2rem] border border-[var(--mauve)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7 ${delight ? "onboarding-preview-delight" : ""}`}
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[var(--blush)] opacity-50" />

        <div className="rounded-[1.65rem] bg-[var(--wine)] px-5 py-8 text-white sm:px-7 sm:py-10">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--rose-milk)]">Welcome to</p>
          <h2 className="mt-3 break-words text-[clamp(2rem,7vw,3.45rem)] leading-[0.98] tracking-[-0.045em]" style={{ fontFamily: "var(--font-serif)" }}>
            {displayName}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--rose-milk)]">
            Everything you need before your appointment, in one place.
          </p>
        </div>

        <div className="space-y-3 px-1 pb-1 pt-5">
          <PreviewRow icon={<CheckCircle2 size={18} aria-hidden="true" />} label="Consultation" meta="Ready when you are" />
          <PreviewRow icon={<CalendarDays size={18} aria-hidden="true" />} label="Appointment details" meta="All in one calm place" />
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-[var(--text-secondary)]">
        A small glimpse of what your clients will experience.
      </p>
    </div>
  );
}

function PreviewRow({ icon, label, meta }: { icon: ReactNode; label: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[var(--text-primary)]">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--text-secondary)]">{meta}</span>
      </span>
    </div>
  );
}
