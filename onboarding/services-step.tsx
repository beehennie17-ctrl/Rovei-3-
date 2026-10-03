"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ServiceCard } from "@/components/onboarding/service-card";
import { ServicesMiniPreview } from "@/components/onboarding/services-mini-preview";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { readOnboardingDraft, updateOnboardingDraft } from "@/lib/onboarding-storage";
import type { ServiceCategoryId } from "@/types/onboarding";

export function ServicesStep() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [services, setServices] = useState<ServiceCategoryId[]>([]);

  useEffect(() => {
    const draft = readOnboardingDraft();
    setStudioName(draft.studioName ?? "");
    setServices(draft.services ?? []);
  }, []);

  function toggleService(id: ServiceCategoryId) {
    setServices((current) => {
      const next = current.includes(id)
        ? current.filter((serviceId) => serviceId !== id)
        : [...current, id];

      updateOnboardingDraft({ services: next });
      return next;
    });
  }

  function handleContinue() {
    if (services.length === 0) return;
    updateOnboardingDraft({ services });
    router.push("/onboarding/mood");
  }

  const studioContext = studioName.trim()
    ? `Building Rovei. for ${studioName.trim()}`
    : "Building your Rovei. studio";

  return (
    <OnboardingShell
      currentStep={2}
      totalSteps={4}
      preview={<ServicesMiniPreview studioName={studioName} services={services} />}
    >
      <div className="page-enter">
        <p className="eyebrow">Your services</p>
        <h1 className="mt-5 max-w-xl text-[clamp(2.35rem,5.5vw,4.35rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
          What happens <span className="editorial-accent text-[var(--wine)]">in your chair?</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem]">
          Choose everything you currently offer. We&apos;ll use this to shape your Rovei experience.
        </p>
        <p className="mt-4 text-sm font-semibold text-[var(--wine)]">{studioContext}</p>

        <fieldset className="mt-9 sm:mt-10">
          <legend className="sr-only">Choose the service categories you currently offer</legend>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
            {SERVICE_CATEGORIES.map((category) => (
              <ServiceCard
                key={category.id}
                category={category}
                selected={services.includes(category.id)}
                onToggle={() => toggleService(category.id)}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-9 flex items-center justify-between gap-3 sm:mt-10">
          <Button
            variant="secondary"
            icon={<ArrowLeft size={17} aria-hidden="true" />}
            onClick={() => router.push("/onboarding")}
          >
            Back
          </Button>
          <Button
            disabled={services.length === 0}
            icon={<ArrowRight size={17} aria-hidden="true" />}
            onClick={handleContinue}
            className="min-w-36 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
