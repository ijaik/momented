import Image from "next/image";
import DownloadButton from "@/components/DownloadButton";
import InfoItem from "@/components/InfoItem";
import ShareButton from "@/components/ShareButton";
import BackButton from "@/components/ui/BackButton";
import { Icons } from "@/components/ui/Icons";
import { formatDisplayDate } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabase";
export default async function PhotoDetail({ params }) {
  const { id } = await params;
  const { data: photo } = await supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, width, height, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares, collection_id, story_id, collections!collection_id(title), stories!story_id(title)",
    )
    .eq("id", id)
    .single();
  if (!photo)
    return <div className="p-20 text-center text-xl">Photo not found.</div>;
  const displayDate = formatDisplayDate(photo.created_at, photo.taken_at);
  const downloadCount = photo.downloads || 0;
  const shareCount = photo.shares || 0;
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BackButton href="/" label="Back to Photos" />
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          <div className="w-full lg:w-2/3 h-fit lg:sticky lg:top-28">
            <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 p-2.5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Image
                src={photo.cloudinary_url}
                alt={photo.title}
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
                {photo.title}
              </h1>
              {!!photo.description && (
                <p className="text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {photo.description}
                </p>
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
                <InfoItem label="Photographed by" value={photo.artist} />
              </div>
            </div>
            <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col gap-3">
              <DownloadButton
                photoId={photo.id}
                cloudinaryUrl={photo.cloudinary_url}
                downloadCount={downloadCount}
              />
              <ShareButton
                title={photo.title}
                photoId={photo.id}
                imageUrl={photo.cloudinary_url}
                shareCount={shareCount}
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
    .select("title, description, camera_model, cloudinary_url, width, height")
    .eq("id", id)
    .single();
  if (!photo) return { title: "Photo Not Found" };
  const title = photo.title
    ? `${photo.title} | Momented`
    : "Photography Gallery | Momented";
  const description = photo.description
    ? `${photo.description} Captured on ${photo.camera_model || "camera"}. View this and more high-quality photography on Momented.`
    : `Explore this incredible photograph "${photo.title}", beautifully captured on ${photo.camera_model || "camera"}. Discover the full collection on Momented.`;
  const pageUrl = `https://momented.vercel.app/photo/${id}`;
  let imageUrl = photo.cloudinary_url;
  if (imageUrl?.includes("/upload/")) {
    imageUrl = imageUrl.replace("/upload/", "/upload/t_social_share/");
  }
  return {
    metadataBase: new URL("https://momented.vercel.app"),
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Momented",
      type: "website",
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
