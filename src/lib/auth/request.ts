import "server-only";
import { cookies, headers } from "next/headers";

const IP_PATTERN =
  /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}|::1)$/;
export function extractClientIp(headerStore: {
  get(name: string): string | null;
}): string {
  // Platform-verified reverse proxy headers that cannot be spoofed by clients
  const trustedIp =
    headerStore.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("cf-connecting-ip")?.trim();
  if (trustedIp && trustedIp !== "unknown" && IP_PATTERN.test(trustedIp))
    return trustedIp;
  // Standard reverse proxy headers (Nginx, Caddy, Traefik, Docker, Railway, etc.)
  const standardIp =
    headerStore.get("x-real-ip")?.trim() ||
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (standardIp && standardIp !== "unknown" && IP_PATTERN.test(standardIp))
    return standardIp;
  return "127.0.0.1";
}
export async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    const trustedIp = extractClientIp(headerStore);
    if (trustedIp !== "127.0.0.1") return trustedIp;
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
