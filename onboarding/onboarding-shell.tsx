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
    <main className="rovei-flow rovei-split page-enter">
      <section className="rovei-split-main">
        <header>
          <Wordmark />
          <div className="rovei-progress-wrap">
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          </div>
        </header>

        <div className="rovei-split-content">{children}</div>
      </section>

      <aside className="rovei-split-preview">
        {preview}
      </aside>
    </main>
  );
}
