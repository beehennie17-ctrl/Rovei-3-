import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";

export function StudioIdentitySection({
  studioName,
  error,
  onChange,
  onBlur,
}: {
  studioName: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">01 · Studio identity</p>
      <h2 className="section-title mt-3">The name clients see.</h2>
      <p className="caption mt-2 max-w-xl">Keep the same identity across the client-facing Rovei experience.</p>
      <div className="mt-5 max-w-xl">
        <Field label="Studio name" htmlFor="studio-settings-name" hint="2–60 characters">
          <Input
            id="studio-settings-name"
            value={studioName}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            maxLength={60}
            autoComplete="organization"
            placeholder="Lash & Co."
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "studio-settings-name-error" : "studio-settings-name-help"}
          />
        </Field>
        {error ? (
          <p id="studio-settings-name-error" className="mt-2 text-xs font-semibold text-[var(--wine)]" role="status">{error}</p>
        ) : (
          <p id="studio-settings-name-help" className="caption mt-2">This is the name clients see in their Rovei experience.</p>
        )}
      </div>
    </Card>
  );
}
