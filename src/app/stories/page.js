import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
export const metadata = { title: "Stories" };
export default async function StoriesPage() {
  const { data: stories, error } = await supabase
    .from("stories")
    .select("*, photos!story_id(id, cloudinary_url)")
    .order("created_at", { ascending: false });
  if (error)
    return <div className="p-10 text-center">Failed to load stories.</div>;
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <header className="mb-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tighter mb-6 text-zinc-900 dark:text-white leading-tight">
          Stories
        </h1>
        <p className="text-[25px] mb-6 text-zinc-400 dark:text-zinc-600">
          Thoughts behind the{" "}
          <span className="font-leckerli tracking-tight">Momented</span>.
        </p>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Where the captured moment meets your own narrative.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stories?.map((story, index) => {
          const coverImage =
            story.photos?.find((p) => p.id === story.cover_photo_id)
              ?.cloudinary_url || story.photos?.[0]?.cloudinary_url;
          const photoCount = story.photos?.length || 0;
          return (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="group relative aspect-video md:aspect-4/3 overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-900 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 block"
            >
              {coverImage
                ? <Image
                    src={coverImage}
                    alt={story.title}
                    fill
                    className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index < 4}
                  />
                : <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-medium text-sm">
                    Empty Story
                  </div>}

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="absolute bottom-10 left-10 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  {story.title}
                </h2>
                <p className="text-white/80 font-medium uppercase tracking-widest text-xs">
                  {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                </p>
              </div>
            </Link>
          );
        })}
        {stories?.length === 0 && (
          <p className="text-zinc-500 col-span-full">No stories written yet.</p>
        )}
      </div>
    </main>
  );
}
