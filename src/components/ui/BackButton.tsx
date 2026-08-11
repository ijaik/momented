"use client";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
export default function BackButton() {
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
      aria-label="Go Back"
      title="Go Back"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all mb-8"
    >
      <Icons.ArrowLeft className="w-5 h-5" />
    </button>
  );
}
