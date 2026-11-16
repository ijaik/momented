import { type NextRequest, NextResponse } from "next/server";
import { isValidAdminToken, SESSION_COOKIE } from "@/lib/auth/auth";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  if (path === "/admin/login" && request.nextUrl.searchParams.has("password")) {
    const cleanUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(cleanUrl);
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isValid = await isValidAdminToken(token);
  if (path === "/admin/login") {
    if (isValid) return NextResponse.redirect(new URL("/admin", request.url));
    const response = NextResponse.next();
    if (token && !isValid) response.cookies.delete(SESSION_COOKIE);
    return response;
  }
  if (!isValid) {
    const redirect = NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
    if (token) redirect.cookies.delete(SESSION_COOKIE);
    return redirect;
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
