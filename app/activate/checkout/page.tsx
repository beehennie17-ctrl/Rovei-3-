import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/branding/wordmark";
import { formatUsd, getBillingCadence, pricing } from "@/lib/pricing";

type CheckoutPageProps = {
  searchParams: Promise<{ billing?: string | string[] }>;
};

export default async function Page({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const rawBilling = Array.isArray(params.billing) ? params.billing[0] : params.billing;
  const billing = getBillingCadence(rawBilling);
  const option = pricing[billing];

  return (
    <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-[960px]">
        <header className="flex items-center justify-between gap-4">
          <Wordmark />
          <Link href="/activate" className="focus-ring motion-soft inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--wine-soft)]">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Back to plan</span>
          </Link>
        </header>

        <section className="mx-auto mt-16 max-w-2xl rounded-[2.2rem] border border-[var(--border-soft)] bg-white px-6 py-10 shadow-[var(--shadow-soft)] sm:px-10 sm:py-12">
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-5 text-[clamp(2.6rem,7vw,4.6rem)] font-bold leading-[0.95] tracking-[-0.05em]">Payment boundary <span className="editorial-accent text-[var(--wine)]">placeholder.</span></h1>

          <div className="mt-8 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Rovei. Studio</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">{option.label} billing</p>
              </div>
              <p className="text-2xl font-bold tracking-[-0.04em] text-[var(--wine)]">{formatUsd(option.price)}<span className="text-sm font-semibold tracking-normal text-[var(--text-secondary)]">/{option.billingLabel}</span></p>
            </div>
          </div>

          <div className="mt-7 space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">Development prototype only.</strong> Checkout will be connected when Rovei&apos;s payment backend is implemented.</p>
            <p>For now, this route marks the boundary between the completed frontend purchase experience and future payment processing. No card information is collected, no payment occurs, and the studio is not activated here.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
