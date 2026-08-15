import PhotoGrid from "@/components/photos/PhotoGrid";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import {
  getAllIds,
  getPhotosForRule,
  getRuleCollectionById,
} from "@/lib/db/queries";
import type { PageProps } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("rule_collections");
  return ids.map((id) => ({ id }));
}
export default async function SingleRulePage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getRuleCollectionById(id),
    getPhotosForRule(id),
  ]);
  if (!collection)
    return <EmptyState description="Rule collection not found." />;
  return (
    <DetailLayout title={collection.title} description={collection.description}>
      <PhotoGrid
        photos={photos || []}
        emptyMessage="No photos have been tagged with this rule yet."
      />
    </DetailLayout>
  );
}
