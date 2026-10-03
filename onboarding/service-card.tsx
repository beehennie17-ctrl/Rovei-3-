import {
  Check,
  Eye,
  Flower2,
  Hand,
  Palette,
  Sparkles,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import type { ServiceCategory, ServiceCategoryIcon } from "@/lib/service-categories";

const serviceIcons: Record<ServiceCategoryIcon, LucideIcon> = {
  lashes: Eye,
  brows: WandSparkles,
  nails: Hand,
  makeup: Palette,
  facials: Flower2,
  other: Sparkles,
};

export function ServiceCard({
  category,
  selected,
  onToggle,
}: {
  category: ServiceCategory;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = serviceIcons[category.icon];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`focus-ring motion-soft group relative min-h-36 w-full rounded-[var(--radius-md)] border p-5 text-left shadow-sm sm:min-h-40 sm:p-5 ${
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

      <span className="mt-5 block text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]">
        {category.name}
      </span>
      <span className="mt-1.5 block text-sm leading-5 text-[var(--text-secondary)]">
        {category.description}
      </span>
      <span className="sr-only">{selected ? "Selected" : "Not selected"}</span>
    </button>
  );
}
