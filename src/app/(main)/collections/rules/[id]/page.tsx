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
  getPhotosForRule,
  getRuleCollectionById,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { PageProps } from "@/types";
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("rule_collections");
  if (ids.length === 0) return [{ id: "_" }];
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  if (id === "_")
    return {
      title: "Rule Collection Not Found",
      robots: { index: false, follow: false },
    };
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getRuleCollectionById(id),
    getPhotosForRule(id),
  ]);
  if (!collection)
    return {
      title: "Rule Collection Not Found",
      robots: { index: false, follow: false },
    };
  const description =
    collection.description ||
    `Photographs by the "${collection.title}" on ${siteConfig.name}.`;
  return buildPageMetadata({
    title: collection.title,
    description,
    path: `/collections/rules/${id}`,
    imageUrl: photos?.[0]?.cloudinary_url,
    noIndex: (photos?.length ?? 0) === 0,
  });
}
async function SingleRuleContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "_") notFound();
  const [{ data: collection }, { data: rawPhotos }] = await Promise.all([
    getRuleCollectionById(id),
    getPhotosForRule(id),
  ]);
  if (!collection) notFound();
  const photos = rawPhotos ?? [];
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
              name: "Rule Collections",
              url: `${siteConfig.url}/collections/rules`,
            },
            { name: collection.title, url },
          ]),
        ]}
      />
      <DetailLayout
        badge="Composition Rule"
        backLink={{ href: "/collections/rules", label: "All Rules" }}
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
          emptyMessage="No photographs by this rule yet."
        />
      </DetailLayout>
    </>
  );
}
export default function SingleRulePage({ params }: PageProps<{ id: string }>) {
  return (
    <Suspense fallback={<Skeleton variant="collection" />}>
      <SingleRuleContent params={params} />
    </Suspense>
  );
}
