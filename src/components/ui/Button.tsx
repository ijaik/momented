import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  isLoading?: boolean;
  loadingText?: ReactNode;
  children: ReactNode;
}
export default function Button({
  variant = "primary",
  size = "md",
  isLoading,
  loadingText,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider gap-1.5 rounded-full",
    md: "px-5 py-2.5 text-xs font-mono uppercase tracking-wider gap-2 rounded-full",
  };
  const variants = {
    primary:
      "bg-solid text-on-solid shadow-xs hover:opacity-90 active:scale-95 font-semibold",
    secondary:
      "border border-line/80 bg-surface/80 backdrop-blur-xs text-ink hover:bg-soft active:scale-95 shadow-2xs font-medium",
    danger:
      "bg-danger-soft text-danger hover:brightness-[0.97] active:scale-95 font-medium",
    ghost:
      "border border-line/50 bg-soft/70 text-muted hover:text-ink hover:bg-soft active:scale-95 font-medium",
  };
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-100 ease-out select-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {isLoading ? loadingText || children : children}
    </button>
  );
}
