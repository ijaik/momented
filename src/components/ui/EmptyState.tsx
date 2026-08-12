import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description: ReactNode;
  className?: string;
}
export default function EmptyState({
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-20 px-6 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 ${className}`}
    >
      {title && (
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      )}
      <p className="text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}
