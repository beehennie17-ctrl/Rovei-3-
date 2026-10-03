import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import type { ClientStatusFilter } from "@/types/clients";

const statusFilters: { value: ClientStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "waiting", label: "Waiting" },
  { value: "complete", label: "Complete" },
  { value: "draft", label: "Draft" },
];

export function ClientsToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string;
  status: ClientStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ClientStatusFilter) => void;
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="relative">
        <label htmlFor="client-search" className="sr-only">Search clients</label>
        <Search
          size={17}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
        />
        <Input
          id="client-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search clients..."
          className="pl-11 pr-11"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear client search"
            className="focus-ring absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"
          >
            <X size={15} aria-hidden />
          </button>
        )}
      </div>

      <div role="group" aria-label="Filter clients by status" className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const active = status === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={active}
              onClick={() => onStatusChange(filter.value)}
              className={`focus-ring motion-soft rounded-full border px-3.5 py-2 text-xs font-bold ${
                active
                  ? "border-[var(--wine)] bg-[var(--wine)] text-white"
                  : "border-[var(--border-soft)] bg-white text-[var(--text-secondary)] hover:border-[var(--blush)] hover:bg-[var(--wine-soft)] hover:text-[var(--wine)]"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
