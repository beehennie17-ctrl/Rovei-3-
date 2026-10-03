"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/branding/wordmark";
import { SignupForm } from "@/components/signup/signup-form";
import { SignupStudioPreview } from "@/components/signup/signup-studio-preview";
import { Button } from "@/components/ui/button";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import { buildPersonalPreviewModel, type PersonalPreviewModel } from "@/lib/preview-model";

export function SignupPage() {
  const router = useRouter();
  const [model, setModel] = useState<PersonalPreviewModel | null>(null);

  useEffect(() => {
    setModel(buildPersonalPreviewModel(readOnboardingDraft()));
  }, []);

  if (!model) {
    return (
      <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8">
        <div className="mx-auto max-w-[1240px]">
          <Wordmark />
          <div className="mt-20 grid gap-5 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-[2rem] bg-white" aria-label="Loading account page" />
            <div className="h-96 animate-pulse rounded-[2rem] bg-[var(--rose-milk)]/35" aria-hidden="true" />
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
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={() => router.push("/preview")}>Back to preview</Button>
          </header>
          <section className="mx-auto mt-20 max-w-2xl rounded-[2.2rem] border border-[var(--border-soft)] bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] sm:px-10 sm:py-16">
            <p className="eyebrow">Save your studio</p>
            <h1 className="mt-5 text-[clamp(2.5rem,7vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.05em]">Start by designing <span className="editorial-accent text-[var(--wine)]">your Rovei studio.</span></h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">Your account page will reflect the studio you create during the four setup steps.</p>
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
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark />
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Saving your studio</span>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={() => router.push("/preview")}>Back to preview</Button>
          </div>
        </header>

        <div className="page-enter mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,0.93fr)_minmax(0,1.07fr)] lg:gap-12 xl:gap-16">
          <section className="flex min-w-0 flex-col justify-center lg:py-8" aria-labelledby="signup-heading">
            <div className="max-w-xl">
              <p className="eyebrow">Save your studio</p>
              <h1 id="signup-heading" className="mt-5 text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.055em] text-[var(--text-primary)]">Make it <span className="editorial-accent text-[var(--wine)]">yours.</span></h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-lg">Create your account to continue with the Rovei studio you just designed.</p>
              <p className="mt-2 text-sm font-semibold text-[var(--wine)]">Your setup stays exactly as you made it.</p>
            </div>

            <SignupForm onValidSubmit={() => router.push("/activate")} />
          </section>

          <SignupStudioPreview model={model} />
        </div>
      </div>
    </main>
  );
}
