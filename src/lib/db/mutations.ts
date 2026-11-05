import "server-only";
import cloudinary from "@/lib/cloudinary/cloudinary";
import {
  getAdminDb,
  type JunctionTable,
  syncJunction,
} from "@/lib/db/supabase-admin";
import { CLOUDINARY_PUBLIC_ID_PATTERN } from "@/lib/utils/validation";
type ContentTable = "collections" | "rule_collections";
interface CollectionSpec {
  table: ContentTable;
  junction: { table: JunctionTable; mainCol: string };
}
const COLLECTION_SPECS: Record<"collection" | "rule", CollectionSpec> = {
  collection: {
    table: "collections",
    junction: { table: "photo_collections", mainCol: "collection_id" },
  },
  rule: {
    table: "rule_collections",
    junction: {
      table: "photo_rule_collections",
      mainCol: "rule_id",
    },
  },
};
export async function deletePhotoFromDb(
  id: string | number,
  publicId?: string,
): Promise<void> {
  const db = getAdminDb();
  await Promise.all([
    db
      .from("collections")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
    db
      .from("rule_collections")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
    db
      .from("calendar_collections")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
    db
      .from("series")
      .update({ cover_photo_id: null })
      .eq("cover_photo_id", id as never),
  ]);
  const { data: deletedPhoto, error } = await db
    .from("photos")
    .delete()
    .eq("id", id as never)
    .select("cloudinary_public_id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const resolvedPublicId = deletedPhoto?.cloudinary_public_id || publicId;
  if (resolvedPublicId && CLOUDINARY_PUBLIC_ID_PATTERN.test(resolvedPublicId)) {
    try {
      await cloudinary.uploader.destroy(resolvedPublicId);
    } catch (cloudinaryError) {
      console.error("Failed to delete Cloudinary asset:", cloudinaryError);
    }
  }
}
export async function updatePhotoInDb(
  id: string | number,
  params: {
    title: string;
    description: string;
    collectionIds: string[];
    ruleIds: string[];
  },
): Promise<void> {
  const db = getAdminDb();
  const { error } = await db
    .from("photos")
    .update({ title: params.title, description: params.description })
    .eq("id", id as never);
  if (error) throw new Error(error.message);
  await Promise.all([
    syncJunction(
      db,
      "photo_collections",
      "photo_id",
      id,
      "collection_id",
      params.collectionIds,
    ),
    syncJunction(
      db,
      "photo_rule_collections",
      "photo_id",
      id,
      "rule_id",
      params.ruleIds,
    ),
  ]);
}
export async function insertPhotoToDb(params: {
  title: string;
  description?: string;
  artist: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  width: number;
  height: number;
  camera_make: string | null;
  camera_model: string | null;
  focal_length: string | null;
  aperture: string | null;
  shutter_speed: string | null;
  iso: number | null;
  taken_at: string | null;
  collectionIds: string[];
  ruleIds: string[];
}): Promise<{ id: string; monthId: number }> {
  const db = getAdminDb();
  const { data: newPhoto, error: dbError } = await db
    .from("photos")
    .insert([
      {
        title: params.title,
        description: params.description,
        cloudinary_url: params.cloudinary_url,
        cloudinary_public_id: params.cloudinary_public_id,
        width: params.width,
        height: params.height,
        camera_make: params.camera_make,
        camera_model: params.camera_model,
        focal_length: params.focal_length,
        aperture: params.aperture,
        shutter_speed: params.shutter_speed,
        iso: params.iso,
        artist: params.artist,
        taken_at: params.taken_at,
      },
    ])
    .select("id")
    .single();
  if (dbError || !newPhoto)
    throw new Error(`Database Error: ${dbError?.message || "Insert failed"}`);
  const photoDate = params.taken_at ? new Date(params.taken_at) : new Date();
  const monthId = photoDate.getUTCMonth() + 1;
  await Promise.all([
    db
      .from("photo_calendar_collections")
      .insert([{ photo_id: newPhoto.id, calendar_id: monthId }]),
    syncJunction(
      db,
      "photo_collections",
      "photo_id",
      newPhoto.id,
      "collection_id",
      params.collectionIds,
      { skipDelete: true },
    ),
    syncJunction(
      db,
      "photo_rule_collections",
      "photo_id",
      newPhoto.id,
      "rule_id",
      params.ruleIds,
      { skipDelete: true },
    ),
  ]);
  const { data: latestCalendarPhoto } = await db
    .from("photos")
    .select("id, photo_calendar_collections!inner()")
    .eq("photo_calendar_collections.calendar_id", monthId)
    .order("taken_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestCalendarPhoto?.id) {
    await db
      .from("calendar_collections")
      .update({ cover_photo_id: latestCalendarPhoto.id })
      .eq("id", monthId);
  }
  return { id: newPhoto.id, monthId };
}
export async function deleteCollectionFromDb(
  kind: "collection" | "rule",
  id: string,
): Promise<void> {
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { error } = await db
    .from(spec.table)
    .delete()
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
}
export async function createCollectionInDb(
  kind: "collection" | "rule",
  params: {
    title: string;
    description: string | null;
    cover_photo_id: string | null;
    photoIds: string[];
  },
): Promise<string> {
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { data, error } = (await db
    .from(spec.table)
    .insert([
      {
        title: params.title,
        description: params.description,
        cover_photo_id: params.cover_photo_id,
      } as never,
    ])
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };
  if (error || !data)
    throw new Error(error?.message || "Failed to create collection");
  await syncJunction(
    db,
    spec.junction.table,
    spec.junction.mainCol,
    data.id,
    "photo_id",
    params.photoIds,
    { skipDelete: true },
  );
  return data.id;
}
export async function updateCollectionInDb(
  kind: "collection" | "rule",
  id: string,
  params: {
    title: string;
    description: string | null;
    cover_photo_id: string | null;
    photoIds: string[];
  },
): Promise<void> {
  const spec = COLLECTION_SPECS[kind];
  const db = getAdminDb();
  const { error } = await db
    .from(spec.table)
    .update({
      title: params.title,
      description: params.description,
      cover_photo_id: params.cover_photo_id,
    } as never)
    .eq("id" as never, id as never);
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    spec.junction.table,
    spec.junction.mainCol,
    id,
    "photo_id",
    params.photoIds,
  );
}
export async function updateCalendarCollectionInDb(
  id: number,
  params: {
    title: string;
    description: string | null;
    cover_photo_id: string | null;
    photoIds: string[];
  },
): Promise<void> {
  const db = getAdminDb();
  const { error } = await db
    .from("calendar_collections")
    .update({
      title: params.title,
      description: params.description,
      cover_photo_id: params.cover_photo_id,
    })
    .eq("id", id as never);
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    "photo_calendar_collections",
    "calendar_id",
    id,
    "photo_id",
    params.photoIds,
  );
}
export async function createSeriesInDb(params: {
  title: string;
  description: string | null;
  cover_photo_id: string | null;
  photoIds: string[];
}): Promise<string> {
  const db = getAdminDb();
  const coverId = params.cover_photo_id || params.photoIds[0] || null;
  const { data: newSeries, error: insertError } = await db
    .from("series")
    .insert([
      {
        title: params.title,
        description: params.description || null,
        cover_photo_id: coverId,
      },
    ])
    .select("id")
    .single();
  if (insertError || !newSeries)
    throw new Error(insertError?.message || "Failed to create series.");
  if (params.photoIds.length > 0) {
    const seriesPhotoInserts = params.photoIds.map((pid, index) => ({
      series_id: newSeries.id,
      photo_id: pid,
      position: index,
    }));
    const { error: junctionError } = await db
      .from("series_photos")
      .insert(seriesPhotoInserts);
    if (junctionError) {
      await db.from("series").delete().eq("id", newSeries.id);
      throw new Error(junctionError.message);
    }
  }
  return newSeries.id;
}
export async function updateSeriesInDb(
  id: string,
  params: {
    title: string;
    description: string | null;
    cover_photo_id: string | null;
    photoIds: string[];
  },
): Promise<void> {
  const db = getAdminDb();
  const coverId = params.cover_photo_id || params.photoIds[0] || null;
  const { error: updateError } = await db
    .from("series")
    .update({
      title: params.title,
      description: params.description || null,
      cover_photo_id: coverId,
    })
    .eq("id", id);
  if (updateError) throw new Error(updateError.message);
  const positions = params.photoIds.map((_, index) => index);
  const { error: rpcError } = await db.rpc("replace_series_photos", {
    p_series_id: id,
    p_photo_ids: params.photoIds,
    p_positions: positions,
  });
  if (rpcError) throw new Error(rpcError.message);
}
export async function deleteSeriesFromDb(id: string): Promise<void> {
  const db = getAdminDb();
  const { error } = await db.from("series").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
