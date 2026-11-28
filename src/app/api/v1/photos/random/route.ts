import { type NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { checkApiRateLimit } from "@/lib/auth/rateLimit";
import { extractClientIp } from "@/lib/auth/request";
import { buildSignedDownloadUrl } from "@/lib/cloudinary/cloudinary";
import { buildCloudinaryUrl } from "@/lib/cloudinary/cloudinaryUtils";
import { getStaticFallbackPhoto } from "@/lib/constants/fallbackPhotos";
import { type ApiPhoto, getPublicApiPhotosPool } from "@/lib/db/queries";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};
const CACHE_HEADERS = {
  ...CORS_HEADERS,
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  Vary: "Accept",
};
function buildPhotoPayload(
  photo: ApiPhoto,
  baseUrl: string,
  imageUrls: {
    wallpaperUrl: string;
    thumbnailUrl: string;
    rawUrl: string;
    fallbackUrl: string;
  },
) {
  return {
    status: "success",
    data: {
      id: photo.id,
      title: photo.title || "Untitled Photograph",
      description: photo.description || null,
      image: {
        url: imageUrls.wallpaperUrl,
        wallpaper_url: imageUrls.wallpaperUrl,
        thumbnail_url: imageUrls.thumbnailUrl,
        raw_url: imageUrls.rawUrl,
        fallback_url: imageUrls.fallbackUrl,
        width: photo.width,
        height: photo.height,
        aspect_ratio:
          photo.width && photo.height ? `${photo.width}:${photo.height}` : null,
      },
      observer: {
        name: photo.artist || siteConfig.author.name,
        role: siteConfig.author.role,
        url: `${baseUrl}/about`,
      },
      camera: {
        device: photo.camera_make
          ? `${photo.camera_make} ${photo.camera_model || ""}`.trim()
          : photo.camera_model || null,
        focal_length: photo.focal_length || null,
        aperture: photo.aperture || null,
        shutter_speed: photo.shutter_speed || null,
        iso: photo.iso || null,
        taken_at: photo.taken_at || null,
      },
      license: {
        name: "Creative Commons Zero 1.0 Universal (CC0)",
        url: "https://creativecommons.org/publicdomain/zero/1.0/",
        commercial_use_allowed: true,
        attribution_required: false,
      },
      links: {
        html: `${baseUrl}/photo/${photo.id}`,
        download: `${baseUrl}/api/v1/photos/random?download=true`,
        direct_image: `${baseUrl}/api/v1/photos/random?redirect=true`,
      },
    },
  };
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
export async function GET(request: NextRequest) {
  const ip = extractClientIp(request.headers);
  const rateLimit = await checkApiRateLimit(ip);
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.reset / 1000)),
  };
  if (rateLimit.limited) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Rate limit exceeded. Public API is limited to 60 requests per hour per IP.",
        retry_after_seconds: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          ...rateLimitHeaders,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }
  const responseHeaders = {
    ...CACHE_HEADERS,
    ...rateLimitHeaders,
  };
  const baseUrl = request.nextUrl.origin || siteConfig.url.replace(/\/$/, "");
  let photos: ApiPhoto[] = [];
  try {
    photos = await getPublicApiPhotosPool();
  } catch (err) {
    console.warn(
      "[PublicAPI] Database fetch error, activating edge fallback:",
      err,
    );
  }
  const { searchParams } = request.nextUrl;
  const orientation = searchParams.get("orientation")?.toLowerCase();
  const shouldRedirect =
    searchParams.get("redirect") === "true" ||
    searchParams.get("redirect") === "1";
  const shouldDownload =
    searchParams.get("download") === "true" ||
    searchParams.get("download") === "1";
  const wantsRaw =
    searchParams.get("raw") === "true" || searchParams.get("raw") === "1";
  // Resilient Fallback: If database is down or archive is empty, serve edge-cached fallback photo
  if (!photos || photos.length === 0) {
    const fallback = getStaticFallbackPhoto(orientation);
    const fallbackAssetUrl = `${baseUrl}/fallback-photos/${fallback.fallback_filename}`;
    if (shouldRedirect || shouldDownload) {
      return NextResponse.redirect(fallbackAssetUrl, {
        status: 302,
        headers: responseHeaders,
      });
    }
    const payload = buildPhotoPayload(fallback, baseUrl, {
      wallpaperUrl: fallbackAssetUrl,
      thumbnailUrl: fallbackAssetUrl,
      rawUrl: fallbackAssetUrl,
      fallbackUrl: fallbackAssetUrl,
    });
    return NextResponse.json(payload, {
      status: 200,
      headers: responseHeaders,
    });
  }
  let pool = photos;
  if (orientation === "portrait") {
    pool = photos.filter((p) => (p.height ?? 0) >= (p.width ?? 0));
  } else if (orientation === "landscape") {
    pool = photos.filter((p) => (p.width ?? 0) > (p.height ?? 0));
  }
  if (pool.length === 0) pool = photos;
  const photo = pool[Math.floor(Math.random() * pool.length)];
  // Allowed Cloudinary Strict Transformations (Fast ~200-400KB WebP/AVIF delivery)
  const wallpaperUrl = buildCloudinaryUrl(photo.cloudinary_url, [
    "f_auto",
    "c_limit",
    "w_1920",
    "q_auto",
  ]);
  const thumbnailUrl = buildCloudinaryUrl(photo.cloudinary_url, [
    "f_auto",
    "c_limit",
    "w_640",
    "q_auto",
  ]);
  const edgeFallbackFilename =
    (photo.height ?? 0) >= (photo.width ?? 0)
      ? "fallback-portrait.jpg"
      : "fallback-landscape.jpg";
  const edgeFallbackUrl = `${baseUrl}/fallback-photos/${edgeFallbackFilename}`;
  // Case 1: Direct Image Stream Redirect (optimized for speed; use ?raw=true for uncompressed original)
  if (shouldRedirect) {
    const targetUrl = wantsRaw ? photo.cloudinary_url : wallpaperUrl;
    return NextResponse.redirect(targetUrl, {
      status: 302,
      headers: responseHeaders,
    });
  }
  // Case 2: Attachment Download Redirect (signed with API secret to satisfy strict transformations)
  if (shouldDownload) {
    let downloadUrl = wallpaperUrl;
    if (photo.cloudinary_public_id && process.env.CLOUDINARY_API_SECRET) {
      try {
        downloadUrl = buildSignedDownloadUrl(
          photo.cloudinary_public_id,
          photo.title || `momented-${photo.id}`,
        );
      } catch (err) {
        console.warn(
          "Failed to sign Cloudinary download URL, using wallpaper fallback:",
          err,
        );
      }
    }
    return NextResponse.redirect(downloadUrl, {
      status: 302,
      headers: responseHeaders,
    });
  }
  // Case 3: Standard Public JSON Payload
  const payload = buildPhotoPayload(photo, baseUrl, {
    wallpaperUrl,
    thumbnailUrl,
    rawUrl: photo.cloudinary_url,
    fallbackUrl: edgeFallbackUrl,
  });
  return NextResponse.json(payload, {
    status: 200,
    headers: responseHeaders,
  });
}
