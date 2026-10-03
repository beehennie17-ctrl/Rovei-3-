import { useId, type ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-[var(--mauve)]/45 ${className}`} />;
}

export function ModalShell({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  const titleId = useId();
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <h2 id={titleId} className="section-title">{title}</h2>
      <div className="my-5">{children}</div>
      {footer}
    </div>
  );
}
