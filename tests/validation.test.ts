import { describe, expect, it } from "bun:test";
import {
  assertBoundedArray,
  assertBoundedString,
  assertValidUUID,
  isValidUUID,
  parseEntityFormData,
} from "@/lib/utils/validation";

describe("validation", () => {
  describe("isValidUUID", () => {
    it("returns true for valid UUID v4 string", () => {
      expect(isValidUUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(true);
    });
    it("returns true for positive integers", () => {
      expect(isValidUUID(1)).toBe(true);
      expect(isValidUUID(12)).toBe(true);
    });
    it("returns false for non-positive or non-integer numbers", () => {
      expect(isValidUUID(0)).toBe(false);
      expect(isValidUUID(-5)).toBe(false);
      expect(isValidUUID(1.5)).toBe(false);
    });
    it("returns false for invalid UUID strings", () => {
      expect(isValidUUID("not-a-uuid")).toBe(false);
      expect(isValidUUID("")).toBe(false);
      expect(isValidUUID("12345")).toBe(false);
    });
  });
  describe("assertValidUUID", () => {
    it("does not throw for valid UUID", () => {
      expect(() =>
        assertValidUUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
      ).not.toThrow();
    });
    it("does not throw for valid positive integer", () => {
      expect(() => assertValidUUID(5)).not.toThrow();
    });
    it("throws for invalid UUID string", () => {
      expect(() => assertValidUUID("invalid-id", "Custom ID")).toThrow(
        "Invalid Custom ID.",
      );
    });
    it("throws for invalid number", () => {
      expect(() => assertValidUUID(-1, "Calendar ID")).toThrow(
        "Invalid Calendar ID: must be a positive integer.",
      );
    });
  });
  describe("assertBoundedString", () => {
    it("passes when string is within bounds", () => {
      expect(() => assertBoundedString("hello", 10, "Title")).not.toThrow();
    });
    it("throws when string exceeds max length", () => {
      expect(() => assertBoundedString("hello world", 5, "Title")).toThrow(
        "Title exceeds maximum length of 5.",
      );
    });
  });
  describe("assertBoundedArray", () => {
    it("passes when array length is within bounds", () => {
      expect(() => assertBoundedArray([1, 2, 3], 5, "Items")).not.toThrow();
    });
    it("throws when array length exceeds bounds", () => {
      expect(() => assertBoundedArray([1, 2, 3], 2, "Items")).toThrow(
        "Items exceeds maximum of 2 items.",
      );
    });
  });
  describe("parseEntityFormData", () => {
    it("parses and deduplicates valid entity form data", () => {
      const form = new FormData();
      const id1 = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
      const id2 = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
      form.set("title", "  Street Shadows  ");
      form.set("description", "  Monochrome frames ");
      form.set("cover_photo_id", id1);
      form.append("photo_ids", id1);
      form.append("photo_ids", id2);
      form.append("photo_ids", id1);
      const parsed = parseEntityFormData(form, { requireTitle: true });
      expect(parsed).toEqual({
        title: "Street Shadows",
        description: "Monochrome frames",
        cover_photo_id: id1,
        photoIds: [id1, id2],
      });
    });
    it("throws when requireTitle is true and title is blank", () => {
      const form = new FormData();
      form.set("title", "   ");
      expect(() => parseEntityFormData(form, { requireTitle: true })).toThrow(
        "Title is required.",
      );
    });
  });
});
