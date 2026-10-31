import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  getCalendarCollectionsList,
  getCuratedCollections,
  getRuleCollectionsList,
  getSeriesList,
  getSitemapPhotos,
} from "@/lib/db/queries";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [photos, curatedRes, rulesRes, calendarsRes, seriesRes] =
    await Promise.all([
      getSitemapPhotos(),
      getCuratedCollections(),
      getRuleCollectionsList(),
      getCalendarCollectionsList(),
      getSeriesList(),
    ]);
  const latestPhotoDate = photos[0]?.created_at
    ? new Date(photos[0].created_at)
    : new Date();
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
        .map((p) => p.cloudinary_url as string)
        .slice(0, 5);
      return {
        url: `${siteConfig.url}/collections/calendar/${cal.id}`,
        lastModified: latestPhotoDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        ...(photoUrls.length > 0 ? { images: photoUrls } : {}),
      };
    });
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}/`,
      lastModified: latestPhotoDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/series`,
      lastModified: latestPhotoDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/collections`,
      lastModified: latestPhotoDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/collections/rules`,
      lastModified: latestPhotoDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...(activeCalendarRoutes.length > 0
      ? [
          {
            url: `${siteConfig.url}/collections/calendar`,
            lastModified: latestPhotoDate,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
        ]
      : []),
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date("2026-01-01"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
  const photoRoutes: MetadataRoute.Sitemap = photos.map((p) => ({
    url: `${siteConfig.url}/photo/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : latestPhotoDate,
    changeFrequency: "monthly" as const,
    priority: 0.9,
    ...(p.cloudinary_url ? { images: [p.cloudinary_url] } : {}),
  }));
  const collectionRoutes: MetadataRoute.Sitemap = (curatedRes.data ?? [])
    .filter((c) => c.photos && c.photos.length > 0)
    .map((c) => {
      const validImages = (c.photos ?? [])
        .filter((p) => Boolean(p?.cloudinary_url))
        .map((p) => p.cloudinary_url as string);
      return {
        url: `${siteConfig.url}/collections/${c.id}`,
        lastModified: c.created_at ? new Date(c.created_at) : latestPhotoDate,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        ...(validImages.length > 0 ? { images: validImages.slice(0, 5) } : {}),
      };
    });
  const ruleRoutes: MetadataRoute.Sitemap = (rulesRes.data ?? [])
    .filter((r) => r.photos && r.photos.length > 0)
    .map((r) => {
      const validImages = (r.photos ?? [])
        .filter((p) => Boolean(p?.cloudinary_url))
        .map((p) => p.cloudinary_url as string);
      return {
        url: `${siteConfig.url}/collections/rules/${r.id}`,
        lastModified: r.created_at ? new Date(r.created_at) : latestPhotoDate,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        ...(validImages.length > 0 ? { images: validImages.slice(0, 5) } : {}),
      };
    });
  const seriesRoutes: MetadataRoute.Sitemap = (seriesRes.data ?? [])
    .filter(
      (s) =>
        s.series_photos &&
        (s.series_photos as unknown as { position: number }[]).length > 0,
    )
    .map((s) => {
      const rawPhotos =
        (s.series_photos as unknown as {
          position: number;
          photos: { cloudinary_url?: string | null } | null;
        }[]) || [];
      const images = rawPhotos
        .map((sp) => sp.photos?.cloudinary_url)
        .filter((url): url is string => Boolean(url));
      return {
        url: `${siteConfig.url}/series/${s.id}`,
        lastModified: s.created_at ? new Date(s.created_at) : latestPhotoDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
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
