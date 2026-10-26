import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  label?: string;
  href?: string;
  fallback?: string;
  className?: string;
}
export default function BackButton({
  label = "Back",
  href,
  fallback,
  className = "",
}: BackButtonProps) {
  const lower = label.toLowerCase();
  const target =
    href ??
    fallback ??
    (lower.includes("series")
      ? "/series"
      : lower.includes("rule")
        ? "/collections?tab=rules"
        : lower.includes("calendar") || lower.includes("month")
          ? "/collections?tab=calendar"
          : lower.includes("collection")
            ? "/collections"
            : "/");
  return (
    <Link
      href={target}
      aria-label={label}
      className={`my-8 md:my-10 group inline-flex items-center gap-2 rounded-full px-3 py-1.5 -ml-3 text-sm font-medium text-muted transition-all duration-100 hover:bg-soft/70 hover:text-ink active:scale-95 ${className}`.trim()}
    >
      <ArrowLeft
        size={16}
        aria-hidden="true"
        className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
      />
      {label}
    </Link>
  );
}
