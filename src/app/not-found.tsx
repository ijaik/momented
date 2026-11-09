import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};
export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-6 bg-signal/70" aria-hidden="true" />
        <span className="editorial-label text-signal/90 font-medium">
          404 — Lost Frame
        </span>
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-ink">
        This moment slipped away.
      </h1>
      <p className="mt-3.5 max-w-sm text-sm sm:text-base leading-relaxed text-muted">
        The photograph or page you were looking for doesn&apos;t exist or has
        moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-xs font-medium uppercase tracking-wider text-paper shadow-xs transition-all duration-150 ease-out hover:opacity-90 active:scale-95"
      >
        Return to journal
      </Link>
    </main>
  );
}
