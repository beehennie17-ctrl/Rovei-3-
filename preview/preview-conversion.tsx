import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewConversion({
  onSave,
  onEdit,
}: {
  onSave: () => void;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-[2rem] bg-[var(--wine)] px-6 py-8 text-white shadow-[var(--shadow-soft)] sm:px-9 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
      <div className="max-w-xl">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--rose-milk)]">Your studio is designed</p>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3.35rem)] leading-[0.98] tracking-[-0.04em]">
          Save it to continue building with <span className="editorial-accent text-[var(--rose-milk)]">Rovei.</span>
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/70">Your setup will stay in this browser while you preview.</p>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col lg:items-stretch">
        <Button variant="secondary" onClick={onSave} className="border-white hover:bg-[var(--rose-milk)] lg:min-w-48">
          <span>Save my studio</span>
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
        <Button variant="ghost" onClick={onEdit} className="border-white/20 text-white hover:bg-white/10 hover:text-white">Edit setup</Button>
      </div>
    </section>
  );
}
