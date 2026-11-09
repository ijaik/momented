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
      className={`flex flex-col items-center justify-center gap-2.5 py-24 text-center ${className}`}
    >
      {title && (
        <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
          {title}
        </h2>
      )}
      <p className="max-w-sm text-sm sm:text-base leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
