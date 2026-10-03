type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
};

const defaultLabels = ["Studio", "Services", "Mood", "Experience"];

export function OnboardingProgress({ currentStep, totalSteps, labels = defaultLabels }: OnboardingProgressProps) {
  const safeTotal = Math.max(totalSteps, 1);
  const safeCurrent = Math.min(Math.max(currentStep, 1), safeTotal);
  const percentage = Math.round((safeCurrent / safeTotal) * 100);
  const visibleLabels = labels.slice(0, safeTotal);

  return (
    <div className="w-full max-w-md" aria-label="Onboarding progress">
      <div className="mb-3 flex items-center justify-between gap-4 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        <span>Step {safeCurrent} of {safeTotal}</span>
        <span>{percentage}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--wine-soft)]"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-valuetext={`Step ${safeCurrent} of ${safeTotal}, ${percentage}% complete`}
      >
        <div className="h-full rounded-full bg-[var(--wine)] motion-soft" style={{ width: `${percentage}%` }} />
      </div>
      {visibleLabels.length > 0 && (
        <ol className="mt-3 grid gap-2 text-[0.68rem] font-semibold text-[var(--text-secondary)]" style={{ gridTemplateColumns: `repeat(${visibleLabels.length}, minmax(0, 1fr))` }}>
          {visibleLabels.map((label, index) => {
            const step = index + 1;
            const isCurrent = step === safeCurrent;
            return (
              <li
                key={label}
                aria-current={isCurrent ? "step" : undefined}
                className={isCurrent ? "text-[var(--wine)]" : undefined}
              >
                {label}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
