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
  const hasMetadata =
    !!photo.camera_model ||
    !!photo.focal_length ||
    !!photo.aperture ||
    !!photo.shutter_speed ||
    photo.iso != null;

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
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold tracking-wide text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors uppercase"
        >
          &larr; Back to Photos
        </Link>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3 flex items-start justify-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800">
            <Image
              src={photo.cloudinary_url}
              alt={photo.title}
              width={photo.width}
              height={photo.height}
              className="w-full h-auto object-contain max-h-[80vh] rounded-2xl shadow-sm"
              priority
            />
          </div>
          <div className="w-full lg:w-1/3 flex flex-col">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {photo.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3 mb-6">
              {!!photo.collections && (
                <Link
                  href={`/collections/${photo.collection_id}`}
                  className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  Collection: {photo.collections.title}
                </Link>
              )}
              {!!photo.stories && (
                <Link
                  href={`/stories/${photo.story_id}`}
                  className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-purple-200 dark:border-purple-800 transition-colors"
                >
                  Story: {photo.stories.title}
                </Link>
              )}
            </div>
            {!!photo.description && (
              <div className="mb-4 mt-2">
                <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed">
                  {photo.description}
                </p>
              </div>
            )}
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              {displayDate}
            </p>
            {hasMetadata && (
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                  Info
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  {!!photo.camera_model && (
                    <div>
                      <span className="block text-zinc-500 text-xs mb-1">
                        Camera
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {photo.camera_model}
                      </span>
                    </div>
                  )}
                  {!!photo.focal_length && (
                    <div>
                      <span className="block text-zinc-500 text-xs mb-1">
                        Focal Length
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {photo.focal_length}
                      </span>
                    </div>
                  )}
                  {!!photo.aperture && (
                    <div>
                      <span className="block text-zinc-500 text-xs mb-1">
                        Aperture
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {photo.aperture}
                      </span>
                    </div>
                  )}
                  {!!photo.shutter_speed && (
                    <div>
                      <span className="block text-zinc-500 text-xs mb-1">
                        Shutter Speed
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {photo.shutter_speed}
                      </span>
                    </div>
                  )}
                  {photo.iso != null && (
                    <div>
                      <span className="block text-zinc-500 text-xs mb-1">
                        ISO
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {photo.iso}
                      </span>
                    </div>
                  )}
                  {!!photo.artist && (
                    <div>
                      <span className="block text-zinc-500 text-xs mb-1">
                        Photographed by
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {photo.artist}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
              initialCount={photo.downloads}
            />
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
  if (!photo) return { title: "Photo Not Found | Momented" };
  return {
    title: `${photo.title} | Momented`,
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
