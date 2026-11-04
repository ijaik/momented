import "server-only";
import { cookies, headers } from "next/headers";

const IP_PATTERN =
  /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}|::1)$/;
export async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    const rawIp =
      headerStore.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      headerStore.get("cf-connecting-ip")?.trim() ||
      headerStore.get("x-real-ip")?.trim() ||
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (rawIp && rawIp !== "unknown" && IP_PATTERN.test(rawIp)) return rawIp;
  } catch {}
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get("m_client_id")?.value;
    if (existing) return `client:${existing}`;
    const newId = crypto.randomUUID();
    cookieStore.set("m_client_id", newId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return `client:${newId}`;
  } catch {
    return "anonymous";
  }
}
