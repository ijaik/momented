import Link from "next/link";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  href?: string;
  className?: string;
}
export default function Badge({ children, href, className = "" }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:outline-none";
  const combinedClassName = `${baseStyles} ${className}`;
  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }
  return <span className={combinedClassName}>{children}</span>;
}
