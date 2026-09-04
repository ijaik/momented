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
    <header className={`mb-12 border-b border-line pb-8 md:mb-14 ${className}`}>
      <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl">
        {title}
      </h1>
      {(description || meta) && (
        <div className="mt-4 flex flex-col gap-1.5">
          {description && (
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted md:text-base">
              {description}
            </p>
          )}
          {meta && <p className="text-sm text-muted/80">{meta}</p>}
        </div>
      )}
    </header>
  );
}
