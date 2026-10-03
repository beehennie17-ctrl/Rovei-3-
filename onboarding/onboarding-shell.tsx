import type { ReactNode } from "react";
import { Wordmark } from "@/components/branding/wordmark";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";

export function OnboardingShell({
  currentStep,
  totalSteps,
  children,
  preview,
}: {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  preview: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <div className="grid min-h-screen lg:grid-cols-[48fr_52fr]">
        <section className="flex min-w-0 flex-col px-[var(--page-gutter)] py-7 sm:py-9 lg:py-10 xl:px-[clamp(56px,7vw,112px)]">
          <header className="flex flex-col gap-7 sm:gap-9">
            <Wordmark />
            <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
          </header>
          <div className="flex flex-1 items-center py-12 sm:py-16 lg:py-14 xl:py-20">
            <div className="w-full max-w-xl">{children}</div>
          </div>
        </section>

        <aside className="flex min-w-0 items-center justify-center bg-[var(--wine-soft)] px-[var(--page-gutter)] py-12 sm:py-16 lg:min-h-screen lg:px-[clamp(48px,6vw,96px)] lg:py-16">
          <div className="w-full max-w-[620px]">{preview}</div>
        </aside>
      </div>
    </main>
  );
}
