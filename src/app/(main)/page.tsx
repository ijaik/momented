import PhotoGrid from "@/components/PhotoGrid";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import type { Photo } from "@/types";
export default async function Home() {
  const { data: photos, error } = await supabase
    .from("photos")
    .select("id, title, cloudinary_url, width, height, camera_model")
    .order("created_at", { ascending: false });
  if (error) return <div className="p-10 text-center">Failed to load.</div>;
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <PageHeader
        title="Photos"
        subtitle={
          <>
            <span className="font-leckerli tracking-tight">Momented</span> at a
            time.
          </>
        }
      />
      <PhotoGrid photos={(photos as Photo[]) || []} />
    </main>
  );
}
