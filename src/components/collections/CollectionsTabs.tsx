import Link from "next/link";
export type CollectionTabKey = "curated" | "rules" | "calendar";
const TAB_LABELS: {
  key: CollectionTabKey;
  name: string;
  href: string;
}[] = [
  {
    key: "curated",
    name: "Themes",
    href: "/collections",
  },
  {
    key: "rules",
    name: "Composition Rules",
    href: "/collections/rules",
  },
  {
    key: "calendar",
    name: "Calendar Months",
    href: "/collections/calendar",
  },
];
export default function CollectionsTabs({
  activeTab,
}: {
  activeTab: CollectionTabKey;
}) {
  return (
    <nav
      aria-label="Collection categories"
      className="mb-10 sm:mb-12 flex items-center justify-start overflow-x-auto pb-2"
    >
      <div className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-soft/70 p-1.5 backdrop-blur-md shadow-2xs">
        {TAB_LABELS.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-150 ease-out active:scale-95 whitespace-nowrap ${
                isActive
                  ? "bg-surface text-ink shadow-xs font-semibold"
                  : "text-muted hover:text-ink hover:bg-surface/50"
              }`}
            >
              {t.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
