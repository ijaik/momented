import Link from "next/link";
import PhotoCard from "@/components/PhotoCard";
import { supabase } from "@/lib/supabase";
export default async function SingleCollectionPage({ params }) {
  const { id } = await params;
  const { data: collection } = await supabase
    .from("collections")
    .select("title, description")
    .eq("id", id)
    .single();
  const { data: photos } = await supabase
    .from("photos")
    .select("id, title, cloudinary_url, width, height, camera_model")
    .eq("collection_id", id)
    .order("created_at", { ascending: false });
  if (!collection) {
    return (
      <div className="p-20 text-center text-xl">Collection not found.</div>
    );
  }
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Link
          href="/collections"
          className="inline-flex items-center text-sm font-semibold tracking-wide text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-12 transition-colors uppercase"
        >
          &larr; Back to Collections
        </Link>
        <header className="mb-16 md:mb-24 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-6">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {collection.description}
            </p>
          )}
        </header>
        {photos && photos.length > 0
          ? <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 pb-24">
              {photos.map((photo, index) => (
                <PhotoCard key={photo.id} photo={photo} index={index} />
              ))}
            </div>
          : <div className="text-center text-zinc-500 py-20 border-t border-zinc-200 dark:border-zinc-800">
              No photos have been added to this collection yet.
            </div>}
      </div>
    </main>
  );
}
