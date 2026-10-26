import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/db/supabase";
export const PHOTO_CARD_COLUMNS =
  "id, title, description, cloudinary_url, width, height, camera_model, taken_at";
export type IdTable =
  | "photos"
  | "collections"
  | "rule_collections"
  | "calendar_collections"
  | "series";
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
const CALENDAR_JUNCTION: PhotoJunction = {
  table: "photo_calendar_collections",
  column: "calendar_id",
};
export async function getAllIds(table: IdTable): Promise<string[]> {
  "use cache";
  cacheTag(`${table}-ids`, table);
  cacheLife("weeks");
  const { data, error } = await supabase.from(table).select("id");
  if (error)
    throw new Error(`Failed to fetch IDs for ${table}: ${error.message}`);
  return (data ?? []).map((row) => String(row.id));
}
export async function getSitemapPhotos(): Promise<
  { id: string; created_at: string | null }[]
> {
  "use cache";
  cacheTag("photos");
  cacheLife("weeks");
  const { data } = await supabase
    .from("photos")
    .select("id, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as { id: string; created_at: string | null }[];
}
export async function getHomePhotos() {
  "use cache";
  cacheTag("photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, width, height, camera_model",
    )
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getPhotoById(id: string) {
  "use cache";
  cacheTag(`photo-${id}`, "photos", "series");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, cloudinary_public_id, width, height, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title), calendars:calendar_collections!photo_calendar_collections(id, title), series:series!series_photos(id, title)",
    )
    .eq("id", id)
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}
export interface AdjacentPhotoSummary {
  id: string;
  title: string | null;
  cloudinary_url: string;
}
export interface AdjacentPhotos {
  prev: AdjacentPhotoSummary | null;
  next: AdjacentPhotoSummary | null;
}
export async function getAdjacentPhotos(
  currentCreatedAt: string,
): Promise<AdjacentPhotos> {
  "use cache";
  cacheTag("photos");
  cacheLife("weeks");
  if (!currentCreatedAt) return { prev: null, next: null };
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("photos")
      .select("id, title, cloudinary_url")
      .gt("created_at", currentCreatedAt)
      .order("created_at", { ascending: true })
      .limit(1),
    supabase
      .from("photos")
      .select("id, title, cloudinary_url")
      .lt("created_at", currentCreatedAt)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  const prev = prevData?.[0] ? (prevData[0] as AdjacentPhotoSummary) : null;
  const next = nextData?.[0] ? (nextData[0] as AdjacentPhotoSummary) : null;
  return { prev, next };
}
async function getPhotosForEntity(
  junction: PhotoJunction,
  entityId: string | number,
  ascending = false,
  tag = "collections",
) {
  "use cache";
  cacheTag("photos", tag);
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("photos")
    .select(
      `${PHOTO_CARD_COLUMNS}, ${junction.table}!inner(${junction.column})`,
    )
    .eq(`${junction.table}.${junction.column}`, entityId)
    .order("created_at", { ascending });
  return { data: data ?? [], error: error?.message ?? null };
}
export function getPhotosForCollection(collectionId: string) {
  return getPhotosForEntity(
    COLLECTION_JUNCTION,
    collectionId,
    false,
    "collections",
  );
}
export function getPhotosForRule(ruleId: string) {
  return getPhotosForEntity(RULE_JUNCTION, ruleId, false, "rules");
}
export function getPhotosForCalendarMonth(monthIndex: number) {
  return getPhotosForEntity(CALENDAR_JUNCTION, monthIndex, false, "calendar");
}
export async function getCollectionById(id: string) {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("collections")
    .select("title, description")
    .eq("id", id)
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}
export async function getRuleCollectionById(id: string) {
  "use cache";
  cacheTag("rules");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("rule_collections")
    .select("title, description")
    .eq("id", id)
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}
export async function getCalendarMonthById(monthIndex: number) {
  "use cache";
  cacheTag("calendar");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("calendar_collections")
    .select("title, description")
    .eq("id", monthIndex)
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}
export async function getCuratedCollections() {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("collections")
    .select("*, photos!photo_collections(id, cloudinary_url)")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getRuleCollectionsList() {
  "use cache";
  cacheTag("collections");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("rule_collections")
    .select("*, photos!photo_rule_collections(id, cloudinary_url)")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getCalendarCollectionsList() {
  "use cache";
  cacheTag("collections", "calendar", "photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("calendar_collections")
    .select(
      "*, photos!photo_calendar_collections(id, cloudinary_url, taken_at, created_at)",
    )
    .order("id", { ascending: true })
    .order("taken_at", {
      referencedTable: "photos",
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", { referencedTable: "photos", ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getSeriesList() {
  "use cache";
  cacheTag("series", "photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("series")
    .select(
      "id, title, description, cover_photo_id, created_at, series_photos(position, photos(id, title, description, cloudinary_url, width, height))",
    )
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "series_photos", ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getSeriesById(id: string) {
  "use cache";
  cacheTag(`series-${id}`, "series", "photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("series")
    .select(
      "id, title, description, cover_photo_id, created_at, series_photos(position, photos(id, title, description, cloudinary_url, cloudinary_public_id, width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares))",
    )
    .eq("id", id)
    .order("position", { referencedTable: "series_photos", ascending: true })
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}
