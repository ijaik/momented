import type { Metadata } from "next";
import CollectionsTabs from "@/components/collections/CollectionsTabs";
import JsonLd from "@/components/seo/JsonLd";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";
import { getRuleCollectionsList } from "@/lib/db/queries";
import { breadcrumbJsonLd, hubPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Composition Rules",
  description:
    "Photographs by rule of thirds, leading lines, framing, and more.",
  path: "/collections/rules",
});
export default async function RuleCollectionsPage() {
  const { data: ruleCollections } = await getRuleCollectionsList();
  const displayCollections = ruleCollections ?? [];
  const count = displayCollections.length;
  return (
    <>
      <JsonLd
        data={[
          hubPageJsonLd({
            title: "Composition Rules",
            description:
              "Photographs by rule of thirds, leading lines, framing, and more.",
            url: `${siteConfig.url}/collections/rules`,
            items: displayCollections.map((col) => ({
              name: col.title,
              description: col.description,
              url: `${siteConfig.url}/collections/rules/${col.id}`,
              image: col.photos?.[0]?.cloudinary_url,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Collections", url: `${siteConfig.url}/collections` },
            {
              name: "Rule Collections",
              url: `${siteConfig.url}/collections/rules`,
            },
          ]),
        ]}
      />
      <PageHeader
        badge="02 / Rules"
        title="Composition Rules"
        description="Photographs by rule of thirds, leading lines, framing, and more."
        meta={
          count > 0 ? `${count} ${count === 1 ? "rule" : "rules"}` : undefined
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
              preload={index < 2}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No rule collections have been added yet." />
      )}
    </>
  );
}
