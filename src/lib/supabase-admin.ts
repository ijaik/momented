import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth";
export async function getAdminDb(
  verifySession: boolean = true,
): Promise<SupabaseClient> {
  if (verifySession) {
    await verifyAdminSession();
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey)
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.",
    );
  return createClient(supabaseUrl, supabaseSecretKey);
}
