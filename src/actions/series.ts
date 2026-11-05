"use server";
import { updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb } from "@/lib/db/supabase-admin";
import {
  assertValidUUID,
  MAX_SERIES_PHOTO_IDS,
  parseEntityFormData,
} from "@/lib/utils/validation";

function revalidateAfterSeriesChange(id?: string) {
  updateTag("series");
  updateTag("series-ids");
  updateTag("photos");
  if (id) updateTag(`series-${id}`);
}
export async function createSeriesAction(
  formData: FormData,
): Promise<{ success: boolean; id?: string }> {
  await verifyAdminSession();
  const { title, description, cover_photo_id, photoIds } = parseEntityFormData(
    formData,
    { maxPhotos: MAX_SERIES_PHOTO_IDS, requireTitle: true },
  );
  const db = getAdminDb();
  const coverId = cover_photo_id || photoIds[0] || null;
  const { data: newSeries, error: insertError } = await db
    .from("series")
    .insert([
      {
        title,
        description: description || null,
        cover_photo_id: coverId,
      },
    ])
    .select("id")
    .single();
  if (insertError || !newSeries)
    throw new Error(insertError?.message || "Failed to create series.");
  if (photoIds.length > 0) {
    const seriesPhotoInserts = photoIds.map((pid, index) => ({
      series_id: newSeries.id,
      photo_id: pid,
      position: index,
    }));
    const { error: junctionError } = await db
      .from("series_photos")
      .insert(seriesPhotoInserts);
    if (junctionError) {
      await db.from("series").delete().eq("id", newSeries.id);
      throw new Error(junctionError.message);
    }
  }
  revalidateAfterSeriesChange(newSeries.id);
  return { success: true, id: newSeries.id };
}
export async function editSeriesAction(
  id: string,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Series ID");
  const { title, description, cover_photo_id, photoIds } = parseEntityFormData(
    formData,
    { maxPhotos: MAX_SERIES_PHOTO_IDS, requireTitle: true },
  );
  const db = getAdminDb();
  const coverId = cover_photo_id || photoIds[0] || null;
  const { error: updateError } = await db
    .from("series")
    .update({
      title,
      description: description || null,
      cover_photo_id: coverId,
    })
    .eq("id", id);
  if (updateError) throw new Error(updateError.message);
  const positions = photoIds.map((_, index) => index);
  const { error: rpcError } = await db.rpc("replace_series_photos", {
    p_series_id: id,
    p_photo_ids: photoIds,
    p_positions: positions,
  });
  if (rpcError) throw new Error(rpcError.message);
  revalidateAfterSeriesChange(id);
  return { success: true };
}
export async function deleteSeriesAction(
  id: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Series ID");
  const db = getAdminDb();
  const { error } = await db.from("series").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAfterSeriesChange(id);
  return { success: true };
}
