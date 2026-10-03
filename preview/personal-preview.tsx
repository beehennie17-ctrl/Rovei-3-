"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/branding/wordmark";
import { ClientExperiencePreview } from "@/components/preview/client-experience-preview";
import { PreviewConversion } from "@/components/preview/preview-conversion";
import { PreviewSummary } from "@/components/preview/preview-summary";
import { PreviewViewToggle, type PreviewView } from "@/components/preview/preview-view-toggle";
import { ProfessionalExperiencePreview } from "@/components/preview/professional-experience-preview";
import { Button } from "@/components/ui/button";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import { buildPersonalPreviewModel, type PersonalPreviewModel } from "@/lib/preview-model";

export function PersonalPreview() {
  const router = useRouter();
  const [model, setModel] = useState<PersonalPreviewModel | null>(null);
  const [view, setView] = useState<PreviewView>("client");

  useEffect(() => {
    setModel(buildPersonalPreviewModel(readOnboardingDraft()));
  }, []);

  if (!model) {
    return (
      <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8">
        <div className="mx-auto max-w-[1240px]">
          <Wordmark />
          <div className="mt-24 h-44 animate-pulse rounded-[2rem] bg-white" aria-label="Loading studio preview" />
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
            <span className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Preview mode</span>
          </header>
          <section className="mx-auto mt-20 max-w-2xl rounded-[2.2rem] border border-[var(--border-soft)] bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] sm:px-10 sm:py-16">
            <p className="eyebrow">Your Rovei studio</p>
            <h1 className="mt-5 text-[clamp(2.4rem,7vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.05em]">
              Your studio preview needs <span className="editorial-accent text-[var(--wine)]">a few details first.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">Build the four quick setup steps, then come back here to see the experience from both sides.</p>
            <Button onClick={() => router.push("/onboarding")} className="mt-8">
              <span>Build my studio</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </section>
        </div>
      </main>
    );
  }

  const headline = model.hasStudioName ? (
    <>{model.studioName}<br /><span className="editorial-accent text-[var(--wine)]">is ready.</span></>
  ) : (
    <>Your studio<br /><span className="editorial-accent text-[var(--wine)]">is ready to preview.</span></>
  );

  return (
    <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark />
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Preview mode</span>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={() => router.push("/onboarding/experience")}>Edit setup</Button>
          </div>
        </header>

        <section className="page-enter pt-12 sm:pt-16 lg:pt-20">
          <div className="max-w-4xl">
            <p className="eyebrow">Your Rovei studio</p>
            <h1 className="mt-5 text-[clamp(3rem,7vw,6.6rem)] font-bold leading-[0.88] tracking-[-0.06em] text-[var(--text-primary)]">{headline}</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">See the experience from both sides before you save your studio.</p>
            <p className="mt-2 text-sm font-semibold text-[var(--wine)]">Nothing is live yet.</p>
          </div>

          <div className="mt-9 sm:mt-11">
            <PreviewSummary model={model} />
          </div>
        </section>

        <section className="mt-12 sm:mt-16 lg:mt-20" aria-labelledby="preview-perspective-heading">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">See both sides</p>
              <h2 id="preview-perspective-heading" className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1] tracking-[-0.045em]">This is what Rovei starts to feel like.</h2>
            </div>
            <PreviewViewToggle value={view} onChange={setView} />
          </div>

          <div className="mt-7 overflow-hidden rounded-[2.4rem] border border-[var(--border-soft)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-7 lg:p-10">
            <div
              id="preview-panel-client"
              role="tabpanel"
              aria-labelledby="preview-tab-client"
              hidden={view !== "client"}
              className="page-enter"
            >
              <ClientExperiencePreview model={model} />
            </div>
            <div
              id="preview-panel-professional"
              role="tabpanel"
              aria-labelledby="preview-tab-professional"
              hidden={view !== "professional"}
              className="page-enter"
            >
              <ProfessionalExperiencePreview model={model} />
            </div>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-[var(--text-secondary)]">This is your preview. Nothing here creates a client, submits a form, or makes your studio live.</p>
        </section>

        <div className="mt-12 sm:mt-16 lg:mt-20">
          <PreviewConversion onSave={() => router.push("/signup")} onEdit={() => router.push("/onboarding/experience")} />
        </div>
      </div>
    </main>
  );
}
