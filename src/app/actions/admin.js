"use server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/supabase-admin";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
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
  revalidatePath("/", "layout");
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
  revalidatePath("/", "layout");
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
  const photoIds = formData.getAll("photo_ids");
  const coverPhotoId = formData.get("cover_photo_id");
  const { data, error } = await db
    .from("collections")
    .insert([
      {
        title: formData.get("title"),
        description: formData.get("description"),
        cover_photo_id: coverPhotoId || null,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (photoIds.length > 0) {
    const { error: updateError } = await db
      .from("photos")
      .update({ collection_id: data.id })
      .in("id", photoIds);
    if (updateError) throw new Error(updateError.message);
  }
  revalidatePath("/", "layout");
  return { success: true };
}
export async function editCollectionAction(id, formData) {
  const db = await getAdminDb();
  const photoIds = formData.getAll("photo_ids");
  const coverPhotoId = formData.get("cover_photo_id");
  const { error } = await db
    .from("collections")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      cover_photo_id: coverPhotoId || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await db
    .from("photos")
    .update({ collection_id: null })
    .eq("collection_id", id);
  if (photoIds.length > 0) {
    await db.from("photos").update({ collection_id: id }).in("id", photoIds);
  }
  revalidatePath("/", "layout");
  return { success: true };
}
export async function deleteCollectionAction(id) {
  const db = await getAdminDb();
  const { error } = await db.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
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
  const photoIds = formData.getAll("photo_ids");
  const coverPhotoId = formData.get("cover_photo_id");
  const { data, error } = await db
    .from("stories")
    .insert([
      {
        title: formData.get("title"),
        content: formData.get("content"),
        cover_photo_id: coverPhotoId || null,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (photoIds.length > 0) {
    const { error: updateError } = await db
      .from("photos")
      .update({ story_id: data.id })
      .in("id", photoIds);
    if (updateError) throw new Error(updateError.message);
  }
  revalidatePath("/", "layout");
  return { success: true };
}
export async function editStoryAction(id, formData) {
  const db = await getAdminDb();
  const photoIds = formData.getAll("photo_ids");
  const coverPhotoId = formData.get("cover_photo_id");
  const { error } = await db
    .from("stories")
    .update({
      title: formData.get("title"),
      content: formData.get("content"),
      cover_photo_id: coverPhotoId || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await db.from("photos").update({ story_id: null }).eq("story_id", id);
  if (photoIds.length > 0) {
    await db.from("photos").update({ story_id: id }).in("id", photoIds);
  }
  revalidatePath("/", "layout");
  return { success: true };
}
export async function deleteStoryAction(id) {
  const db = await getAdminDb();
  const { error } = await db.from("stories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return { success: true };
}
