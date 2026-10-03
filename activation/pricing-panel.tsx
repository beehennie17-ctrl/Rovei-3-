import { ArrowRight } from "lucide-react";
import { BillingToggle } from "@/components/activation/billing-toggle";
import { Button } from "@/components/ui/button";
import { formatUsd, pricing, type BillingCadence } from "@/lib/pricing";

type PricingPanelProps = {
  billing: BillingCadence;
  onBillingChange: (cadence: BillingCadence) => void;
  onContinue: () => void;
};

export function PricingPanel({ billing, onBillingChange, onContinue }: PricingPanelProps) {
  const option = pricing[billing];

  return (
    <section aria-labelledby="activation-heading" className="flex min-w-0 flex-col justify-center lg:py-6">
      <div className="max-w-xl">
        <p className="eyebrow">Activate your studio</p>
        <h1 id="activation-heading" className="mt-5 text-[clamp(3rem,6vw,5.7rem)] font-bold leading-[0.9] tracking-[-0.055em] text-[var(--text-primary)]">
          Your studio is designed. <span className="editorial-accent text-[var(--wine)]">Now make it real.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-lg">Activate Rovei. to start using the studio you created with real clients.</p>
        <p className="mt-2 text-sm font-semibold text-[var(--wine)]">Your setup stays exactly as you designed it.</p>
      </div>

      <div className="mt-9">
        <BillingToggle value={billing} onChange={onBillingChange} />
      </div>

      <div className="mt-7 min-h-[9.5rem] rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--text-secondary)]">Rovei. Studio</p>
        <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-[clamp(3.2rem,8vw,5.25rem)] font-bold leading-none tracking-[-0.06em] text-[var(--wine)]">{formatUsd(option.price)}</span>
          <span className="pb-1.5 text-sm font-semibold text-[var(--text-secondary)]">/{option.billingLabel}</span>
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{option.billedCopy}</p>

        {billing === "annual" && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-[var(--wine-soft)] px-3 py-1.5 font-bold text-[var(--wine)]">Save {formatUsd(option.savings ?? 0)}</span>
            <span className="text-[var(--text-secondary)]">{formatUsd(option.equivalentMonthly ?? 0)}/month equivalent</span>
          </div>
        )}
      </div>

      <Button onClick={onContinue} className="mt-6 w-full sm:w-auto">
        <span>Continue to secure checkout</span>
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs leading-5 text-[var(--text-secondary)]">
        <span>Cancel anytime.</span>
        <span>No setup fee.</span>
        <span>Billing begins only after checkout is completed.</span>
      </div>
    </section>
  );
}
