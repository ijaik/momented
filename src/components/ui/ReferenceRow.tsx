import Link from "next/link";
export interface ReferenceLink {
  id: string | number;
  title: string;
  href: string;
  kind: string;
}
export default function ReferenceRow({ link }: { link: ReferenceLink }) {
  return (
    <li>
      <Link
        href={link.href}
        className="group flex items-baseline justify-between gap-6 py-3 transition-opacity duration-150 hover:opacity-80"
      >
        <span className="font-sans text-sm sm:text-base font-medium text-ink underline decoration-line/80 decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-ink">
          {link.title}
        </span>
        <span className="shrink-0 editorial-label text-muted/80">
          {link.kind}
        </span>
      </Link>
    </li>
  );
}
