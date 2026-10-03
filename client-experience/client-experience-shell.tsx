import type { CSSProperties, ReactNode } from "react";
import type { ClientTheme } from "@/types";

export function ClientExperienceShell({
  studioName,
  theme,
  children,
}: {
  studioName: string;
  theme: ClientTheme;
  children: ReactNode;
}) {
  return (
    <main
      className="min-h-screen px-4 py-5 sm:px-6 sm:py-8 lg:py-12"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="mx-auto w-full max-w-[720px]">
        <header className="mb-5 flex items-center justify-between gap-4 px-1 sm:mb-7">
          <p className="max-w-[70%] truncate text-xs font-bold uppercase tracking-[0.16em]" style={{ color: theme.muted }}>
            {studioName}
          </p>
          <span
            className="rounded-full border px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]"
            style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.muted }}
          >
            Client experience
          </span>
        </header>

        <section
          className="texture-cosmetic overflow-hidden rounded-[2rem] border shadow-[var(--shadow-soft)] sm:rounded-[2.4rem]"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <div
            className="shimmer-micro relative min-h-2 overflow-hidden"
            style={{
              height: "7px",
              backgroundColor: theme.primary,
              "--client-shimmer": theme.shimmer,
            } as CSSProperties}
            aria-hidden="true"
          />
          <div className="p-5 sm:p-8 lg:p-10">{children}</div>
        </section>

        <footer className="px-2 pb-8 pt-5 text-center text-xs leading-5" style={{ color: theme.muted }}>
          <p>Preview mode · Your responses currently stay in this browser.</p>
          <p className="mt-1 font-semibold">Powered by Rovei.</p>
        </footer>
      </div>
    </main>
  );
}
