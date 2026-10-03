import { ExperienceOptionCard } from "@/components/onboarding/experience-option-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import type { ExperienceModuleId } from "@/types/onboarding";

export function StudioExperienceSection({
  selections,
  recommendations,
  error,
  onToggle,
  onApplyRecommendations,
}: {
  selections: ExperienceModuleId[];
  recommendations: ExperienceModuleId[];
  error?: string;
  onToggle: (id: ExperienceModuleId) => void;
  onApplyRecommendations: () => void;
}) {
  const recommended = new Set(recommendations);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">04 · Client experience</p>
          <h2 className="section-title mt-3">What clients complete before they arrive.</h2>
          <p className="caption mt-2 max-w-2xl">Recommendations follow your currently selected services, but your saved choices remain yours.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onApplyRecommendations}>Apply recommendations</Button>
      </div>
      <fieldset className="mt-5">
        <legend className="sr-only">Default client-experience modules</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <ExperienceOptionCard
              key={option.id}
              option={option}
              selected={selections.includes(option.id)}
              recommended={recommended.has(option.id)}
              onToggle={() => onToggle(option.id)}
            />
          ))}
        </div>
      </fieldset>
      {error && <p className="mt-3 text-xs font-semibold text-[var(--wine)]" role="status">{error}</p>}
    </Card>
  );
}
