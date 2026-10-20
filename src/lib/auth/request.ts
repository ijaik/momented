import "server-only";
import { cookies, headers } from "next/headers";
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const rawIp =
    headerStore.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("cf-connecting-ip")?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (rawIp && rawIp !== "unknown") return rawIp;
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
