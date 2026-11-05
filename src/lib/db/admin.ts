import "server-only";
import type { CalendarItem } from "@/app/admin/_components/CalendarManager";
import type { BaseItem } from "@/app/admin/_components/ItemManager";
import type { PhotoItem } from "@/app/admin/_components/PhotoManager";
import type { SeriesAdminItem } from "@/app/admin/_components/SeriesManager";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb } from "@/lib/db/supabase-admin";
export async function getAdminPhotos(): Promise<PhotoItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("photos")
    .select(
      "id, title, description, cloudinary_url, cloudinary_public_id, downloads, shares, collections!photo_collections(id, title), rules:rule_collections!photo_rule_collections(id, title)",
    )
    .order("created_at", { ascending: false });
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
export async function getAdminCollections(): Promise<BaseItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("collections")
    .select(
      "id, title, description, cover_photo_id, photos!photo_collections(id, cloudinary_url, title)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: (row as { description: string | null }).description,
    cover_photo_id: (row as { cover_photo_id: string | null }).cover_photo_id,
    photos: (
      (row.photos ?? []) as {
        id: string;
        cloudinary_url: string;
        title: string | null;
      }[]
    ).map((p) => ({
      id: String(p.id),
      cloudinary_url: p.cloudinary_url,
      title: p.title ?? undefined,
    })),
  }));
}
export async function getAdminRuleCollections(): Promise<BaseItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("rule_collections")
    .select(
      "id, title, description, cover_photo_id, photos!photo_rule_collections(id, cloudinary_url, title)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: (row as { description: string | null }).description,
    cover_photo_id: (row as { cover_photo_id: string | null }).cover_photo_id,
    photos: (
      (row.photos ?? []) as {
        id: string;
        cloudinary_url: string;
        title: string | null;
      }[]
    ).map((p) => ({
      id: String(p.id),
      cloudinary_url: p.cloudinary_url,
      title: p.title ?? undefined,
    })),
  }));
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
export async function getAdminSeries(): Promise<SeriesAdminItem[]> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("series")
    .select(
      "id, title, description, cover_photo_id, created_at, series_photos(position, photos(id, title, cloudinary_url))",
    )
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "series_photos", ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((s) => {
    const rawPhotos = s.series_photos || [];
    const photos = rawPhotos
      .map((sp) => sp.photos)
      .filter((p): p is { id: string; title: string; cloudinary_url: string } =>
        Boolean(p),
      );
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      cover_photo_id: s.cover_photo_id,
      created_at: s.created_at,
      photos,
    };
  });
}
