import { describe, it, expect } from "vitest";
import {
  startOfLocalDay,
  addLocalDays,
  formatDateInputValue,
  parseDateInputValue,
} from "../date-input";

describe("date-input utils", () => {
  describe("startOfLocalDay", () => {
    it("should return the start of the local day", () => {
      const date = new Date(2025, 0, 15, 14, 30, 0); // Jan 15, 2025 14:30:00
      const start = startOfLocalDay(date);
      expect(start.getFullYear()).toBe(2025);
      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(15);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });
  });

  describe("addLocalDays", () => {
    it("should add days correctly across month boundaries", () => {
      const date = new Date(2025, 0, 30, 0, 0, 0); // Jan 30
      const next = addLocalDays(date, 3); // Should be Feb 2
      expect(next.getMonth()).toBe(1); // Feb is 1
      expect(next.getDate()).toBe(2);
    });
  });

  describe("formatDateInputValue", () => {
    it("should format valid date as YYYY-MM-DD", () => {
      const date = new Date(2025, 5, 5); // June 5, 2025
      expect(formatDateInputValue(date)).toBe("2025-06-05");
    });

    it("should return empty string for null", () => {
      expect(formatDateInputValue(null)).toBe("");
    });

    it("should return empty string for invalid date", () => {
      expect(formatDateInputValue(new Date("invalid"))).toBe("");
    });
  });

  describe("parseDateInputValue", () => {
    it("should parse valid YYYY-MM-DD", () => {
      const date = parseDateInputValue("2025-06-05");
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(5);
      expect(date?.getDate()).toBe(5);
    });

    it("should return null for empty string", () => {
      expect(parseDateInputValue("")).toBeNull();
    });

    it("should return null for invalid format", () => {
      expect(parseDateInputValue("2025/06/05")).toBeNull();
      expect(parseDateInputValue("invalid-date")).toBeNull();
    });
  });
});
