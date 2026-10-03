import { useRef, type KeyboardEvent } from "react";

export type ScheduleView = "today" | "week";

const scheduleViews: ScheduleView[] = ["today", "week"];

export function ScheduleViewToggle({ view, onChange }: { view: ScheduleView; onChange: (view: ScheduleView) => void }) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectFromKeyboard(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % scheduleViews.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + scheduleViews.length) % scheduleViews.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = scheduleViews.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextView = scheduleViews[nextIndex];
    onChange(nextView);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div role="tablist" aria-label="Schedule view" className="inline-flex rounded-full border border-[var(--border-soft)] bg-white p-1 shadow-[var(--shadow-card)]">
      {scheduleViews.map((option, index) => {
        const selected = view === option;
        return (
          <button
            key={option}
            ref={(element: HTMLButtonElement | null) => { tabRefs.current[index] = element; }}
            id={`schedule-${option}-tab`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`schedule-${option}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => selectFromKeyboard(event, index)}
            className={`focus-ring motion-soft rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] ${
              selected ? "bg-[var(--wine)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
