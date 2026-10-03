export function Wordmark({ compact = false }: { compact?: boolean }) {
  return <span className={`inline-flex items-baseline font-semibold tracking-[-0.055em] text-[var(--wine)] ${compact ? "text-xl" : "text-2xl"}`} aria-label="Rovei">Rovei<span className="text-[var(--blush)]">.</span></span>;
}
