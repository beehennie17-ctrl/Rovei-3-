import Link from "next/link";
import { ArrowRight, SearchX, UserRoundPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClientStatusFilter } from "@/types/clients";

export function ClientDirectoryNoResults({
  search,
  status,
  onClearSearch,
  onViewAll,
}: {
  search: string;
  status: ClientStatusFilter;
  onClearSearch: () => void;
  onViewAll: () => void;
}) {
  return (
    <Card className="grid min-h-64 place-items-center border-dashed p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden>
          <SearchX size={18} />
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-[-0.025em]">No clients found.</h2>
        <p className="body-text mt-2">Try another name, service or status.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {search.trim() && (
            <button
              type="button"
              onClick={onClearSearch}
              className="focus-ring motion-soft rounded-full border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--wine)] hover:border-[var(--blush)] hover:bg-[var(--wine-soft)]"
            >
              Clear search
            </button>
          )}
          {status !== "all" && (
            <button
              type="button"
              onClick={onViewAll}
              className="focus-ring motion-soft rounded-full border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--wine)] hover:border-[var(--blush)] hover:bg-[var(--wine-soft)]"
            >
              View all clients
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ClientDirectoryEmptyState() {
  return (
    <Card className="grid min-h-72 place-items-center border-dashed p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden>
          <UserRoundPlus size={18} />
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-[-0.025em]">Your client list starts here.</h2>
        <p className="body-text mt-2">Add your first client and Rovei. will keep their consultations, preferences and visits together from day one.</p>
        <Link
          href="/app/clients/new"
          className="focus-ring motion-soft mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--wine)] bg-[var(--wine)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]"
        >
          Add first client <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
