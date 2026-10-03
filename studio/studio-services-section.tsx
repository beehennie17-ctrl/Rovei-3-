import { ServiceCard } from "@/components/onboarding/service-card";
import { Card } from "@/components/ui/card";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import type { ServiceCategoryId } from "@/types/onboarding";

export function StudioServicesSection({
  services,
  error,
  onToggle,
}: {
  services: ServiceCategoryId[];
  error?: string;
  onToggle: (id: ServiceCategoryId) => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">02 · Services</p>
      <h2 className="section-title mt-3">What your studio offers.</h2>
      <p className="caption mt-2">Changing Studio services does not delete or rewrite your Beauty Packs.</p>
      <fieldset className="mt-5">
        <legend className="sr-only">Studio service categories</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {SERVICE_CATEGORIES.map((category) => (
            <ServiceCard
              key={category.id}
              category={category}
              selected={services.includes(category.id)}
              onToggle={() => onToggle(category.id)}
            />
          ))}
        </div>
      </fieldset>
      {error && <p className="mt-3 text-xs font-semibold text-[var(--wine)]" role="status">{error}</p>}
    </Card>
  );
}
