import Link from "next/link";
export type CollectionTabKey = "curated" | "rules" | "calendar";
const TAB_LABELS: { key: CollectionTabKey; name: string; href: string }[] = [
  { key: "curated", name: "Curated", href: "/collections" },
  { key: "rules", name: "Rules", href: "/collections/rules" },
  { key: "calendar", name: "Calendar", href: "/collections/calendar" },
];
export default function CollectionsTabs({
  activeTab,
}: {
  activeTab: CollectionTabKey;
}) {
  return (
    <div className="mb-10 -mt-2 flex gap-8 overflow-x-auto overflow-y-hidden border-b border-line">
      {TAB_LABELS.map((t) => {
        const isActive = t.key === activeTab;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative -mb-px whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-all duration-100 active:scale-95 ${
              isActive
                ? "border-signal text-ink font-semibold"
                : "border-transparent text-muted hover:border-line hover:text-ink"
            }`}
          >
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}
