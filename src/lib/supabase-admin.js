import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth";
export async function getAdminDb(verifySession = true) {
  if (verifySession) {
    await verifyAdminSession();
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
  );
}
