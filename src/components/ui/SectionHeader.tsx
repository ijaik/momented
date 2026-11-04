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
      className={`mb-8 sm:mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end ${className}`}
    >
      <div>
        {label && (
          <div className="mb-2.5 flex items-center gap-2">
            {Icon && (
              <Icon
                size={15}
                className="text-signal shrink-0"
                aria-hidden="true"
              />
            )}
            <span className="text-xs font-mono uppercase tracking-widest text-signal">
              {label}
            </span>
          </div>
        )}
        <h2 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-signal hover:underline underline-offset-4 active:scale-95 transition-transform duration-100"
        >
          <span>{action.label}</span>
          <ArrowRight
            size={14}
            className="transition-transform duration-150 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
