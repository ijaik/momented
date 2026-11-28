import { describe, expect, it } from "bun:test";
import { logoutAllAction } from "@/actions/auth";
import { getDownloadUrlAction } from "@/actions/download";
import { editPhotoAction } from "@/actions/photos";
import {
  checkRateLimit,
  clearGlobalLoginFailures,
  clearLoginFailures,
  GLOBAL_LOGIN_MAX_FAILURES,
  getGlobalLoginLockout,
  getLoginLockout,
  recordGlobalLoginFailure,
  recordLoginFailure,
} from "@/lib/auth/rateLimit";
import {
  parsePhotoEditInput,
  sanitizeExifFields,
} from "@/lib/utils/validation";

describe("Security & Rate Limiting", () => {
  it("allows requests under the rate limit threshold", async () => {
    const key = `test-user-${Date.now()}`;
    const res = await checkRateLimit(key);
    expect(res.limited).toBe(false);
    expect(res.retryAfterSeconds).toBe(0);
  });
  it("records failed login attempts and calculates lockout accurately", async () => {
    const ip = `test-ip-${Date.now()}`;
    for (let i = 0; i < 4; i++) {
      const res = await recordLoginFailure(ip);
      expect(res.lockedOut).toBe(false);
    }
    const fifth = await recordLoginFailure(ip);
    expect(fifth.lockedOut).toBe(true);
    expect(fifth.retryAfterSeconds).toBeGreaterThan(0);
    const lockout = await getLoginLockout(ip);
    expect(lockout).toBeGreaterThan(0);
    await clearLoginFailures(ip);
    const cleared = await getLoginLockout(ip);
    expect(cleared).toBe(0);
  });
  it("enforces global brute-force lockout across distributed requests", async () => {
    await clearGlobalLoginFailures();
    for (let i = 0; i < GLOBAL_LOGIN_MAX_FAILURES - 1; i++) {
      const res = await recordGlobalLoginFailure();
      expect(res.lockedOut).toBe(false);
    }
    const tripping = await recordGlobalLoginFailure();
    expect(tripping.lockedOut).toBe(true);
    expect(tripping.retryAfterSeconds).toBeGreaterThan(0);
    const lockout = await getGlobalLoginLockout();
    expect(lockout).toBeGreaterThan(0);
    await clearGlobalLoginFailures();
    const cleared = await getGlobalLoginLockout();
    expect(cleared).toBe(0);
  });
});
describe("Download Server Action Protections", () => {
  it("rejects non-Cloudinary or malicious URLs", async () => {
    const fakePhotoId = "00000000-0000-0000-0000-000000000001";
    expect(
      getDownloadUrlAction({
        photoId: fakePhotoId,
        cloudinaryUrl: "javascript:alert(1)",
      }),
    ).rejects.toThrow("Invalid Cloudinary URL");
    expect(
      getDownloadUrlAction({
        photoId: fakePhotoId,
        cloudinaryUrl: "https://evil-site.com/malicious.jpg",
      }),
    ).rejects.toThrow("Invalid Cloudinary URL");
    expect(
      getDownloadUrlAction({
        photoId: fakePhotoId,
        cloudinaryUrl:
          "https://res.cloudinary.com/attacker-cloud/image/upload/malicious.jpg",
      }),
    ).rejects.toThrow("Invalid Cloudinary URL");
    expect(
      getDownloadUrlAction({
        photoId: "invalid-uuid-string",
        cloudinaryUrl:
          "https://res.cloudinary.com/momented/image/upload/sample.jpg",
      }),
    ).rejects.toThrow("Invalid photo ID.");
  });
});
describe("Admin Auth Gates & Photo Validation", () => {
  const validPhotoId = "00000000-0000-4000-8000-000000000001";
  it("rejects unauthenticated logoutAllAction and editPhotoAction calls", async () => {
    expect(logoutAllAction()).rejects.toThrow();
    expect(
      editPhotoAction(validPhotoId, "Valid Title", "", [], []),
    ).rejects.toThrow();
  });
  it("parsePhotoEditInput rejects blank/whitespace titles and trims valid text", () => {
    expect(() => parsePhotoEditInput(validPhotoId, "   ", "", [], [])).toThrow(
      "Title is required.",
    );
    expect(
      parsePhotoEditInput(
        validPhotoId,
        "  Golden Light  ",
        "  Evening walk  ",
        [],
        [],
      ),
    ).toEqual({
      title: "Golden Light",
      description: "Evening walk",
      collectionIds: [],
      ruleIds: [],
    });
  });
  it("sanitizeExifFields drops invalid zero/negative ISO and empty/non-numeric focal length", () => {
    expect(sanitizeExifFields({ FocalLength: "auto", ISO: 0 })).toEqual({
      focalLength: null,
      iso: null,
    });
    expect(
      sanitizeExifFields({ FocalLength: "...", ISOSpeedRatings: -100 }),
    ).toEqual({
      focalLength: null,
      iso: null,
    });
    expect(
      sanitizeExifFields({ FocalLength: "35.0 mm", ISOSpeedRatings: "400" }),
    ).toEqual({
      focalLength: "35.0mm",
      iso: 400,
    });
  });
});
