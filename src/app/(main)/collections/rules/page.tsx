import type { Metadata } from "next";
import CollectionsTabs from "@/components/collections/CollectionsTabs";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getRuleCollectionsList } from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Rule Collections",
  description:
    "Moments made under a deliberate constraint — one photography rule at a time.",
  path: "/collections/rules",
});
export default async function RuleCollectionsPage() {
  const { data: ruleCollections } = await getRuleCollectionsList();
  const displayCollections = ruleCollections ?? [];
  const count = displayCollections.length;
  return (
    <>
      <PageHeader
        title="Rule Collections"
        description="Moments made under a deliberate constraint — one photography rule at a time."
        meta={
          count > 0
            ? `${count} ${count === 1 ? "collection" : "collections"}`
            : undefined
        }
      />
      <CollectionsTabs activeTab="rules" />
      {count > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {displayCollections.map((col, index) => (
            <CoverCard
              key={col.id}
              item={col}
              href={`/collections/rules/${col.id}`}
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
