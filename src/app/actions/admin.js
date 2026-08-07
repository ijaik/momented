"use server";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/supabase-admin";

const revalidateAll = () => revalidatePath("/", "layout");
async function syncCollectionPhotos(db, collectionId, photoIds) {
  await db.from("photo_collections").delete().eq("collection_id", collectionId);
  if (photoIds?.length > 0) {
    const inserts = photoIds.map((id) => ({
      photo_id: id,
      collection_id: collectionId,
    }));
    await db.from("photo_collections").insert(inserts);
  }
}
async function syncStoryPhotos(db, storyId, photoIds) {
  await db.from("photo_stories").delete().eq("story_id", storyId);
  if (photoIds?.length > 0) {
    const inserts = photoIds.map((id) => ({ photo_id: id, story_id: storyId }));
    await db.from("photo_stories").insert(inserts);
  }
}
export async function getPhotosAction() {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { data, error } = await db
    .from("photos")
    .select(
      "*, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title), stories!photo_stories(id, title)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function deletePhotoAction(id, publicId) {
  await verifyAdminSession();
  const db = await getAdminDb();
  if (publicId) await cloudinary.uploader.destroy(publicId);
  const { error } = await db.from("photos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function editPhotoAction(
  id,
  title,
  description,
  collectionIds,
  storyIds,
  ruleIds,
) {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { error } = await db
    .from("photos")
    .update({ title, description })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await db.from("photo_collections").delete().eq("photo_id", id);
  if (collectionIds?.length) {
    await db
      .from("photo_collections")
      .insert(
        collectionIds.map((cId) => ({ photo_id: id, collection_id: cId })),
      );
  }
  await db.from("photo_rule_collections").delete().eq("photo_id", id);
  if (ruleIds?.length) {
    await db
      .from("photo_rule_collections")
      .insert(ruleIds.map((rId) => ({ photo_id: id, rule_id: rId })));
  }
  await db.from("photo_stories").delete().eq("photo_id", id);
  if (storyIds?.length) {
    await db
      .from("photo_stories")
      .insert(storyIds.map((sId) => ({ photo_id: id, story_id: sId })));
  }
  revalidateAll();
  return { success: true };
}
export async function getCollectionsAction() {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { data, error } = await db
    .from("collections")
    .select("*, photos!photo_collections(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function createCollectionAction(formData) {
  await verifyAdminSession();
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
  await syncCollectionPhotos(db, data.id, formData.getAll("photo_ids"));
  revalidateAll();
  return { success: true };
}
export async function editCollectionAction(id, formData) {
  await verifyAdminSession();
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
  await syncCollectionPhotos(db, id, formData.getAll("photo_ids"));
  revalidateAll();
  return { success: true };
}
export async function deleteCollectionAction(id) {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { error } = await db.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getStoriesAction() {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { data, error } = await db
    .from("stories")
    .select("*, photos!photo_stories(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function createStoryAction(formData) {
  await verifyAdminSession();
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
  await syncStoryPhotos(db, data.id, formData.getAll("photo_ids"));
  revalidateAll();
  return { success: true };
}
export async function editStoryAction(id, formData) {
  await verifyAdminSession();
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
  await syncStoryPhotos(db, id, formData.getAll("photo_ids"));
  revalidateAll();
  return { success: true };
}
export async function deleteStoryAction(id) {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { error } = await db.from("stories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getCalendarCollectionsAction() {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { data, error } = await db
    .from("calendar_collections")
    .select("*, photos!photo_calendar_collections(id, cloudinary_url, title)")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
export async function editCalendarCollectionAction(id, formData) {
  await verifyAdminSession();
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
async function syncRulePhotos(db, ruleId, photoIds) {
  await db.from("photo_rule_collections").delete().eq("rule_id", ruleId);
  if (photoIds?.length > 0) {
    const inserts = photoIds.map((id) => ({
      photo_id: id,
      rule_id: ruleId,
    }));
    await db.from("photo_rule_collections").insert(inserts);
  }
}
export async function getRuleCollectionsAction() {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { data, error } = await db
    .from("rule_collections")
    .select("*, photos!photo_rule_collections(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function createRuleCollectionAction(formData) {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { data, error } = await db
    .from("rule_collections")
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
  await syncRulePhotos(db, data.id, formData.getAll("photo_ids"));
  revalidateAll();
  return { success: true };
}
export async function editRuleCollectionAction(id, formData) {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { error } = await db
    .from("rule_collections")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      cover_photo_id: formData.get("cover_photo_id") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncRulePhotos(db, id, formData.getAll("photo_ids"));
  revalidateAll();
  return { success: true };
}
export async function deleteRuleCollectionAction(id) {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { error } = await db.from("rule_collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
