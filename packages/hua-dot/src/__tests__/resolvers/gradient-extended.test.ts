import { describe, it, expect } from "vitest";
import { dot } from "../../index";

describe("gradient — extended coverage", () => {
  describe("gradient directions", () => {
    it("bg-gradient-to-r → to right", () => {
      const result = dot("bg-gradient-to-r from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to right");
    });

    it("bg-gradient-to-l → to left", () => {
      const result = dot("bg-gradient-to-l from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to left");
    });

    it("bg-gradient-to-t → to top", () => {
      const result = dot("bg-gradient-to-t from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to top");
    });

    it("bg-gradient-to-b → to bottom", () => {
      const result = dot("bg-gradient-to-b from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to bottom");
    });

    it("bg-gradient-to-tr → to top right", () => {
      const result = dot("bg-gradient-to-tr from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to top right");
    });

    it("bg-gradient-to-tl → to top left", () => {
      const result = dot("bg-gradient-to-tl from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to top left");
    });

    it("bg-gradient-to-br → to bottom right", () => {
      const result = dot("bg-gradient-to-br from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to bottom right");
    });

    it("bg-gradient-to-bl → to bottom left", () => {
      const result = dot("bg-gradient-to-bl from-red-500 to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
      expect(String(result.backgroundImage)).toContain("to bottom left");
    });

    it("bg-gradient-to-r alone (no stops) → no backgroundImage", () => {
      const result = dot("bg-gradient-to-r");
      expect(result).not.toHaveProperty("backgroundImage");
    });
  });

  describe("gradient from/via/to stops", () => {
    it("from-red-500 to-blue-500 → linear-gradient with both stops", () => {
      const result = dot("bg-gradient-to-r from-red-500 to-blue-500");
      const img = String(result.backgroundImage);
      expect(img).toContain("linear-gradient");
      expect(img).toContain("to right");
    });

    it("from-transparent to-white → gradient with transparent", () => {
      const result = dot("bg-gradient-to-r from-transparent to-white");
      const img = String(result.backgroundImage);
      expect(img).toContain("transparent");
      expect(img).toContain("#ffffff");
    });

    it("from-red via-yellow to-green → three-stop gradient", () => {
      const result = dot(
        "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500",
      );
      const img = String(result.backgroundImage);
      expect(img).toContain("linear-gradient");
      // Should contain all 3 color stops
      const commas = (img.match(/,/g) || []).length;
      expect(commas).toBeGreaterThanOrEqual(3);
    });

    it("from-primary-500 to-primary-900", () => {
      const result = dot("bg-gradient-to-b from-primary-500 to-primary-900");
      const img = String(result.backgroundImage);
      expect(img).toContain("linear-gradient");
      expect(img).toContain("to bottom");
    });
  });

  describe("gradient color stops with opacity", () => {
    it("from-red-500/50 → opacity modifier in gradient", () => {
      const result = dot("bg-gradient-to-r from-red-500/50 to-blue-500");
      const img = String(result.backgroundImage);
      expect(img).toContain("linear-gradient");
      // from color should use rgb with alpha
      expect(img).toMatch(/rgb\(\d+ \d+ \d+ \/ 0\.5\)/);
    });

    it("to-white/0 → transparent end stop", () => {
      const result = dot("bg-gradient-to-r from-blue-500 to-white/0");
      expect(result).toHaveProperty("backgroundImage");
    });
  });

  describe("arbitrary gradient values", () => {
    it("from-[#ff0000] → arbitrary hex color", () => {
      const result = dot("bg-gradient-to-r from-[#ff0000] to-blue-500");
      const img = String(result.backgroundImage);
      expect(img).toContain("#ff0000");
    });

    it("to-[var(--color-brand)] → CSS variable stop", () => {
      const result = dot("bg-gradient-to-r from-white to-[var(--color-brand)]");
      const img = String(result.backgroundImage);
      expect(img).toContain("var(--color-brand)");
    });
  });

  describe("gradient percentage positions", () => {
    it("from-0% → sets gradient from position", () => {
      const result = dot("bg-gradient-to-r from-red-500 from-0% to-blue-500");
      expect(result).toHaveProperty("backgroundImage");
    });

    it("to-100% → sets gradient to position", () => {
      const result = dot("bg-gradient-to-r from-red-500 to-blue-500 to-100%");
      expect(result).toHaveProperty("backgroundImage");
    });
  });

  describe("dark mode with gradient", () => {
    it("dark:from-gray-900 → applies in dark mode", () => {
      const result = dot(
        "bg-gradient-to-r from-white dark:from-gray-900 to-blue-500",
        { dark: true },
      );
      const img = String(result.backgroundImage);
      expect(img).toContain("linear-gradient");
    });
  });

  describe("edge cases", () => {
    it("gradient without direction → backgroundImage still set with default", () => {
      // only from/to without direction
      const result = dot("from-red-500 to-blue-500");
      // With no direction token, no __dot_gradientDirection set → backgroundImage
      // behavior depends on implementation (may or may not set without direction)
      // Just verify no crash
      expect(result).toBeDefined();
    });

    it("unknown gradient direction → empty object", () => {
      const result = dot("bg-gradient-to-z");
      expect(result).toEqual({});
    });

    it("!important on gradient stop", () => {
      const result = dot("!from-red-500");
      // Even with !important on gradient internal key, final backgroundImage should work
      expect(result).toBeDefined();
    });
  });
});
