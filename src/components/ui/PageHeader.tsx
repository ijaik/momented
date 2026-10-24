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
    <header className={`my-12 md:my-16 xl:my-20 ${className}`}>
      <div className="flex flex-col gap-6 border-b border-line pb-10 md:flex-row md:items-end md:justify-between md:gap-16 xl:pb-12">
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl xl:text-6xl">
          {title}
        </h1>
        {(description || meta) && (
          <div className="flex max-w-md flex-col gap-3 md:items-end md:text-right">
            {description && (
              <p className="text-[15px] leading-relaxed text-muted md:text-base xl:text-lg">
                {description}
              </p>
            )}
            {meta && (
              <p className="flex items-center gap-2 text-sm text-muted md:justify-end xl:text-base">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 rounded-full bg-signal xl:h-1.5 xl:w-1.5"
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
