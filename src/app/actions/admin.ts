"use server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/supabase-admin";
import type { Database, TableName } from "@/types/database.types";

type JunctionTable =
  | "photo_collections"
  | "photo_rule_collections"
  | "photo_stories";
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
  db: SupabaseClient<Database>,
  table: JunctionTable,
  mainCol: string,
  mainId: string | number,
  targetCol: string,
  targetIds: string[],
) {
  await db
    .from(table)
    .delete()
    .eq(mainCol as never, mainId as never);
  if (targetIds?.length > 0) {
    const inserts = targetIds.map((targetId) => ({
      [mainCol]: mainId,
      [targetCol]: targetId,
    }));
    await db.from(table).insert(inserts as never);
  }
}
async function deleteItem(
  table: TableName,
  id: string | number,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { error } = await db
    .from(table)
    .delete()
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getPhotosAction() {
  await verifyAdminSession();
  const db = getAdminDb();
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
  const db = getAdminDb();
  const { error } = await db
    .from("photos")
    .delete()
    .eq("id", id as never);
  if (error) throw new Error(error.message);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error("Failed to delete Cloudinary asset:", cloudinaryError);
    }
  }
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
  const db = getAdminDb();
  const { error } = await db
    .from("photos")
    .update({ title, description })
    .eq("id", id as never);
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
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("collections")
    .select("*, photos!photo_collections(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function createCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = getAdminDb();
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
  const db = getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseFormData(formData);
  const { error } = await db
    .from("collections")
    .update({ title, description, cover_photo_id })
    .eq("id", id as never);
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
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("stories")
    .select("*, photos!photo_stories(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function createStoryAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = getAdminDb();
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
  const db = getAdminDb();
  const { title, content, cover_photo_id, photoIds } = parseFormData(formData);
  const { error } = await db
    .from("stories")
    .update({ title, content, cover_photo_id })
    .eq("id", id as never);
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
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("calendar_collections")
    .select("*, photos!photo_calendar_collections(id, cloudinary_url, title)")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function editCalendarCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { title, description, cover_photo_id } = parseFormData(formData);
  const { error } = await db
    .from("calendar_collections")
    .update({ title, description, cover_photo_id })
    .eq("id", id as never);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
export async function getRuleCollectionsAction() {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("rule_collections")
    .select("*, photos!photo_rule_collections(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function createRuleCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = getAdminDb();
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
  const db = getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseFormData(formData);
  const { error } = await db
    .from("rule_collections")
    .update({ title, description, cover_photo_id })
    .eq("id", id as never);
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
