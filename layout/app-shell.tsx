"use client";

import { usePathname } from "next/navigation";
import { Home, CalendarDays, Users, Gift, Store, Settings, Plus } from "lucide-react";
import { Wordmark } from "@/components/branding/wordmark";
import { Avatar } from "@/components/ui/avatar";
import { NavItem } from "./nav-item";

const desktopItems = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/beauty-packs", label: "Beauty Packs", icon: Gift },
  { href: "/app/studio", label: "Studio", icon: Store },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mobileNewActive = pathname === "/app/clients/new" || pathname.startsWith("/app/clients/new/");
  const mobileClientsActive = pathname.startsWith("/app/clients") && !mobileNewActive;

  return <div className="min-h-dvh bg-[var(--surface-muted)]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] border-r border-[var(--border-soft)] bg-[var(--sidebar-surface)] px-4 py-6 lg:flex lg:flex-col">
      <div className="px-2"><Wordmark /></div>
      <nav className="mt-9 space-y-1.5" aria-label="Primary navigation">{desktopItems.map((item) => <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />)}</nav>
      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white p-3"><Avatar initials="MR" size="sm" /><div className="min-w-0"><p className="truncate text-xs font-bold">Mia Rhodes</p><p className="caption truncate">Studio owner</p></div></div>
      </div>
    </aside>

    <div className="lg:pl-[228px]">
      <div className="mx-auto min-h-dvh max-w-[1480px] px-[var(--page-gutter)] pb-28 pt-8 sm:pt-10 lg:pb-16 lg:pt-12"><main className="page-enter">{children}</main></div>
    </div>

    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[26px] border border-[var(--border-soft)] bg-white/95 p-1.5 shadow-[var(--shadow-soft)] backdrop-blur-md lg:hidden" aria-label="Mobile navigation">
      <NavItem href="/app" label="Home" icon={Home} active={pathname === "/app"} compact />
      <NavItem href="/app/clients" label="Clients" icon={Users} active={mobileClientsActive} compact />
      <NavItem href="/app/clients/new" label="New" icon={Plus} active={mobileNewActive} compact />
      <NavItem href="/app/schedule" label="Schedule" icon={CalendarDays} active={pathname.startsWith("/app/schedule")} compact />
      <NavItem href="/app/studio" label="Studio" icon={Store} active={pathname.startsWith("/app/studio") || pathname.startsWith("/app/settings")} compact />
    </nav>
  </div>;
}
