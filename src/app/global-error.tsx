"use client";
import { useEffect } from "react";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center font-sans">
      <span className="font-leckerli text-3xl tracking-tight text-zinc-900 dark:text-white mb-4">
        Momented
      </span>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
        Something went wrong
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Try again
      </button>
    </main>
  );
}
