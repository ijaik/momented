import { type NextRequest, NextResponse } from "next/server";
import { isValidAdminToken, SESSION_COOKIE } from "@/lib/auth";

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
function buildCsp(scriptSrc: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    `connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com ${supabaseUrl}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}
function buildStrictCsp(nonce: string): string {
  return buildCsp(`script-src 'self' 'nonce-${nonce}'`);
}
function buildBaselineCsp(): string {
  return buildCsp("script-src 'self' 'unsafe-inline'");
}
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === "production";
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");
  const isNonceRoute = isAdminPath;
  const nonce = isProduction && isNonceRoute ? generateNonce() : undefined;
  const csp = isProduction
    ? nonce
      ? buildStrictCsp(nonce)
      : buildBaselineCsp()
    : undefined;
  const requestHeaders = new Headers(request.headers);
  if (nonce) requestHeaders.set("x-nonce", nonce);
  if (csp) requestHeaders.set("Content-Security-Policy", csp);
  if (isAdminPath) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const isValid = await isValidAdminToken(token);
    if (path === "/admin/login") {
      if (isValid) return NextResponse.redirect(new URL("/admin", request.url));
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      if (token && !isValid) response.cookies.delete(SESSION_COOKIE);
      if (csp) response.headers.set("Content-Security-Policy", csp);
      return response;
    }
    if (!isValid) {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  if (csp) response.headers.set("Content-Security-Policy", csp);
  return response;
}
export const config = {
  matcher: ["/admin/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
