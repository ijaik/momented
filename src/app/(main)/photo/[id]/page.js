import Image from "next/image";
import Link from "next/link";
import DownloadButton from "@/components/DownloadButton";
import InfoItem from "@/components/InfoItem";
import ShareButton from "@/components/ShareButton";
import BackButton from "@/components/ui/BackButton";
import { Icons } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { getSocialShareImageUrl } from "@/lib/cloudinaryUtils";
import { formatDisplayDate, getPhotoDate } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabase";
export default async function PhotoDetail({ params }) {
  const { id } = await params;
  const { data: photo } = await supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, width, height, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares, collections!photo_collections(id, title), stories!photo_stories(id, title)",
    )
    .eq("id", id)
    .single();
  if (!photo)
    return <div className="p-20 text-center text-xl">Photo not found.</div>;
  const displayDate = formatDisplayDate(photo.created_at, photo.taken_at);
  const { month: monthIndex } = getPhotoDate(photo);
  let calendarCollections = [];
  if (monthIndex) {
    const { data: calData } = await supabase
      .from("calendar_collections")
      .select("id, title")
      .eq("id", monthIndex);
    calendarCollections = calData || [];
  }
  const standardCollections = photo.collections || [];
  const hasCollections =
    standardCollections.length > 0 || calendarCollections.length > 0;
  const hasStories = photo.stories && photo.stories.length > 0;
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BackButton href="/" label="Back to Photos" />
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          <div className="w-full lg:w-2/3 h-fit lg:sticky lg:top-28">
            <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 p-2.5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Image
                src={photo.cloudinary_url}
                alt={photo.title || "Photographed Moment"}
                width={photo.width}
                height={photo.height}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 wrap-break-words">
                {photo.title || "Untitled"}
              </h1>
              {!!photo.description && (
                <p className="text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {photo.description}
                </p>
              )}
              {(hasCollections || hasStories) && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
                  {hasCollections && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Collections
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {standardCollections.map((c) => (
                          <Link
                            key={`std-${c.id}`}
                            href={`/collections/${c.id}`}
                            className="inline-flex items-center text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {c.title}
                          </Link>
                        ))}
                        {calendarCollections.map((c) => (
                          <Link
                            key={`cal-${c.id}`}
                            href={`/collections/calendar/${c.id}`}
                            className="inline-flex items-center text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {c.title}
                          </Link>
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
                        {photo.stories.map((s) => (
                          <Link
                            key={s.id}
                            href={`/stories/${s.id}`}
                            className="inline-flex items-center text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <Icons.Info className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                <InfoItem label="Date" value={displayDate} />
                <InfoItem label="Camera" value={photo.camera_model} />
                <InfoItem label="Focal Length" value={photo.focal_length} />
                <InfoItem label="Aperture" value={photo.aperture} />
                <InfoItem label="Shutter Speed" value={photo.shutter_speed} />
                <InfoItem label="ISO" value={photo.iso} />
                <InfoItem
                  label="Photographed by"
                  value={photo.artist || siteConfig.author.name}
                />
              </div>
            </div>
            <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col gap-3">
              <DownloadButton
                photoId={photo.id}
                cloudinaryUrl={photo.cloudinary_url}
                downloadCount={photo.downloads || 0}
              />
              <ShareButton
                title={photo.title}
                photoId={photo.id}
                imageUrl={photo.cloudinary_url}
                shareCount={photo.shares || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: photo } = await supabase
    .from("photos")
    .select("title, description, camera_model, cloudinary_url")
    .eq("id", id)
    .single();
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
