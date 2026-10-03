import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: ReactNode; description?: string; action?: ReactNode }) {
  return <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">{eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}<h1 className="page-title">{title}</h1>{description && <p className="body-text mt-3">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}
  </header>;
}

export function SectionHeader({ title, description, action }: { title: ReactNode; description?: string; action?: ReactNode }) {
  return <div className="flex items-end justify-between gap-4"><div><h2 className="section-title">{title}</h2>{description && <p className="caption mt-1.5">{description}</p>}</div>{action}</div>;
}
