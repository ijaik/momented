import PhotoGrid from "@/components/PhotoGrid";
import { supabase } from "@/lib/supabase";
export default async function Home() {
  const { data: photos, error } = await supabase
    .from("photos")
    .select("id, title, cloudinary_url, width, height, camera_model")
    .order("created_at", { ascending: false });
  if (error) return <div className="p-10 text-center">Failed to load.</div>;
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <header className="mb-20 text-center">
        <h1 className="text-[50px] font-extrabold tracking-tighter mb-6 text-zinc-900 dark:text-white leading-tight">
          Photos
        </h1>
        <p className="text-[25px] text-zinc-400 dark:text-zinc-600">
          <span className="font-leckerli tracking-tight">Momented</span> at a
          time.
        </p>
      </header>
      <PhotoGrid photos={photos} />
    </main>
  );
}
