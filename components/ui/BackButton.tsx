"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
interface BackButtonProps {
  label?: string;
  className?: string;
}
export default function BackButton({
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={`group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink ${className}`}
    >
      <ArrowLeft
        size={16}
        aria-hidden="true"
        className="transition-transform group-hover:-translate-x-0.5"
      />
      {label}
    </button>
  );
}