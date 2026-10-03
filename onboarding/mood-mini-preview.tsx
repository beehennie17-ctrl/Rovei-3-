import type { CSSProperties } from "react";
import { CalendarDays, ChevronRight, FileText, Image as ImageIcon } from "lucide-react";
import { getServiceCategory } from "@/lib/service-categories";
import type { ClientTheme } from "@/types";
import type { ServiceCategoryId } from "@/types/onboarding";

const previewRows = [
  { label: "Consultation", icon: FileText },
  { label: "Appointment details", icon: CalendarDays },
  { label: "Inspiration", icon: ImageIcon },
];

export function MoodMiniPreview({
  studioName,
  services,
  theme,
  hasSelection,
}: {
  studioName: string;
  services: ServiceCategoryId[];
  theme: ClientTheme;
  hasSelection: boolean;
}) {
  const displayName = studioName.trim() || "Your Studio";
  const serviceNames = services
    .map((id) => getServiceCategory(id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="mb-5 flex items-center justify-between gap-4 px-1">
        <p className="eyebrow">Client preview</p>
        <p className="caption">{hasSelection ? `${theme.name} mood` : "Choose a mood"}</p>
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
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] opacity-75">Client experience</p>
            <h2
              className="mt-4 break-words text-[clamp(2rem,7vw,3.4rem)] leading-[0.94] tracking-[-0.045em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {displayName}
            </h2>
            {serviceNames.length > 0 && (
              <p className="mt-4 text-xs font-semibold leading-5 opacity-80">{serviceNames.join(" · ")}</p>
            )}
          </div>
        </div>

        <div className="px-1 pb-1 pt-6 sm:px-2">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em]" style={{ color: theme.muted }}>
            Welcome, Emily.
          </p>
          <p className="mt-2 text-lg font-bold tracking-[-0.025em]" style={{ color: theme.text }}>
            Let&apos;s get you ready for your appointment.
          </p>

          <div className="mt-5 space-y-2.5">
            {previewRows.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="motion-soft flex items-center gap-3 rounded-2xl border px-4 py-3.5"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full"
                  style={{ backgroundColor: theme.secondary, color: theme.text }}
                  aria-hidden="true"
                >
                  <Icon size={15} strokeWidth={1.9} />
                </span>
                <span className="text-sm font-bold" style={{ color: theme.text }}>{label}</span>
              </div>
            ))}
          </div>

          <div
            className="motion-soft mt-5 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-bold"
            style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
            aria-hidden="true"
          >
            <span>Begin</span>
            <ChevronRight size={17} />
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-[var(--text-secondary)]">
        Only your client-facing preview changes. Rovei itself stays Rovei.
      </p>
    </div>
  );
}
