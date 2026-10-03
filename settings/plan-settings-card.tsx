import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { annualSavings, formatUsd, pricing } from "@/lib/pricing";

export function PlanSettingsCard() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Plan & billing</p>
          <h2 className="section-title mt-3">Rovei. Studio</h2>
          <p className="caption mt-2">One Studio plan · monthly or annual billing.</p>
        </div>
        <span className="rounded-full border border-[var(--blush)] bg-[var(--wine-soft)] px-3 py-1 text-xs font-bold text-[var(--wine)]">Preview mode · Not activated</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Monthly</p>
          <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">{formatUsd(pricing.monthly.price)}<span className="text-sm font-medium text-[var(--text-secondary)]">/month</span></p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Annual</p>
            <span className="text-xs font-bold text-[var(--wine)]">Save {formatUsd(annualSavings)}</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">{formatUsd(pricing.annual.price)}<span className="text-sm font-medium text-[var(--text-secondary)]">/year</span></p>
        </div>
      </div>

      <Link href="/activate" className="focus-ring motion-soft mt-5 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-[var(--wine)] hover:underline">
        View activation <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </Card>
  );
}
