import type { Metadata } from "next";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";
import {
  getAllIds,
  getPhotosForRule,
  getRuleCollectionById,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { PageProps } from "@/types";
export const instant = false;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("rule_collections");
  if (ids.length === 0) return [{ id: "_" }];
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  if (id === "_") return { title: "Rule Collections" };
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getRuleCollectionById(id),
    getPhotosForRule(id),
  ]);
  if (!collection) return { title: "Rule Collection Not Found" };
  return buildPageMetadata({
    title: collection.title,
    description: collection.description || undefined,
    path: `/collections/rules/${id}`,
    imageUrl: photos?.[0]?.cloudinary_url,
    noIndex: (photos?.length ?? 0) === 0,
  });
}
export default async function SingleRulePage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  if (id === "_") {
    return (
      <DetailLayout
        title="Rule Collections"
        description="Explore compositions categorized by photographic rules."
        backHref="/collections?tab=rules"
        backLabel="All rule collections"
      >
        <EmptyState description="No rule collection found." />
      </DetailLayout>
    );
  }
  const [{ data: collection }, { data: rawPhotos }] = await Promise.all([
    getRuleCollectionById(id),
    getPhotosForRule(id),
  ]);
  const photos = rawPhotos ?? [];
  if (!collection)
    return <EmptyState description="Rule collection not found." />;
  const url = `${siteConfig.url}/collections/rules/${id}`;
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
          breadcrumbJsonLd([
            {
              name: "Collections",
              url: `${siteConfig.url}/collections?tab=rules`,
            },
            { name: collection.title, url },
          ]),
        ]}
      />
      <DetailLayout
        title={collection.title}
        description={collection.description}
        backHref="/collections?tab=rules"
        backLabel="All rule collections"
        meta={
          photos.length === 0
            ? undefined
            : `${photos.length} ${photos.length === 1 ? "photograph" : "photographs"}`
        }
      >
        <PhotoGrid
          photos={photos}
          emptyMessage="No photographs have been tagged with this rule yet."
        />
      </DetailLayout>
    </>
  );
}
