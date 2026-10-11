import Link from "next/link";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] px-5 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-soft)] pb-6">
          <Link href="/" className="text-3xl font-black tracking-[-0.06em] text-[var(--wine)]">Rovei.</Link>
          <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold text-[var(--text-secondary)]" aria-label="Support navigation">
            <Link href="/support">Help centre</Link>
            <Link href="/support/new?kind=ticket">Contact support</Link>
            <Link href="/support/new?kind=feedback">Feedback</Link>
            <Link href="/">Back to Studio →</Link>
          </nav>
        </header>
        <main className="py-10 sm:py-14">{children}</main>
      </div>
    </div>
  );
}
