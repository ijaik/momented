import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
export async function proxy(request) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin")) return NextResponse.next();
  const token = request.cookies.get("admin_session")?.value;
  let isValid = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
      await jwtVerify(token, secret);
      isValid = true;
    } catch (_error) {
      isValid = false;
    }
  }
  if (path === "/admin/login") {
    if (isValid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const response = NextResponse.next();
    if (token && !isValid) response.cookies.delete("admin_session");
    return response;
  }
  if (!isValid) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
    if (token) response.cookies.delete("admin_session");
    return response;
  }
  return NextResponse.next();
}
export const config = {
  matcher: "/admin/:path*",
};
