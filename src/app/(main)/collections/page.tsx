import type { Metadata } from "next";
import CollectionHubView from "@/components/collections/CollectionHubView";
import { siteConfig } from "@/config/site";
import { getCuratedCollections } from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Thematic Collections",
  description: "Photographs grouped by atmosphere, texture, and mood.",
  path: "/collections",
});
export default async function CollectionsPage() {
  const { data: curatedCollections } = await getCuratedCollections();
  const displayCollections = curatedCollections ?? [];
  return (
    <CollectionHubView
      activeTab="curated"
      badge="02 / Themes"
      title="Thematic Collections"
      description="Photographs grouped by atmosphere, texture, and mood."
      countLabel={{ singular: "theme", plural: "themes" }}
      emptyMessage="No collections have been added yet."
      baseHref="/collections"
      items={displayCollections}
      breadcrumbs={[
        { name: "Collections", url: `${siteConfig.url}/collections` },
      ]}
    />
  );
}
