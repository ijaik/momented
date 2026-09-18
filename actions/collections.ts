"use server";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import {
  getAdminDb,
  type JunctionTable,
  syncJunction,
} from "@/lib/db/supabase-admin";
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
function parseFormData(formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const coverPhotoRaw = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  if (coverPhotoRaw) assertValidUUID(coverPhotoRaw, "Cover photo ID");
  assertBoundedArray(photoIds, MAX_PHOTO_IDS, "Photo IDs");
  for (const pid of photoIds) assertValidUUID(pid, "Photo ID");
  return {
    title,
    description,
    cover_photo_id: coverPhotoRaw,
    photoIds,
  };
}
function revalidateAfterCollectionChange() {
  updateTag("collections");
  updateTag("photos");
  revalidatePath("/collections");
}
type ContentTable = "collections" | "rule_collections";
interface CollectionSpec {
  table: ContentTable;
  contentField: "description";
  junction: { table: JunctionTable; mainCol: string };
}
const COLLECTION_SPECS = {
  collection: {
    table: "collections",
    contentField: "description",
    junction: { table: "photo_collections", mainCol: "collection_id" },
  },
  rule: {
    table: "rule_collections",
    contentField: "description",
    junction: {
      table: "photo_rule_collections",
      mainCol: "rule_id",
    },
  },
} as const satisfies Record<string, CollectionSpec>;
async function deleteCollection(
  table: ContentTable,
  id: string | number,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Item ID");
  const db = getAdminDb();
  const { error } = await db
    .from(table)
    .delete()
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  revalidateAfterCollectionChange();
  return { success: true };
}
async function createCollection(
  kind: keyof typeof COLLECTION_SPECS,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { title, cover_photo_id, photoIds } = parseFormData(formData);
  const contentValue = (formData.get(spec.contentField) as string) || "";
  assertBoundedString(contentValue, MAX_DESCRIPTION_LENGTH, spec.contentField);
  const { data, error } = await db
    .from(spec.table)
    .insert([
      {
        title,
        [spec.contentField]: contentValue,
        cover_photo_id,
      } as never,
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    spec.junction.table,
    spec.junction.mainCol,
    data.id,
    "photo_id",
    photoIds,
  );
  revalidateAfterCollectionChange();
  return { success: true };
}
async function editCollection(
  kind: keyof typeof COLLECTION_SPECS,
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Item ID");
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { title, cover_photo_id, photoIds } = parseFormData(formData);
  const contentValue = (formData.get(spec.contentField) as string) || "";
  assertBoundedString(contentValue, MAX_DESCRIPTION_LENGTH, spec.contentField);
  const { error } = await db
    .from(spec.table)
    .update({
      title,
      [spec.contentField]: contentValue,
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
  revalidateAfterCollectionChange();
  return { success: true };
}
interface AdminCollectionView {
  id: string | number;
  title: string;
  description: string | null;
  cover_photo_id: string | number | null;
  photos: { id: string | number; cloudinary_url: string; title?: string }[];
}
async function getCollections(
  kind: keyof typeof COLLECTION_SPECS,
): Promise<AdminCollectionView[]> {
  await verifyAdminSession();
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { data, error } = await db
    .from(spec.table)
    .select(`*, photos!${spec.junction.table}(id, cloudinary_url, title)`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: (row as Record<string, unknown>)["description"] as
      | string
      | null,
    cover_photo_id: (row as Record<string, unknown>)["cover_photo_id"] as
      | string
      | number
      | null,
    photos: (
      (row.photos ?? []) as {
        id: string | number;
        cloudinary_url: string;
        title: string | null;
      }[]
    ).map((p) => ({
      id: p.id,
      cloudinary_url: p.cloudinary_url,
      title: p.title ?? undefined,
    })),
  }));
}
export async function getCollectionsAction() {
  return getCollections("collection");
}
export async function createCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  return createCollection("collection", formData);
}
export async function editCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  return editCollection("collection", id, formData);
}
export async function deleteCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteCollection("collections", id);
}
export async function getRuleCollectionsAction() {
  return getCollections("rule");
}
export async function createRuleCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  return createCollection("rule", formData);
}
export async function editRuleCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  return editCollection("rule", id, formData);
}
export async function deleteRuleCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteCollection("rule_collections", id);
}