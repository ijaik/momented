"use server";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { getAdminDb, syncJunction } from "@/lib/db/supabase-admin";
import {
  assertBoundedArray,
  assertBoundedString,
  assertValidUUID,
  MAX_DESCRIPTION_LENGTH,
  MAX_PHOTO_IDS,
  MAX_TITLE_LENGTH,
} from "@/lib/utils/validation";

function revalidateAfterPhotoChange() {
  updateTag("photos");
  updateTag("photos-ids");
  updateTag("collections");
  revalidatePath("/");
  revalidatePath("/collections");
}
interface AdminPhotoView {
  id: string | number;
  title: string;
  description: string | null;
  cloudinary_url: string;
  cloudinary_public_id: string;
  downloads: number;
  shares: number;
  collections: { id: string | number; title: string }[];
  rules: { id: string | number; title: string }[];
}
export async function getPhotosAction(): Promise<AdminPhotoView[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, cloudinary_public_id, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cloudinary_url: row.cloudinary_url,
    cloudinary_public_id: row.cloudinary_public_id,
    downloads: row.downloads ?? 0,
    shares: row.shares ?? 0,
    collections: row.collections ?? [],
    rules: row.rules ?? [],
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
  ruleIds: string[],
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Photo ID");
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  assertBoundedArray(collectionIds, MAX_PHOTO_IDS, "Collection IDs");
  assertBoundedArray(ruleIds, MAX_PHOTO_IDS, "Rule IDs");
  for (const cid of collectionIds) assertValidUUID(cid, "Collection ID");
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
  ]);
  revalidateAfterPhotoChange();
  return { success: true };
}
