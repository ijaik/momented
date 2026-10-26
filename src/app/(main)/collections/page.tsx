import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import {
  getCalendarCollectionsList,
  getCuratedCollections,
  getRuleCollectionsList,
} from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { BaseCollection, PageProps } from "@/types";

function resolveTab(tab?: string): keyof typeof TAB_TITLES {
  return tab === "calendar"
    ? "calendar"
    : tab === "rules"
      ? "rules"
      : "curated";
}
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
  const activeTab = resolveTab(tab);
  const { title, description } = TAB_TITLES[activeTab];
  const path =
    activeTab === "curated" ? "/collections" : `/collections?tab=${activeTab}`;
  return buildPageMetadata({
    title,
    description,
    path,
  });
}
const TAB_LABELS: { key: string; name: string; href: string }[] = [
  { key: "curated", name: "Curated", href: "/collections" },
  { key: "rules", name: "Rules", href: "/collections?tab=rules" },
  { key: "calendar", name: "Calendar", href: "/collections?tab=calendar" },
];
function CollectionsFallback() {
  return (
    <div className="my-16 animate-pulse">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-44 rounded-xs bg-muted/20" />
        <div className="h-4 w-80 rounded-xs bg-muted/15" />
      </div>
      <div className="mb-10 flex gap-8 border-b border-line pb-3">
        <div className="h-4 w-16 rounded-xs bg-muted/20" />
        <div className="h-4 w-16 rounded-xs bg-muted/15" />
        <div className="h-4 w-16 rounded-xs bg-muted/15" />
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-4/3 rounded-xl border border-line/60 bg-soft/70"
          />
        ))}
      </div>
    </div>
  );
}
async function CollectionsView({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = resolveTab(tab);
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
    <>
      <PageHeader
        title={TAB_TITLES[activeTab].title}
        description={TAB_TITLES[activeTab].description}
        meta={
          count > 0
            ? `${count} ${count === 1 ? "collection" : "collections"}`
            : undefined
        }
      />
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
    </>
  );
}
export default function CollectionsPage({
  searchParams,
}: PageProps<Record<string, never>, { tab?: string }>) {
  return (
    <Suspense fallback={<CollectionsFallback />}>
      <CollectionsView searchParams={searchParams} />
    </Suspense>
  );
}
