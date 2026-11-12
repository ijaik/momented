import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PhotoDetailView from "@/components/photos/PhotoDetailView";
import JsonLd from "@/components/seo/JsonLd";
import type { ReferenceLink } from "@/components/ui/ReferenceRow";
import Skeleton from "@/components/ui/Skeleton";
import { siteConfig } from "@/config/site";
import {
  getAdjacentPhotos,
  getAllIds,
  getPhotoById,
  getRelatedPhotos,
} from "@/lib/db/queries";
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
  if (id === "_")
    return {
      title: "Photograph Not Found",
      robots: { index: false, follow: false },
    };
  const { data: photo } = await getPhotoById(id);
  if (!photo)
    return {
      title: "Photograph Not Found",
      robots: { index: false, follow: false },
    };
  const title = photo.title || "Untitled Momented";
  const displayDate = formatDisplayDate(photo.created_at, photo.taken_at);
  const exifParts = [
    photo.camera_model ? `shot on ${photo.camera_model}` : null,
    photo.focal_length || null,
    photo.aperture || null,
    photo.shutter_speed || null,
    photo.iso ? `ISO ${photo.iso}` : null,
  ].filter(Boolean);
  const contextParts = [
    ...(photo.collections?.map((c) => c.title) ?? []),
    ...(photo.rules?.map((r) => r.title) ?? []),
    ...(photo.series?.map((s) => s.title) ?? []),
  ];
  const exifSummary = exifParts.length > 0 ? ` (${exifParts.join(", ")})` : "";
  const contextSummary =
    contextParts.length > 0 ? ` Featured in ${contextParts.join(", ")}.` : "";
  const description = photo.description
    ? `${title} — ${photo.description}.${exifSummary ? ` Captured${exifSummary}.` : ""}${contextSummary}`.replace(
        /\.\./g,
        ".",
      )
    : `"${title}" — a public domain (CC0) photograph by ${photo.artist || siteConfig.author.name}${displayDate !== "Unknown date" ? ` (${displayDate})` : ""}${exifSummary}.${contextSummary}`;
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
  if (id === "_") notFound();
  const { data: photo } = await getPhotoById(id);
  if (!photo) notFound();
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
  const [relatedPhotos, adjacent] = await Promise.all([
    getRelatedPhotos({
      photoId: typedPhoto.id,
      collectionId: standardCollections[0]?.id,
      ruleId: ruleCollections[0]?.id,
      seriesId: seriesList[0]?.id,
      monthIndex,
    }),
    getAdjacentPhotos(typedPhoto.id, typedPhoto.created_at ?? null),
  ]);
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
              url: `${siteConfig.url}/photos`,
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
        prevPhoto={adjacent.prev}
        nextPhoto={adjacent.next}
      />
    </>
  );
}
export default function PhotoDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton variant="photo" />}>
      <PhotoDetailContent params={params} />
    </Suspense>
  );
}
