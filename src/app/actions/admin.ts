"use server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/supabase-admin";

const revalidateAll = () => revalidatePath("/", "layout");
function parseFormData(formData: FormData) {
  return {
    title: (formData.get("title") as string) || "",
    description: (formData.get("description") as string) || "",
    content: (formData.get("content") as string) || "",
    cover_photo_id: (formData.get("cover_photo_id") as string) || null,
    photoIds: formData.getAll("photo_ids").map(String),
  };
}
async function syncJunction(
  db: SupabaseClient,
  table: string,
  mainCol: string,
  mainId: string | number,
  targetCol: string,
  targetIds: string[],
) {
  await db.from(table).delete().eq(mainCol, mainId);
  if (targetIds?.length > 0) {
    const inserts = targetIds.map((targetId) => ({
      [mainCol]: mainId,
      [targetCol]: targetId,
    }));
    await db.from(table).insert(inserts);
  }
}
async function fetchItemsWithPhotos<
  TTable extends string,
  TRelation extends string,
>(
  table: TTable,
  photoRelation: TRelation,
  orderBy = "created_at",
  ascending = false,
) {
  await verifyAdminSession();
  const db = await getAdminDb();
  const selectQuery =
    `*, photos!${photoRelation}(id, cloudinary_url, title)` as const;
  const { data, error } = await db
    .from(table)
    .select(selectQuery)
    .order(orderBy, { ascending });
  if (error) throw new Error(error.message);
  return data ?? [];
}
async function deleteItem(
  table: string,
  id: string | number,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
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
  if (publicId) await cloudinary.uploader.destroy(publicId);
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
  await syncJunction(
    db,
    "photo_collections",
    "photo_id",
    id,
    "collection_id",
    collectionIds,
  );
  await syncJunction(
    db,
    "photo_rule_collections",
    "photo_id",
    id,
    "rule_id",
    ruleIds,
  );
  await syncJunction(db, "photo_stories", "photo_id", id, "story_id", storyIds);
  revalidateAll();
  return { success: true };
}
export async function getCollectionsAction() {
  return fetchItemsWithPhotos("collections", "photo_collections");
}
export async function createCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseFormData(formData);
  const { data, error } = await db
    .from("collections")
    .insert([{ title, description, cover_photo_id }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    "photo_collections",
    "collection_id",
    data.id,
    "photo_id",
    photoIds,
  );
  revalidateAll();
  return { success: true };
}
export async function editCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseFormData(formData);
  const { error } = await db
    .from("collections")
    .update({ title, description, cover_photo_id })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    "photo_collections",
    "collection_id",
    id,
    "photo_id",
    photoIds,
  );
  revalidateAll();
  return { success: true };
}
export async function deleteCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteItem("collections", id);
}
export async function getStoriesAction() {
  return fetchItemsWithPhotos("stories", "photo_stories");
}
export async function createStoryAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { title, content, cover_photo_id, photoIds } = parseFormData(formData);
  const { data, error } = await db
    .from("stories")
    .insert([{ title, content, cover_photo_id }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    "photo_stories",
    "story_id",
    data.id,
    "photo_id",
    photoIds,
  );
  revalidateAll();
  return { success: true };
}
export async function editStoryAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { title, content, cover_photo_id, photoIds } = parseFormData(formData);
  const { error } = await db
    .from("stories")
    .update({ title, content, cover_photo_id })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncJunction(db, "photo_stories", "story_id", id, "photo_id", photoIds);
  revalidateAll();
  return { success: true };
}
export async function deleteStoryAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteItem("stories", id);
}
export async function getCalendarCollectionsAction() {
  return fetchItemsWithPhotos(
    "calendar_collections",
    "photo_calendar_collections",
    "id",
    true,
  );
}
export async function editCalendarCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { title, description, cover_photo_id } = parseFormData(formData);
  const { error } = await db
    .from("calendar_collections")
    .update({ title, description, cover_photo_id })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getRuleCollectionsAction() {
  return fetchItemsWithPhotos("rule_collections", "photo_rule_collections");
}
export async function createRuleCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseFormData(formData);
  const { data, error } = await db
    .from("rule_collections")
    .insert([{ title, description, cover_photo_id }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    "photo_rule_collections",
    "rule_id",
    data.id,
    "photo_id",
    photoIds,
  );
  revalidateAll();
  return { success: true };
}
export async function editRuleCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = await getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseFormData(formData);
  const { error } = await db
    .from("rule_collections")
    .update({ title, description, cover_photo_id })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    "photo_rule_collections",
    "rule_id",
    id,
    "photo_id",
    photoIds,
  );
  revalidateAll();
  return { success: true };
}
export async function deleteRuleCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteItem("rule_collections", id);
}
