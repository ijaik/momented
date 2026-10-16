import type { Metadata } from "next";
import PhotoDetailView from "@/components/photos/PhotoDetailView";
import JsonLd from "@/components/seo/JsonLd";
import BackButton from "@/components/ui/BackButton";
import EmptyState from "@/components/ui/EmptyState";
import type { ReferenceLink } from "@/components/ui/ReferenceRow";
import { siteConfig } from "@/config/site";
import { getAllIds, getPhotoById } from "@/lib/db/queries";
import { breadcrumbJsonLd, photographJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
import type { PageProps, Photo } from "@/types";
export const instant = false;
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
export default async function PhotoDetail({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  if (id === "_") {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
        <BackButton label="All photographs" className="mb-8 md:mb-10" />
        <EmptyState description="Photograph not found." />
      </main>
    );
  }
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
    ...seriesList.map((s) => ({
      id: s.id,
      title: s.title,
      href: `/series/${s.id}`,
      kind: "Series",
    })),
  ];
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8 md:py-10">
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
      <BackButton label="All photographs" className="mb-5 md:mb-6" />
      <PhotoDetailView
        photo={typedPhoto}
        displayDate={displayDate}
        references={references}
      />
    </main>
  );
}
