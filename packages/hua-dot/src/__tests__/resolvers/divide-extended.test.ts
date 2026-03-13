import { describe, it, expect } from "vitest";
import { dot } from "../../index";

describe("divide resolver — extended coverage", () => {
  describe("divide color", () => {
    it("divide-gray-200 → borderColor", () => {
      const result = dot("divide-gray-200");
      expect(result).toHaveProperty("borderColor");
    });

    it("divide-white → borderColor white", () => {
      const result = dot("divide-white");
      expect(result).toHaveProperty("borderColor", "#ffffff");
    });

    it("divide-transparent → borderColor transparent", () => {
      const result = dot("divide-transparent");
      expect(result).toHaveProperty("borderColor", "transparent");
    });

    it("divide-primary-500 → borderColor primary", () => {
      const result = dot("divide-primary-500");
      expect(result).toHaveProperty("borderColor", "#2b6cd6");
    });

    it("divide-red-300 → borderColor red-300", () => {
      const result = dot("divide-red-300");
      expect(result).toHaveProperty("borderColor");
    });
  });

  describe("divide-x and divide-y are unsupported (returns empty)", () => {
    it("divide-x returns empty (child combinator unsupported)", () => {
      expect(dot("divide-x")).toEqual({});
    });

    it("divide-y returns empty (child combinator unsupported)", () => {
      expect(dot("divide-y")).toEqual({});
    });

    it("divide-x-2 returns empty", () => {
      expect(dot("divide-x-2")).toEqual({});
    });

    it("divide-y-4 returns empty", () => {
      expect(dot("divide-y-4")).toEqual({});
    });
  });

  describe("divide with opacity", () => {
    it("divide-gray-200/50 → border color with opacity", () => {
      const result = dot("divide-gray-200/50");
      expect(result).toHaveProperty("borderColor");
      // With opacity modifier
      const borderColor = String(result.borderColor);
      expect(borderColor).toMatch(/rgb\(\d+ \d+ \d+ \/ 0\.5\)/);
    });
  });
});
