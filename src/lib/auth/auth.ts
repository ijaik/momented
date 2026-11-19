import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAdminDb } from "@/lib/db/supabase-admin";
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-admin_session"
    : "admin_session";
export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const TOKEN_ISSUER = "momented";
const TOKEN_AUDIENCE = "momented-admin";
const MIN_SESSION_SECRET_LENGTH = 32;
function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret)
    throw new Error("Server configuration error: missing ADMIN_SESSION_SECRET");
  if (secret.length < MIN_SESSION_SECRET_LENGTH)
    throw new Error(
      `Server configuration error: ADMIN_SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters long.`,
    );
  return new TextEncoder().encode(secret);
}
/**
 * Creates a database-backed session in Supabase and returns a signed JWT containing the session ID.
 */
export async function createAdminSession(options?: {
  ip?: string;
  userAgent?: string;
}): Promise<string> {
  const expiresAt = new Date(
    Date.now() + SESSION_COOKIE_MAX_AGE * 1000,
  ).toISOString();
  const db = getAdminDb();
  const { data, error } = await db
    .from("admin_sessions")
    .insert({
      expires_at: expiresAt,
      ip_address: options?.ip || null,
      user_agent: options?.userAgent || null,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[Auth] Failed to create admin session in database:", error);
    throw new Error("Failed to create admin session");
  }
  return new SignJWT({ admin: true, sessionId: data.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}
/**
 * Parses and verifies the JWT cryptographic signature, returning the embedded sessionId if valid.
 */
export async function parseAdminToken(
  token: string | undefined,
): Promise<{ sessionId: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    if (
      payload.admin === true &&
      typeof payload.sessionId === "string" &&
      payload.sessionId.length > 0
    )
      return { sessionId: payload.sessionId };
    return null;
  } catch {
    return null;
  }
}
/**
 * Authoritative session verification: checks cryptographic signature AND active existence in Supabase.
 * Defends against leaked ADMIN_SESSION_SECRET (attacker cannot forge an active DB session ID).
 */
export async function isValidAdminToken(
  token: string | undefined,
): Promise<boolean> {
  const parsed = await parseAdminToken(token);
  if (!parsed?.sessionId) return false;
  try {
    const db = getAdminDb();
    const { data, error } = await db
      .from("admin_sessions")
      .select("id")
      .eq("id", parsed.sessionId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error || !data) return false;
    return true;
  } catch (err) {
    console.error("[Auth] Error verifying admin session in database:", err);
    return false;
  }
}
/**
 * Revokes a single session by deleting its record from Supabase.
 */
export async function invalidateAdminSession(sessionId: string): Promise<void> {
  try {
    const db = getAdminDb();
    await db.from("admin_sessions").delete().eq("id", sessionId);
  } catch (err) {
    console.error("[Auth] Error invalidating admin session:", err);
  }
}
/**
 * Revokes all active admin sessions across all devices (Global Logout).
 */
export async function invalidateAllAdminSessions(): Promise<void> {
  try {
    const db = getAdminDb();
    await db.from("admin_sessions").delete().not("id", "is", null);
  } catch (err) {
    console.error("[Auth] Error invalidating all admin sessions:", err);
  }
}
/**
 * Authoritative session verification for Server Components and Server Actions.
 * Wrapped in React cache() to deduplicate multiple calls within a single request.
 */
export const verifyAdminSession = cache(async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await isValidAdminToken(token))) {
    cookieStore.delete(SESSION_COOKIE_OPTIONS);
    redirect("/admin/login");
  }
  return true;
});
