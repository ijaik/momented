"use server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/supabase-admin";

const revalidateAll = () => revalidatePath("/", "layout");
async function syncCollectionPhotos(
  db: SupabaseClient,
  collectionId: string | number,
  photoIds: string[],
) {
  await db.from("photo_collections").delete().eq("collection_id", collectionId);
  if (photoIds?.length > 0) {
    const inserts = photoIds.map((id) => ({
      photo_id: id,
      collection_id: collectionId,
    }));
    await db.from("photo_collections").insert(inserts);
  }
}
async function syncStoryPhotos(
  db: SupabaseClient,
  storyId: string | number,
  photoIds: string[],
) {
  await db.from("photo_stories").delete().eq("story_id", storyId);
  if (photoIds?.length > 0) {
    const inserts = photoIds.map((id) => ({
      photo_id: id,
      story_id: storyId,
    }));
    await db.from("photo_stories").insert(inserts);
  }
}
async function syncRulePhotos(
  db: SupabaseClient,
  ruleId: string | number,
  photoIds: string[],
) {
  await db.from("photo_rule_collections").delete().eq("rule_id", ruleId);
  if (photoIds?.length > 0) {
    const inserts = photoIds.map((id) => ({
      photo_id: id,
      rule_id: ruleId,
    }));
    await db.from("photo_rule_collections").insert(inserts);
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
export async function deletePhotoAction(
  id: string | number,
  publicId?: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
  const { error } = await db.from("photos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function editPhotoAction(
  id: string | number,
  title: string,
  description: string,
  collectionIds: string[],
  storyIds: string[],
  ruleIds: string[],
): Promise<{ success: boolean }> {
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
export async function createCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const cover_photo_id = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  const { data, error } = await db
    .from("collections")
    .insert([
      {
        title,
        description,
        cover_photo_id,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncCollectionPhotos(db, data.id, photoIds);
  revalidateAll();
  return { success: true };
}
export async function editCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const cover_photo_id = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  const { error } = await db
    .from("collections")
    .update({
      title,
      description,
      cover_photo_id,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncCollectionPhotos(db, id, photoIds);
  revalidateAll();
  return { success: true };
}
export async function deleteCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
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
export async function createStoryAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const title = (formData.get("title") as string) || "";
  const content = (formData.get("content") as string) || "";
  const cover_photo_id = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  const { data, error } = await db
    .from("stories")
    .insert([
      {
        title,
        content,
        cover_photo_id,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncStoryPhotos(db, data.id, photoIds);
  revalidateAll();
  return { success: true };
}
export async function editStoryAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const title = (formData.get("title") as string) || "";
  const content = (formData.get("content") as string) || "";
  const cover_photo_id = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  const { error } = await db
    .from("stories")
    .update({
      title,
      content,
      cover_photo_id,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncStoryPhotos(db, id, photoIds);
  revalidateAll();
  return { success: true };
}
export async function deleteStoryAction(
  id: string | number,
): Promise<{ success: boolean }> {
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
export async function editCalendarCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const cover_photo_id = (formData.get("cover_photo_id") as string) || null;
  const { error } = await db
    .from("calendar_collections")
    .update({
      title,
      description,
      cover_photo_id,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
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
export async function createRuleCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const cover_photo_id = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  const { data, error } = await db
    .from("rule_collections")
    .insert([
      {
        title,
        description,
        cover_photo_id,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncRulePhotos(db, data.id, photoIds);
  revalidateAll();
  return { success: true };
}
export async function editRuleCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const cover_photo_id = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  const { error } = await db
    .from("rule_collections")
    .update({
      title,
      description,
      cover_photo_id,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncRulePhotos(db, id, photoIds);
  revalidateAll();
  return { success: true };
}
export async function deleteRuleCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { error } = await db.from("rule_collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
