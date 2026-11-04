import { describe, expect, it } from "bun:test";
import { getDownloadUrlAction } from "@/actions/download";
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
