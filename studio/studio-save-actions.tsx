import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudioSaveActions({
  dirty,
  valid,
  saved,
  error,
  onDiscard,
}: {
  dirty: boolean;
  valid: boolean;
  saved: boolean;
  error: string;
  onDiscard: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-4 shadow-[var(--shadow-card)] sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
      <div className="min-h-8">
        {error ? (
          <p role="status" className="text-sm font-semibold text-[var(--wine)]">{error}</p>
        ) : saved ? (
          <p role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--success)]"><Check size={16} aria-hidden="true" /> Saved</p>
        ) : dirty ? (
          <p className="text-sm font-semibold text-[var(--warning)]">Unsaved changes</p>
        ) : (
          <p className="caption">Your saved Studio configuration is up to date.</p>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row">
        {dirty && (
          <Button type="button" variant="secondary" icon={<RotateCcw size={15} aria-hidden="true" />} onClick={onDiscard}>Discard changes</Button>
        )}
        <Button type="submit" disabled={!valid || !dirty} className="disabled:cursor-not-allowed disabled:opacity-45">Save studio changes</Button>
      </div>
    </div>
  );
}
