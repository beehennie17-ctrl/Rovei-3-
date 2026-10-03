import { useRef, type KeyboardEvent } from "react";

export type PreviewView = "client" | "professional";

const previewViews: PreviewView[] = ["client", "professional"];

export function PreviewViewToggle({
  value,
  onChange,
}: {
  value: PreviewView;
  onChange: (value: PreviewView) => void;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectFromKeyboard(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % previewViews.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + previewViews.length) % previewViews.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = previewViews.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextView = previewViews[nextIndex];
    onChange(nextView);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      className="inline-grid w-full max-w-[430px] grid-cols-2 rounded-full border border-[var(--border-soft)] bg-white p-1.5 shadow-[0_10px_28px_rgba(86,15,31,0.06)]"
      role="tablist"
      aria-label="Studio preview perspective"
    >
      {previewViews.map((view, index) => {
        const selected = value === view;
        const isClient = view === "client";
        return (
          <button
            key={view}
            ref={(element: HTMLButtonElement | null) => { tabRefs.current[index] = element; }}
            type="button"
            role="tab"
            id={`preview-tab-${view}`}
            aria-selected={selected}
            aria-controls={`preview-panel-${view}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(view)}
            onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => selectFromKeyboard(event, index)}
            className={`focus-ring motion-soft rounded-full px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] ${selected ? "bg-[var(--wine)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"}`}
          >
            {isClient ? "Client view" : "Your view"}
          </button>
        );
      })}
    </div>
  );
}
