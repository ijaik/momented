"use client";
import { useEffect } from "react";
import "./globals.css";
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
      <body className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink font-sans">
        <p className="font-script text-2xl tracking-tight">Momented</p>
        <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          An unexpected error occurred while loading this page. Please try
          again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-solid px-5 py-2.5 text-sm font-medium text-on-solid shadow-xs transition-all duration-100 ease-out hover:opacity-90 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
