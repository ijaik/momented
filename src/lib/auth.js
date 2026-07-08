import { jwtVerify } from "jose";
import { cookies } from "next/headers";
export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized Request. Intruder blocked.");
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (_error) {
    throw new Error("Unauthorized Request. Invalid or expired token.");
  }
}
