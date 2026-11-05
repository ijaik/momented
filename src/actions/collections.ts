"use server";
import { updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import {
  getAdminDb,
  type JunctionTable,
  syncJunction,
} from "@/lib/db/supabase-admin";
import { assertValidUUID, parseEntityFormData } from "@/lib/utils/validation";

function revalidateAfterCollectionChange(
  kind: "collection" | "rule",
  id?: string,
) {
  updateTag("collections");
  updateTag("rules");
  updateTag("collections-ids");
  updateTag("rule_collections-ids");
  updateTag("photos");
  if (id) updateTag(`${kind}-${id}`);
}
type ContentTable = "collections" | "rule_collections";
interface CollectionSpec {
  table: ContentTable;
  junction: { table: JunctionTable; mainCol: string };
}
const COLLECTION_SPECS = {
  collection: {
    table: "collections",
    junction: { table: "photo_collections", mainCol: "collection_id" },
  },
  rule: {
    table: "rule_collections",
    junction: {
      table: "photo_rule_collections",
      mainCol: "rule_id",
    },
  },
} as const satisfies Record<string, CollectionSpec>;
async function deleteCollection(
  kind: keyof typeof COLLECTION_SPECS,
  id: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Item ID");
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { error } = await db
    .from(spec.table)
    .delete()
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  revalidateAfterCollectionChange(kind, id);
  return { success: true };
}
async function createCollection(
  kind: keyof typeof COLLECTION_SPECS,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseEntityFormData(formData);
  const { data, error } = await db
    .from(spec.table)
    .insert([
      {
        title,
        description,
        cover_photo_id,
      } as never,
    ])
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    spec.junction.table,
    spec.junction.mainCol,
    data.id,
    "photo_id",
    photoIds,
    { skipDelete: true },
  );
  revalidateAfterCollectionChange(kind, data.id);
  return { success: true };
}
async function editCollection(
  kind: keyof typeof COLLECTION_SPECS,
  id: string,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Item ID");
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { title, description, cover_photo_id, photoIds } =
    parseEntityFormData(formData);
  const { error } = await db
    .from(spec.table)
    .update({
      title,
      description,
      cover_photo_id,
    } as never)
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    spec.junction.table,
    spec.junction.mainCol,
    id,
    "photo_id",
    photoIds,
  );
  revalidateAfterCollectionChange(kind, id);
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
