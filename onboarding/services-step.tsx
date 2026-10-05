"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { LockedClientPreview } from "@/components/onboarding/locked-client-preview";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ServiceCard } from "@/components/onboarding/service-card";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import {
  readOnboardingDraft,
  updateOnboardingDraft,
} from "@/lib/onboarding-storage";
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

      updateOnboardingDraft({
        services: next,
      });

      return next;
    });
  }

  function handleContinue() {
    if (services.length === 0) return;

    updateOnboardingDraft({
      services,
    });

    router.push("/onboarding/mood");
  }

  const serviceNames = SERVICE_CATEGORIES
    .filter((category) => services.includes(category.id))
    .map((category) => category.name);

  return (
    <OnboardingShell
      currentStep={2}
      totalSteps={4}
      preview={
        <LockedClientPreview
          studioName={studioName.trim() || "Your studio"}
          clientName="Your client"
          service={
            serviceNames.length > 0
              ? serviceNames.join(" · ")
              : "Choose your services"
          }
        />
      }
    >
      <div>
        <p className="rovei-eyebrow">Your services</p>

        <h1 className="rovei-onboarding-title">
          What do{" "}
          <span className="rovei-editorial">you offer?</span>
        </h1>

        <p className="rovei-onboarding-copy">
          Choose everything you currently offer. Nothing is selected until
          you choose it.
        </p>

        <fieldset className="rovei-choice-grid">
          <legend className="sr-only">
            Choose the service categories you currently offer
          </legend>

          {SERVICE_CATEGORIES.map((category) => (
            <ServiceCard
              key={category.id}
              category={category}
              selected={services.includes(category.id)}
              onToggle={() => toggleService(category.id)}
            />
          ))}
        </fieldset>

        <div className="rovei-step-actions">
          <button
            type="button"
            className="rovei-btn rovei-btn-secondary"
            onClick={() => router.push("/onboarding/studio")}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>

          <button
            type="button"
            className="rovei-btn"
            disabled={services.length === 0}
            onClick={handleContinue}
          >
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
