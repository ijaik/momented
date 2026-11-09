import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  label?: string;
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: {
    href: string;
    label: string;
  };
  className?: string;
}
export default function SectionHeader({
  label,
  icon: Icon,
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
          <div className="mb-3 flex items-center gap-2.5">
            {Icon && (
              <Icon
                size={14}
                className="text-signal/90 shrink-0"
                aria-hidden="true"
              />
            )}
            <span className="editorial-label text-signal/90 font-medium">
              {label}
            </span>
          </div>
        )}
        <h2 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl md:text-[2.75rem] leading-[1.08]">
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
          className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted transition-colors hover:text-ink active:scale-95"
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
