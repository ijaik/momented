import { describe, expect, it } from "bun:test";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

describe("buildPageMetadata", () => {
  it("returns absolute title when title already contains the site name", () => {
    const meta = buildPageMetadata({
      title: "Momented — Minimalist Photography Journal & Gallery",
      description: "Sample description",
      path: "/",
    });
    expect(meta.title).toEqual({
      absolute: "Momented — Minimalist Photography Journal & Gallery",
    });
  });
  it("returns simple string title when title does not contain the site name so layout template applies", () => {
    const meta = buildPageMetadata({
      title: "About",
      description: "About the photographer",
      path: "/about",
    });
    expect(meta.title).toBe("About");
    expect(meta.openGraph?.title).toBe(`About | ${siteConfig.name}`);
  });
});
