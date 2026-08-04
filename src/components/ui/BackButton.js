import Link from "next/link";
export default function BackButton({ href, label }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm font-semibold tracking-wide text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-12 transition-colors uppercase"
    >
      &larr; {label}
    </Link>
  );
}
