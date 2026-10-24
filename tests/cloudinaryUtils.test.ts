import { describe, expect, it } from "bun:test";
import {
  buildCloudinaryUrl,
  getSocialShareImageUrl,
} from "@/lib/cloudinary/cloudinaryUtils";

describe("cloudinaryUtils", () => {
  describe("buildCloudinaryUrl", () => {
    it("returns empty string if url is null or empty", () => {
      expect(buildCloudinaryUrl(null)).toBe("");
      expect(buildCloudinaryUrl("")).toBe("");
    });
    it("returns unmodified URL if not a cloudinary URL", () => {
      const externalUrl = "https://example.com/images/sample.jpg";
      expect(buildCloudinaryUrl(externalUrl, ["w_500"])).toBe(externalUrl);
    });
    it("returns unmodified URL if transformations array is empty", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg";
      expect(buildCloudinaryUrl(url, [])).toBe(url);
    });
    it("injects transformations into a clean upload URL", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg";
      const transformed = buildCloudinaryUrl(url, ["w_800", "q_auto"]);
      expect(transformed).toBe(
        "https://res.cloudinary.com/demo/image/upload/w_800,q_auto/v12345/sample.jpg",
      );
    });
    it("does NOT mistake folder names like b_street or c_urban for transform segments", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/b_street/photo.jpg";
      const transformed = buildCloudinaryUrl(url, ["w_400"]);
      expect(transformed).toBe(
        "https://res.cloudinary.com/demo/image/upload/w_400/b_street/photo.jpg",
      );
    });
    it("replaces existing valid transform segment if present", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/c_fill,w_300/v123/sample.jpg";
      const transformed = buildCloudinaryUrl(url, ["w_800"]);
      expect(transformed).toBe(
        "https://res.cloudinary.com/demo/image/upload/c_fill,w_300/w_800/v123/sample.jpg",
      );
    });
  });
  describe("getSocialShareImageUrl", () => {
    it("adds t_social_share transformation", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg";
      const result = getSocialShareImageUrl(url);
      expect(result).toBe(
        "https://res.cloudinary.com/demo/image/upload/t_social_share/v12345/sample.jpg",
      );
    });
  });
});
