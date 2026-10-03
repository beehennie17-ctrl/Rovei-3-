import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  icon?: ReactNode;
};

export function Button({ variant = "primary", size = "md", icon, type = "button", className = "", children, ...props }: ButtonProps) {
  const variantClass = {
    primary: "bg-[var(--wine)] text-white border-[var(--wine)] hover:bg-[var(--wine-hover)]",
    secondary: "bg-white text-[var(--wine)] border-[var(--border-soft)] hover:border-[var(--blush)] hover:bg-[var(--wine-soft)]",
    ghost: "bg-transparent text-[var(--text-primary)] border-transparent hover:bg-[var(--wine-soft)]",
  }[variant];
  const sizeClass = size === "sm" ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-sm";

  return (
    <button type={type} className={`focus-ring motion-soft pressable inline-flex items-center justify-center gap-2 rounded-full border font-semibold ${variantClass} ${sizeClass} ${className}`} {...props}>
      {icon}{children}
    </button>
  );
}
