"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  const handleBack = () => {
    if (
      typeof document !== "undefined" &&
      document.referrer.startsWith(window.location.origin)
    )
      router.back();
    else router.push("/");
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className="my-8 md:my-10 group inline-flex items-center gap-2 rounded-full px-3 py-1.5 -ml-3 text-sm font-medium text-muted transition-all duration-100 hover:bg-soft/70 hover:text-ink active:scale-95"
    >
      <ArrowLeft
        size={16}
        aria-hidden="true"
        className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
      />
      {label}
    </button>
  );
}
