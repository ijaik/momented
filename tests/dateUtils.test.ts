import { describe, expect, it } from "bun:test";
import {
  formatDisplayDate,
  getPhotoDate,
  isPhotoUndated,
  parsePhotoDate,
} from "@/lib/utils/dateUtils";

describe("dateUtils", () => {
  describe("parsePhotoDate", () => {
    it("returns null for null, undefined, or empty input", () => {
      expect(parsePhotoDate(null)).toBeNull();
      expect(parsePhotoDate(undefined)).toBeNull();
      expect(parsePhotoDate("")).toBeNull();
      expect(parsePhotoDate("   ")).toBeNull();
    });
    it("correctly parses EXIF format YYYY:MM:DD HH:MM:SS", () => {
      const parsed = parsePhotoDate("2024:08:15 14:30:00");
      expect(parsed).not.toBeNull();
      expect(parsed?.getUTCFullYear()).toBe(2024);
      expect(parsed?.getUTCMonth()).toBe(7); // 0-indexed: August is 7
      expect(parsed?.getUTCDate()).toBe(15);
      expect(parsed?.getUTCHours()).toBe(14);
      expect(parsed?.getUTCMinutes()).toBe(30);
    });
    it("correctly parses ISO 8601 strings", () => {
      const parsed = parsePhotoDate("2025-05-10T12:00:00Z");
      expect(parsed).not.toBeNull();
      expect(parsed?.getUTCFullYear()).toBe(2025);
      expect(parsed?.getUTCMonth()).toBe(4); // May
      expect(parsed?.getUTCDate()).toBe(10);
    });
    it("returns null for invalid date strings", () => {
      expect(parsePhotoDate("invalid-date-format")).toBeNull();
    });
  });
  describe("isPhotoUndated", () => {
    it("returns true when taken_at is missing or null", () => {
      expect(isPhotoUndated({})).toBe(true);
      expect(isPhotoUndated({ taken_at: null })).toBe(true);
    });
    it("returns true when taken_at year is 1970 or earlier (epoch)", () => {
      expect(isPhotoUndated({ taken_at: "1970-01-01T00:00:00Z" })).toBe(true);
      expect(isPhotoUndated({ taken_at: "1969-12-31T23:59:59Z" })).toBe(true);
    });
    it("returns false for a photo with a valid modern date", () => {
      expect(isPhotoUndated({ taken_at: "2024-06-20T10:00:00Z" })).toBe(false);
    });
  });
  describe("getPhotoDate", () => {
    it("extracts year, month, day, and formatted dateString from taken_at", () => {
      const res = getPhotoDate({ taken_at: "2023-11-05T08:00:00Z" });
      expect(res).toEqual({
        year: 2023,
        month: 11,
        day: 5,
        dateString: "2023-11-05",
      });
    });
    it("falls back to created_at when taken_at is absent", () => {
      const res = getPhotoDate({ created_at: "2022-03-09T00:00:00Z" });
      expect(res).toEqual({
        year: 2022,
        month: 3,
        day: 9,
        dateString: "2022-03-09",
      });
    });
  });
  describe("formatDisplayDate", () => {
    it("returns 'Unknown date' if no date provided", () => {
      expect(formatDisplayDate(null, null)).toBe("Unknown date");
    });
    it("formats a valid date into en-US long format", () => {
      const formatted = formatDisplayDate("2024-04-12T00:00:00Z", null);
      expect(formatted).toBe("April 12, 2024");
    });
  });
});
