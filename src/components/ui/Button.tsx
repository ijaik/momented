import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
  isLoading?: boolean;
  loadingText?: ReactNode;
  children: ReactNode;
}
export default function Button({
  variant = "primary",
  isLoading,
  loadingText,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary:
      "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 py-3 px-6",
    secondary:
      "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 py-2 px-6",
    danger:
      "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 py-2.5 px-5 text-sm",
    ghost:
      "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-4 py-2",
    link: "bg-transparent text-blue-600 dark:text-blue-400 hover:underline p-0",
  };
  return (
    <button
      disabled={isLoading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? loadingText || children : children}
    </button>
  );
}
