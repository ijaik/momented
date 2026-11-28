import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { getAdminDb } from "@/lib/db/supabase-admin";
import { parsePhotoDate } from "@/lib/utils/dateUtils";
import { CLOUDINARY_PUBLIC_ID_PATTERN } from "@/lib/utils/validation";
import type { Database } from "@/types/database.types";

type JunctionTable =
  | "photo_collections"
  | "photo_rule_collections"
  | "photo_calendar_collections";
async function syncJunction(
  db: SupabaseClient<Database>,
  table: JunctionTable,
  mainCol: string,
  mainId: string | number,
  targetCol: string,
  targetIds: string[],
  { skipDelete = false }: { skipDelete?: boolean } = {},
): Promise<void> {
  const cleanTargetIds = Array.from(new Set(targetIds.filter(Boolean)));
  if (skipDelete) {
    if (cleanTargetIds.length === 0) return;
    let insertError: { message: string } | null = null;
    if (table === "photo_collections") {
      const rows = cleanTargetIds.map((targetId) =>
        mainCol === "photo_id"
          ? { photo_id: String(mainId), collection_id: targetId }
          : { collection_id: String(mainId), photo_id: targetId },
      );
      ({ error: insertError } = await db
        .from("photo_collections")
        .insert(rows));
    } else if (table === "photo_rule_collections") {
      const rows = cleanTargetIds.map((targetId) =>
        mainCol === "photo_id"
          ? { photo_id: String(mainId), rule_id: targetId }
          : { rule_id: String(mainId), photo_id: targetId },
      );
      ({ error: insertError } = await db
        .from("photo_rule_collections")
        .insert(rows));
    } else {
      const rows = cleanTargetIds.map((targetId) =>
        mainCol === "photo_id"
          ? {
              photo_id: String(mainId),
              calendar_id: Number.parseInt(targetId, 10),
            }
          : { calendar_id: Number(mainId), photo_id: targetId },
      );
      ({ error: insertError } = await db
        .from("photo_calendar_collections")
        .insert(rows));
    }
    if (insertError)
      throw new Error(
        `Failed to insert into junction table ${table}: ${insertError.message}`,
      );
    return;
  }
  const { error: rpcError } = await db.rpc("replace_photo_junctions", {
    p_table_name: table,
    p_main_col: mainCol,
    p_main_id: String(mainId),
    p_target_col: targetCol,
    p_target_ids: cleanTargetIds,
  });
  if (rpcError) {
    throw new Error(
      `Failed to sync junction table ${table}: ${rpcError.message}`,
    );
  }
}
export async function deletePhotoFromDb(
  id: string,
  publicId?: string,
): Promise<void> {
  const db = getAdminDb();
  const { data: deletedPhoto, error } = await db
    .from("photos")
    .delete()
    .eq("id", id)
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
  id: string,
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
    .eq("id", id);
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
  const photoDate = parsePhotoDate(params.taken_at) ?? new Date();
  const monthId = photoDate.getUTCMonth() + 1;
  try {
    const [calendarRes] = await Promise.all([
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
    if (calendarRes.error) {
      throw new Error(
        `Failed to link photo to calendar month: ${calendarRes.error.message}`,
      );
    }
  } catch (err) {
    await db.from("photos").delete().eq("id", newPhoto.id);
    throw err;
  }
  await db
    .from("calendar_collections")
    .update({ cover_photo_id: newPhoto.id })
    .eq("id", monthId)
    .is("cover_photo_id", null);
  return { id: newPhoto.id, monthId };
}
export async function deleteCollectionFromDb(
  kind: "collection" | "rule",
  id: string,
): Promise<void> {
  const db = getAdminDb();
  const { error } =
    kind === "collection"
      ? await db.from("collections").delete().eq("id", id)
      : await db.from("rule_collections").delete().eq("id", id);
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
  const db = getAdminDb();
  const row = {
    title: params.title,
    description: params.description,
    cover_photo_id: params.cover_photo_id,
  };
  const { data, error } =
    kind === "collection"
      ? await db.from("collections").insert([row]).select("id").single()
      : await db.from("rule_collections").insert([row]).select("id").single();
  if (error || !data)
    throw new Error(error?.message || "Failed to create collection");
  await syncJunction(
    db,
    kind === "collection" ? "photo_collections" : "photo_rule_collections",
    kind === "collection" ? "collection_id" : "rule_id",
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
  const db = getAdminDb();
  const patch = {
    title: params.title,
    description: params.description,
    cover_photo_id: params.cover_photo_id,
  };
  const { error } =
    kind === "collection"
      ? await db.from("collections").update(patch).eq("id", id)
      : await db.from("rule_collections").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    kind === "collection" ? "photo_collections" : "photo_rule_collections",
    kind === "collection" ? "collection_id" : "rule_id",
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
    .eq("id", id);
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
