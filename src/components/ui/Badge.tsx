import Link from "next/link";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  href?: string;
  className?: string;
}
export default function Badge({ children, href, className = "" }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full border border-line bg-soft/70 px-3 py-1 text-[13px] text-muted transition-colors hover:border-ink/25 hover:text-ink";
  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${className}`}>
        {children}
      </Link>
    );
  }
  return <span className={`${baseStyles} ${className}`}>{children}</span>;
}
