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
  const spec = ITEM_SPECS[kind];
  const db = getAdminDb();
  const { title, cover_photo_id, photoIds } = parseFormData(formData);
  const contentValue = (formData.get(spec.contentField) as string) || "";
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
async function getItemsAction(kind: keyof typeof ITEM_SPECS) {
  await verifyAdminSession();
  const spec = ITEM_SPECS[kind];
  const db = getAdminDb();
  const { data, error } = await db
    .from(spec.table)
    .select(`*, photos!${spec.junction?.table}(id, cloudinary_url, title)`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
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
