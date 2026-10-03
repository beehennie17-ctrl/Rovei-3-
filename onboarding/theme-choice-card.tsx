import { Check } from "lucide-react";
import type { ClientTheme, ThemeName } from "@/types";

export function ThemeChoiceCard({
  themeName,
  theme,
  description,
  selected,
  onSelect,
}: {
  themeName: ThemeName;
  theme: ClientTheme;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`focus-ring motion-soft group relative min-h-32 w-full overflow-hidden rounded-[var(--radius-md)] border bg-white p-3 text-left sm:min-h-36 sm:p-3.5 ${
        selected
          ? "border-[var(--wine)] shadow-[var(--shadow-card)]"
          : "border-[var(--mauve)] hover:-translate-y-0.5 hover:border-[var(--blush)] hover:shadow-[var(--shadow-card)]"
      }`}
    >
      <span
        className="relative block h-16 overflow-hidden rounded-[14px] border sm:h-[4.6rem]"
        style={{ backgroundColor: theme.primary, borderColor: theme.border, color: theme.onPrimary }}
        aria-hidden="true"
      >
        <span
          className="absolute inset-x-0 bottom-0 h-5"
          style={{ backgroundColor: theme.secondary, opacity: 0.82 }}
        />
        <span
          className="absolute left-3 top-3 size-3 rounded-full border"
          style={{ backgroundColor: theme.surface, borderColor: theme.onPrimary }}
        />
      </span>

      <span className="mt-3 flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-bold tracking-[-0.01em] text-[var(--text-primary)]">
            {theme.name}
          </span>
          <span className="mt-1 block text-[0.72rem] leading-[1.35] text-[var(--text-secondary)]">
            {description}
          </span>
        </span>
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-full border motion-soft ${
            selected
              ? "scale-100 border-[var(--wine)] bg-[var(--wine)] text-white opacity-100"
              : "scale-95 border-[var(--mauve)] bg-white text-transparent opacity-65"
          }`}
          aria-hidden="true"
        >
          <Check size={13} strokeWidth={2.6} />
        </span>
      </span>
      <span className="sr-only">{selected ? "Selected" : "Not selected"}: {theme.name}</span>
      {themeName === "custom" && <span className="sr-only">Custom signature colour option</span>}
    </button>
  );
}
