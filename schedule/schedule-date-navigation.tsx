import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScheduleView } from "./schedule-view-toggle";

export function ScheduleDateNavigation({
  view,
  periodLabel,
  isDemoPeriod,
  onPrevious,
  onNext,
  onToday,
}: {
  view: ScheduleView;
  periodLabel: string;
  isDemoPeriod: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const periodName = view === "today" ? "day" : "week";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          aria-label={`Previous ${periodName}`}
          className="focus-ring motion-soft grid size-10 place-items-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--text-secondary)] hover:border-[var(--blush)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"
        >
          <ChevronLeft size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label={`Next ${periodName}`}
          className="focus-ring motion-soft grid size-10 place-items-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--text-secondary)] hover:border-[var(--blush)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"
        >
          <ChevronRight size={17} aria-hidden />
        </button>
        {!isDemoPeriod && (
          <button
            type="button"
            onClick={onToday}
            className="focus-ring motion-soft rounded-full px-3 py-2 text-xs font-bold text-[var(--wine)] hover:bg-[var(--wine-soft)]"
          >
            Today
          </button>
        )}
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]" aria-live="polite">{periodLabel}</p>
    </div>
  );
}
