import type { Metadata } from "next";
import CollectionHubView from "@/components/collections/CollectionHubView";
import { siteConfig } from "@/config/site";
import { getCalendarCollectionsList } from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Calendar Collections",
  description: "Photographs grouped by the month they were taken.",
  path: "/collections/calendar",
});
export default async function CalendarCollectionsPage() {
  const { data: calendarCollections } = await getCalendarCollectionsList();
  const displayCollections = (calendarCollections ?? []).filter(
    (col) => col.photos && col.photos.length > 0,
  );
  return (
    <CollectionHubView
      activeTab="calendar"
      badge="02 / Calendar"
      title="Photographs by Month"
      description="Photographs organized by the month they were taken."
      countLabel={{ singular: "active month", plural: "active months" }}
      emptyMessage="No calendar collections have been added yet."
      baseHref="/collections/calendar"
      items={displayCollections}
      breadcrumbs={[
        { name: "Collections", url: `${siteConfig.url}/collections` },
        {
          name: "Calendar Collections",
          url: `${siteConfig.url}/collections/calendar`,
        },
      ]}
    />
  );
}
