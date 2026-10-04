import {
  ArrowRight,
} from "lucide-react";

import type {
  ClientTheme,
} from "@/types";

export function PreviewConversion({
  onSave,
  onEdit,
  theme,
}: {
  onSave: () => void;
  onEdit: () => void;
  theme: ClientTheme;
}) {
  return (
    <section
      className="texture-cosmetic overflow-hidden rounded-[2.4rem] px-6 py-9 shadow-[var(--shadow-soft)] sm:px-10 sm:py-11 lg:flex lg:items-center lg:justify-between lg:gap-10"
      style={{
        backgroundColor:
          theme.primary,

        color:
          theme.onPrimary,
      }}
    >
      <div className="max-w-2xl">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] opacity-72">
          Your studio is designed
        </p>

        <h2 className="mt-4 text-[clamp(2.4rem,5vw,4.6rem)] font-medium leading-[0.92] tracking-[-0.05em]">
          Save it to continue
          <br />
          building with{" "}
          <span className="editorial-accent">
            Rovei.
          </span>
        </h2>

        <p className="mt-5 max-w-lg text-sm font-medium leading-6 opacity-72">
          Your setup stays with you
          while you preview and
          create your account.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:min-w-56 lg:flex-col">
        <button
          type="button"
          onClick={onSave}
          className="focus-ring motion-soft pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-bold shadow-sm hover:-translate-y-0.5"
          style={{
            backgroundColor:
              theme.surface,

            color:
              theme.text,

            borderColor:
              theme.border,
          }}
        >
          <span>
            Save my studio
          </span>

          <ArrowRight
            size={17}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="focus-ring motion-soft pressable min-h-12 rounded-full border border-current/20 px-6 text-sm font-bold hover:bg-white/10"
          style={{
            color:
              theme.onPrimary,
          }}
        >
          Edit setup
        </button>
      </div>
    </section>
  );
}
