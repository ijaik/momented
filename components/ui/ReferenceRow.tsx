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
        className="group flex items-baseline justify-between gap-6 py-3"
      >
        <span className="text-[15px] text-ink underline decoration-line decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-ink">
          {link.title}
        </span>
        <span className="shrink-0 text-[13px] text-muted">{link.kind}</span>
      </Link>
    </li>
  );
}