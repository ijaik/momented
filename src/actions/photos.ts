"use server";
import { verifyAdminSession } from "@/lib/auth/auth";
import { revalidatePhotos } from "@/lib/cache/tags";
import { deletePhotoFromDb, updatePhotoInDb } from "@/lib/db/mutations";
import {
  assertBoundedArray,
  assertBoundedString,
  assertValidUUID,
  MAX_DESCRIPTION_LENGTH,
  MAX_PHOTO_IDS,
  MAX_TITLE_LENGTH,
} from "@/lib/utils/validation";
export async function deletePhotoAction(
  id: string | number,
  publicId?: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Photo ID");
  await deletePhotoFromDb(id, publicId);
  revalidatePhotos(id);
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
  await updatePhotoInDb(id, {
    title,
    description,
    collectionIds,
    ruleIds,
  });
  revalidatePhotos(id);
  return { success: true };
}
