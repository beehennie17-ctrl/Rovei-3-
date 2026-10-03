import Link from "next/link";
import { ArrowRight, UserRoundPlus } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DashboardEmptyState() {
  return (
    <Card className="grid min-h-72 place-items-center border-dashed p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden>
          <UserRoundPlus size={18} />
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-[-0.025em]">Your first client starts here.</h2>
        <p className="body-text mt-2">Add a client and Rovei. will create the experience you’ll send before their appointment.</p>
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

export function AttentionEmptyState() {
  return (
    <Card className="p-5 sm:p-6">
      <p className="font-bold">Everyone is ready.</p>
      <p className="body-text mt-2">Your upcoming clients have completed what they need to.</p>
    </Card>
  );
}
