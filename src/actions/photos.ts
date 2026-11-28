"use server";
import { verifyAdminSession } from "@/lib/auth/auth";
import { revalidatePhotos } from "@/lib/cache/tags";
import { deletePhotoFromDb, updatePhotoInDb } from "@/lib/db/mutations";
import { assertValidUUID, parsePhotoEditInput } from "@/lib/utils/validation";
export async function deletePhotoAction(
  id: string,
  publicId?: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Photo ID");
  await deletePhotoFromDb(id, publicId);
  revalidatePhotos(id);
  return { success: true };
}
export async function editPhotoAction(
  id: string,
  title: string,
  description: string,
  collectionIds: string[],
  ruleIds: string[],
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const parsed = parsePhotoEditInput(
    id,
    title,
    description,
    collectionIds,
    ruleIds,
  );
  await updatePhotoInDb(id, parsed);
  revalidatePhotos(id);
  return { success: true };
}
