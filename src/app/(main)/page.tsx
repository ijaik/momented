import type { Metadata } from "next";
import HomeCuratedLenses from "@/components/home/HomeCuratedLenses";
import HomeFeaturedSeries from "@/components/home/HomeFeaturedSeries";
import HomeHero from "@/components/home/HomeHero";
import HomeRecentPhotos from "@/components/home/HomeRecentPhotos";
import JsonLd from "@/components/seo/JsonLd";
import { getHomeEditorialData } from "@/lib/db/queries";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Momented",
  description:
    "A photography journal of light, shadow, & the moments in between.",
  path: "/",
});
export default async function Home() {
  const {
    heroPhoto,
    recentPhotos,
    totalPhotos,
    featuredSeries,
    featuredCollection,
    featuredRule,
    featuredCalendar,
  } = await getHomeEditorialData();
  return (
    <>
      <JsonLd data={[websiteJsonLd(), personJsonLd()]} />
      <div className="flex flex-col gap-12.5 sm:gap-18.75 md:gap-25 pb-12.5">
        <HomeHero heroPhoto={heroPhoto} />
        <HomeFeaturedSeries featuredSeries={featuredSeries} />
        <HomeCuratedLenses
          featuredCollection={featuredCollection}
          featuredRule={featuredRule}
          featuredCalendar={featuredCalendar}
        />
        <HomeRecentPhotos
          recentPhotos={recentPhotos}
          totalPhotos={totalPhotos}
        />
      </div>
    </>
  );
}
