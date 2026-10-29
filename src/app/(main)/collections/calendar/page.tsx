import type { Metadata } from "next";
import CollectionsTabs from "@/components/collections/CollectionsTabs";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getCalendarCollectionsList } from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Calendar Collections",
  description:
    "Moments as they happened, grouped by the month they were captured.",
  path: "/collections/calendar",
});
export default async function CalendarCollectionsPage() {
  const { data: calendarCollections } = await getCalendarCollectionsList();
  const displayCollections = (calendarCollections ?? []).filter(
    (col) => col.photos && col.photos.length > 0,
  );
  const count = displayCollections.length;
  return (
    <>
      <PageHeader
        title="Calendar Collections"
        description="Moments as they happened, grouped by the month they were captured."
        meta={
          count > 0
            ? `${count} ${count === 1 ? "collection" : "collections"}`
            : undefined
        }
      />
      <CollectionsTabs activeTab="calendar" />
      {count > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {displayCollections.map((col, index) => (
            <CoverCard
              key={col.id}
              item={col}
              href={`/collections/calendar/${col.id}`}
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
