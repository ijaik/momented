import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { buildCloudinaryUrl } from "@/lib/cloudinary/cloudinaryUtils";
import {
  getCalendarCollectionsList,
  getCuratedCollections,
  getRuleCollectionsList,
  getSeriesList,
  getSitemapPhotos,
} from "@/lib/db/queries";
import { extractSortedSeriesPhotos } from "@/lib/utils/series";

function getMaxDate(
  dates: (string | null | undefined)[],
  fallback: Date,
): Date {
  let maxTime = 0;
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    if (!Number.isNaN(t) && t > maxTime) maxTime = t;
  }
  return maxTime > 0 ? new Date(maxTime) : fallback;
}
function optimizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return buildCloudinaryUrl(url, ["c_limit", "w_1920", "q_auto", "f_jpg"]);
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheTag("photos", "series", "collections", "rules", "calendar");
  cacheLife("days");
  const [photos, curatedRes, rulesRes, calendarsRes, seriesRes] =
    await Promise.all([
      getSitemapPhotos(),
      getCuratedCollections(),
      getRuleCollectionsList(),
      getCalendarCollectionsList(),
      getSeriesList(),
    ]);
  const fallbackDate = new Date("2026-01-01");
  const latestPhotoDate = photos[0]?.created_at
    ? new Date(photos[0].created_at)
    : fallbackDate;
  const activeCalendarRoutes: MetadataRoute.Sitemap = (calendarsRes.data ?? [])
    .filter(
      (cal) =>
        Array.isArray(cal.photos) &&
        cal.photos.some((p) => Boolean(p?.id && p?.cloudinary_url)),
    )
    .map((cal) => {
      const validPhotos = (cal.photos ?? []).filter((p) =>
        Boolean(p?.cloudinary_url),
      );
      const photoUrls = validPhotos
        .map((p) => optimizeImageUrl(p.cloudinary_url))
        .filter((u): u is string => Boolean(u))
        .slice(0, 5);
      const calPhotoDates = (cal.photos ?? []).map(
        (p) => (p as { created_at?: string | null })?.created_at,
      );
      return {
        url: `${siteConfig.url}/collections/calendar/${cal.id}`,
        lastModified: getMaxDate(calPhotoDates, latestPhotoDate),
        ...(photoUrls.length > 0 ? { images: photoUrls } : {}),
      };
    });
  const seriesDates = (seriesRes.data ?? []).map((s) => s.created_at);
  const collectionDates = (curatedRes.data ?? []).map((c) => c.created_at);
  const ruleDates = (rulesRes.data ?? []).map((r) => r.created_at);
  const calendarDates = (calendarsRes.data ?? []).flatMap((c) =>
    (c.photos ?? []).map(
      (p) => (p as { created_at?: string | null })?.created_at,
    ),
  );
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: latestPhotoDate,
    },
    {
      url: `${siteConfig.url}/photos`,
      lastModified: latestPhotoDate,
    },
    {
      url: `${siteConfig.url}/walk`,
      lastModified: latestPhotoDate,
    },
    {
      url: `${siteConfig.url}/series`,
      lastModified: getMaxDate(seriesDates, latestPhotoDate),
    },
    {
      url: `${siteConfig.url}/collections`,
      lastModified: getMaxDate(collectionDates, latestPhotoDate),
    },
    {
      url: `${siteConfig.url}/collections/rules`,
      lastModified: getMaxDate(ruleDates, latestPhotoDate),
    },
    ...(activeCalendarRoutes.length > 0
      ? [
          {
            url: `${siteConfig.url}/collections/calendar`,
            lastModified: getMaxDate(calendarDates, latestPhotoDate),
          },
        ]
      : []),
    {
      url: `${siteConfig.url}/about`,
      lastModified: fallbackDate,
    },
    {
      url: `${siteConfig.url}/developers`,
      lastModified: fallbackDate,
    },
  ];
  const photoRoutes: MetadataRoute.Sitemap = photos.map((p) => {
    const optUrl = optimizeImageUrl(p.cloudinary_url);
    return {
      url: `${siteConfig.url}/photo/${p.id}`,
      lastModified: p.created_at ? new Date(p.created_at) : latestPhotoDate,
      ...(optUrl ? { images: [optUrl] } : {}),
    };
  });
  const buildCollectionRoutes = (
    items:
      | {
          id: string;
          created_at?: string | null;
          photos?:
            | {
                cloudinary_url?: string | null;
                created_at?: string | null;
              }[]
            | null;
        }[]
      | null,
    pathPrefix: string,
  ): MetadataRoute.Sitemap =>
    (items ?? [])
      .filter((item) => item.photos && item.photos.length > 0)
      .map((item) => {
        const validImages = (item.photos ?? [])
          .map((p) => optimizeImageUrl(p?.cloudinary_url))
          .filter((url): url is string => Boolean(url));
        const dates = [
          item.created_at,
          ...(item.photos ?? []).map((p) => p?.created_at),
        ];
        return {
          url: `${siteConfig.url}${pathPrefix}/${item.id}`,
          lastModified: getMaxDate(dates, latestPhotoDate),
          ...(validImages.length > 0
            ? { images: validImages.slice(0, 5) }
            : {}),
        };
      });
  const collectionRoutes = buildCollectionRoutes(
    curatedRes.data,
    "/collections",
  );
  const ruleRoutes = buildCollectionRoutes(rulesRes.data, "/collections/rules");
  const seriesRoutes: MetadataRoute.Sitemap = (seriesRes.data ?? [])
    .map((s) => ({
      id: s.id,
      created_at: s.created_at,
      orderedPhotos: extractSortedSeriesPhotos(
        s.series_photos as unknown as {
          position: number;
          photos: {
            cloudinary_url?: string | null;
            created_at?: string | null;
          } | null;
        }[],
      ),
    }))
    .filter((s) => s.orderedPhotos.length > 0)
    .map((s) => {
      const images = s.orderedPhotos
        .map((photo) => optimizeImageUrl(photo.cloudinary_url))
        .filter((url): url is string => Boolean(url));
      const dates = [
        s.created_at,
        ...s.orderedPhotos.map((photo) => photo.created_at),
      ];
      return {
        url: `${siteConfig.url}/series/${s.id}`,
        lastModified: getMaxDate(dates, latestPhotoDate),
        ...(images.length > 0 ? { images: images.slice(0, 5) } : {}),
      };
    });
  return [
    ...staticRoutes,
    ...photoRoutes,
    ...seriesRoutes,
    ...collectionRoutes,
    ...ruleRoutes,
    ...activeCalendarRoutes,
  ];
}
