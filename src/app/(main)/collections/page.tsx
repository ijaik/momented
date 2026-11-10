import type { Metadata } from "next";
import CollectionsTabs from "@/components/collections/CollectionsTabs";
import JsonLd from "@/components/seo/JsonLd";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";
import { getCuratedCollections } from "@/lib/db/queries";
import { breadcrumbJsonLd, hubPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Thematic Collections",
  description: "Photographs grouped by atmosphere, texture, and mood.",
  path: "/collections",
});
export default async function CollectionsPage() {
  const { data: curatedCollections } = await getCuratedCollections();
  const displayCollections = curatedCollections ?? [];
  const count = displayCollections.length;
  return (
    <>
      <JsonLd
        data={[
          hubPageJsonLd({
            title: "Thematic Collections",
            description:
              "Photographs grouped by atmosphere, texture, and mood.",
            url: `${siteConfig.url}/collections`,
            items: displayCollections.map((col) => ({
              name: col.title,
              description: col.description,
              url: `${siteConfig.url}/collections/${col.id}`,
              image: col.photos?.[0]?.cloudinary_url,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Collections", url: `${siteConfig.url}/collections` },
          ]),
        ]}
      />
      <PageHeader
        badge="02 / Themes"
        title="Thematic Collections"
        description="Photographs grouped by atmosphere, texture, and mood."
        meta={
          count > 0 ? `${count} ${count === 1 ? "theme" : "themes"}` : undefined
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
              preload={index < 2}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No collections have been added yet." />
      )}
    </>
  );
}
