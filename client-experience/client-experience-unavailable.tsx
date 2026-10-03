import { Link2Off } from "lucide-react";

export function ClientExperienceUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-muted)] px-5 py-10">
      <section className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden="true">
          <Link2Off size={20} />
        </span>
        <p className="eyebrow mt-6">Client experience</p>
        <h1 className="page-title mt-3">This client experience isn&apos;t available.</h1>
        <p className="body-text mx-auto mt-4 max-w-md">This preview link may no longer be active in this browser.</p>
        <p className="caption mt-7">Powered by Rovei.</p>
      </section>
    </main>
  );
}
