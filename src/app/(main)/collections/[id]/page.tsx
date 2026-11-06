import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import DetailLayout from "@/components/ui/DetailLayout";
import Skeleton from "@/components/ui/Skeleton";
import { siteConfig } from "@/config/site";
import {
  getAllIds,
  getCollectionById,
  getPhotosForCollection,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { PageProps } from "@/types";
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("collections");
  if (ids.length === 0) return [{ id: "_" }];
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  if (id === "_")
    return {
      title: "Collection Not Found",
      robots: { index: false, follow: false },
    };
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getCollectionById(id),
    getPhotosForCollection(id),
  ]);
  if (!collection)
    return {
      title: "Collection Not Found",
      robots: { index: false, follow: false },
    };
  const description =
    collection.description ||
    `Photographs from the "${collection.title}" collection on ${siteConfig.name}.`;
  return buildPageMetadata({
    title: collection.title,
    description,
    path: `/collections/${id}`,
    imageUrl: photos?.[0]?.cloudinary_url,
    noIndex: (photos?.length ?? 0) === 0,
  });
}
async function SingleCollectionContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "_") notFound();
  const [{ data: collection }, { data: rawPhotos }] = await Promise.all([
    getCollectionById(id),
    getPhotosForCollection(id),
  ]);
  if (!collection) notFound();
  const photos = rawPhotos ?? [];
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
            {
              name: "Thematic Collections",
              url: `${siteConfig.url}/collections`,
            },
            { name: collection.title, url },
          ]),
        ]}
      />
      <DetailLayout
        badge="Thematic Collections"
        backLink={{ href: "/collections", label: "All Collections" }}
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
          emptyMessage="No photographs have been added to this collection yet."
        />
      </DetailLayout>
    </>
  );
}
export default function SingleCollectionPage({
  params,
}: PageProps<{ id: string }>) {
  return (
    <Suspense fallback={<Skeleton variant="collection" />}>
      <SingleCollectionContent params={params} />
    </Suspense>
  );
}
