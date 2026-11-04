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
    <header className={`my-10 sm:my-14 md:my-16 ${className}`}>
      {backLink && (
        <div className="mb-6">
          <Link
            href={backLink.href}
            className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-muted backdrop-blur-xs transition-all duration-150 hover:bg-soft hover:text-ink active:scale-95"
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
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-soft/70 px-3.5 py-1 text-xs font-medium text-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal animate-pulse"
          />
          <span>{badge}</span>
        </div>
      )}
      <div className="flex flex-col gap-6 border-b border-line pb-10 md:flex-row md:items-end md:justify-between md:gap-12 xl:pb-12">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl font-medium leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <div className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base lg:text-lg">
              {description}
            </div>
          )}
        </div>
        {(meta || action) && (
          <div className="flex shrink-0 flex-col items-start gap-4 md:items-end md:text-right">
            {action}
            {meta && (
              <div className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-soft/50 px-3.5 py-1.5 text-xs font-mono text-muted">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
                />
                <span>{meta}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
