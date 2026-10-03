import type { ChangeEvent } from "react";
import { Textarea } from "@/components/ui/form-controls";
import type { ClientTheme } from "@/types";

export function ConsultationStep({
  value,
  theme,
  showError,
  onChange,
}: {
  value: string;
  theme: ClientTheme;
  showError: boolean;
  onChange: (value: string) => void;
}) {
  const invalid = showError && !value.trim();
  return (
    <div className="page-enter">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.muted }}>Consultation</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">What would you like from this appointment?</h1>
      <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>Tell your professional about the look, finish or result you&apos;re hoping for.</p>
      <label htmlFor="consultation-goal" className="mt-7 block text-sm font-bold">Your goal</label>
      <Textarea
        id="consultation-goal"
        value={value}
        maxLength={500}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        placeholder="Tell us the look, finish or result you're hoping for..."
        aria-invalid={invalid || undefined}
        aria-describedby="consultation-help consultation-error"
        className="mt-2 min-h-36"
        style={{ borderColor: invalid ? "var(--warning)" : theme.border }}
      />
      <div className="mt-2 flex items-start justify-between gap-4 text-xs" style={{ color: theme.muted }}>
        <span id="consultation-help">Beauty goals only — no medical information is needed.</span>
        <span>{value.length}/500</span>
      </div>
      <p id="consultation-error" className="mt-2 text-xs font-semibold text-[var(--warning)]" hidden={!invalid}>Tell us what you&apos;d like from the appointment before continuing.</p>
    </div>
  );
}
