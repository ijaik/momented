import type { Metadata } from "next";
import CollectionsTabs from "@/components/collections/CollectionsTabs";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getCuratedCollections } from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Collections",
  description:
    "Moments gathered by hand — themes and moods curated on Momented.",
  path: "/collections",
});
export default async function CollectionsPage() {
  const { data: curatedCollections } = await getCuratedCollections();
  const displayCollections = curatedCollections ?? [];
  const count = displayCollections.length;
  return (
    <>
      <PageHeader
        title="Collections"
        description="Moments gathered by hand — themes and moods curated on Momented."
        meta={
          count > 0
            ? `${count} ${count === 1 ? "collection" : "collections"}`
            : undefined
        }
      />
      <CollectionsTabs activeTab="curated" />
      {count > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {displayCollections.map((col, index) => (
            <CoverCard
              key={col.id}
              item={col}
              href={`/collections/${col.id}`}
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
