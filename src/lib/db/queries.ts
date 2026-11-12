import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/db/supabase";
import { sortSeriesPhotos } from "@/lib/utils/series";
import type { Photo } from "@/types";

function throwIfUnexpectedDbError(
  error: { code?: string; message: string } | null,
  context: string,
): void {
  if (!error) return;
  if (error.code === "PGRST116") return;
  throw new Error(`Database error in ${context}: ${error.message}`);
}
const PHOTO_CARD_COLUMNS =
  "id, title, description, cloudinary_url, width, height, camera_make, camera_model, taken_at";
type IdTable =
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
  if (error) {
    throwIfUnexpectedDbError(error, `getAllIds(${table})`);
    return [];
  }
  return (data ?? []).map((row) => String(row.id));
}
export async function getSitemapPhotos(): Promise<
  { id: string; created_at: string | null; cloudinary_url?: string | null }[]
> {
  "use cache";
  cacheTag("photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("photos")
    .select("id, created_at, cloudinary_url")
    .order("created_at", { ascending: false });
  throwIfUnexpectedDbError(error, "getSitemapPhotos");
  return (data ?? []) as {
    id: string;
    created_at: string | null;
    cloudinary_url?: string | null;
  }[];
}
export async function getHomePhotos() {
  "use cache";
  cacheTag("photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, width, height, camera_make, camera_model",
    )
    .order("created_at", { ascending: false });
  throwIfUnexpectedDbError(error, "getHomePhotos");
  return { data: (data ?? []) as Photo[], error: error?.message ?? null };
}
export interface HomeEditorialData {
  heroPhoto: Photo | null;
  recentPhotos: Photo[];
  totalPhotos: number;
  featuredSeries: {
    id: string;
    title: string;
    description: string | null;
    photos: {
      id: string;
      title: string | null;
      cloudinary_url: string;
      width: number;
      height: number;
    }[];
  } | null;
  featuredCollection: {
    id: string;
    title: string;
    description: string | null;
    cover_photo_id?: string | null;
    photos?: { id: string; cloudinary_url: string }[];
  } | null;
  featuredRule: {
    id: string;
    title: string;
    description: string | null;
    cover_photo_id?: string | null;
    photos?: { id: string; cloudinary_url: string }[];
  } | null;
  featuredCalendar: {
    id: number;
    title: string;
    description: string | null;
    cover_photo_id?: string | null;
    photos?: { id: string; cloudinary_url: string }[];
  } | null;
}
export async function getHomeEditorialData(): Promise<HomeEditorialData> {
  "use cache";
  cacheTag("photos", "series", "collections", "rules", "calendar");
  cacheLife("days");
  const [
    photosRes,
    countRes,
    seriesRes,
    collectionsRes,
    rulesRes,
    calendarRes,
  ] = await Promise.all([
    supabase
      .from("photos")
      .select(
        "id, title, description, cloudinary_url, width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso, taken_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(13),
    supabase.from("photos").select("id", { count: "exact", head: true }),
    getSeriesList(),
    getCuratedCollections(),
    getRuleCollectionsList(),
    getCalendarCollectionsList(),
  ]);
  throwIfUnexpectedDbError(photosRes.error, "getHomeEditorialData(photos)");
  throwIfUnexpectedDbError(countRes.error, "getHomeEditorialData(count)");
  const allPhotos = (photosRes.data ?? []) as Photo[];
  const heroPhoto = allPhotos[0] ?? null;
  const recentPhotos = allPhotos.slice(1, 13);
  const totalPhotos = countRes.count ?? allPhotos.length;
  const rawLatestSeries = seriesRes.data?.[0] ?? null;
  let featuredSeries: HomeEditorialData["featuredSeries"] = null;
  if (rawLatestSeries) {
    const rawPhotos =
      (rawLatestSeries.series_photos as unknown as {
        position: number;
        photos: {
          id: string;
          title: string | null;
          cloudinary_url: string;
          width: number;
          height: number;
        } | null;
      }[]) || [];
    const sortedPhotos = sortSeriesPhotos(rawPhotos)
      .map((sp) => sp.photos)
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    featuredSeries = {
      id: rawLatestSeries.id,
      title: rawLatestSeries.title,
      description: rawLatestSeries.description,
      photos: sortedPhotos,
    };
  }
  const collections = collectionsRes.data ?? [];
  const featuredCollection =
    collections.find((c) => Array.isArray(c.photos) && c.photos.length > 0) ??
    collections[0] ??
    null;
  const rules = rulesRes.data ?? [];
  const featuredRule =
    rules.find((r) => Array.isArray(r.photos) && r.photos.length > 0) ??
    rules[0] ??
    null;
  const calendars = calendarRes.data ?? [];
  const currentMonthId = new Date().getUTCMonth() + 1;
  const activeCalendars = calendars.filter(
    (c) => Array.isArray(c.photos) && c.photos.length > 0,
  );
  const featuredCalendar =
    activeCalendars.find((c) => c.id === currentMonthId) ??
    activeCalendars[0] ??
    calendars[0] ??
    null;
  return {
    heroPhoto,
    recentPhotos,
    totalPhotos,
    featuredSeries,
    featuredCollection,
    featuredRule,
    featuredCalendar,
  };
}
export async function getPhotoById(id: string) {
  "use cache";
  cacheTag(`photo-${id}`, "photos", "series");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, cloudinary_public_id, width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso, artist, taken_at, created_at, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title), calendars:calendar_collections!photo_calendar_collections(id, title), series:series!series_photos(id, title)",
    )
    .eq("id", id)
    .single();
  throwIfUnexpectedDbError(error, `getPhotoById(${id})`);
  return { data: data ?? null, error: error?.message ?? null };
}
export async function getAdjacentPhotos(
  photoId: string,
  createdAt: string | null | undefined,
): Promise<{
  prev: { id: string; title: string | null } | null;
  next: { id: string; title: string | null } | null;
}> {
  "use cache";
  cacheTag(`photo-${photoId}-adjacent`, "photos");
  cacheLife("weeks");
  if (!createdAt) return { prev: null, next: null };
  const prevPromise = supabase
    .from("photos")
    .select("id, title")
    .gt("created_at", createdAt)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const nextPromise = supabase
    .from("photos")
    .select("id, title")
    .lt("created_at", createdAt)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const [prevRes, nextRes] = await Promise.all([prevPromise, nextPromise]);
  return {
    prev: prevRes.data ?? null,
    next: nextRes.data ?? null,
  };
}
async function getPhotosForEntity(
  junction: PhotoJunction,
  entityId: string | number,
  ascending = false,
  tag = "collections",
  entityTag = `${tag}-${entityId}`,
): Promise<{ data: Photo[]; error: string | null }> {
  "use cache";
  cacheTag("photos", tag, entityTag);
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("photos")
    .select(`${PHOTO_CARD_COLUMNS}, ${junction.table}!inner()`)
    .eq(`${junction.table}.${junction.column}`, entityId)
    .order("created_at", { ascending });
  throwIfUnexpectedDbError(error, `getPhotosForEntity(${junction.table})`);
  return {
    data: (data ?? []) as unknown as Photo[],
    error: error?.message ?? null,
  };
}
export function getPhotosForCollection(collectionId: string) {
  return getPhotosForEntity(
    COLLECTION_JUNCTION,
    collectionId,
    false,
    "collections",
    `collection-${collectionId}`,
  );
}
export function getPhotosForRule(ruleId: string) {
  return getPhotosForEntity(
    RULE_JUNCTION,
    ruleId,
    false,
    "rules",
    `rule-${ruleId}`,
  );
}
export async function getRelatedPhotos({
  photoId,
  collectionId,
  ruleId,
  seriesId,
  monthIndex,
}: {
  photoId: string;
  collectionId?: string | null;
  ruleId?: string | null;
  seriesId?: string | null;
  monthIndex?: number | null;
}): Promise<Photo[]> {
  "use cache";
  cacheTag("photos", "collections", "rules", "series", "calendar");
  cacheLife("weeks");
  const validMonth =
    monthIndex !== null &&
    monthIndex !== undefined &&
    monthIndex >= 1 &&
    monthIndex <= 12
      ? monthIndex
      : null;
  const [collectionRes, seriesRes, ruleRes, calendarRes, homeRes] =
    await Promise.all([
      collectionId
        ? getPhotosForCollection(collectionId)
        : Promise.resolve({ data: [] as Photo[], error: null }),
      seriesId
        ? getSeriesById(seriesId)
        : Promise.resolve({ data: null, error: null }),
      ruleId
        ? getPhotosForRule(ruleId)
        : Promise.resolve({ data: [] as Photo[], error: null }),
      validMonth
        ? getPhotosForCalendarMonth(validMonth)
        : Promise.resolve({ data: [] as Photo[], error: null }),
      getHomePhotos(),
    ]);
  const seriesPhotos: Photo[] = seriesRes.data?.series_photos
    ? (
        seriesRes.data.series_photos as unknown as {
          position: number;
          photos: Photo | null;
        }[]
      )
        .map((sp) => sp.photos)
        .filter((p): p is Photo => Boolean(p))
    : [];
  const relatedMap = new Map<string, Photo>();
  const pools: Photo[][] = [
    collectionRes.data,
    seriesPhotos,
    ruleRes.data,
    calendarRes.data,
    homeRes.data,
  ];
  for (const pool of pools) {
    for (const p of pool) {
      if (p.id !== photoId && !relatedMap.has(p.id)) {
        relatedMap.set(p.id, p);
        if (relatedMap.size >= 3) return Array.from(relatedMap.values());
      }
    }
  }
  return Array.from(relatedMap.values()).slice(0, 3);
}
export function getPhotosForCalendarMonth(monthIndex: number) {
  return getPhotosForEntity(
    CALENDAR_JUNCTION,
    monthIndex,
    false,
    "calendar",
    `calendar-${monthIndex}`,
  );
}
export async function getCollectionById(id: string) {
  "use cache";
  cacheTag("collections", `collection-${id}`);
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("collections")
    .select("title, description")
    .eq("id", id)
    .single();
  throwIfUnexpectedDbError(error, `getCollectionById(${id})`);
  return { data: data ?? null, error: error?.message ?? null };
}
export async function getRuleCollectionById(id: string) {
  "use cache";
  cacheTag("rules", `rule-${id}`);
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("rule_collections")
    .select("title, description")
    .eq("id", id)
    .single();
  throwIfUnexpectedDbError(error, `getRuleCollectionById(${id})`);
  return { data: data ?? null, error: error?.message ?? null };
}
export async function getCalendarMonthById(monthIndex: number) {
  "use cache";
  cacheTag("calendar", `calendar-${monthIndex}`);
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("calendar_collections")
    .select("title, description")
    .eq("id", monthIndex)
    .single();
  throwIfUnexpectedDbError(error, `getCalendarMonthById(${monthIndex})`);
  return { data: data ?? null, error: error?.message ?? null };
}
export async function getCuratedCollections() {
  "use cache";
  cacheTag("collections", "photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("collections")
    .select(
      "id, title, description, cover_photo_id, created_at, photos!photo_collections(id, cloudinary_url, created_at)",
    )
    .order("created_at", { ascending: false });
  throwIfUnexpectedDbError(error, "getCuratedCollections");
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getRuleCollectionsList() {
  "use cache";
  cacheTag("rules", "collections", "photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("rule_collections")
    .select(
      "id, title, description, cover_photo_id, created_at, photos!photo_rule_collections(id, cloudinary_url, created_at)",
    )
    .order("created_at", { ascending: false });
  throwIfUnexpectedDbError(error, "getRuleCollectionsList");
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getCalendarCollectionsList() {
  "use cache";
  cacheTag("collections", "calendar", "photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("calendar_collections")
    .select(
      "id, title, description, cover_photo_id, photos!photo_calendar_collections(id, cloudinary_url, created_at)",
    )
    .order("id", { ascending: true })
    .order("taken_at", {
      referencedTable: "photos",
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", { referencedTable: "photos", ascending: false });
  throwIfUnexpectedDbError(error, "getCalendarCollectionsList");
  return { data: data ?? [], error: error?.message ?? null };
}
export async function getSeriesList() {
  "use cache";
  cacheTag("series", "photos");
  cacheLife("weeks");
  const { data, error } = await supabase
    .from("series")
    .select(
      "id, title, description, cover_photo_id, created_at, series_photos(position, photos(id, title, description, cloudinary_url, width, height, created_at))",
    )
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "series_photos", ascending: true });
  throwIfUnexpectedDbError(error, "getSeriesList");
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
  throwIfUnexpectedDbError(error, `getSeriesById(${id})`);
  return { data: data ?? null, error: error?.message ?? null };
}
