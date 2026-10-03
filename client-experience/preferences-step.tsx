import type { ClientAppointmentFeel, ClientFinishPreference } from "@/types/client-experience";
import type { ClientTheme } from "@/types";

const finishOptions: { value: ClientFinishPreference; label: string }[] = [
  { value: "natural", label: "Natural" },
  { value: "soft", label: "Soft" },
  { value: "defined", label: "Defined" },
  { value: "glam", label: "Glam" },
  { value: "not-sure", label: "Not sure yet" },
];

const feelOptions: { value: ClientAppointmentFeel; label: string }[] = [
  { value: "quiet", label: "Quiet & relaxed" },
  { value: "chatty", label: "Happy to chat" },
  { value: "no-preference", label: "No preference" },
];

function RadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  theme,
  onChange,
  describedBy,
}: {
  legend: string;
  name: string;
  options: { value: T; label: string }[];
  value?: T;
  theme: ClientTheme;
  onChange: (value: T) => void;
  describedBy?: string;
}) {
  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="text-sm font-bold">{legend}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className="focus-within:ring-2 focus-within:ring-[var(--wine)] focus-within:ring-offset-2 flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition"
              style={{
                borderColor: selected ? theme.primary : theme.border,
                backgroundColor: selected ? theme.secondary : theme.surface,
                color: theme.text,
              }}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="size-4 accent-[var(--wine)]"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PreferencesStep({
  finish,
  appointmentFeel,
  theme,
  showError,
  onFinishChange,
  onAppointmentFeelChange,
}: {
  finish?: ClientFinishPreference;
  appointmentFeel?: ClientAppointmentFeel;
  theme: ClientTheme;
  showError: boolean;
  onFinishChange: (value: ClientFinishPreference) => void;
  onAppointmentFeelChange: (value: ClientAppointmentFeel) => void;
}) {
  const invalid = showError && (!finish || !appointmentFeel);
  return (
    <div className="page-enter">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.muted }}>Your preferences</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">A little about what feels right.</h1>
      <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>These preferences help your professional understand your style and the kind of appointment you enjoy.</p>
      <div className="mt-7 space-y-7">
        <RadioGroup legend="Preferred finish" name="finish" options={finishOptions} value={finish} theme={theme} onChange={onFinishChange} describedBy={invalid ? "preferences-error" : undefined} />
        <RadioGroup legend="How do you like your appointments to feel?" name="appointment-feel" options={feelOptions} value={appointmentFeel} theme={theme} onChange={onAppointmentFeelChange} describedBy={invalid ? "preferences-error" : undefined} />
      </div>
      <p id="preferences-error" className="mt-4 text-xs font-semibold text-[var(--warning)]" hidden={!invalid}>Choose one option in each group before continuing.</p>
    </div>
  );
}
