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
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("rule_collections");
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
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
  });
}
export default async function SingleRulePage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
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
              url: `${siteConfig.url}/collections`,
            },
            { name: collection.title, url },
          ]),
        ]}
      />
      <DetailLayout
        title={collection.title}
        description={collection.description}
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
