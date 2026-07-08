import PhotoCard from "@/components/PhotoCard";
import { supabase } from "@/lib/supabase";
export default async function Home() {
  const { data: photos, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return <div className="p-10 text-center">Failed to load.</div>;
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <header className="mb-20 text-center">
        <h1 className="text-[50px] font-extrabold tracking-tighter mb-6 text-zinc-900 dark:text-white leading-tight">
          Photos
        </h1>
        <p className="text-[25px] text-zinc-400 dark:text-zinc-600">
          One <span className="font-leckerli tracking-tight">Momented</span> at
          a time.
        </p>
      </header>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {photos?.map((photo, index) => (
          <PhotoCard key={photo.id} photo={photo} index={index} />
        ))}
        {photos?.length === 0 && (
          <p className="text-zinc-500 col-span-full">No photos uploaded yet.</p>
        )}
      </div>
    </main>
  );
}
