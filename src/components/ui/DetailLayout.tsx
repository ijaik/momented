import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface DetailLayoutProps {
  badge?: string;
  title?: string;
  description?: string | null;
  meta?: ReactNode;
  backLink?: { href: string; label: string };
  children: ReactNode;
}
export default function DetailLayout({
  badge,
  title,
  description,
  meta,
  backLink,
  children,
}: DetailLayoutProps) {
  return (
    <>
      <header className="my-8 md:my-12 border-b border-line pb-8 md:pb-10">
        {backLink && (
          <div className="mb-5">
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
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-soft/70 px-3 py-1 text-xs font-medium text-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal animate-pulse"
            />
            <span>{badge}</span>
          </div>
        )}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl font-medium leading-[1.08] tracking-tight text-ink sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3.5 max-w-2xl whitespace-pre-wrap text-[15px] leading-relaxed text-muted md:text-base">
                {description}
              </p>
            )}
          </div>
          {meta && (
            <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line/80 bg-soft/50 px-3.5 py-1.5 text-xs font-mono text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
              />
              <span>{meta}</span>
            </div>
          )}
        </div>
      </header>
      {children}
    </>
  );
}
