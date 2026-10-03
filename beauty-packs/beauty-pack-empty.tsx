import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function BeautyPackEmpty() {
  return (
    <section className="grid min-h-80 place-items-center rounded-[var(--radius-lg)] border border-dashed border-[var(--mauve)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <div className="max-w-md">
        <div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]">
          <Sparkles size={19} aria-hidden="true" />
        </div>
        <h2 className="section-title text-xl">Build once. Reuse every time.</h2>
        <p className="body-text mt-3">Create a Beauty Pack for the appointments you offer most, then reuse that client experience instead of starting from scratch.</p>
        <Link href="/app/beauty-packs/new" className="focus-ring motion-soft mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]">
          Create your first Beauty Pack
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
