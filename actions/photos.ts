"use server";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { getAdminDb, syncJunction } from "@/lib/db/supabase-admin";
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5_000;
const MAX_PHOTO_IDS = 500;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertValidUUID(id: string | number, label = "ID"): void {
  if (typeof id === "number") return;
  if (typeof id !== "string" || !UUID_PATTERN.test(id))
    throw new Error(`Invalid ${label}.`);
}
function assertBoundedString(
  value: string,
  maxLength: number,
  label: string,
): void {
  if (value.length > maxLength)
    throw new Error(`${label} exceeds maximum length of ${maxLength}.`);
}
function assertBoundedArray(
  arr: unknown[],
  maxLength: number,
  label: string,
): void {
  if (arr.length > maxLength)
    throw new Error(`${label} exceeds maximum of ${maxLength} items.`);
}
function revalidateAfterPhotoChange() {
  updateTag("photos");
  revalidatePath("/");
  revalidatePath("/collections");
}
interface AdminPhotoView {
  id: string | number;
  title: string;
  description: string | null;
  cloudinary_url: string;
  cloudinary_public_id: string;
  collections: { id: string | number; title: string }[];
  rules: { id: string | number; title: string }[];
  stories: { id: string | number; title: string }[];
}
export async function getPhotosAction(): Promise<AdminPhotoView[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, cloudinary_public_id, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title), stories!photo_stories(id, title)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cloudinary_url: row.cloudinary_url,
    cloudinary_public_id: row.cloudinary_public_id,
    collections: row.collections ?? [],
    rules: row.rules ?? [],
    stories: row.stories ?? [],
  }));
}
export async function deletePhotoAction(
  id: string | number,
  publicId?: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Photo ID");
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
  revalidateAfterPhotoChange();
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
  assertValidUUID(id, "Photo ID");
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  assertBoundedArray(collectionIds, MAX_PHOTO_IDS, "Collection IDs");
  assertBoundedArray(storyIds, MAX_PHOTO_IDS, "Story IDs");
  assertBoundedArray(ruleIds, MAX_PHOTO_IDS, "Rule IDs");
  for (const cid of collectionIds) assertValidUUID(cid, "Collection ID");
  for (const sid of storyIds) assertValidUUID(sid, "Story ID");
  for (const rid of ruleIds) assertValidUUID(rid, "Rule ID");
  const db = getAdminDb();
  const { error } = await db
    .from("photos")
    .update({ title, description })
    .eq("id", id as never);
  if (error) throw new Error(error.message);
  await Promise.all([
    syncJunction(
      db,
      "photo_collections",
      "photo_id",
      id,
      "collection_id",
      collectionIds,
    ),
    syncJunction(
      db,
      "photo_rule_collections",
      "photo_id",
      id,
      "rule_id",
      ruleIds,
    ),
    syncJunction(db, "photo_stories", "photo_id", id, "story_id", storyIds),
  ]);
  revalidateAfterPhotoChange();
  return { success: true };
}