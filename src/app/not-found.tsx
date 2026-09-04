import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-script text-2xl tracking-tight text-ink">Momented</p>
      <h1 className="mt-6 font-serif text-6xl font-medium tracking-tight text-ink sm:text-7xl">
        404
      </h1>
      <p className="mt-4 max-w-sm leading-relaxed text-muted">
        This moment doesn&apos;t exist, or it may have been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-solid px-5 py-2.5 text-sm font-medium text-on-solid transition-opacity hover:opacity-85"
      >
        Back to the photographs
      </Link>
    </main>
  );
}
