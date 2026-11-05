"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  signAdminToken,
} from "@/lib/auth/auth";
import {
  clearLoginFailures,
  getGlobalLoginLockout,
  getLoginLockout,
  recordGlobalLoginFailure,
  recordLoginFailure,
} from "@/lib/auth/rateLimit";
import { getClientIp } from "@/lib/auth/request";
export interface LoginState {
  error?: string;
}
export async function loginAction(
  prevStateOrFormData: LoginState | FormData,
  maybeFormData?: FormData,
): Promise<LoginState> {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : (prevStateOrFormData as FormData);
  const password = formData?.get("password");
  if (typeof password !== "string" || !password)
    return { error: "Password is required" };
  const globalLockoutRemaining = await getGlobalLoginLockout();
  if (globalLockoutRemaining > 0) {
    const minutes = Math.ceil(globalLockoutRemaining / 60);
    return {
      error: `Too many attempts. Try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
    };
  }
  const ip = await getClientIp();
  const lockoutKey = `login:${ip}`;
  const lockoutRemaining = await getLoginLockout(lockoutKey);
  if (lockoutRemaining > 0) {
    const minutes = Math.ceil(lockoutRemaining / 60);
    return {
      error: `Too many attempts. Try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
    };
  }
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) return { error: "Server configuration error" };
  const isValid = await bcrypt.compare(password, adminPasswordHash);
  if (!isValid) {
    const [{ lockedOut: ipLockedOut }, { lockedOut: globalLockedOut }] =
      await Promise.all([
        recordLoginFailure(lockoutKey),
        recordGlobalLoginFailure(),
      ]);
    return {
      error:
        ipLockedOut || globalLockedOut
          ? "Too many attempts. Try again in 15 minutes."
          : "Incorrect password",
    };
  }
  await clearLoginFailures(lockoutKey);
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
  redirect("/admin");
}
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: SESSION_COOKIE,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  redirect("/");
}
