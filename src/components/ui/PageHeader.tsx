import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  backLink?: { href: string; label: string };
  action?: ReactNode;
  className?: string;
}
export default function PageHeader({
  badge,
  title,
  description,
  meta,
  backLink,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`my-8 sm:my-12 md:my-14 ${className}`}>
      {backLink && (
        <div className="mb-6">
          <Link
            href={backLink.href}
            className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted transition-colors hover:text-ink active:scale-95"
          >
            <ArrowLeft
              size={13}
              className="transition-transform duration-150 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            <span>{backLink.label}</span>
          </Link>
        </div>
      )}
      {badge && (
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-6 bg-signal/70" aria-hidden="true" />
          <span className="editorial-label text-signal/90 font-medium">
            {badge}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-6 border-b border-line/70 pb-8 md:flex-row md:items-end md:justify-between md:gap-12 sm:pb-10 md:pb-12">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl leading-[1.03] tracking-tight text-ink sm:text-5xl lg:text-6xl xl:text-7xl">
            {title}
          </h1>
          {description && (
            <div className="mt-3.5 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base lg:text-lg">
              {description}
            </div>
          )}
        </div>
        {(meta || action) && (
          <div className="flex shrink-0 flex-col items-start gap-4 md:items-end md:text-right">
            {action}
            {meta && (
              <span className="editorial-label text-muted/90 tabular-nums">
                {meta}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
