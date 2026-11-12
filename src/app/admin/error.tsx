"use client";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);
  const isNetworkError =
    error.message?.includes("fetch failed") ||
    error.message?.includes("ENOTFOUND") ||
    error.message?.includes("timeout");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertCircle size={24} aria-hidden="true" />
      </div>
      <h2 className="font-serif text-2xl tracking-tight text-ink">
        {isNetworkError
          ? "Database connection interrupted"
          : "Could not load admin dashboard"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        {isNetworkError
          ? "The request to Supabase timed out or failed to resolve. Please check your connection and retry."
          : error.message ||
            "An unexpected error occurred while loading dashboard data."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-solid px-5 py-2.5 text-sm font-medium text-on-solid transition-all hover:opacity-90 active:scale-98"
      >
        <RefreshCw size={15} aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
