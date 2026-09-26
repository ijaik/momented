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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f6] px-6 text-center text-[#201e1a]">
        <p className="font-script text-2xl tracking-tight">Momented</p>
        <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#5c5750]">
          An unexpected error occurred while loading this page. Please try
          again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center rounded-md bg-[#201e1a] px-5 py-2.5 text-sm font-medium text-[#faf9f6] transition-opacity hover:opacity-85"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
