import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
export type JunctionTable =
  | "photo_collections"
  | "photo_rule_collections"
  | "photo_calendar_collections";
let cachedAdminDb: SupabaseClient<Database> | null = null;
export function getAdminDb(): SupabaseClient<Database> {
  if (cachedAdminDb) return cachedAdminDb;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey)
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.",
    );
  cachedAdminDb = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedAdminDb;
}
export async function syncJunction(
  db: SupabaseClient<Database>,
  table: JunctionTable,
  mainCol: string,
  mainId: string | number,
  targetCol: string,
  targetIds: string[],
  { skipDelete = false }: { skipDelete?: boolean } = {},
): Promise<void> {
  const dynamicClient = db as SupabaseClient<Database>;
  const cleanTargetIds = Array.from(new Set(targetIds.filter(Boolean)));
  if (!skipDelete) {
    const { error: rpcError } = await dynamicClient.rpc(
      "replace_photo_junctions",
      {
        p_table_name: table,
        p_main_col: mainCol,
        p_main_id: String(mainId),
        p_target_col: targetCol,
        p_target_ids: cleanTargetIds,
      },
    );
    if (!rpcError) return;
  }
  // Safe diff-based sync: insert missing first, then delete obsolete, avoiding data loss on insert error
  const { data: existingRows } = await dynamicClient
    .from(table)
    .select(targetCol)
    .eq(mainCol, mainId);
  const existingIds = new Set(
    (existingRows ?? []).map((r) =>
      String((r as unknown as Record<string, unknown>)[targetCol]),
    ),
  );
  const toInsert = cleanTargetIds.filter((id) => !existingIds.has(id));
  if (toInsert.length > 0) {
    const inserts = toInsert.map((targetId) => ({
      [mainCol]: mainId,
      [targetCol]: targetId,
    }));
    const { error: insertError } = await dynamicClient
      .from(table)
      .insert(inserts as never);
    if (insertError)
      throw new Error(
        `Failed to insert into junction table ${table}: ${insertError.message}`,
      );
  }
  if (!skipDelete) {
    const toDelete = Array.from(existingIds).filter(
      (id) => !cleanTargetIds.includes(id),
    );
    if (toDelete.length > 0) {
      const { error: deleteError } = await dynamicClient
        .from(table)
        .delete()
        .eq(mainCol, mainId)
        .in(targetCol, toDelete);
      if (deleteError)
        throw new Error(
          `Failed to remove obsolete records from junction table ${table}: ${deleteError.message}`,
        );
    }
  }
}
