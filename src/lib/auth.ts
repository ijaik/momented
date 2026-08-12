import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
export const SESSION_COOKIE = "admin_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const TOKEN_ISSUER = "momented";
const TOKEN_AUDIENCE = "momented-admin";
function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret)
    throw new Error("Server configuration error: missing ADMIN_SESSION_SECRET");
  return new TextEncoder().encode(secret);
}
export async function signAdminToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}
export async function isValidAdminToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSessionSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    return true;
  } catch {
    return false;
  }
}
export async function verifyAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) throw new Error("Unauthorized: No session token found");
  if (!(await isValidAdminToken(token)))
    throw new Error("Unauthorized: Invalid session token");
  return true;
}
