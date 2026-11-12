import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  id?: string;
  label?: string;
  title: string;
  description?: ReactNode;
  action?: {
    href: string;
    label: string;
  };
  className?: string;
}
export default function SectionHeader({
  id,
  label,
  title,
  description,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-10 sm:mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end ${className}`}
    >
      <div>
        {label && (
          <span className="editorial-label text-ink font-medium">{label}</span>
        )}
        <h2
          id={id}
          className="font-serif text-3xl tracking-tight text-ink sm:text-4xl md:text-[2.75rem] leading-[1.08] font-normal"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted transition-colors hover:text-ink"
        >
          <span>{action.label}</span>
          <ArrowRight
            size={13}
            className="transition-transform duration-150 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
