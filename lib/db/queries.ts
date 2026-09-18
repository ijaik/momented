import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/db/supabase";
export const PHOTO_CARD_COLUMNS =
  "id, title, cloudinary_url, width, height, camera_model, taken_at";
export type IdTable =
  | "photos"
  | "collections"
  | "rule_collections"
  | "stories"
  | "calendar_collections";
type PhotoJunction =
  | {
      table: "photo_collections";
      column: "collection_id";
    }
  | {
      table: "photo_rule_collections";
      column: "rule_id";
    }
  | {
      table: "photo_stories";
      column: "story_id";
    }
  | {
      table: "photo_calendar_collections";
      column: "calendar_id";
    };
const COLLECTION_JUNCTION: PhotoJunction = {
  table: "photo_collections",
  column: "collection_id",
};
const RULE_JUNCTION: PhotoJunction = {
  table: "photo_rule_collections",
  column: "rule_id",
};
const STORY_JUNCTION: PhotoJunction = {
  table: "photo_stories",
  column: "story_id",
};
const CALENDAR_JUNCTION: PhotoJunction = {
  table: "photo_calendar_collections",
  column: "calendar_id",
};
export async function getAllIds(table: IdTable): Promise<string[]> {
  "use cache";
  cacheTag("photos", "collections", "stories");
  cacheLife("weeks");
  const { data } = await supabase.from(table).select("id");
  return (data ?? []).map((row) => String(row.id));
}
export async function getHomePhotos() {
  "use cache";
  cacheTag("photos");
  cacheLife("weeks");
  return supabase
    .from("photos")
    .select("id, title, cloudinary_url, width, height, camera_model")
    .order("created_at", { ascending: false });
}
export async function getPhotoById(id: string) {
  "use cache";
  cacheTag(`photo-${id}`, "photos");
  cacheLife("weeks");
  return supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, width, height, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title), stories!photo_stories(id, title), calendars:calendar_collections!photo_calendar_collections(id, title)",
    )
    .eq("id", id)
    .single();
}
async function getPhotosForEntity(
  junction: PhotoJunction,
  entityId: string | number,
  ascending = false,
) {
  "use cache";
  cacheTag("photos", "collections");
  cacheLife("weeks");
  return supabase
    .from("photos")
    .select(
      `${PHOTO_CARD_COLUMNS}, ${junction.table}!inner(${junction.column})`,
    )
    .eq(`${junction.table}.${junction.column}`, entityId)
    .order("created_at", { ascending });
}
export function getPhotosForCollection(collectionId: string) {
  return getPhotosForEntity(COLLECTION_JUNCTION, collectionId);
}
export function getPhotosForRule(ruleId: string) {
  return getPhotosForEntity(RULE_JUNCTION, ruleId);
}
export function getPhotosForStory(storyId: string) {
  return getPhotosForEntity(STORY_JUNCTION, storyId, true);
}
export function getPhotosForCalendarMonth(monthIndex: number) {
  return getPhotosForEntity(CALENDAR_JUNCTION, monthIndex);
}
export async function getCollectionById(id: string) {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  return supabase
    .from("collections")
    .select("title, description")
    .eq("id", id)
    .single();
}
export async function getRuleCollectionById(id: string) {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  return supabase
    .from("rule_collections")
    .select("title, description")
    .eq("id", id)
    .single();
}
export async function getCalendarMonthById(monthIndex: number) {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  return supabase
    .from("calendar_collections")
    .select("title, description")
    .eq("id", monthIndex)
    .single();
}
export async function getCuratedCollections() {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  return supabase
    .from("collections")
    .select("*, photos!photo_collections(id, cloudinary_url)")
    .order("created_at", { ascending: false });
}
export async function getRuleCollectionsList() {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  return supabase
    .from("rule_collections")
    .select("*, photos!photo_rule_collections(id, cloudinary_url)")
    .order("created_at", { ascending: false });
}
export async function getCalendarCollectionsList() {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  return supabase
    .from("calendar_collections")
    .select("*, photos!photo_calendar_collections(id, cloudinary_url)")
    .order("id", { ascending: true });
}
export async function getStoriesWithPhotos() {
  "use cache";
  cacheTag("stories");
  cacheLife("weeks");
  return supabase
    .from("stories")
    .select("*, photos!photo_stories(id, cloudinary_url)")
    .order("created_at", { ascending: false });
}
export async function getStoryById(id: string) {
  "use cache";
  cacheTag("stories");
  cacheLife("weeks");
  return supabase
    .from("stories")
    .select("id, title, created_at, content")
    .eq("id", id)
    .single();
}