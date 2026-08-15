import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
export type JunctionTable =
  | "photo_collections"
  | "photo_rule_collections"
  | "photo_stories";
let cachedAdminDb: SupabaseClient<Database> | null = null;
export function getAdminDb(): SupabaseClient<Database> {
  if (cachedAdminDb) return cachedAdminDb;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey)
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.",
    );
  cachedAdminDb = createClient(supabaseUrl, supabaseSecretKey);
  return cachedAdminDb;
}
export async function syncJunction(
  db: SupabaseClient<Database>,
  table: JunctionTable,
  mainCol: string,
  mainId: string | number,
  targetCol: string,
  targetIds: string[],
): Promise<void> {
  await db
    .from(table)
    .delete()
    .eq(mainCol as never, mainId as never);
  if (targetIds?.length > 0) {
    const inserts = targetIds.map((targetId) => ({
      [mainCol]: mainId,
      [targetCol]: targetId,
    }));
    await db.from(table).insert(inserts as never);
  }
}
