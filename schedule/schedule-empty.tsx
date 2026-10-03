import Link from "next/link";
import { Plus } from "lucide-react";

export function ScheduleEmpty() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--mauve)] bg-white p-7 text-center sm:p-10">
      <h3 className="section-title">Your schedule is clear.</h3>
      <p className="body-text mx-auto mt-2 max-w-md">No clients are scheduled for this day.</p>
      <Link
        href="/app/clients/new"
        className="focus-ring motion-soft mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--wine)] hover:border-[var(--blush)] hover:bg-[var(--wine-soft)]"
      >
        <Plus size={15} aria-hidden /> Add client
      </Link>
    </div>
  );
}
