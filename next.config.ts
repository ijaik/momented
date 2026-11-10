import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  devIndicators: false,
  poweredByHeader: false,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinary/cloudinaryLoader.ts",
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";
    const publicCsp = [
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
    return [
      {
        source: "/((?!admin).*)",
        headers: [{ key: "Content-Security-Policy", value: publicCsp }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};
export default nextConfig;
