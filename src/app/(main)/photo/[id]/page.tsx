import type { Metadata } from "next";
import { Suspense } from "react";
import PhotoDetailView from "@/components/photos/PhotoDetailView";
import JsonLd from "@/components/seo/JsonLd";
import EmptyState from "@/components/ui/EmptyState";
import type { ReferenceLink } from "@/components/ui/ReferenceRow";
import Skeleton from "@/components/ui/Skeleton";
import { siteConfig } from "@/config/site";
import { getAllIds, getPhotoById, getRelatedPhotos } from "@/lib/db/queries";
import {
  breadcrumbJsonLd,
  photographJsonLd,
  photoPageJsonLd,
} from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate, getPhotoDate } from "@/lib/utils/dateUtils";
import type { PageProps, Photo } from "@/types";
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("photos");
  if (ids.length === 0) return [{ id: "_" }];
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  if (id === "_") return { title: "Photographs" };
  const { data: photo } = await getPhotoById(id);
  if (!photo) return { title: "Photo Not Found" };
  const title = photo.title || "Photography Gallery";
  const description = photo.description
    ? `${photo.description} Captured on ${photo.camera_model || "camera"}.`
    : `Explore "${photo.title || "this photograph"}" on ${siteConfig.name}.`;
  return buildPageMetadata({
    title,
    description,
    path: `/photo/${id}`,
    imageUrl: photo.cloudinary_url,
  });
}
async function PhotoDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "_") return <EmptyState description="Photograph not found." />;
  const { data: photo } = await getPhotoById(id);
  if (!photo) return <EmptyState description="Photo not found." />;
  const typedPhoto: Photo = photo;
  const displayDate = formatDisplayDate(
    typedPhoto.created_at,
    typedPhoto.taken_at,
  );
  const calendarCollections = typedPhoto.calendars || [];
  const standardCollections = typedPhoto.collections || [];
  const ruleCollections = typedPhoto.rules || [];
  const seriesList = typedPhoto.series || [];
  const title = typedPhoto.title || "Untitled Momented";
  const monthIndex =
    calendarCollections[0]?.id !== undefined
      ? Number(calendarCollections[0].id)
      : typedPhoto.taken_at || typedPhoto.created_at
        ? getPhotoDate(typedPhoto).month
        : null;
  const relatedPhotos = await getRelatedPhotos({
    photoId: typedPhoto.id,
    collectionId: standardCollections[0]?.id,
    ruleId: ruleCollections[0]?.id,
    seriesId: seriesList[0]?.id,
    monthIndex,
  });
  const references: ReferenceLink[] = [
    ...standardCollections.map((c) => ({
      id: c.id,
      title: c.title,
      href: `/collections/${c.id}`,
      kind: "Collection" as const,
    })),
    ...ruleCollections.map((r) => ({
      id: r.id,
      title: r.title,
      href: `/collections/rules/${r.id}`,
      kind: "Rule" as const,
    })),
    ...calendarCollections.map((c) => ({
      id: c.id,
      title: c.title,
      href: `/collections/calendar/${c.id}`,
      kind: "Month" as const,
    })),
    ...seriesList.map((s) => ({
      id: s.id,
      title: s.title,
      href: `/series/${s.id}`,
      kind: "Series" as const,
    })),
  ];
  return (
    <>
      <JsonLd
        data={[
          photoPageJsonLd(typedPhoto),
          photographJsonLd(typedPhoto),
          breadcrumbJsonLd([
            {
              name: "Photographs",
              url: `${siteConfig.url}/`,
            },
            ...(standardCollections[0]
              ? [
                  {
                    name: standardCollections[0].title,
                    url: `${siteConfig.url}/collections/${standardCollections[0].id}`,
                  },
                ]
              : []),
            {
              name: title,
              url: `${siteConfig.url}/photo/${typedPhoto.id}`,
            },
          ]),
        ]}
      />
      <PhotoDetailView
        photo={typedPhoto}
        displayDate={displayDate}
        references={references}
        relatedPhotos={relatedPhotos}
      />
    </>
  );
}
export default function PhotoDetail({ params }: PageProps<{ id: string }>) {
  return (
    <Suspense fallback={<Skeleton variant="photo" />}>
      <PhotoDetailContent params={params} />
    </Suspense>
  );
}
