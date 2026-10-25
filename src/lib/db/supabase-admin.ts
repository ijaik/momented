import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
export type JunctionTable =
  | "photo_collections"
  | "photo_rule_collections"
  | "photo_calendar_collections"
  | "series_photos";
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
  const dynamicClient = db as SupabaseClient;
  if (!skipDelete) {
    const { error: deleteError } = await dynamicClient
      .from(table)
      .delete()
      .eq(mainCol, mainId);
    if (deleteError)
      throw new Error(
        `Failed to clear junction table ${table}: ${deleteError.message}`,
      );
  }
  if (targetIds?.length > 0) {
    const uniqueTargetIds = Array.from(new Set(targetIds.filter(Boolean)));
    if (uniqueTargetIds.length === 0) return;
    const inserts = uniqueTargetIds.map((targetId) => ({
      [mainCol]: mainId,
      [targetCol]: targetId,
    }));
    const { error: insertError } = await dynamicClient
      .from(table)
      .insert(inserts);
    if (insertError)
      throw new Error(
        `Failed to update junction table ${table}: ${insertError.message}`,
      );
  }
}
