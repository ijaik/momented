import PhotoGrid from "@/components/PhotoGrid";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
export const revalidate = 3600;
export default async function Home() {
  const { data: photos, error } = await supabase
    .from("photos")
    .select(
      "id, title, cloudinary_url, width, height, camera_model, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) return <EmptyState description="Failed to load." />;
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
      <PhotoGrid photos={photos || []} />
    </main>
  );
}
