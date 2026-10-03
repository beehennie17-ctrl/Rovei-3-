"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActivationComparison } from "@/components/activation/activation-comparison";
import { ActivationStudioPreview } from "@/components/activation/activation-studio-preview";
import { IncludedFeatures } from "@/components/activation/included-features";
import { PricingPanel } from "@/components/activation/pricing-panel";
import { Wordmark } from "@/components/branding/wordmark";
import { Button } from "@/components/ui/button";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import { buildPersonalPreviewModel, type PersonalPreviewModel } from "@/lib/preview-model";
import type { BillingCadence } from "@/lib/pricing";

export function ActivationPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingCadence>("monthly");
  const [model, setModel] = useState<PersonalPreviewModel | null>(null);

  useEffect(() => {
    setModel(buildPersonalPreviewModel(readOnboardingDraft()));
  }, []);

  if (!model) {
    return (
      <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8">
        <div className="mx-auto max-w-[1260px]">
          <Wordmark />
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="h-[32rem] animate-pulse rounded-[2rem] bg-white" aria-label="Loading activation page" />
            <div className="h-[32rem] animate-pulse rounded-[2rem] bg-[var(--rose-milk)]/35" aria-hidden="true" />
          </div>
        </div>
      </main>
    );
  }

  if (model.isDraftEmpty) {
    return (
      <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8">
        <div className="mx-auto max-w-[1120px]">
          <header className="flex items-center justify-between gap-4">
            <Wordmark />
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={() => router.push("/signup")}>Back</Button>
          </header>
          <section className="mx-auto mt-20 max-w-2xl rounded-[2.2rem] border border-[var(--border-soft)] bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] sm:px-10 sm:py-16">
            <p className="eyebrow">Activate your studio</p>
            <h1 className="mt-5 text-[clamp(2.5rem,7vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.05em]">Build your studio <span className="editorial-accent text-[var(--wine)]">before activating Rovei.</span></h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">Activation becomes meaningful once your Studio, Services, Design, and Client Experience choices are in place.</p>
            <Button onClick={() => router.push("/onboarding")} className="mt-8">
              <span>Build my studio</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-[1260px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={() => router.push("/signup")}>Back</Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/preview")}>Preview studio</Button>
          </div>
        </header>

        <div className="page-enter mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16">
          <PricingPanel
            billing={billing}
            onBillingChange={setBilling}
            onContinue={() => router.push(`/activate/checkout?billing=${billing}`)}
          />

          <aside className="min-w-0 space-y-5" aria-label={`Activate ${model.studioName}`}>
            <ActivationStudioPreview model={model} />
            <IncludedFeatures />
            <ActivationComparison />
          </aside>
        </div>
      </div>
    </main>
  );
}
