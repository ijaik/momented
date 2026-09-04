"use client";
import { useRouter } from "next/navigation";
import { Icons } from "./Icons";

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
      <Icons.ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}
