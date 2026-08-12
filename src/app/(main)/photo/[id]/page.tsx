import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import DownloadButton from "@/components/DownloadButton";
import InfoItem from "@/components/InfoItem";
import ShareButton from "@/components/ShareButton";
import BackButton from "@/components/ui/BackButton";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Icons } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { getSocialShareImageUrl } from "@/lib/cloudinaryUtils";
import { formatDisplayDate, getPhotoDate } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabase";
import type { PageProps, Photo } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const { data } = await supabase.from("photos").select("id");
  return (data ?? []).map((photo) => ({ id: photo.id }));
}
const getPhoto = cache(async (id: string) => {
  const { data } = await supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, width, height, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title), stories!photo_stories(id, title)",
    )
    .eq("id", id)
    .single();
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
    const { data: calData } = await supabase
      .from("calendar_collections")
      .select("id, title")
      .eq("id", monthIndex);
    calendarCollections = calData || [];
  }
  const standardCollections = typedPhoto.collections || [];
  const ruleCollections = typedPhoto.rules || [];
  const hasCollections =
    standardCollections.length > 0 ||
    ruleCollections.length > 0 ||
    calendarCollections.length > 0;
  const hasStories = typedPhoto.stories && typedPhoto.stories.length > 0;
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BackButton />
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          <div className="w-full lg:w-2/3 h-fit lg:sticky lg:top-28">
            <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 p-2.5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Image
                src={typedPhoto.cloudinary_url}
                alt={typedPhoto.title || "Photographed Moment"}
                width={typedPhoto.width}
                height={typedPhoto.height}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 wrap-break-words">
                {typedPhoto.title || "Untitled"}
              </h1>
              {!!typedPhoto.description && (
                <p className="text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {typedPhoto.description}
                </p>
              )}
              {hasCollections && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Collections
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {standardCollections.map((c) => (
                      <Badge key={`std-${c.id}`} href={`/collections/${c.id}`}>
                        {c.title}
                      </Badge>
                    ))}
                    {ruleCollections.map((r) => (
                      <Badge
                        key={`rule-${r.id}`}
                        href={`/collections/rules/${r.id}`}
                      >
                        {r.title}
                      </Badge>
                    ))}
                    {calendarCollections.map((c) => (
                      <Badge
                        key={`cal-${c.id}`}
                        href={`/collections/calendar/${c.id}`}
                      >
                        {c.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {hasStories && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Stories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {typedPhoto.stories?.map((s) => (
                      <Badge key={s.id} href={`/stories/${s.id}`}>
                        {s.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <Icons.Info className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                <InfoItem label="Date" value={displayDate} />
                <InfoItem label="Camera" value={typedPhoto.camera_model} />
                <InfoItem
                  label="Focal Length"
                  value={typedPhoto.focal_length}
                />
                <InfoItem label="Aperture" value={typedPhoto.aperture} />
                <InfoItem
                  label="Shutter Speed"
                  value={typedPhoto.shutter_speed}
                />
                <InfoItem label="ISO" value={typedPhoto.iso?.toString()} />
                <InfoItem
                  label="Photographed by"
                  value={typedPhoto.artist || siteConfig.author.name}
                />
              </div>
            </div>
            <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col gap-3">
              <DownloadButton
                photoId={typedPhoto.id}
                cloudinaryUrl={typedPhoto.cloudinary_url}
                downloadCount={typedPhoto.downloads || 0}
              />
              <ShareButton
                title={typedPhoto.title || ""}
                photoId={typedPhoto.id}
                imageUrl={typedPhoto.cloudinary_url}
                shareCount={typedPhoto.shares || 0}
              />
            </div>
          </div>
        </div>
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
  const fullTitle = `${title} | ${siteConfig.name}`;
  const description = photo.description
    ? `${photo.description} Captured on ${photo.camera_model || "camera"}.`
    : `Explore "${photo.title || "this photograph"}" on ${siteConfig.name}.`;
  const pageUrl = `${siteConfig.url}/photo/${id}`;
  const imageUrl = getSocialShareImageUrl(photo.cloudinary_url);
  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
