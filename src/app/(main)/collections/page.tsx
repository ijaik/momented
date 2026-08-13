import type { Metadata } from "next";
import Link from "next/link";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import {
  getCalendarCollectionsList,
  getCuratedCollections,
  getRuleCollectionsList,
} from "@/lib/queries";
import type { BaseCollection, PageProps } from "@/types";
export const metadata: Metadata = { title: "Collections" };
export const revalidate = 3600;
export default async function CollectionsPage({
  searchParams,
}: PageProps<Record<string, never>, { tab?: string }>) {
  const { tab } = await searchParams;
  const activeTab =
    tab === "calendar" ? "calendar" : tab === "rules" ? "rules" : "curated";
  const [
    { data: curatedCollections },
    { data: ruleCollections },
    { data: calendarCollections },
  ] = await Promise.all([
    getCuratedCollections(),
    getRuleCollectionsList(),
    getCalendarCollectionsList(),
  ]);
  const activeCalendarCollections = (calendarCollections || []).filter(
    (col) => col.photos && col.photos.length > 0,
  );
  let displayCollections: BaseCollection[] | null = curatedCollections;
  if (activeTab === "rules") {
    displayCollections = ruleCollections;
  } else if (activeTab === "calendar") {
    displayCollections = activeCalendarCollections;
  }
  const tabs = [
    {
      name: "Curated",
      href: "/collections",
      isActive: activeTab === "curated",
    },
    {
      name: "Rules",
      href: "/collections?tab=rules",
      isActive: activeTab === "rules",
    },
    {
      name: "Calendar",
      href: "/collections?tab=calendar",
      isActive: activeTab === "calendar",
    },
  ];
  const getHref = (id: string | number) => {
    if (activeTab === "calendar") return `/collections/calendar/${id}`;
    if (activeTab === "rules") return `/collections/rules/${id}`;
    return `/collections/${id}`;
  };
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <PageHeader
        title="Collections"
        subtitle={
          <>
            Collections of{" "}
            <span className="font-leckerli tracking-tight">Momented</span>.
          </>
        }
      />
      <div className="w-full mb-10">
        <nav
          className="flex w-full border-b border-zinc-200 dark:border-zinc-800"
          aria-label="Collection views"
        >
          {tabs.map((tabItem) => (
            <Link
              key={tabItem.name}
              href={tabItem.href}
              aria-current={tabItem.isActive ? "page" : undefined}
              className={`w-1/3 text-center py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tabItem.isActive
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {tabItem.name}
            </Link>
          ))}
        </nav>
      </div>
      {displayCollections && displayCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <EmptyState description="No collections found for this view." />
      )}
    </main>
  );
}
