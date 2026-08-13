import "server-only";
import { supabase } from "@/lib/supabase";
export const PHOTO_CARD_COLUMNS =
  "id, title, description, created_at, cloudinary_url, width, height, camera_model";
export type IdTable =
  | "photos"
  | "collections"
  | "rule_collections"
  | "stories"
  | "calendar_collections";
export async function getAllIds(table: IdTable): Promise<string[]> {
  const { data } = await supabase.from(table).select("id");
  return (data ?? []).map((row) => String(row.id));
}
export async function getHomePhotos() {
  return supabase
    .from("photos")
    .select(
      "id, title, cloudinary_url, width, height, camera_model, created_at",
    )
    .order("created_at", { ascending: false });
}
export async function getPhotoById(id: string) {
  return supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, width, height, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title), stories!photo_stories(id, title)",
    )
    .eq("id", id)
    .single();
}
export async function getPhotosForCollection(collectionId: string) {
  return supabase
    .from("photos")
    .select(
      `id, title, description, created_at, cloudinary_url, width, height, camera_model, photo_collections!inner(collection_id)`,
    )
    .eq("photo_collections.collection_id", collectionId)
    .order("created_at", { ascending: false });
}
export async function getPhotosForRule(ruleId: string) {
  return supabase
    .from("photos")
    .select(
      `id, title, description, created_at, cloudinary_url, width, height, camera_model, photo_rule_collections!inner(rule_id)`,
    )
    .eq("photo_rule_collections.rule_id", ruleId)
    .order("created_at", { ascending: false });
}
export async function getPhotosForStory(storyId: string) {
  return supabase
    .from("photos")
    .select(
      `id, title, description, created_at, cloudinary_url, width, height, camera_model, photo_stories!inner(story_id)`,
    )
    .eq("photo_stories.story_id", storyId)
    .order("created_at", { ascending: true });
}
export async function getPhotosForCalendarMonth(monthIndex: number) {
  return supabase
    .from("photos")
    .select(
      "id, title, cloudinary_url, width, height, camera_model, taken_at, created_at, photo_calendar_collections!inner(calendar_id)",
    )
    .eq("photo_calendar_collections.calendar_id", monthIndex)
    .order("created_at", { ascending: false });
}
export async function getCuratedCollections() {
  return supabase
    .from("collections")
    .select("*, photos!photo_collections(id, cloudinary_url)")
    .order("created_at", { ascending: false });
}
export async function getCollectionById(id: string) {
  return supabase
    .from("collections")
    .select("title, description")
    .eq("id", id)
    .single();
}
export async function getRuleCollectionsList() {
  return supabase
    .from("rule_collections")
    .select("*, photos!photo_rule_collections(id, cloudinary_url)")
    .order("created_at", { ascending: false });
}
export async function getRuleCollectionById(id: string) {
  return supabase
    .from("rule_collections")
    .select("title, description")
    .eq("id", id)
    .single();
}
export async function getCalendarCollectionsList() {
  return supabase
    .from("calendar_collections")
    .select("*, photos!photo_calendar_collections(id, cloudinary_url)")
    .order("id", { ascending: true });
}
export async function getCalendarMonthById(monthIndex: number) {
  return supabase
    .from("calendar_collections")
    .select("title, description")
    .eq("id", monthIndex)
    .single();
}
export async function getCalendarMonthTitle(monthIndex: number) {
  return supabase
    .from("calendar_collections")
    .select("id, title")
    .eq("id", monthIndex);
}
export async function getStoriesWithPhotos() {
  return supabase
    .from("stories")
    .select("*, photos!photo_stories(id, cloudinary_url)")
    .order("created_at", { ascending: false });
}
export async function getStoryById(id: string) {
  return supabase
    .from("stories")
    .select("title, created_at, content")
    .eq("id", id)
    .single();
}
