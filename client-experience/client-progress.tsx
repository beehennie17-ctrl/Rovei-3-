import type { ClientTheme } from "@/types";

export function ClientProgress({ current, total, theme }: { current: number; total: number; theme: ClientTheme }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 100;
  return (
    <div className="mb-7" aria-label={`Step ${current} of ${total}`}>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold" style={{ color: theme.muted }}>
        <span>{current} of {total}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: theme.secondary }}>
        <div className="motion-soft h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: theme.primary }} />
      </div>
    </div>
  );
}
