import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
}
export default function PageHeader({
  title,
  subtitle,
  description,
}: PageHeaderProps) {
  return (
    <header className="mb-12 md:mb-16 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl md:text-2xl font-medium text-zinc-600 dark:text-zinc-400 tracking-tight">
          {subtitle}
        </p>
      )}
      {description && (
        <p className="text-base text-zinc-500 dark:text-zinc-400 mt-2">
          {description}
        </p>
      )}
    </header>
  );
}
