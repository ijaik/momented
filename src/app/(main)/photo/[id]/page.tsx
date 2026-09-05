import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import DownloadButton from "@/components/photos/DownloadButton";
import InfoItem from "@/components/photos/InfoItem";
import ShareButton from "@/components/photos/ShareButton";
import JsonLd from "@/components/seo/JsonLd";
import BackButton from "@/components/ui/BackButton";
import EmptyState from "@/components/ui/EmptyState";
import ReferenceRow, { type ReferenceLink } from "@/components/ui/ReferenceRow";
import { siteConfig } from "@/config/site";
import {
  getAllIds,
  getCalendarMonthTitle,
  getPhotoById,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, photographJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate, getPhotoDate } from "@/lib/utils/dateUtils";
import type { PageProps, Photo } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("photos");
  return ids.map((id) => ({ id }));
}
const getPhoto = cache(async (id: string) => {
  const { data } = await getPhotoById(id);
  return data;
});
export default async function PhotoDetail({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const photo = await getPhoto(id);
  if (!photo) return <EmptyState description="Photo not found." />;
  const typedPhoto: Photo = photo;
  const displayDate = formatDisplayDate(
    typedPhoto.created_at,
    typedPhoto.taken_at,
  );
  const { month: monthIndex } = getPhotoDate(typedPhoto);
  let calendarCollections: { id: number; title: string }[] = [];
  if (monthIndex) {
    const { data: calData } = await getCalendarMonthTitle(monthIndex);
    calendarCollections = calData || [];
  }
  const standardCollections = typedPhoto.collections || [];
  const ruleCollections = typedPhoto.rules || [];
  const hasCollections =
    standardCollections.length > 0 ||
    ruleCollections.length > 0 ||
    calendarCollections.length > 0;
  const hasStories = typedPhoto.stories && typedPhoto.stories.length > 0;
  const title = typedPhoto.title || "Untitled";
  const references: ReferenceLink[] = [
    ...standardCollections.map((c) => ({
      id: c.id,
      title: c.title,
      href: `/collections/${c.id}`,
      kind: "Collection",
    })),
    ...ruleCollections.map((r) => ({
      id: r.id,
      title: r.title,
      href: `/collections/rules/${r.id}`,
      kind: "Rule",
    })),
    ...calendarCollections.map((c) => ({
      id: c.id,
      title: c.title,
      href: `/collections/calendar/${c.id}`,
      kind: "Month",
    })),
    ...(typedPhoto.stories || []).map((s) => ({
      id: s.id,
      title: s.title,
      href: `/stories/${s.id}`,
      kind: "Story",
    })),
  ];
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
      <JsonLd
        data={[
          photographJsonLd(typedPhoto),
          breadcrumbJsonLd([
            {
              name: "Photographs",
              url: `${siteConfig.url}/`,
            },
            {
              name: title,
              url: `${siteConfig.url}/photo/${typedPhoto.id}`,
            },
          ]),
        ]}
      />
      <BackButton label="All photographs" className="mb-8 md:mb-10" />
      <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <figure className="min-w-0 lg:sticky lg:top-24">
          <div className="overflow-hidden border border-line bg-soft">
            <Image
              src={typedPhoto.cloudinary_url}
              alt={title}
              width={typedPhoto.width}
              height={typedPhoto.height}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="block h-auto w-full"
              priority
            />
          </div>
          <figcaption className="mt-6">
            <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            {typedPhoto.description && (
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                {typedPhoto.description}
              </p>
            )}
            <p className="mt-3 text-sm text-muted">
              {displayDate}
              {typedPhoto.camera_model &&
                ` · shot on ${typedPhoto.camera_model}`}
              {` · by ${typedPhoto.artist || siteConfig.author.name}`}
            </p>
          </figcaption>
        </figure>
        <aside className="flex min-w-0 flex-col gap-10">
          <section aria-label="Photograph details">
            <h2 className="mb-1 text-sm font-medium text-ink">Details</h2>
            <dl className="border-t border-line">
              <InfoItem label="Focal length" value={typedPhoto.focal_length} />
              <InfoItem label="Aperture" value={typedPhoto.aperture} />
              <InfoItem
                label="Shutter speed"
                value={typedPhoto.shutter_speed}
              />
              <InfoItem label="ISO" value={typedPhoto.iso?.toString()} />
            </dl>
          </section>
          {references.length > 0 && (
            <section aria-label="Related collections and stories">
              <h2 className="mb-1 text-sm font-medium text-ink">
                {hasCollections && hasStories
                  ? "Found in"
                  : hasCollections
                    ? "Part of"
                    : "Written about in"}
              </h2>
              <ul className="divide-y divide-line border-y border-line last:border-b-0">
                {references.map((ref) => (
                  <ReferenceRow key={`${ref.kind}-${ref.id}`} link={ref} />
                ))}
              </ul>
            </section>
          )}
          <section
            aria-label="Download and share"
            className="grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
          >
            <ShareButton
              title={typedPhoto.title || ""}
              photoId={typedPhoto.id}
              imageUrl={typedPhoto.cloudinary_url}
              shareCount={typedPhoto.shares || 0}
            />
            <DownloadButton
              photoId={typedPhoto.id}
              cloudinaryUrl={typedPhoto.cloudinary_url}
              downloadCount={typedPhoto.downloads || 0}
            />
          </section>
        </aside>
      </div>
    </main>
  );
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const photo = await getPhoto(id);
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
