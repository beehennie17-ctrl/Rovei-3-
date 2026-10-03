import { Check } from "lucide-react";

const features = [
  "Unlimited clients",
  "Branded client experiences",
  "Signature Client Cards",
  "Beauty Packs",
  "Client history",
  "Consultation flows",
  "Photo uploads",
  "Before + afters",
  "Studio themes",
  "Custom signature colour",
  "Visit notes",
  "Installable web app",
  "Future product updates",
];

export function IncludedFeatures() {
  return (
    <section className="rounded-[2rem] border border-[var(--border-soft)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6" aria-labelledby="included-features-heading">
      <p className="eyebrow">One plan</p>
      <h2 id="included-features-heading" className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">Everything in Rovei. Studio</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Once activated, you&apos;ll be able to use the full studio with real clients. Monthly and Annual include the same product.</p>
      <ul className="mt-5 grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-[var(--text-primary)]">
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden="true"><Check size={12} strokeWidth={2.5} /></span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
