"use server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
export async function loginAction(formData) {
  const password = formData.get("password");
  const isValid = bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH);
  if (isValid) {
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
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
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: false, error: "Incorrect password" };
}
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}
