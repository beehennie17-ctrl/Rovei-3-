import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { BeautyPackModuleCard } from "@/components/beauty-packs/beauty-pack-module-card";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { BEAUTY_PACK_NAME_MAX_LENGTH } from "@/lib/beauty-pack";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

export function BeautyPackForm({
  name,
  service,
  modules,
  recommendedModules,
  nameError,
  serviceError,
  modulesError,
  onNameChange,
  onNameBlur,
  onServiceChange,
  onServiceBlur,
  onToggleModule,
  onApplyRecommendations,
}: {
  name: string;
  service: ServiceCategoryId | "";
  modules: ExperienceModuleId[];
  recommendedModules: ExperienceModuleId[];
  nameError?: string;
  serviceError?: string;
  modulesError?: string;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onServiceChange: (value: ServiceCategoryId | "") => void;
  onServiceBlur: () => void;
  onToggleModule: (moduleId: ExperienceModuleId) => void;
  onApplyRecommendations: () => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <label htmlFor="beauty-pack-name" className="mb-2 block text-sm font-semibold">Beauty Pack name</label>
        <Input
          id="beauty-pack-name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onBlur={onNameBlur}
          placeholder="Lash Appointment"
          maxLength={BEAUTY_PACK_NAME_MAX_LENGTH}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "beauty-pack-name-error beauty-pack-name-hint" : "beauty-pack-name-hint"}
        />
        <p id="beauty-pack-name-hint" className="caption mt-2">Your client won&apos;t need to understand your internal setup — choose a name that makes sense to you.</p>
        {nameError && <p id="beauty-pack-name-error" className="mt-2 text-xs font-medium text-[var(--wine)]">{nameError}</p>}
      </div>

      <div>
        <label htmlFor="beauty-pack-service" className="mb-2 block text-sm font-semibold">Service</label>
        <Select
          id="beauty-pack-service"
          value={service}
          onChange={(event) => onServiceChange((event.target.value || "") as ServiceCategoryId | "")}
          onBlur={onServiceBlur}
          aria-invalid={serviceError ? true : undefined}
          aria-describedby={serviceError ? "beauty-pack-service-error" : undefined}
        >
          <option value="">Choose a service</option>
          {SERVICE_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Select>
        {serviceError && <p id="beauty-pack-service-error" className="mt-2 text-xs font-medium text-[var(--wine)]">{serviceError}</p>}
      </div>

      <fieldset aria-describedby={modulesError ? "beauty-pack-modules-error" : undefined}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <legend className="text-sm font-semibold">Client experience</legend>
            <p className="caption mt-1.5">Choose at least one Rovei module for this reusable template.</p>
          </div>
          {service && (
            <Button type="button" variant="secondary" size="sm" onClick={onApplyRecommendations} icon={<RotateCcw size={14} aria-hidden="true" />}>
              Apply recommendations
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <BeautyPackModuleCard
              key={option.id}
              option={option}
              selected={modules.includes(option.id)}
              recommended={recommendedModules.includes(option.id)}
              onToggle={() => onToggleModule(option.id)}
            />
          ))}
        </div>
        {modulesError && <p id="beauty-pack-modules-error" className="mt-3 text-xs font-medium text-[var(--wine)]">{modulesError}</p>}
      </fieldset>
    </div>
  );
}
