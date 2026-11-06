import { type NextRequest, NextResponse } from "next/server";
import { isValidAdminToken, SESSION_COOKIE } from "@/lib/auth/auth";

function buildCsp(isAdmin = false): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const scriptSrc = isAdmin
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
    : "script-src 'self' 'unsafe-inline'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    `connect-src 'self' data: blob: https://res.cloudinary.com https://api.cloudinary.com https://cdn.jsdelivr.net ${supabaseUrl}`.trim(),
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === "production";
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");
  if (path === "/admin/login" && request.nextUrl.searchParams.has("password")) {
    const cleanUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(cleanUrl);
  }
  const response = NextResponse.next();
  if (isProduction)
    response.headers.set("Content-Security-Policy", buildCsp(isAdminPath));
  if (!isAdminPath) return response;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isValid = await isValidAdminToken(token);
  if (path === "/admin/login") {
    if (isValid) return NextResponse.redirect(new URL("/admin", request.url));
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
  return response;
}
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|icons|screenshots|sitemap.xml|robots.txt|manifest.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
