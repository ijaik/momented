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
      className={`flex flex-col items-center justify-center gap-2 py-20 text-center ${className}`}
    >
      {title && (
        <h2 className="font-serif text-2xl font-medium text-ink">{title}</h2>
      )}
      <p className="max-w-sm text-[15px] leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
