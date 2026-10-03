"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function NavItem({ href, label, icon: Icon, active = false, compact = false }: { href: string; label: string; icon: LucideIcon; active?: boolean; compact?: boolean }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={`focus-ring motion-soft group flex items-center gap-3 rounded-2xl font-semibold ${compact ? "flex-col gap-1 px-2 py-2 text-[10px]" : "px-3.5 py-3 text-sm"} ${active ? "bg-[var(--wine-soft)] text-[var(--wine)]" : "text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)]"}`}>
    <Icon size={compact ? 19 : 18} strokeWidth={active ? 2.3 : 1.8} />
    <span>{label}</span>
  </Link>;
}
