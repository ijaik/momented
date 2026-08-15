import PhotoGrid from "@/components/photos/PhotoGrid";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getHomePhotos } from "@/lib/db/queries";
export const revalidate = 3600;
export default async function Home() {
  const { data: photos, error } = await getHomePhotos();
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
