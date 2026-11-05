"use server";
import { verifyAdminSession } from "@/lib/auth/auth";
import { revalidateCollections, revalidateRules } from "@/lib/cache/tags";
import {
  createCollectionInDb,
  deleteCollectionFromDb,
  updateCollectionInDb,
} from "@/lib/db/mutations";
import { assertValidUUID, parseEntityFormData } from "@/lib/utils/validation";

function revalidate(kind: "collection" | "rule", id?: string) {
  if (kind === "collection") revalidateCollections(id);
  else revalidateRules(id);
}
async function deleteCollection(
  kind: "collection" | "rule",
  id: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Item ID");
  await deleteCollectionFromDb(kind, id);
  revalidate(kind, id);
  return { success: true };
}
async function createCollection(
  kind: "collection" | "rule",
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const { title, description, cover_photo_id, photoIds } =
    parseEntityFormData(formData);
  const id = await createCollectionInDb(kind, {
    title,
    description,
    cover_photo_id,
    photoIds,
  });
  revalidate(kind, id);
  return { success: true };
}
async function editCollection(
  kind: "collection" | "rule",
  id: string,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Item ID");
  const { title, description, cover_photo_id, photoIds } =
    parseEntityFormData(formData);
  await updateCollectionInDb(kind, id, {
    title,
    description,
    cover_photo_id,
    photoIds,
  });
  revalidate(kind, id);
  return { success: true };
}
export async function createCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  return createCollection("collection", formData);
}
export async function editCollectionAction(
  id: string,
  formData: FormData,
): Promise<{ success: boolean }> {
  return editCollection("collection", id, formData);
}
export async function deleteCollectionAction(
  id: string,
): Promise<{ success: boolean }> {
  return deleteCollection("collection", id);
}
export async function createRuleCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  return createCollection("rule", formData);
}
export async function editRuleCollectionAction(
  id: string,
  formData: FormData,
): Promise<{ success: boolean }> {
  return editCollection("rule", id, formData);
}
export async function deleteRuleCollectionAction(
  id: string,
): Promise<{ success: boolean }> {
  return deleteCollection("rule", id);
}
