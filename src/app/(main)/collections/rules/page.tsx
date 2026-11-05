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
      <JsonLd
        data={[
          hubPageJsonLd({
            title: "Rule Collections — Composition Constraints",
            description:
              "Moments made under a deliberate constraint — one photography rule at a time.",
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
        badge="02 / Curated Lenses"
        title="Composition Rules"
        description="Moments made under deliberate geometric and optical constraints — rule of thirds, framing, and leading lines."
        meta={
          count > 0 ? `${count} ${count === 1 ? "rule" : "rules"}` : undefined
        }
      />
      <CollectionsTabs activeTab="rules" />
      {count > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {displayCollections.map((col) => (
            <CoverCard
              key={col.id}
              item={col}
              href={`/collections/rules/${col.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="Nothing here yet — this view is still waiting for its first collection." />
      )}
    </>
  );
}
