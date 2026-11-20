import type { Metadata } from "next";
import CollectionHubView from "@/components/collections/CollectionHubView";
import { siteConfig } from "@/config/site";
import { getRuleCollectionsList } from "@/lib/db/queries";
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
  return (
    <CollectionHubView
      activeTab="rules"
      badge="02 / Rules"
      title="Composition Rules"
      description="Photographs by rule of thirds, leading lines, framing, and more."
      countLabel={{ singular: "rule", plural: "rules" }}
      emptyMessage="No rule collections have been added yet."
      baseHref="/collections/rules"
      items={displayCollections}
      breadcrumbs={[
        { name: "Collections", url: `${siteConfig.url}/collections` },
        {
          name: "Rule Collections",
          url: `${siteConfig.url}/collections/rules`,
        },
      ]}
    />
  );
}
