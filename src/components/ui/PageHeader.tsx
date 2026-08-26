import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  description?: string;
}
export default function PageHeader({
  title,
  subtitle,
  description,
}: PageHeaderProps) {
  return (
    <header className="mb-12 md:mb-16 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-8 transition-colors">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
          {title}
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
          {subtitle || title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
