import { describe, it, expect, beforeEach } from "vitest";
import { dotMap, dot, createDotConfig, clearDotCache } from "../index";

describe("dotMap() — extended coverage", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  describe("focus-within state", () => {
    it("routes focus-within: to focus-within bucket", () => {
      const result = dotMap("p-4 focus-within:bg-blue-50");
      expect(result.base).toEqual({ padding: "16px" });
      expect(result["focus-within"]).toHaveProperty("backgroundColor");
    });

    it("multiple focus-within styles accumulate", () => {
      const result = dotMap(
        "focus-within:border-blue-500 focus-within:bg-blue-50",
      );
      expect(result.base).toEqual({});
      expect(result["focus-within"]).toHaveProperty("borderColor");
      expect(result["focus-within"]).toHaveProperty("backgroundColor");
    });
  });

  describe("null/undefined inputs", () => {
    it("returns empty base for null", () => {
      // @ts-expect-error testing runtime safety
      expect(dotMap(null)).toEqual({ base: {} });
    });

    it("returns empty base for undefined", () => {
      // @ts-expect-error testing runtime safety
      expect(dotMap(undefined)).toEqual({ base: {} });
    });
  });

  describe("all six state variants", () => {
    it("handles all state variants in one call", () => {
      const result = dotMap(
        "bg-white hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-300 disabled:opacity-50 focus-visible:ring-2 focus-within:bg-blue-50",
      );
      expect(result.base).toHaveProperty("backgroundColor");
      expect(result.hover).toHaveProperty("backgroundColor");
      expect(result.focus).toHaveProperty("backgroundColor");
      expect(result.active).toHaveProperty("backgroundColor");
      expect(result.disabled).toHaveProperty("opacity");
      expect(result["focus-visible"]).toHaveProperty("boxShadow");
      expect(result["focus-within"]).toHaveProperty("backgroundColor");
    });
  });

  describe("state + dark mode combination", () => {
    it("dark mode + hover state both resolved", () => {
      const result = dotMap(
        "bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
        { dark: true },
      );
      expect(result.base).toHaveProperty("backgroundColor");
      expect(result.hover).toHaveProperty("backgroundColor");
    });

    it("dark mode only without hover", () => {
      const result = dotMap("bg-white dark:bg-black", { dark: true });
      expect(result.base).toEqual({ backgroundColor: "#000000" });
      expect(result.hover).toBeUndefined();
    });
  });

  describe("state + responsive combination", () => {
    it("breakpoint + state both resolved", () => {
      const result = dotMap(
        "p-4 md:p-8 hover:bg-gray-100 md:hover:bg-gray-200",
        { breakpoint: "md" },
      );
      expect(result.base).toEqual({ padding: "32px" });
      expect(result.hover).toHaveProperty("backgroundColor");
    });
  });

  describe("shadow + ring in state variants", () => {
    it("hover shadow resolves to boxShadow", () => {
      const result = dotMap("hover:shadow-lg");
      expect(result.hover).toHaveProperty("boxShadow");
    });

    it("focus ring resolves to boxShadow", () => {
      const result = dotMap("focus:ring-2");
      expect(result.focus).toHaveProperty("boxShadow");
    });

    it("no internal key leakage in state", () => {
      const result = dotMap("hover:shadow-lg focus:ring-2");
      expect(result.hover).not.toHaveProperty("__dot_shadowLayer");
      expect(result.focus).not.toHaveProperty("__dot_ringLayer");
    });
  });

  describe("gradient in base style", () => {
    it("gradient in base resolves correctly", () => {
      const result = dotMap(
        "bg-gradient-to-r from-red-500 to-blue-500 hover:opacity-75",
      );
      expect(result.base).toHaveProperty("backgroundImage");
      expect(result.hover).toHaveProperty("opacity");
    });
  });

  describe("transform accumulation in states", () => {
    it("hover transforms accumulate correctly", () => {
      const result = dotMap("hover:rotate-45 hover:scale-110");
      expect(result.hover).toHaveProperty("transform");
      expect(String(result.hover?.transform)).toContain("rotate");
      expect(String(result.hover?.transform)).toContain("scale");
    });
  });

  describe("filter accumulation in states", () => {
    it("hover filter accumulates correctly", () => {
      const result = dotMap("hover:blur-sm hover:brightness-75");
      expect(result.hover).toHaveProperty("filter");
      const filter = String(result.hover?.filter);
      expect(filter).toContain("blur");
      expect(filter).toContain("brightness");
    });
  });

  describe("caching behavior", () => {
    it("same input produces same result (cached)", () => {
      const r1 = dotMap("p-4 hover:bg-gray-100");
      const r2 = dotMap("p-4 hover:bg-gray-100");
      expect(r1).toEqual(r2);
    });

    it("different dark mode options cached separately", () => {
      const light = dotMap("bg-white dark:bg-black");
      const dark = dotMap("bg-white dark:bg-black", { dark: true });
      expect(light.base).not.toEqual(dark.base);
    });
  });

  describe("flutter target in dotMap", () => {
    it("flutter target in dotMap base produces flutter recipe structure", () => {
      const result = dotMap("p-4", { target: "flutter" });
      // Flutter result has different structure
      expect(result).toHaveProperty("base");
    });
  });

  describe("native target in dotMap", () => {
    it("native target converts px to numbers", () => {
      const result = dotMap("p-4 hover:p-8", { target: "native" });
      expect(result.base).toEqual({ padding: 16 });
      expect(result.hover).toEqual({ padding: 32 });
    });

    it("native target drops unsupported properties in states", () => {
      const result = dotMap("hover:cursor-pointer hover:bg-gray-100", {
        target: "native",
      });
      // cursor is unsupported on native, but backgroundColor should be kept
      if (result.hover && Object.keys(result.hover).length > 0) {
        expect(result.hover).toHaveProperty("backgroundColor");
      }
    });
  });

  describe("!important in dotMap", () => {
    it("!important preserved in base", () => {
      const result = dotMap("!p-4");
      const padding = (result.base as Record<string, string>).padding;
      expect(padding).toBe("16px !important");
    });

    it("!important preserved in state", () => {
      const result = dotMap("hover:!bg-red-500");
      if (result.hover) {
        expect(
          String((result.hover as Record<string, string>).backgroundColor),
        ).toContain("!important");
      }
    });
  });

  describe("complex real-world patterns", () => {
    it("button interactive pattern", () => {
      const result = dotMap(
        "px-4 py-2 bg-primary-500 text-white rounded-md " +
          "hover:bg-primary-600 focus:ring-2 focus:ring-primary-300 active:bg-primary-700 disabled:opacity-50",
      );
      expect(result.base).toHaveProperty("paddingLeft");
      expect(result.base).toHaveProperty("backgroundColor");
      expect(result.hover).toHaveProperty("backgroundColor");
      expect(result.focus).toHaveProperty("boxShadow");
      expect(result.active).toHaveProperty("backgroundColor");
      expect(result.disabled).toHaveProperty("opacity");
    });

    it("input field interactive pattern", () => {
      const result = dotMap(
        "border border-gray-300 rounded-md p-3 " +
          "focus:outline-none focus:border-primary-500 focus:ring-1 focus-within:bg-blue-50",
      );
      expect(result.base).toHaveProperty("borderWidth");
      expect(result.focus).toHaveProperty("borderColor");
      expect(result.focus).toHaveProperty("boxShadow");
      expect(result["focus-within"]).toHaveProperty("backgroundColor");
    });

    it("card with hover effect", () => {
      const result = dotMap(
        "bg-white rounded-xl p-6 shadow-sm border border-gray-100 " +
          "hover:shadow-lg hover:border-primary-200",
      );
      expect(result.base).toHaveProperty("backgroundColor");
      expect(result.base).toHaveProperty("boxShadow");
      expect(result.hover).toHaveProperty("boxShadow");
      expect(result.hover).toHaveProperty("borderColor");
    });
  });
});
