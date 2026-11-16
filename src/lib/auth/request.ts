import "server-only";
import { cookies, headers } from "next/headers";

const IP_PATTERN =
  /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}|::1)$/;
export async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    // Platform-verified reverse proxy headers that cannot be spoofed by clients
    const trustedIp =
      headerStore.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      headerStore.get("cf-connecting-ip")?.trim();
    if (trustedIp && trustedIp !== "unknown" && IP_PATTERN.test(trustedIp))
      return trustedIp;
    // In local development, allow real-ip or forwarded-for fallbacks
    if (process.env.NODE_ENV !== "production") {
      const devIp =
        headerStore.get("x-real-ip")?.trim() ||
        headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
      if (devIp && devIp !== "unknown" && IP_PATTERN.test(devIp)) return devIp;
    }
  } catch {}
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get("m_client_id")?.value;
    if (existing) return `client:${existing}`;
    const newId = crypto.randomUUID();
    cookieStore.set("m_client_id", newId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return `client:${newId}`;
  } catch {
    return "anonymous";
  }
}
