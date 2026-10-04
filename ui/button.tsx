import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
      | "primary"
      | "secondary"
      | "ghost";

    size?: "sm" | "md";
    icon?: ReactNode;
  };

export function Button({
  variant = "primary",
  size = "md",
  icon,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary:
      "border-[var(--wine)] bg-[var(--wine)] text-white shadow-[0_9px_22px_rgba(148,22,81,0.14)] hover:-translate-y-0.5 hover:bg-[var(--wine-hover)] hover:shadow-[0_12px_26px_rgba(148,22,81,0.18)]",

    secondary:
      "border-[var(--border-soft)] bg-[var(--cream)] text-[var(--wine)] shadow-[0_6px_18px_rgba(148,22,81,0.05)] hover:-translate-y-0.5 hover:border-[var(--blush)] hover:bg-[var(--rose-wash)]",

    ghost:
      "border-transparent bg-transparent text-[var(--text-primary)] hover:bg-[var(--wine-soft)]",
  }[variant];

  const sizeClass =
    size === "sm"
      ? "h-9 px-3.5 text-sm"
      : "h-11 px-5 text-sm";

  return (
    <button
      type={type}
      className={`focus-ring motion-soft pressable inline-flex items-center justify-center gap-2 rounded-full border font-bold ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
