import type { ReactNode } from "react";
interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  className?: string;
}
export default function PageHeader({
  title,
  description,
  meta,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`mb-12 md:mb-16 ${className}`}>
      <div className="flex flex-col gap-6 border-b border-line pb-10 md:flex-row md:items-end md:justify-between md:gap-16">
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {(description || meta) && (
          <div className="flex max-w-md flex-col gap-3 md:items-end md:text-right">
            {description && (
              <p className="text-[15px] leading-relaxed text-muted md:text-base">
                {description}
              </p>
            )}
            {meta && (
              <p className="flex items-center gap-2 text-sm text-muted md:justify-end">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 rounded-full bg-signal"
                />
                {meta}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}