import Link from "next/link";
import { ArrowRight, Gift, Store, WalletCards, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const shortcuts: Array<{ href: string; title: string; description: string; icon: LucideIcon }> = [
  { href: "/app/studio", title: "Studio", description: "Manage your brand, services and client experience.", icon: Store },
  { href: "/app/beauty-packs", title: "Beauty Packs", description: "Manage reusable client-experience templates.", icon: Gift },
  { href: "/activate", title: "Activation & billing", description: "Review the Rovei Studio plan.", icon: WalletCards },
];

export function WorkspaceShortcuts() {
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">Workspace shortcuts</p>
      <h2 className="section-title mt-3">Manage the parts of Rovei that already work.</h2>
      <div className="mt-5 space-y-2.5">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="focus-ring motion-soft flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white p-4 hover:-translate-y-0.5 hover:border-[var(--blush)] hover:shadow-[var(--shadow-card)]"
              aria-label={`${shortcut.title}: ${shortcut.description}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden="true"><Icon size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{shortcut.title}</span>
                <span className="caption mt-1 block">{shortcut.description}</span>
              </span>
              <ArrowRight className="shrink-0 text-[var(--wine)]" size={16} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
