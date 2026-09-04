import type { Metadata } from "next";
import Link from "next/link";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import {
  getCalendarCollectionsList,
  getCuratedCollections,
  getRuleCollectionsList,
} from "@/lib/db/queries";
import type { BaseCollection, PageProps } from "@/types";
export const revalidate = 3600;
const TAB_TITLES: Record<string, { title: string; description: string }> = {
  curated: {
    title: "Collections",
    description:
      "Moments gathered by hand — themes and moods curated on Momented.",
  },
  rules: {
    title: "Rule Collections",
    description:
      "Moments made under a deliberate constraint — one photography rule at a time.",
  },
  calendar: {
    title: "Calendar Collections",
    description:
      "Moments as they happened, grouped by the month they were captured.",
  },
};
export async function generateMetadata({
  searchParams,
}: PageProps<Record<string, never>, { tab?: string }>): Promise<Metadata> {
  const { tab } = await searchParams;
  const active =
    tab === "calendar" ? "calendar" : tab === "rules" ? "rules" : "curated";
  const { title, description } = TAB_TITLES[active];
  return {
    title,
    description,
    alternates: {
      canonical:
        active === "curated" ? "/collections" : `/collections?tab=${active}`,
    },
  };
}
const TAB_LABELS: { key: string; name: string; href: string }[] = [
  { key: "curated", name: "Curated", href: "/collections" },
  { key: "rules", name: "Rules", href: "/collections?tab=rules" },
  { key: "calendar", name: "Calendar", href: "/collections?tab=calendar" },
];
export default async function CollectionsPage({
  searchParams,
}: PageProps<Record<string, never>, { tab?: string }>) {
  const { tab } = await searchParams;
  const activeTab =
    tab === "calendar" ? "calendar" : tab === "rules" ? "rules" : "curated";
  let displayCollections: BaseCollection[] | null = null;
  if (activeTab === "rules") {
    const { data } = await getRuleCollectionsList();
    displayCollections = data ?? null;
  } else if (activeTab === "calendar") {
    const { data } = await getCalendarCollectionsList();
    displayCollections = (data ?? []).filter(
      (col) => col.photos && col.photos.length > 0,
    );
  } else {
    const { data } = await getCuratedCollections();
    displayCollections = data ?? null;
  }
  const getHref = (id: string | number) => {
    if (activeTab === "calendar") return `/collections/calendar/${id}`;
    if (activeTab === "rules") return `/collections/rules/${id}`;
    return `/collections/${id}`;
  };
  const count = displayCollections?.length ?? 0;
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <PageHeader
        title={TAB_TITLES[activeTab].title}
        description={TAB_TITLES[activeTab].description}
        meta={
          count > 0
            ? `${count} ${count === 1 ? "collection" : "collections"}`
            : undefined
        }
      />
      <div className="mb-10 -mt-2 flex gap-7 overflow-x-auto overflow-y-hidden border-b border-line">
        {TAB_LABELS.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative -mb-px whitespace-nowrap border-b-2 py-3 text-sm transition-colors ${
                isActive
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {t.name}
            </Link>
          );
        })}
      </div>
      {displayCollections && displayCollections.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {displayCollections.map((col, index) => (
            <CoverCard
              key={col.id}
              item={col}
              href={getHref(col.id)}
              index={index}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="Nothing here yet — this view is still waiting for its first collection." />
      )}
    </main>
  );
}
