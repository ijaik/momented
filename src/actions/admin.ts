"use server";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import cloudinary from "@/lib/cloudinary/cloudinary";
import {
  getAdminDb,
  type JunctionTable,
  syncJunction,
} from "@/lib/db/supabase-admin";
import type { TableName } from "@/types/database.types";

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5_000;
const MAX_CONTENT_LENGTH = 50_000;
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
const revalidateAll = () => revalidatePath("/", "layout");
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
async function deleteItem(
  table: TableName,
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
  revalidateAll();
  return { success: true };
}
type ContentTable = "collections" | "rule_collections" | "stories";
interface ItemSpec {
  table: ContentTable;
  contentField: "description" | "content";
  junction?: { table: JunctionTable; mainCol: string };
}
const ITEM_SPECS = {
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
  story: {
    table: "stories",
    contentField: "content",
    junction: { table: "photo_stories", mainCol: "story_id" },
  },
} as const satisfies Record<string, ItemSpec>;
async function createItem(
  kind: keyof typeof ITEM_SPECS,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const spec = ITEM_SPECS[kind];
  const db = getAdminDb();
  const { title, cover_photo_id, photoIds } = parseFormData(formData);
  const contentValue = (formData.get(spec.contentField) as string) || "";
  const maxLen =
    spec.contentField === "content"
      ? MAX_CONTENT_LENGTH
      : MAX_DESCRIPTION_LENGTH;
  assertBoundedString(contentValue, maxLen, spec.contentField);
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
  if (spec.junction) {
    await syncJunction(
      db,
      spec.junction.table,
      spec.junction.mainCol,
      data.id,
      "photo_id",
      photoIds,
    );
  }
  revalidateAll();
  return { success: true };
}
async function editItem(
  kind: keyof typeof ITEM_SPECS,
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Item ID");
  const spec = ITEM_SPECS[kind];
  const db = getAdminDb();
  const { title, cover_photo_id, photoIds } = parseFormData(formData);
  const contentValue = (formData.get(spec.contentField) as string) || "";
  const maxLen =
    spec.contentField === "content"
      ? MAX_CONTENT_LENGTH
      : MAX_DESCRIPTION_LENGTH;
  assertBoundedString(contentValue, maxLen, spec.contentField);
  const { error } = await db
    .from(spec.table)
    .update({
      title,
      [spec.contentField]: contentValue,
      cover_photo_id,
    } as never)
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  if (spec.junction) {
    await syncJunction(
      db,
      spec.junction.table,
      spec.junction.mainCol,
      id,
      "photo_id",
      photoIds,
    );
  }
  revalidateAll();
  return { success: true };
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
  revalidateAll();
  return { success: true };
}
interface AdminItemView {
  id: string | number;
  title: string;
  description?: string | null;
  content?: string | null;
  cover_photo_id?: string | number | null;
  photos: { id: string | number; cloudinary_url: string; title?: string }[];
  [key: string]: unknown;
}
async function getItemsAction(
  kind: keyof typeof ITEM_SPECS,
): Promise<AdminItemView[]> {
  await verifyAdminSession();
  const spec = ITEM_SPECS[kind];
  const db = getAdminDb();
  const { data, error } = await db
    .from(spec.table)
    .select(`*, photos!${spec.junction?.table}(id, cloudinary_url, title)`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    [spec.contentField]: row[spec.contentField as keyof typeof row] ?? null,
    cover_photo_id: row.cover_photo_id ?? null,
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
  return getItemsAction("collection");
}
export async function createCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  return createItem("collection", formData);
}
export async function editCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  return editItem("collection", id, formData);
}
export async function deleteCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteItem("collections", id);
}
export async function getStoriesAction() {
  return getItemsAction("story");
}
export async function createStoryAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  return createItem("story", formData);
}
export async function editStoryAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  return editItem("story", id, formData);
}
export async function deleteStoryAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteItem("stories", id);
}
export async function getRuleCollectionsAction() {
  return getItemsAction("rule");
}
export async function createRuleCollectionAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  return createItem("rule", formData);
}
export async function editRuleCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  return editItem("rule", id, formData);
}
export async function deleteRuleCollectionAction(
  id: string | number,
): Promise<{ success: boolean }> {
  return deleteItem("rule_collections", id);
}
interface AdminCalendarView {
  id: number;
  title: string;
  description: string | null;
  cover_photo_id: string | null;
  photos: { id: string | number; cloudinary_url: string; title?: string }[];
}
export async function getCalendarCollectionsAction(): Promise<
  AdminCalendarView[]
> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("calendar_collections")
    .select("*, photos!photo_calendar_collections(id, cloudinary_url, title)")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cover_photo_id: row.cover_photo_id,
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
export async function editCalendarCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const { title, description, cover_photo_id } = parseFormData(formData);
  const db = getAdminDb();
  const { error } = await db
    .from("calendar_collections")
    .update({ title, description, cover_photo_id })
    .eq("id", id as never);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { success: true };
}
