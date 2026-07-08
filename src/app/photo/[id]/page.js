import Image from "next/image";
import Link from "next/link";
import DownloadButton from "@/components/DownloadButton";
import { supabase } from "@/lib/supabase";
export default async function PhotoDetail({ params }) {
  const { id } = await params;
  const { data: photo } = await supabase
    .from("photos")
    .select("*, collections!collection_id(title), stories!story_id(title)")
    .eq("id", id)
    .single();
  if (!photo) {
    return <div className="p-20 text-center text-xl">Photo not found.</div>;
  }
  let displayDate = new Date(photo.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (photo.taken_at) {
    const formattedExif = photo.taken_at.replace(
      /^(\d{4}):(\d{2}):(\d{2})/,
      "$1-$2-$3",
    );
    displayDate = new Date(formattedExif).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold tracking-wide text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors uppercase"
        >
          &larr; Back to Photos
        </Link>
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          <div className="w-full lg:w-2/3 h-fit lg:sticky lg:top-28 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl overflow-hidden p-2 md:p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Image
              src={photo.cloudinary_url}
              alt={photo.title}
              width={photo.width}
              height={photo.height}
              className="w-full h-auto object-contain max-h-[85vh] rounded-2xl"
              priority
            />
          </div>
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {photo.title}
                </h1>
                {!!photo.description && (
                  <p className="text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed">
                    {photo.description}
                  </p>
                )}
              </div>
              {(!!photo.collections || !!photo.stories) && (
                <div className="flex flex-wrap gap-2 pt-5 border-t border-zinc-100 dark:border-zinc-800/60">
                  {!!photo.collections && (
                    <Link
                      href={`/collections/${photo.collection_id}`}
                      className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800/60 transition-colors"
                    >
                      Collection: {photo.collections.title}
                    </Link>
                  )}
                  {!!photo.stories && (
                    <Link
                      href={`/stories/${photo.story_id}`}
                      className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-purple-200 dark:border-purple-800/60 transition-colors"
                    >
                      Story: {photo.stories.title}
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-5">
                Info
              </h3>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                <div>
                  <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                    Date
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {displayDate}
                  </span>
                </div>
                {!!photo.camera_model && (
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                      Camera
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {photo.camera_model}
                    </span>
                  </div>
                )}
                {!!photo.focal_length && (
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                      Focal Length
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {photo.focal_length}
                    </span>
                  </div>
                )}
                {!!photo.aperture && (
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                      Aperture
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {photo.aperture}
                    </span>
                  </div>
                )}
                {!!photo.shutter_speed && (
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                      Shutter Speed
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {photo.shutter_speed}
                    </span>
                  </div>
                )}
                {photo.iso != null && (
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                      ISO
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {photo.iso}
                    </span>
                  </div>
                )}
                {!!photo.artist && (
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
                      Photographed by
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {photo.artist}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <DownloadButton
                photoId={photo.id}
                cloudinaryUrl={photo.cloudinary_url}
                initialCount={photo.downloads}
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
    .select("*")
    .eq("id", id)
    .single();
  if (!photo) return { title: "Photo Not Found" };
  return {
    title: `${photo.title}`,
    description:
      photo.description ||
      `View ${photo.title}, shot on ${photo.camera_model || "camera"}.`,
    openGraph: {
      title: photo.title,
      description: photo.description || `A photograph by Jai.`,
      images: [
        {
          url: photo.cloudinary_url,
          width: photo.width,
          height: photo.height,
          alt: photo.title,
        },
      ],
    },
  };
}
