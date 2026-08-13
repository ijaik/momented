import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { supabase } from "@/lib/supabase";
export const revalidate = 3600;
async function getIds(
  table: "photos" | "collections" | "stories" | "rule_collections",
) {
  const { data } = await supabase.from(table).select("id");
  return (data ?? []).map((row) => String(row.id));
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [photoIds, collectionIds, storyIds, ruleIds] = await Promise.all([
    getIds("photos"),
    getIds("collections"),
    getIds("stories"),
    getIds("rule_collections"),
  ]);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "daily", priority: 1 },
    {
      url: `${siteConfig.url}/collections`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/stories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
  const calendarRoutes: MetadataRoute.Sitemap = Array.from(
    { length: 12 },
    (_, i) => ({
      url: `${siteConfig.url}/collections/calendar/${i + 1}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );
  return [
    ...staticRoutes,
    ...photoIds.map((id) => ({
      url: `${siteConfig.url}/photo/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...collectionIds.map((id) => ({
      url: `${siteConfig.url}/collections/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...ruleIds.map((id) => ({
      url: `${siteConfig.url}/collections/rules/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...calendarRoutes,
    ...storyIds.map((id) => ({
      url: `${siteConfig.url}/stories/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
