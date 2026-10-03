import { Sparkles } from "lucide-react";
import type { PersonalPreviewModel } from "@/lib/preview-model";

export function SignupStudioPreview({ model }: { model: PersonalPreviewModel }) {
  const visibleSteps = model.experience.slice(0, 3);
  const remainingSteps = Math.max(0, model.experience.length - visibleSteps.length);

  return (
    <aside className="relative flex min-h-full flex-col justify-center overflow-hidden rounded-[2.4rem] border border-[var(--border-soft)] bg-[var(--rose-milk)]/30 p-5 sm:p-7 lg:p-9" aria-labelledby="signup-studio-preview-title">
      <div className="absolute -right-16 -top-14 size-52 rounded-full bg-white/55 blur-3xl" aria-hidden="true" />
      <div className="relative z-10">
        <p className="eyebrow">Your studio</p>
        <h2 id="signup-studio-preview-title" className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--text-primary)]">{model.studioName}</h2>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <span className="rounded-full border border-[var(--border-soft)] bg-white/75 px-3 py-1.5">{model.themeLabel}</span>
          <span className="rounded-full border border-[var(--border-soft)] bg-white/75 px-3 py-1.5">{model.services.length} {model.services.length === 1 ? "service" : "services"}</span>
          <span className="rounded-full border border-[var(--border-soft)] bg-white/75 px-3 py-1.5">{model.experience.length} {model.experience.length === 1 ? "client step" : "client steps"}</span>
        </div>

        {model.serviceNames.length > 0 && (
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{model.serviceNames.join(" · ")}</p>
        )}

        <div
          className="shimmer-micro texture-cosmetic relative mt-7 overflow-hidden rounded-[2rem] border p-5 shadow-[var(--shadow-soft)] sm:p-6"
          style={{
            background: model.theme.background,
            borderColor: model.theme.border,
            color: model.theme.text,
            ["--client-shimmer" as string]: model.theme.shimmer,
          }}
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em]" style={{ color: model.theme.muted }}>Client experience</p>
                <p className="mt-2 font-serif text-2xl leading-none tracking-[-0.03em]">{model.studioName}</p>
              </div>
              <span className="inline-flex size-9 items-center justify-center rounded-full" style={{ background: model.theme.secondary, color: model.theme.text }} aria-hidden="true">
                <Sparkles size={16} />
              </span>
            </div>

            <div className="mt-7 rounded-[1.5rem] p-4 sm:p-5" style={{ background: model.theme.surface, border: `1px solid ${model.theme.border}` }}>
              <p className="font-serif text-xl tracking-[-0.025em]">Hi Emily.</p>
              <p className="mt-2 text-sm leading-6" style={{ color: model.theme.muted }}>Everything you need before your appointment, in one place.</p>

              <div className="mt-5 space-y-2">
                {visibleSteps.length > 0 ? visibleSteps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: model.theme.border }}>
                    <span>{step.name}</span>
                    <span className="size-2 rounded-full" style={{ background: model.theme.primary }} aria-hidden="true" />
                  </div>
                )) : (
                  <p className="rounded-xl border px-3 py-3 text-xs leading-5" style={{ borderColor: model.theme.border, color: model.theme.muted }}>A simple client experience, ready for your finishing touches.</p>
                )}
              </div>

              {remainingSteps > 0 && <p className="mt-3 text-xs font-semibold" style={{ color: model.theme.muted }}>+{remainingSteps} more</p>}
            </div>

            <div className="mt-4 h-10 rounded-full px-4 text-sm font-semibold leading-10" style={{ background: model.theme.primary, color: model.theme.onPrimary }}>Begin →</div>
          </div>
        </div>

        <p className="mt-5 text-xs leading-5 text-[var(--text-secondary)]">Your setup stays exactly as you made it in this browser. Account credentials are not part of the studio draft.</p>
      </div>
    </aside>
  );
}
