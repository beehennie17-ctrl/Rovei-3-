import { CheckCircle2, Sparkles } from "lucide-react";
import { getServiceCategory } from "@/lib/service-categories";
import type { ServiceCategoryId } from "@/types/onboarding";

export function ServicesMiniPreview({
  studioName,
  services,
}: {
  studioName: string;
  services: ServiceCategoryId[];
}) {
  const displayName = studioName.trim() || "Your Studio";
  const selectedCategories = services
    .map((id) => getServiceCategory(id))
    .filter((category) => category !== undefined);

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <div className="mb-5 flex items-center justify-between gap-4 px-1">
        <p className="eyebrow">Your studio</p>
        <p className="caption">Taking shape in Rovei.</p>
      </div>

      <div className="texture-cosmetic relative overflow-hidden rounded-[2rem] border border-[var(--mauve)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[var(--blush)] opacity-50" />

        <div className="rounded-[1.65rem] bg-[var(--wine)] px-5 py-7 text-white sm:px-7 sm:py-8">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--rose-milk)]">Client experience</p>
          <h2
            className="mt-3 break-words text-[clamp(1.9rem,7vw,3.15rem)] leading-[0.98] tracking-[-0.045em]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {displayName}
          </h2>
        </div>

        <div className="px-1 pb-1 pt-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--wine)]">Your services</p>

          {selectedCategories.length === 0 ? (
            <div className="mt-4 flex min-h-28 items-center gap-3 rounded-2xl border border-dashed border-[var(--mauve)] bg-[var(--surface-muted)] px-4 py-5 text-[var(--text-secondary)]">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden="true">
                <Sparkles size={17} />
              </span>
              <p className="text-sm leading-6">Your services will appear here.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2" aria-label="Selected services preview">
              {selectedCategories.map((category) => (
                <li
                  key={category.id}
                  className="motion-soft page-enter flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3.5"
                >
                  <CheckCircle2 className="shrink-0 text-[var(--wine)]" size={18} aria-hidden="true" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">{category.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-[var(--text-secondary)]">
        Your setup is starting to reflect what you actually offer.
      </p>
    </div>
  );
}
