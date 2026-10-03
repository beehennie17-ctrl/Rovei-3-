import type { ChangeEvent, ReactNode } from "react";
import type { ClientTheme } from "@/types";

export function AcknowledgementStep({
  eyebrow,
  title,
  description,
  checkboxLabel,
  acknowledged,
  theme,
  showError,
  children,
  onChange,
}: {
  eyebrow: string;
  title: string;
  description: string;
  checkboxLabel: string;
  acknowledged: boolean;
  theme: ClientTheme;
  showError: boolean;
  children?: ReactNode;
  onChange: (value: boolean) => void;
}) {
  const invalid = showError && !acknowledged;
  return (
    <div className="page-enter">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.muted }}>{eyebrow}</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>{description}</p>
      {children && <div className="mt-6 rounded-2xl border p-5 text-sm leading-6" style={{ borderColor: theme.border, backgroundColor: theme.background }}>{children}</div>}
      <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6" style={{ borderColor: acknowledged ? theme.primary : theme.border, backgroundColor: acknowledged ? theme.secondary : theme.surface }}>
        <input type="checkbox" checked={acknowledged} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)} className="mt-1 size-4 accent-[var(--wine)]" aria-invalid={invalid || undefined} aria-describedby={invalid ? "acknowledgement-error" : undefined} />
        <span>{checkboxLabel}</span>
      </label>
      <p id="acknowledgement-error" className="mt-3 text-xs font-semibold text-[var(--warning)]" hidden={!invalid}>Please acknowledge this before continuing.</p>
    </div>
  );
}
