import type { CSSProperties } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getClientPrepCopy } from "@/lib/client-prep-copy";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientTheme } from "@/types";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

export function BeautyPackPreview({
  studioName,
  packName,
  service,
  modules,
  theme,
}: {
  studioName: string;
  packName: string;
  service: ServiceCategoryId | "";
  modules: ExperienceModuleId[];
  theme: ClientTheme;
}) {
  const serviceName = service ? getServiceCategory(service)?.name : undefined;
  const selectedOptions = EXPERIENCE_OPTIONS.filter((option) => modules.includes(option.id));
  const showReady = Boolean(service && selectedOptions.length > 0);

  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4 sm:px-6">
        <div>
          <p className="eyebrow">Client preview</p>
          <p className="caption mt-1">Uses your studio&apos;s current client theme.</p>
        </div>
        <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">Preview</span>
      </div>

      <div className="p-4 sm:p-6">
        {!showReady ? (
          <div className="grid min-h-[460px] place-items-center rounded-[2rem] border border-dashed border-[var(--mauve)] bg-[var(--surface-muted)] px-6 text-center">
            <div className="max-w-xs">
              <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]"><Sparkles size={18} aria-hidden="true" /></div>
              <h3 className="mt-4 font-bold">Your Beauty Pack will appear here.</h3>
              <p className="caption mt-2">Choose a service and at least one client step to shape the reusable experience.</p>
            </div>
          </div>
        ) : (
          <div
            className="texture-cosmetic overflow-hidden rounded-[2rem] border p-4 shadow-[var(--shadow-card)]"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
          >
            <div
              className="shimmer-micro relative overflow-hidden rounded-[1.65rem] px-5 pb-7 pt-8"
              style={{
                backgroundColor: theme.primary,
                color: theme.onPrimary,
                "--client-shimmer": theme.shimmer,
              } as CSSProperties}
            >
              <div className="relative z-[1]">
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.15em] opacity-75">{studioName.trim() || "Your Studio"}</p>
                <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.13em] opacity-75">Client experience</p>
                <h2 className="mt-2 break-words text-3xl leading-[0.98] tracking-[-0.04em]" style={{ fontFamily: "var(--font-serif)" }}>{packName.trim() || "Beauty Pack"}</h2>
                <p className="mt-4 text-xs font-semibold opacity-80">{serviceName}</p>
              </div>
            </div>

            <div className="px-1 pb-1 pt-6">
              <p className="text-[0.67rem] font-bold uppercase tracking-[0.14em]" style={{ color: theme.muted }}>Before your appointment</p>
              <div className="mt-4 space-y-2.5">
                {selectedOptions.map((option) => (
                  <div key={option.id} className="rounded-2xl border px-4 py-3.5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <p className="text-sm font-bold" style={{ color: theme.text }}>{option.name}</p>
                    {option.id === "prep" && service && <p className="mt-1 text-xs leading-5" style={{ color: theme.muted }}>{getClientPrepCopy(service)}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold" style={{ backgroundColor: theme.primary, color: theme.onPrimary }} aria-hidden="true">
                <span>Begin</span><ArrowRight size={16} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
