import type { CSSProperties } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientTheme } from "@/types";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

export function StudioClientPreview({
  studioName,
  services,
  modules,
  theme,
}: {
  studioName: string;
  services: ServiceCategoryId[];
  modules: ExperienceModuleId[];
  theme: ClientTheme;
}) {
  const serviceNames = services.map((id) => getServiceCategory(id)?.name).filter((value): value is string => Boolean(value));
  const selectedOptions = EXPERIENCE_OPTIONS.filter((option) => modules.includes(option.id));

  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4 sm:px-6">
        <div>
          <p className="eyebrow">Live client preview</p>
          <p className="caption mt-1">Unsaved edits appear here immediately.</p>
        </div>
        <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">Preview</span>
      </div>

      <div className="p-4 sm:p-6">
        <div
          className="texture-cosmetic overflow-hidden rounded-[2rem] border p-4 shadow-[var(--shadow-card)]"
          style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
        >
          <div
            className="shimmer-micro relative overflow-hidden rounded-[1.65rem] px-5 pb-8 pt-8"
            style={{
              backgroundColor: theme.primary,
              color: theme.onPrimary,
              "--client-shimmer": theme.shimmer,
            } as CSSProperties}
          >
            <div className="relative z-[1]">
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.15em] opacity-75">{studioName.trim() || "Your Studio"}</p>
              <p className="mt-7 text-[0.68rem] font-bold uppercase tracking-[0.13em] opacity-75">Client experience</p>
              <h2 className="mt-2 text-3xl leading-[0.98] tracking-[-0.04em]" style={{ fontFamily: "var(--font-serif)" }}>Hi Emily.</h2>
              <p className="mt-3 max-w-xs text-sm leading-6 opacity-85">Let&apos;s get you ready for your appointment.</p>
              {serviceNames.length > 0 && <p className="mt-5 text-xs font-semibold opacity-80">{serviceNames.join(" · ")}</p>}
            </div>
          </div>

          <div className="px-1 pb-1 pt-6">
            <p className="text-[0.67rem] font-bold uppercase tracking-[0.14em]" style={{ color: theme.muted }}>Before your appointment</p>
            {selectedOptions.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {selectedOptions.map((option) => (
                  <div key={option.id} className="rounded-2xl border px-4 py-3.5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <p className="text-sm font-bold" style={{ color: theme.text }}>{option.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed px-5 py-7 text-center" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <Sparkles className="mx-auto" size={18} aria-hidden="true" style={{ color: theme.primary }} />
                <p className="mt-3 text-sm font-semibold" style={{ color: theme.text }}>Choose client steps to preview the experience.</p>
              </div>
            )}
            <div className="mt-5 flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold" style={{ backgroundColor: theme.primary, color: theme.onPrimary }} aria-hidden="true">
              <span>Begin</span><ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
