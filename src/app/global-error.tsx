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
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-script text-2xl tracking-tight text-ink">Momented</p>
      <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-sm leading-relaxed text-muted">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center justify-center rounded-md bg-solid px-5 py-2.5 text-sm font-medium text-on-solid transition-opacity hover:opacity-85"
      >
        Try again
      </button>
    </main>
  );
}
