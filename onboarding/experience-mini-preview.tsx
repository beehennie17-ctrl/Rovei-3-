import type { CSSProperties } from "react";
import { Check, ChevronRight, Clock3 } from "lucide-react";
import { getExperienceOption } from "@/lib/experience-options";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientTheme } from "@/types";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

function getEffortLabel(count: number) {
  if (count <= 2) return "Around 2 min";
  if (count <= 4) return "Around 3 min";
  return "Around 4 min";
}

export function ExperienceMiniPreview({
  studioName,
  services,
  selections,
  theme,
}: {
  studioName: string;
  services: ServiceCategoryId[];
  selections: ExperienceModuleId[];
  theme: ClientTheme;
}) {
  const displayName = studioName.trim() || "Your Studio";
  const serviceNames = services
    .map((id) => getServiceCategory(id)?.name)
    .filter((name): name is string => Boolean(name));
  const selectedOptions = selections
    .map((id) => getExperienceOption(id))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="mb-5 flex items-center justify-between gap-4 px-1">
        <p className="eyebrow">Client preview</p>
        <p className="caption">Your experience</p>
      </div>

      <div
        className="motion-soft texture-cosmetic overflow-hidden rounded-[2.1rem] border p-4 shadow-[var(--shadow-soft)] sm:p-5"
        style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
      >
        <div
          className="shimmer-micro relative overflow-hidden rounded-[1.7rem] px-5 pb-7 pt-8 sm:px-7 sm:pb-8 sm:pt-9"
          style={{
            backgroundColor: theme.primary,
            color: theme.onPrimary,
            "--client-shimmer": theme.shimmer,
          } as CSSProperties}
        >
          <div className="relative z-[1]">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] opacity-75">{displayName}</p>
            <h2
              className="mt-4 text-[clamp(2rem,7vw,3.25rem)] leading-[0.94] tracking-[-0.045em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Hi Emily.
            </h2>
            <p className="mt-4 max-w-xs text-sm font-semibold leading-6 opacity-85">
              Let&apos;s get you ready for your appointment.
            </p>
            {serviceNames.length > 0 && (
              <p className="mt-4 text-xs font-semibold leading-5 opacity-75">{serviceNames.join(" · ")}</p>
            )}
          </div>
        </div>

        <div className="px-1 pb-1 pt-6 sm:px-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em]" style={{ color: theme.muted }}>
                Before your appointment
              </p>
              <p className="mt-1.5 text-lg font-bold tracking-[-0.025em]" style={{ color: theme.text }}>
                Your pre-appointment flow
              </p>
            </div>
            {selectedOptions.length > 0 && (
              <span className="flex shrink-0 items-center gap-1.5 text-[0.68rem] font-semibold" style={{ color: theme.muted }}>
                <Clock3 size={13} aria-hidden="true" />
                {getEffortLabel(selectedOptions.length)}
              </span>
            )}
          </div>

          {selectedOptions.length > 0 ? (
            <div className="mt-5 space-y-2.5" aria-live="polite">
              {selectedOptions.map((option) => (
                <div
                  key={option.id}
                  className="motion-soft flex items-center gap-3 rounded-2xl border px-4 py-3.5"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: theme.secondary, color: theme.text }}
                    aria-hidden="true"
                  >
                    <Check size={14} strokeWidth={2.2} />
                  </span>
                  <span className="text-sm font-bold" style={{ color: theme.text }}>{option.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="mt-5 rounded-2xl border px-4 py-5 text-sm leading-6"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.muted }}
              aria-live="polite"
            >
              Your client experience is intentionally minimal.
            </div>
          )}

          <div
            className="motion-soft mt-5 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-bold"
            style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
            aria-hidden="true"
          >
            <span>Start</span>
            <ChevronRight size={17} />
          </div>
        </div>
      </div>
    </div>
  );
}
