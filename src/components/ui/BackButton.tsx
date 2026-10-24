"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1)
      router.back();
    else router.push("/");
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className="my-8 md:my-10 group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
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
