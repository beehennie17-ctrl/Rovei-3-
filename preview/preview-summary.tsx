import type { PersonalPreviewModel } from "@/lib/preview-model";

export function PreviewSummary({ model }: { model: PersonalPreviewModel }) {
  return (
    <div className="grid gap-3 rounded-[1.6rem] border border-[var(--border-soft)] bg-white p-4 shadow-[var(--shadow-card)] sm:grid-cols-[1.3fr_repeat(3,1fr)] sm:p-5">
      <div className="min-w-0 sm:border-r sm:border-[var(--border-soft)] sm:pr-5">
        <p className="text-[0.64rem] font-bold uppercase tracking-[0.13em] text-[var(--text-secondary)]">You created</p>
        <p className="mt-1.5 truncate font-bold tracking-[-0.02em] text-[var(--text-primary)]">{model.studioName}</p>
        {model.serviceNames.length > 0 && <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{model.serviceNames.join(" · ")}</p>}
      </div>
      <SummaryStat label="Services" value={`${model.services.length}`} detail={model.services.length === 1 ? "service" : "services"} />
      <SummaryStat label="Look" value={model.themeLabel} detail="experience" />
      <SummaryStat label="Client flow" value={`${model.experience.length}`} detail={model.experience.length === 1 ? "client step" : "client steps"} />
    </div>
  );
}

function SummaryStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-muted)] px-3.5 py-3 sm:bg-transparent sm:px-4 sm:py-1">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1.5 text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]">{value}</p>
      <p className="mt-0.5 text-[0.68rem] text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}
