"use server";
import { revalidatePath } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/supabase-admin";

const revalidateAll = () => revalidatePath("/", "layout");
async function syncPhotoRelations(db, column, entityId, photoIds) {
  await db
    .from("photos")
    .update({ [column]: null })
    .eq(column, entityId);
  if (photoIds && photoIds.length > 0) {
    const { error } = await db
      .from("photos")
      .update({ [column]: entityId })
      .in("id", photoIds);
    if (error) throw new Error(error.message);
  }
}
export async function getPhotosAction() {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("photos")
    .select("*, collections!collection_id(title), stories!story_id(title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function deletePhotoAction(id, publicId) {
  const db = await getAdminDb();
  await cloudinary.uploader.destroy(publicId);
  const { error } = await db.from("photos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function editPhotoAction(
  id,
  title,
  description,
  collectionId,
  storyId,
) {
  const db = await getAdminDb();
  const { error } = await db
    .from("photos")
    .update({
      title,
      description,
      collection_id: collectionId || null,
      story_id: storyId || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getCollectionsAction() {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("collections")
    .select("*, photos!collection_id(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function createCollectionAction(formData) {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("collections")
    .insert([
      {
        title: formData.get("title"),
        description: formData.get("description"),
        cover_photo_id: formData.get("cover_photo_id") || null,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncPhotoRelations(
    db,
    "collection_id",
    data.id,
    formData.getAll("photo_ids"),
  );
  revalidateAll();
  return { success: true };
}
export async function editCollectionAction(id, formData) {
  const db = await getAdminDb();
  const { error } = await db
    .from("collections")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      cover_photo_id: formData.get("cover_photo_id") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncPhotoRelations(
    db,
    "collection_id",
    id,
    formData.getAll("photo_ids"),
  );
  revalidateAll();
  return { success: true };
}
export async function deleteCollectionAction(id) {
  const db = await getAdminDb();
  const { error } = await db.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getStoriesAction() {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("stories")
    .select("*, photos!story_id(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function createStoryAction(formData) {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("stories")
    .insert([
      {
        title: formData.get("title"),
        content: formData.get("content"),
        cover_photo_id: formData.get("cover_photo_id") || null,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncPhotoRelations(
    db,
    "story_id",
    data.id,
    formData.getAll("photo_ids"),
  );
  revalidateAll();
  return { success: true };
}
export async function editStoryAction(id, formData) {
  const db = await getAdminDb();
  const { error } = await db
    .from("stories")
    .update({
      title: formData.get("title"),
      content: formData.get("content"),
      cover_photo_id: formData.get("cover_photo_id") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncPhotoRelations(db, "story_id", id, formData.getAll("photo_ids"));
  revalidateAll();
  return { success: true };
}
export async function deleteStoryAction(id) {
  const db = await getAdminDb();
  const { error } = await db.from("stories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getCalendarCollectionsAction() {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("calendar_collections")
    .select(
      "*, photos!calendar_collections_cover_photo_id_fkey(id, cloudinary_url)",
    )
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
export async function editCalendarCollectionAction(id, formData) {
  const db = await getAdminDb();
  const { error } = await db
    .from("calendar_collections")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      cover_photo_id: formData.get("cover_photo_id") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
