import {
  Camera,
  Check,
  ClipboardList,
  HeartHandshake,
  Images,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ExperienceOption, ExperienceOptionIcon } from "@/lib/experience-options";

const experienceIcons: Record<ExperienceOptionIcon, LucideIcon> = {
  consultation: ClipboardList,
  preferences: SlidersHorizontal,
  inspiration: Images,
  consent: HeartHandshake,
  prep: Sparkles,
  "current-photos": Camera,
};

export function ExperienceOptionCard({
  option,
  selected,
  recommended,
  onToggle,
}: {
  option: ExperienceOption;
  selected: boolean;
  recommended: boolean;
  onToggle: () => void;
}) {
  const Icon = experienceIcons[option.icon];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`focus-ring motion-soft group relative min-h-40 w-full rounded-[var(--radius-md)] border p-5 text-left shadow-sm ${
        selected
          ? "border-[var(--wine)] bg-[var(--wine-soft)] shadow-[var(--shadow-card)]"
          : "border-[var(--mauve)] bg-white hover:-translate-y-0.5 hover:border-[var(--blush)] hover:shadow-[var(--shadow-card)]"
      }`}
    >
      <span className="flex items-start justify-between gap-4">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-full border motion-soft ${
            selected
              ? "border-[var(--blush)] bg-[var(--rose-milk)] text-[var(--wine)]"
              : "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--wine)]"
          }`}
          aria-hidden="true"
        >
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full border motion-soft ${
            selected
              ? "scale-100 border-[var(--wine)] bg-[var(--wine)] text-white opacity-100"
              : "scale-95 border-[var(--mauve)] bg-white text-transparent opacity-70"
          }`}
          aria-hidden="true"
        >
          <Check size={15} strokeWidth={2.5} />
        </span>
      </span>

      <span className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]">
          {option.name}
        </span>
        {recommended && (
          <span className="rounded-full border border-[var(--blush)] bg-white px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--wine)]">
            Recommended
          </span>
        )}
      </span>
      <span className="mt-1.5 block text-sm leading-5 text-[var(--text-secondary)]">
        {option.shortDescription}
      </span>
      <span className="sr-only">{selected ? "Selected" : "Not selected"}</span>
    </button>
  );
}
