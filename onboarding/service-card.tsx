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
import type {
  ServiceCategory,
  ServiceCategoryIcon,
} from "@/lib/service-categories";

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
      className={`rovei-choice rovei-service-choice ${
        selected ? "selected" : ""
      }`}
    >
      <span className="rovei-choice-check" aria-hidden="true">
        <Check size={13} strokeWidth={2.5} />
      </span>

      <span className="rovei-service-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <span className="rovei-choice-title">
        {category.name}
      </span>

      <span className="rovei-choice-copy">
        {category.description}
      </span>

      <span className="sr-only">
        {selected ? "Selected" : "Not selected"}
      </span>
    </button>
  );
}
