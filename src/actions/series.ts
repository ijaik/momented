"use server";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb } from "@/lib/db/supabase-admin";
import {
  assertBoundedArray,
  assertBoundedString,
  assertValidUUID,
  MAX_DESCRIPTION_LENGTH,
  MAX_SERIES_PHOTO_IDS,
  MAX_TITLE_LENGTH,
} from "@/lib/utils/validation";

function revalidateAfterSeriesChange(id?: string) {
  updateTag("series");
  updateTag("series-ids");
  updateTag("photos");
  revalidatePath("/series");
  revalidatePath("/");
  if (id) {
    updateTag(`series-${id}`);
    revalidatePath(`/series/${id}`);
  }
}
export async function getSeriesAction() {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("series")
    .select(
      "id, title, description, cover_photo_id, created_at, series_photos(position, photos(id, title, cloudinary_url))",
    )
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "series_photos", ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((s) => {
    const rawPhotos = s.series_photos || [];
    const photos = rawPhotos
      .map((sp) => sp.photos)
      .filter((p): p is { id: string; title: string; cloudinary_url: string } =>
        Boolean(p),
      );
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      cover_photo_id: s.cover_photo_id,
      created_at: s.created_at,
      photos,
    };
  });
}
export async function createSeriesAction(
  formData: FormData,
): Promise<{ success: boolean; id?: string }> {
  await verifyAdminSession();
  const title = ((formData.get("title") as string) || "").trim();
  const description =
    ((formData.get("description") as string) || "").trim() || null;
  const coverPhotoRaw = (formData.get("cover_photo_id") as string) || null;
  const photoIds = Array.from(
    new Set(formData.getAll("photo_ids").map(String)),
  );
  if (!title) throw new Error("Series title is required.");
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  if (description)
    assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  if (coverPhotoRaw) assertValidUUID(coverPhotoRaw, "Cover photo ID");
  assertBoundedArray(photoIds, MAX_SERIES_PHOTO_IDS, "Photo IDs");
  for (const pid of photoIds) assertValidUUID(pid, "Photo ID");
  const db = getAdminDb();
  const coverId = coverPhotoRaw || photoIds[0] || null;
  const { data: newSeries, error: insertError } = await db
    .from("series")
    .insert([
      {
        title,
        description,
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
    if (junctionError) throw new Error(junctionError.message);
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
  const title = ((formData.get("title") as string) || "").trim();
  const description =
    ((formData.get("description") as string) || "").trim() || null;
  const coverPhotoRaw = (formData.get("cover_photo_id") as string) || null;
  const photoIds = Array.from(
    new Set(formData.getAll("photo_ids").map(String)),
  );
  if (!title) throw new Error("Series title is required.");
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  if (description)
    assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  if (coverPhotoRaw) assertValidUUID(coverPhotoRaw, "Cover photo ID");
  assertBoundedArray(photoIds, MAX_SERIES_PHOTO_IDS, "Photo IDs");
  for (const pid of photoIds) assertValidUUID(pid, "Photo ID");
  const db = getAdminDb();
  const coverId = coverPhotoRaw || photoIds[0] || null;
  const { error: updateError } = await db
    .from("series")
    .update({
      title,
      description,
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
