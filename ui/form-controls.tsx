import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

const fieldClass = "focus-ring h-12 w-full rounded-2xl border border-[var(--border-soft)] bg-white px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--mauve)] hover:border-[var(--blush)]";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={`${fieldClass} ${className}`} {...props} />; }
export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={`focus-ring min-h-28 w-full resize-y rounded-2xl border border-[var(--border-soft)] bg-white p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--mauve)] hover:border-[var(--blush)] ${className}`} {...props} />; }
export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={`${fieldClass} ${className}`} {...props}>{children}</select>; }

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="inline-flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-[var(--wine)]" {...props} /><span>{label}</span></label>;
}

export function RadioCard({ name, value, title, description, defaultChecked }: { name: string; value: string; title: string; description?: string; defaultChecked?: boolean }) {
  return <label className="group relative block cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white p-4 transition hover:border-[var(--blush)]">
    <input className="peer sr-only" type="radio" name={name} value={value} defaultChecked={defaultChecked} />
    <span className="absolute inset-0 rounded-[var(--radius-md)] ring-2 ring-transparent peer-checked:ring-[var(--wine)]" />
    <span className="block text-sm font-bold">{title}</span>{description && <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">{description}</span>}
  </label>;
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return <div><div className="mb-2 flex items-end justify-between gap-3"><label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label>{hint && <span className="caption">{hint}</span>}</div>{children}</div>;
}
