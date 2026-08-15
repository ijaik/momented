import type { Metadata } from "next";
import { cache } from "react";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";
import {
  getAllIds,
  getCollectionById,
  getPhotosForCollection,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { PageProps } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("collections");
  return ids.map((id) => ({ id }));
}
const getCollection = cache(async (id: string) => {
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getCollectionById(id),
    getPhotosForCollection(id),
  ]);
  return { collection, photos: photos ?? [] };
});
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const { collection, photos } = await getCollection(id);
  if (!collection) return { title: "Collection Not Found" };
  return buildPageMetadata({
    title: collection.title,
    description: collection.description || undefined,
    path: `/collections/${id}`,
    imageUrl: photos[0]?.cloudinary_url,
  });
}
export default async function SingleCollectionPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const { collection, photos } = await getCollection(id);
  if (!collection) return <EmptyState description="Collection not found." />;
  const url = `${siteConfig.url}/collections/${id}`;
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
            { name: "Collections", url: `${siteConfig.url}/collections` },
            { name: collection.title, url },
          ]),
        ]}
      />
      <DetailLayout
        title={collection.title}
        description={collection.description}
      >
        <PhotoGrid
          photos={photos}
          emptyMessage="No photos have been added to this collection yet."
        />
      </DetailLayout>
    </>
  );
}
