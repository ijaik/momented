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
        className="group flex items-baseline justify-between gap-6 py-3.5 transition-transform duration-100 ease-out active:scale-95"
      >
        <span className="font-serif text-[15px] sm:text-base text-ink underline decoration-line/80 decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-ink">
          {link.title}
        </span>
        <span className="shrink-0 editorial-label text-muted/80">
          {link.kind}
        </span>
      </Link>
    </li>
  );
}
