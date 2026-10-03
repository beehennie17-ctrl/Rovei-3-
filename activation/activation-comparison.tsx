export function ActivationComparison() {
  return (
    <section className="grid overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-white shadow-[var(--shadow-card)] sm:grid-cols-2" aria-labelledby="activation-comparison-heading">
      <h2 id="activation-comparison-heading" className="sr-only">What activation changes</h2>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--text-secondary)]">Design mode</p>
        <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">You created:</p>
        <ul className="mt-3 space-y-2 text-sm leading-5 text-[var(--text-secondary)]">
          <li>Studio identity</li>
          <li>Services</li>
          <li>Visual style</li>
          <li>Client experience</li>
        </ul>
      </div>
      <div className="border-t border-[var(--border-soft)] bg-[var(--wine-soft)]/55 p-5 sm:border-l sm:border-t-0 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--wine)]">After activation</p>
        <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">You&apos;ll be able to:</p>
        <ul className="mt-3 space-y-2 text-sm leading-5 text-[var(--text-secondary)]">
          <li>Add real clients</li>
          <li>Create client links</li>
          <li>Receive completed consultations</li>
          <li>Build permanent Client Cards and histories</li>
        </ul>
      </div>
    </section>
  );
}
