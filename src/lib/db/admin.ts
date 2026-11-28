import "server-only";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb } from "@/lib/db/supabase-admin";
import { extractSortedSeriesPhotos } from "@/lib/utils/series";
import type {
  BaseItem,
  CalendarItem,
  PhotoItem,
  SeriesAdminItem,
} from "@/types/admin";
export async function getAdminPhotos(): Promise<PhotoItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, cloudinary_public_id, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title)",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cloudinary_url: row.cloudinary_url,
    cloudinary_public_id: row.cloudinary_public_id,
    downloads: row.downloads ?? 0,
    shares: row.shares ?? 0,
    collections: row.collections ?? [],
    rules: row.rules ?? [],
  }));
}
async function fetchAdminBaseItems(
  table: "collections" | "rule_collections",
  junctionTable: "photo_collections" | "photo_rule_collections",
): Promise<BaseItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from(table)
    .select(
      `id, title, description, cover_photo_id, photos!${junctionTable}(id, cloudinary_url, title)`,
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cover_photo_id: row.cover_photo_id,
    photos: (
      (row.photos ?? []) as {
        id: string;
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
export function getAdminCollections(): Promise<BaseItem[]> {
  return fetchAdminBaseItems("collections", "photo_collections");
}
export function getAdminRuleCollections(): Promise<BaseItem[]> {
  return fetchAdminBaseItems("rule_collections", "photo_rule_collections");
}
export async function getAdminCalendarCollections(): Promise<CalendarItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("calendar_collections")
    .select(
      "id, title, description, cover_photo_id, photos!photo_calendar_collections(id, cloudinary_url, title)",
    )
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cover_photo_id: row.cover_photo_id,
    photos: (
      (row.photos ?? []) as {
        id: string;
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
export async function getAdminSeries(): Promise<SeriesAdminItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("series")
    .select(
      "id, title, description, cover_photo_id, created_at, series_photos(position, photos(id, title, cloudinary_url))",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .order("position", { referencedTable: "series_photos", ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    cover_photo_id: s.cover_photo_id,
    created_at: s.created_at,
    photos: extractSortedSeriesPhotos(s.series_photos),
  }));
}
