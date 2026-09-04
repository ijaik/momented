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
    sm: "px-3.5 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
  };
  const variants = {
    primary: "bg-solid text-on-solid hover:opacity-85 active:opacity-100",
    secondary: "border border-line bg-surface text-ink hover:bg-soft",
    danger: "bg-danger-soft text-danger hover:brightness-[0.97]",
    ghost: "text-muted hover:text-ink hover:bg-soft",
  };
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {isLoading ? loadingText || children : children}
    </button>
  );
}
