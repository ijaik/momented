"use server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
export async function loginAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const password = formData.get("password");
  if (typeof password !== "string" || !password)
    return { success: false, error: "Password is required" };
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash)
    return { success: false, error: "Server configuration error" };
  const isValid = await bcrypt.compare(password, adminPasswordHash);
  if (isValid) {
    const secretKey = process.env.ADMIN_SESSION_SECRET;
    if (!secretKey)
      return { success: false, error: "Server configuration error" };
    const secret = new TextEncoder().encode(secretKey);
    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "strict",
    });
    return { success: true };
  }
  return { success: false, error: "Incorrect password" };
}
export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}
