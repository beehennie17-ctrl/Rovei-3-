import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/form-controls";

export function CustomThemeControl({
  textValue,
  activeColour,
  showError,
  onTextChange,
  onColourChange,
}: {
  textValue: string;
  activeColour: string;
  showError: boolean;
  onTextChange: (value: string) => void;
  onColourChange: (value: string) => void;
}) {
  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4 sm:p-5">
      <p className="text-sm font-bold text-[var(--text-primary)]">Your signature colour</p>
      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
        Choose one colour for the strongest client-facing accents. You can refine this later.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[96px_1fr] sm:items-end">
        <div>
          <label htmlFor="custom-theme-colour" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            Colour
          </label>
          <input
            id="custom-theme-colour"
            type="color"
            value={activeColour}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onColourChange(event.target.value)}
            className="focus-ring h-12 w-full cursor-pointer rounded-2xl border border-[var(--border-soft)] bg-white p-1.5"
          />
        </div>
        <div>
          <label htmlFor="custom-theme-hex" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            Hex colour
          </label>
          <Input
            id="custom-theme-hex"
            type="text"
            value={textValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onTextChange(event.target.value)}
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={7}
            aria-invalid={showError || undefined}
            aria-describedby={showError ? "custom-theme-hex-error" : "custom-theme-hex-hint"}
            placeholder="#8A4053"
          />
        </div>
      </div>

      {showError ? (
        <p id="custom-theme-hex-error" className="mt-2 text-xs font-semibold text-[var(--wine)]" role="status">
          Use a six-digit hex colour, for example #8A4053.
        </p>
      ) : (
        <p id="custom-theme-hex-hint" className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          Six-digit hex only. Incomplete values won&apos;t change your preview.
        </p>
      )}
    </div>
  );
}
