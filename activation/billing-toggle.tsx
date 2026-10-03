import { formatUsd, pricing, type BillingCadence } from "@/lib/pricing";

type BillingToggleProps = {
  value: BillingCadence;
  onChange: (cadence: BillingCadence) => void;
};

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex w-full rounded-full border border-[var(--border-soft)] bg-white p-1.5 shadow-[var(--shadow-card)] sm:w-auto" role="group" aria-label="Billing cadence">
      {(["monthly", "annual"] as const).map((cadence) => {
        const selected = value === cadence;
        return (
          <button
            key={cadence}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(cadence)}
            className={`motion-soft focus-ring flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold sm:flex-none ${selected ? "bg-[var(--wine)] text-white shadow-[var(--shadow-card)]" : "text-[var(--text-secondary)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"}`}
          >
            <span>{pricing[cadence].label}</span>
            {cadence === "annual" && (
              <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${selected ? "bg-white/15 text-white" : "bg-[var(--rose-milk)]/55 text-[var(--wine)]"}`}>
                Save {formatUsd(pricing.annual.savings ?? 0)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

