import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";
import {
  getCollectionById,
  getPhotosForCollection,
  getPhotosForRule,
  getRuleCollectionById,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isValidUUID } from "@/lib/utils/validation";
export type CollectionKind = "collection" | "rule";
const COLLECTION_KIND_CONFIG = {
  collection: {
    notFoundTitle: "Collection Not Found",
    badge: "Thematic Collections",
    backLink: { href: "/collections", label: "All Collections" },
    emptyMessage: "No photographs have been added to this collection yet.",
    pathPrefix: "/collections",
    buildFallbackDescription: (title: string) =>
      `Photographs from the "${title}" collection on ${siteConfig.name}.`,
    buildBreadcrumbs: (title: string, url: string) => [
      { name: "Thematic Collections", url: `${siteConfig.url}/collections` },
      { name: title, url },
    ],
    fetchDetail: async (id: string) =>
      Promise.all([getCollectionById(id), getPhotosForCollection(id)]),
  },
  rule: {
    notFoundTitle: "Rule Collection Not Found",
    badge: "Composition Rule",
    backLink: { href: "/collections/rules", label: "All Rules" },
    emptyMessage: "No photographs by this rule yet.",
    pathPrefix: "/collections/rules",
    buildFallbackDescription: (title: string) =>
      `Photographs by the "${title}" on ${siteConfig.name}.`,
    buildBreadcrumbs: (title: string, url: string) => [
      { name: "Collections", url: `${siteConfig.url}/collections` },
      { name: "Rule Collections", url: `${siteConfig.url}/collections/rules` },
      { name: title, url },
    ],
    fetchDetail: async (id: string) =>
      Promise.all([getRuleCollectionById(id), getPhotosForRule(id)]),
  },
} as const;
export async function buildCollectionDetailMetadata(
  kind: CollectionKind,
  id: string,
): Promise<Metadata> {
  const cfg = COLLECTION_KIND_CONFIG[kind];
  if (!isValidUUID(id)) {
    return {
      title: cfg.notFoundTitle,
      robots: { index: false, follow: false },
    };
  }
  const [{ data: collection }, { data: photos }] = await cfg.fetchDetail(id);
  if (!collection) {
    return {
      title: cfg.notFoundTitle,
      robots: { index: false, follow: false },
    };
  }
  return buildPageMetadata({
    title: collection.title,
    description:
      collection.description || cfg.buildFallbackDescription(collection.title),
    path: `${cfg.pathPrefix}/${id}`,
    imageUrl: photos?.[0]?.cloudinary_url,
    noIndex: (photos?.length ?? 0) === 0,
  });
}
export async function CollectionDetailContent({
  kind,
  params,
}: {
  kind: CollectionKind;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const cfg = COLLECTION_KIND_CONFIG[kind];
  const [{ data: collection }, { data: rawPhotos }] = await cfg.fetchDetail(id);
  if (!collection) notFound();
  const photos = rawPhotos ?? [];
  const url = `${siteConfig.url}${cfg.pathPrefix}/${id}`;
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            collection,
            url,
            photos[0]?.cloudinary_url,
            photos,
          ),
          breadcrumbJsonLd(cfg.buildBreadcrumbs(collection.title, url)),
        ]}
      />
      <PageHeader
        badge={cfg.badge}
        backLink={cfg.backLink}
        title={collection.title}
        description={collection.description}
        meta={
          photos.length === 0
            ? undefined
            : `${photos.length} ${photos.length === 1 ? "photograph" : "photographs"}`
        }
      />
      <PhotoGrid photos={photos} emptyMessage={cfg.emptyMessage} />
    </>
  );
}
