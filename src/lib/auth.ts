import { jwtVerify } from "jose";
import { cookies } from "next/headers";
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized: No session token found");
  const secretKey = process.env.ADMIN_SESSION_SECRET;
  if (!secretKey)
    throw new Error("Server configuration error: missing ADMIN_SESSION_SECRET");
  try {
    const secret = new TextEncoder().encode(secretKey);
    await jwtVerify(token, secret);
    return true;
  } catch {
    throw new Error("Unauthorized: Invalid session token");
  }
}
