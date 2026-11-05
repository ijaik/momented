"use server";
import { updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { getAdminDb, syncJunction } from "@/lib/db/supabase-admin";
import {
  assertBoundedArray,
  assertBoundedString,
  assertValidUUID,
  CLOUDINARY_PUBLIC_ID_PATTERN,
  MAX_DESCRIPTION_LENGTH,
  MAX_PHOTO_IDS,
  MAX_TITLE_LENGTH,
} from "@/lib/utils/validation";

function revalidateAfterPhotoChange(id?: string | number) {
  updateTag("photos");
  updateTag("photos-ids");
  updateTag("collections");
  updateTag("rules");
  updateTag("calendar");
  updateTag("series");
  if (id) updateTag(`photo-${id}`);
}
export async function deletePhotoAction(
  id: string | number,
  publicId?: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Photo ID");
  const db = getAdminDb();
  await Promise.all([
    db
      .from("collections")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
    db
      .from("rule_collections")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
    db
      .from("calendar_collections")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
    db
      .from("series")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
  ]);
  const { data: deletedPhoto, error } = await db
    .from("photos")
    .delete()
    .eq("id", id as never)
    .select("cloudinary_public_id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const resolvedPublicId = deletedPhoto?.cloudinary_public_id || publicId;
  if (resolvedPublicId && CLOUDINARY_PUBLIC_ID_PATTERN.test(resolvedPublicId)) {
    try {
      await cloudinary.uploader.destroy(resolvedPublicId);
    } catch (cloudinaryError) {
      console.error("Failed to delete Cloudinary asset:", cloudinaryError);
    }
  }
  revalidateAfterPhotoChange(id);
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
  revalidateAfterPhotoChange(id);
  return { success: true };
}
