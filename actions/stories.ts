"use server";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb, syncJunction } from "@/lib/db/supabase-admin";
const MAX_TITLE_LENGTH = 200;
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
function parseFormData(formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const coverPhotoRaw = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  if (coverPhotoRaw) assertValidUUID(coverPhotoRaw, "Cover photo ID");
  assertBoundedArray(photoIds, MAX_PHOTO_IDS, "Photo IDs");
  for (const pid of photoIds) assertValidUUID(pid, "Photo ID");
  return { title, cover_photo_id: coverPhotoRaw, photoIds };
}
function revalidateAfterStoryChange() {
  updateTag("stories");
  updateTag("photos");
  revalidatePath("/stories");
}
interface AdminStoryView {
  id: string | number;
  title: string;
  content: string | null;
  cover_photo_id: string | number | null;
  photos: { id: string | number; cloudinary_url: string; title?: string }[];
}
export async function getStoriesAction(): Promise<AdminStoryView[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("stories")
    .select("*, photos!photo_stories(id, cloudinary_url, title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content ?? null,
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
export async function createStoryAction(
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { title, cover_photo_id, photoIds } = parseFormData(formData);
  const content = (formData.get("content") as string) || "";
  assertBoundedString(content, MAX_CONTENT_LENGTH, "Content");
  const { data, error } = await db
    .from("stories")
    .insert([{ title, content, cover_photo_id } as never])
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncJunction(db, "photo_stories", "story_id", data.id, "photo_id", photoIds);
  revalidateAfterStoryChange();
  return { success: true };
}
export async function editStoryAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Story ID");
  const db = getAdminDb();
  const { title, cover_photo_id, photoIds } = parseFormData(formData);
  const content = (formData.get("content") as string) || "";
  assertBoundedString(content, MAX_CONTENT_LENGTH, "Content");
  const { error } = await db
    .from("stories")
    .update({ title, content, cover_photo_id } as never)
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  await syncJunction(db, "photo_stories", "story_id", id, "photo_id", photoIds);
  revalidateAfterStoryChange();
  return { success: true };
}
export async function deleteStoryAction(
  id: string | number,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Story ID");
  const db = getAdminDb();
  const { error } = await db
    .from("stories")
    .delete()
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  revalidateAfterStoryChange();
  return { success: true };
}