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
      className="mb-10 sm:mb-12 flex items-center justify-start overflow-x-auto border-b border-line/70"
    >
      <div className="flex items-center gap-7 sm:gap-9">
        {TAB_LABELS.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative pb-3.5 text-xs sm:text-sm font-medium uppercase tracking-wider transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? "text-ink font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-ink"
                  : "text-muted hover:text-ink"
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
