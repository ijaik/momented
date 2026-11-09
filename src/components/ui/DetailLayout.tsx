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
      <header className="my-8 md:my-12 border-b border-line/70 pb-8 md:pb-10">
        {backLink && (
          <div className="mb-5">
            <Link
              href={backLink.href}
              className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted transition-colors hover:text-ink active:scale-95"
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
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl font-medium leading-[1.06] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3.5 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          {meta && (
            <span className="editorial-label text-muted/90 tabular-nums shrink-0">
              {meta}
            </span>
          )}
        </div>
      </header>
      {children}
    </>
  );
}
