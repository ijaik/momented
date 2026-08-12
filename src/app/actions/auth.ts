"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  signAdminToken,
} from "@/lib/auth";
import {
  clearLoginFailures,
  getLoginLockout,
  recordLoginFailure,
} from "@/lib/rateLimit";
import { getClientIp } from "@/lib/request";
export async function loginAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const password = formData.get("password");
  if (typeof password !== "string" || !password)
    return { success: false, error: "Password is required" };
  const ip = await getClientIp();
  const lockoutKey = `login:${ip}`;
  const lockoutRemaining = getLoginLockout(lockoutKey);
  if (lockoutRemaining > 0) {
    const minutes = Math.ceil(lockoutRemaining / 60);
    return {
      success: false,
      error: `Too many attempts. Try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
    };
  }
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash)
    return { success: false, error: "Server configuration error" };
  const isValid = await bcrypt.compare(password, adminPasswordHash);
  if (!isValid) {
    const { lockedOut } = recordLoginFailure(lockoutKey);
    return {
      success: false,
      error: lockedOut
        ? "Too many attempts. Try again in 15 minutes."
        : "Incorrect password",
    };
  }
  clearLoginFailures(lockoutKey);
  const token = await signAdminToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "strict",
    priority: "high",
  });
  return { success: true };
}
export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return { success: true };
}
