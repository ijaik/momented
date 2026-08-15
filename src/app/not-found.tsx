import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center font-sans">
      <span className="font-leckerli text-3xl tracking-tight text-zinc-900 dark:text-white mb-4">
        Momented
      </span>
      <h1 className="text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-3">
        404
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
        This moment doesn&apos;t exist, or it may have been moved.
      </p>
      <Link
        href="/"
        className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Back to Photos
      </Link>
    </main>
  );
}
