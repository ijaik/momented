import { describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

// Sample mock photos pool
const mockPhotos = [
  {
    id: "photo-landscape-1",
    title: "Misty Horizon",
    description: "Quiet morning mist.",
    cloudinary_url:
      "https://res.cloudinary.com/momented/image/upload/v123456/mist.jpg",
    cloudinary_public_id: "momented-dev/mist",
    width: 4000,
    height: 3000,
    camera_make: "Motorola",
    camera_model: "moto g64 5G",
    focal_length: "4.2mm",
    aperture: "f/1.8",
    shutter_speed: "1/500s",
    iso: 100,
    artist: "Jai",
    taken_at: "2026-05-14T06:00:00Z",
    created_at: "2026-05-14T08:00:00Z",
  },
  {
    id: "photo-portrait-2",
    title: "Vertical Silhouette",
    description: "Street lamp against evening sky.",
    cloudinary_url:
      "https://res.cloudinary.com/momented/image/upload/v123456/silhouette.jpg",
    cloudinary_public_id: "momented-dev/silhouette",
    width: 3000,
    height: 4000,
    camera_make: "Motorola",
    camera_model: "moto g64 5G",
    focal_length: "4.2mm",
    aperture: "f/1.8",
    shutter_speed: "1/250s",
    iso: 200,
    artist: "Jai",
    taken_at: "2026-06-20T19:30:00Z",
    created_at: "2026-06-20T20:00:00Z",
  },
];
let currentMockPool: typeof mockPhotos = mockPhotos;
let shouldMockThrow = false;
process.env.CLOUDINARY_API_SECRET = "mock_secret";
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "momented";
mock.module("@/lib/db/queries", () => ({
  getPublicApiPhotosPool: async () => {
    if (shouldMockThrow) throw new Error("Simulated database failure");
    return currentMockPool;
  },
}));
// Import after mocking
const { GET, OPTIONS } = await import("@/app/api/v1/photos/random/route");
const { clearApiRateLimitForTest } = await import("@/lib/auth/rateLimit");
describe("Public Wallpaper API (/api/v1/photos/random)", () => {
  it("OPTIONS returns 204 with permissive CORS headers", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
  it("GET returns 200 JSON with structured metadata and CC0 license", async () => {
    currentMockPool = mockPhotos;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=60");
    expect(res.headers.get("Vary")).toContain("Accept");
    const json = await res.json();
    expect(json.status).toBe("success");
    expect(json.data.id).toBeDefined();
    expect(json.data.image.url).toContain("res.cloudinary.com");
    expect(json.data.image.wallpaper_url).toContain("w_1920");
    expect(json.data.image.thumbnail_url).toContain("w_640");
    expect(json.data.image.raw_url).toBeDefined();
    expect(json.data.image.fallback_url).toContain("/fallback-photos/");
    expect(json.data.license.name).toContain("CC0");
    expect(json.data.license.commercial_use_allowed).toBe(true);
    expect(json.data.camera.device).toContain("moto g64 5G");
    expect(json.data.links.download).toContain(
      "/api/v1/photos/random?download=true",
    );
  });
  it("GET dynamically uses request origin for hypermedia links on custom/local domains", async () => {
    currentMockPool = mockPhotos;
    const req = new NextRequest("http://localhost:3000/api/v1/photos/random");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.links.download).toBe(
      "http://localhost:3000/api/v1/photos/random?download=true",
    );
    expect(json.data.links.direct_image).toBe(
      "http://localhost:3000/api/v1/photos/random?redirect=true",
    );
    expect(json.data.links.html).toBe(
      `http://localhost:3000/photo/${json.data.id}`,
    );
    expect(json.data.image.fallback_url).toContain(
      "http://localhost:3000/fallback-photos/",
    );
  });
  it("GET ?redirect=true redirects (302) to optimized wallpaper on Cloudinary", async () => {
    currentMockPool = mockPhotos;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?redirect=true",
    );
    const res = await GET(req);
    expect(res.status).toBe(302);
    const location = res.headers.get("Location");
    expect(location).toBeDefined();
    expect(location).toContain("res.cloudinary.com");
    expect(location).toContain("w_1920");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=60");
    expect(res.headers.get("Vary")).toContain("Accept");
  });
  it("GET ?redirect=true&raw=true redirects (302) to uncompressed raw master", async () => {
    currentMockPool = mockPhotos;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?redirect=true&raw=true",
    );
    const res = await GET(req);
    expect(res.status).toBe(302);
    const location = res.headers.get("Location");
    expect(location).toBeDefined();
    expect(location).toContain("res.cloudinary.com");
    expect(location).not.toContain("w_1920");
  });
  it("GET ?download=true redirects (302) with fl_attachment transformation", async () => {
    currentMockPool = mockPhotos;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?download=true",
    );
    const res = await GET(req);
    expect(res.status).toBe(302);
    const location = res.headers.get("Location");
    expect(location).toBeDefined();
    expect(location).toContain("fl_attachment");
  });
  it("GET ?orientation=portrait selects only portrait photos", async () => {
    currentMockPool = mockPhotos;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?orientation=portrait",
    );
    const res = await GET(req);
    const json = await res.json();
    expect(json.data.id).toBe("photo-portrait-2");
    expect(json.data.image.height).toBeGreaterThan(json.data.image.width);
  });
  it("GET ?orientation=landscape selects only landscape photos", async () => {
    currentMockPool = mockPhotos;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?orientation=landscape",
    );
    const res = await GET(req);
    const json = await res.json();
    expect(json.data.id).toBe("photo-landscape-1");
    expect(json.data.image.width).toBeGreaterThan(json.data.image.height);
  });
  it("GET falls back to static edge photo when database returns empty array", async () => {
    currentMockPool = [];
    shouldMockThrow = false;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("success");
    expect(json.data.image.url).toContain("/fallback-photos/");
    expect(json.data.license.commercial_use_allowed).toBe(true);
  });
  it("GET falls back to static edge photo matching orientation when database is empty", async () => {
    currentMockPool = [];
    shouldMockThrow = false;
    const portraitReq = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?orientation=portrait",
    );
    const portraitRes = await GET(portraitReq);
    expect(portraitRes.status).toBe(200);
    const portraitJson = await portraitRes.json();
    expect(portraitJson.data.image.url).toContain("fallback-portrait.jpg");
    expect(portraitJson.data.image.height).toBeGreaterThan(
      portraitJson.data.image.width,
    );
    const landscapeReq = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?orientation=landscape",
    );
    const landscapeRes = await GET(landscapeReq);
    expect(landscapeRes.status).toBe(200);
    const landscapeJson = await landscapeRes.json();
    expect(landscapeJson.data.image.url).toContain("fallback-landscape.jpg");
    expect(landscapeJson.data.image.width).toBeGreaterThan(
      landscapeJson.data.image.height,
    );
  });
  it("GET gracefully recovers with fallback photo when database query throws error", async () => {
    shouldMockThrow = true;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("success");
    expect(json.data.image.url).toContain("/fallback-photos/");
    shouldMockThrow = false;
  });
  it("GET in fallback mode redirects (302) to static edge fallback asset", async () => {
    currentMockPool = [];
    shouldMockThrow = false;
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random?redirect=true&orientation=landscape",
    );
    const res = await GET(req);
    expect(res.status).toBe(302);
    const location = res.headers.get("Location");
    expect(location).toContain("/fallback-photos/fallback-landscape.jpg");
  });
  it("GET returns standard rate limit headers", async () => {
    currentMockPool = mockPhotos;
    const testIp = "203.0.113.10";
    clearApiRateLimitForTest(testIp);
    const req = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random",
      { headers: { "x-forwarded-for": testIp } },
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("59");
    expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
  });
  it("GET enforces 60 req/hr rate limit and returns 429 Too Many Requests", async () => {
    currentMockPool = mockPhotos;
    const testIp = "203.0.113.42";
    clearApiRateLimitForTest(testIp);
    // Make 60 requests to consume the quota
    for (let i = 0; i < 60; i++) {
      const req = new NextRequest(
        "https://momented.vercel.app/api/v1/photos/random",
        { headers: { "x-forwarded-for": testIp } },
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
    }
    // 61st request should be rejected with 429
    const blockedReq = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random",
      { headers: { "x-forwarded-for": testIp } },
    );
    const blockedRes = await GET(blockedReq);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get("Retry-After")).toBeDefined();
    expect(blockedRes.headers.get("X-RateLimit-Remaining")).toBe("0");
    const blockedJson = await blockedRes.json();
    expect(blockedJson.status).toBe("error");
    expect(blockedJson.message).toContain("Rate limit exceeded");
    expect(blockedJson.retry_after_seconds).toBeGreaterThan(0);
    // Another IP should still succeed
    const otherIpReq = new NextRequest(
      "https://momented.vercel.app/api/v1/photos/random",
      { headers: { "x-forwarded-for": "203.0.113.99" } },
    );
    const otherIpRes = await GET(otherIpReq);
    expect(otherIpRes.status).toBe(200);
  });
});
