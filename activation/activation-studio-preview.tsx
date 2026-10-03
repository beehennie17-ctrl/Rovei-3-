import { Sparkles } from "lucide-react";
import type { PersonalPreviewModel } from "@/lib/preview-model";

export function ActivationStudioPreview({ model }: { model: PersonalPreviewModel }) {
  return (
    <section className="relative overflow-hidden rounded-[2.3rem] border border-[var(--border-soft)] bg-[var(--rose-milk)]/28 p-5 shadow-[var(--shadow-soft)] sm:p-7" aria-labelledby="activation-studio-heading">
      <div className="absolute -right-14 -top-14 size-44 rounded-full bg-white/60 blur-3xl" aria-hidden="true" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Your studio</p>
            <h2 id="activation-studio-heading" className="mt-3 text-[clamp(2rem,4vw,3.15rem)] font-bold leading-[0.98] tracking-[-0.045em]">{model.studioName}</h2>
          </div>
          <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--wine)]">Preview mode</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-3 py-1.5">{model.themeLabel}</span>
          <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-3 py-1.5">{model.services.length} {model.services.length === 1 ? "service" : "services"}</span>
          <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-3 py-1.5">{model.experience.length} {model.experience.length === 1 ? "client step" : "client steps"}</span>
        </div>
        {model.serviceNames.length > 0 && <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{model.serviceNames.join(" · ")}</p>}

        <div
          className="shimmer-micro texture-cosmetic relative mt-6 overflow-hidden rounded-[1.8rem] border p-5"
          style={{
            background: model.theme.background,
            borderColor: model.theme.border,
            color: model.theme.text,
            ["--client-shimmer" as string]: model.theme.shimmer,
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em]" style={{ color: model.theme.muted }}>Client experience</p>
                <p className="mt-2 font-serif text-2xl tracking-[-0.03em]">{model.studioName}</p>
              </div>
              <span className="inline-flex size-9 items-center justify-center rounded-full" style={{ background: model.theme.secondary, color: model.theme.text }} aria-hidden="true"><Sparkles size={16} /></span>
            </div>
            <div className="mt-6 rounded-[1.35rem] border p-4" style={{ background: model.theme.surface, borderColor: model.theme.border }}>
              <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: model.theme.muted }}>Ready to activate</p>
              <p className="mt-2 text-sm leading-6">Your client experience is designed and waiting in preview mode.</p>
              <div className="mt-4 rounded-full px-4 py-2.5 text-center text-sm font-semibold" style={{ background: model.theme.primary, color: model.theme.onPrimary }}>Studio preview</div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Not live yet.</strong> Activation is what lets you begin using this studio with real clients.</p>
      </div>
    </section>
  );
}
