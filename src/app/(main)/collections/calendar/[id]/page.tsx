import type { Metadata } from "next";
import CalendarMonthView, {
  type YearGroup,
} from "@/components/collections/CalendarMonthView";
import JsonLd from "@/components/seo/JsonLd";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";
import {
  getAllIds,
  getCalendarMonthById,
  getPhotosForCalendarMonth,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPhotoDate, isPhotoUndated } from "@/lib/utils/dateUtils";
import type { PageProps, Photo } from "@/types";
export const instant = false;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("calendar_collections");
  if (ids.length === 0)
    return Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1) }));
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const monthIndex = parseInt(id, 10);
  if (Number.isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return { title: "Month Not Found" };
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getCalendarMonthById(monthIndex),
    getPhotosForCalendarMonth(monthIndex),
  ]);
  if (!collection) return { title: "Month Not Found" };
  return buildPageMetadata({
    title: collection.title,
    description: collection.description || undefined,
    path: `/collections/calendar/${id}`,
    imageUrl: photos?.[0]?.cloudinary_url,
    noIndex: (photos?.length ?? 0) === 0,
  });
}
export default async function CalendarMonthPage({
  params,
  searchParams,
}: PageProps<{ id: string }, { tab?: string }>) {
  const { id } = await params;
  const { tab } = (await searchParams) ?? {};
  const monthIndex = parseInt(id, 10);
  if (Number.isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return <EmptyState description="Invalid month requested." />;
  const [{ data: collection }, { data: rawPhotos }] = await Promise.all([
    getCalendarMonthById(monthIndex),
    getPhotosForCalendarMonth(monthIndex),
  ]);
  const monthPhotos = rawPhotos ?? [];
  if (!collection) return <EmptyState description="Month not found." />;
  const groupedByYear = new Map<number, Photo[]>();
  const undatedPhotos: Photo[] = [];
  for (const photo of monthPhotos) {
    if (isPhotoUndated(photo)) {
      undatedPhotos.push(photo);
      continue;
    }
    const { year } = getPhotoDate(photo);
    const yearPhotos = groupedByYear.get(year);
    if (yearPhotos) yearPhotos.push(photo);
    else groupedByYear.set(year, [photo]);
  }
  const structuredYears: YearGroup[] = Array.from(groupedByYear.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, photos]) => ({ year, photos }));
  const url = `${siteConfig.url}/collections/calendar/${id}`;
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            collection,
            url,
            monthPhotos[0]?.cloudinary_url,
            monthPhotos,
          ),
          breadcrumbJsonLd([
            {
              name: "Collections",
              url: `${siteConfig.url}/collections?tab=calendar`,
            },
            { name: collection.title, url },
          ]),
        ]}
      />
      <DetailLayout
        title={collection.title}
        description={collection.description}
        meta={
          monthPhotos.length === 0
            ? undefined
            : `${monthPhotos.length} ${monthPhotos.length === 1 ? "photograph" : "photographs"}`
        }
      >
        {structuredYears.length > 0 || undatedPhotos.length > 0 ? (
          <CalendarMonthView
            collectionTitle={collection.title}
            structuredYears={structuredYears}
            undatedPhotos={undatedPhotos}
            initialTab={tab}
          />
        ) : (
          <EmptyState
            description={`No photographs were captured in ${collection.title.toLowerCase()} yet.`}
            className="pt-6"
          />
        )}
      </DetailLayout>
    </>
  );
}
