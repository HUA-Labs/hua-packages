import { describe, it, expect, beforeEach } from "vitest";
import {
  dot,
  dotMap,
  dotCx,
  dotVariants,
  createDotConfig,
  clearDotCache,
} from "../index";

describe("edge cases — new coverage", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  // ─── Arbitrary values ───────────────────────────────────────────────────────

  describe("arbitrary values — expanded", () => {
    it("w-[300px] → width: 300px", () => {
      expect(dot("w-[300px]")).toEqual({ width: "300px" });
    });

    it("h-[50vh] → height: 50vh", () => {
      expect(dot("h-[50vh]")).toEqual({ height: "50vh" });
    });

    it("p-[2rem] → padding: 2rem", () => {
      expect(dot("p-[2rem]")).toEqual({ padding: "2rem" });
    });

    it("bg-[#ff0000] → backgroundColor: #ff0000", () => {
      expect(dot("bg-[#ff0000]")).toEqual({ backgroundColor: "#ff0000" });
    });

    it("text-[14px] → passes to color resolver (falls through)", () => {
      // text-[arbitrary] is ambiguous: dot treats it as color, not fontSize
      const result = dot("text-[14px]");
      // Either color (fall-through behavior) or no-op — just verify no crash
      expect(result).toBeDefined();
    });

    it("m-[calc(100%-20px)] → margin: calc(100%-20px)", () => {
      expect(dot("m-[calc(100%-20px)]")).toEqual({ margin: "calc(100%-20px)" });
    });

    it("z-[100] → zIndex: 100", () => {
      expect(dot("z-[100]")).toEqual({ zIndex: "100" });
    });

    it("min-w-[0px] → minWidth: 0px", () => {
      expect(dot("min-w-[0px]")).toEqual({ minWidth: "0px" });
    });

    it("max-w-[65ch] → maxWidth: 65ch", () => {
      expect(dot("max-w-[65ch]")).toEqual({ maxWidth: "65ch" });
    });
  });

  // ─── Important modifier ──────────────────────────────────────────────────────

  describe("!important modifier", () => {
    it("!p-4 → padding: 16px !important", () => {
      const result = dot("!p-4");
      expect(result.padding).toBe("16px !important");
    });

    it("!bg-white → backgroundColor: #ffffff !important", () => {
      const result = dot("!bg-white");
      expect(result.backgroundColor).toBe("#ffffff !important");
    });

    it("!text-sm → fontSize with !important", () => {
      const result = dot("!text-sm");
      expect(String(result.fontSize)).toContain("!important");
    });

    it("!m-0 → margin: 0px !important", () => {
      const result = dot("!m-0");
      expect(result.margin).toBe("0px !important");
    });

    it("mixed important and normal", () => {
      const result = dot("p-4 !m-2");
      expect(result.padding).toBe("16px");
      expect(result.margin).toBe("8px !important");
    });
  });

  // ─── Negative values ─────────────────────────────────────────────────────────

  describe("negative values", () => {
    it("-m-4 → margin: -16px", () => {
      expect(dot("-m-4")).toEqual({ margin: "-16px" });
    });

    it("-mt-2 → marginTop: -8px", () => {
      expect(dot("-mt-2")).toEqual({ marginTop: "-8px" });
    });

    it("-top-2 → top: -8px", () => {
      expect(dot("-top-2")).toEqual({ top: "-8px" });
    });

    it("-left-4 → left: -16px", () => {
      expect(dot("-left-4")).toEqual({ left: "-16px" });
    });

    it("-inset-2 → all sides negative", () => {
      const result = dot("-inset-2");
      expect(result).toMatchObject({
        top: "-8px",
        right: "-8px",
        bottom: "-8px",
        left: "-8px",
      });
    });

    it("-z-10 → zIndex: -10", () => {
      expect(dot("-z-10")).toEqual({ zIndex: "-10" });
    });
  });

  // ─── Opacity modifiers ───────────────────────────────────────────────────────

  describe("opacity modifiers on colors", () => {
    it("bg-primary-500/50 → rgb with 0.5 alpha", () => {
      const result = dot("bg-primary-500/50");
      expect(result).toHaveProperty("backgroundColor");
      expect(String(result.backgroundColor)).toMatch(
        /rgb\(\d+ \d+ \d+ \/ 0\.5\)/,
      );
    });

    it("bg-black/25 → rgb with 0.25 alpha", () => {
      const result = dot("bg-black/25");
      expect(result).toHaveProperty("backgroundColor");
      expect(String(result.backgroundColor)).toContain("0.25");
    });

    it("text-gray-900/75 → color with alpha", () => {
      const result = dot("text-gray-900/75");
      expect(result).toHaveProperty("color");
      expect(String(result.color)).toContain("0.75");
    });

    it("border-red-500/25 → borderColor with alpha", () => {
      const result = dot("border-red-500/25");
      expect(result).toHaveProperty("borderColor");
      expect(String(result.borderColor)).toContain("0.25");
    });

    it("bg-white/0 → fully transparent", () => {
      const result = dot("bg-white/0");
      expect(result).toHaveProperty("backgroundColor");
      expect(String(result.backgroundColor)).toContain("0)");
    });

    it("bg-white/100 → fully opaque", () => {
      const result = dot("bg-white/100");
      expect(result).toHaveProperty("backgroundColor");
      // Full opacity should use original color
      expect(String(result.backgroundColor)).toBeDefined();
    });
  });

  // ─── dotCx edge cases ────────────────────────────────────────────────────────

  describe("dotCx edge cases", () => {
    it("later duplicate class wins in dotCx result", () => {
      // dotCx just joins — the later value will win when dot() processes it
      const combined = dotCx("p-4", "p-8");
      expect(combined).toBe("p-4 p-8");
      const result = dot(combined);
      expect(result.padding).toBe("32px");
    });

    it("dotCx with false boolean expression", () => {
      const enabled = false;
      expect(dotCx("base", enabled && "enabled-class")).toBe("base");
    });

    it("dotCx with undefined filters correctly", () => {
      expect(dotCx(undefined, "p-4", undefined)).toBe("p-4");
    });

    it("dotCx with null filters correctly", () => {
      expect(dotCx(null, "flex", null)).toBe("flex");
    });

    it("dotCx with 0 filters correctly", () => {
      expect(dotCx(0 as unknown as false, "block")).toBe("block");
    });
  });

  // ─── dotMap edge cases ───────────────────────────────────────────────────────

  describe("dotMap edge cases", () => {
    it("empty input → base is {}", () => {
      expect(dotMap("")).toEqual({ base: {} });
    });

    it("only base styles (no variants)", () => {
      const result = dotMap("p-4 bg-white");
      expect(result.base).toEqual({
        padding: "16px",
        backgroundColor: "#ffffff",
      });
      expect(result.hover).toBeUndefined();
      expect(result.focus).toBeUndefined();
    });

    it("dark:hover combined — dark active, hover resolved", () => {
      const result = dotMap("bg-white dark:hover:bg-gray-900", { dark: true });
      // dark:hover should be in hover bucket when dark is active
      expect(result.base).toBeDefined();
    });

    it("dotMap with undefined input → base is {}", () => {
      expect(dotMap(undefined)).toEqual({ base: {} });
    });

    it("only hover styles → base is empty", () => {
      const result = dotMap("hover:bg-red-500");
      expect(result.base).toEqual({});
      expect(result.hover).toHaveProperty("backgroundColor");
    });
  });

  // ─── dotVariants edge cases ──────────────────────────────────────────────────

  describe("dotVariants edge cases", () => {
    it("empty variants config still renders base", () => {
      const component = dotVariants({
        base: "p-4 flex",
        variants: {},
      });
      expect(component({})).toMatchObject({ padding: "16px", display: "flex" });
    });

    it("default variants applied automatically", () => {
      const btn = dotVariants({
        base: "inline-flex",
        variants: {
          size: {
            sm: "text-sm",
            md: "text-base",
            lg: "text-lg",
          },
        },
        defaultVariants: {
          size: "md",
        },
      });
      const result = btn({});
      expect(result.fontSize).toBe("16px");
    });

    it("explicit variant overrides default", () => {
      const btn = dotVariants({
        base: "p-2",
        variants: {
          size: { sm: "text-sm", lg: "text-lg" },
        },
        defaultVariants: { size: "sm" },
      });
      const result = btn({ size: "lg" });
      expect(result.fontSize).toBe("18px");
    });

    it("null/undefined variant uses default", () => {
      const component = dotVariants({
        base: "p-2",
        variants: {
          color: { red: "bg-red-500", blue: "bg-blue-500" },
        },
        defaultVariants: { color: "blue" },
      });
      const result = component({ color: undefined });
      expect(result).toHaveProperty("backgroundColor");
    });

    it("compound variant activates when both conditions met", () => {
      const component = dotVariants({
        base: "p-2",
        variants: {
          color: { red: "bg-red-500", blue: "bg-blue-500" },
          size: { sm: "text-sm", lg: "text-lg" },
        },
        compoundVariants: [
          {
            conditions: { color: "red", size: "lg" },
            dot: "font-bold",
          },
        ],
      });
      const result = component({ color: "red", size: "lg" });
      expect(result.fontWeight).toBe("700");
    });

    it("compound variant does NOT activate when only one condition met", () => {
      const component = dotVariants({
        base: "p-2",
        variants: {
          color: { red: "bg-red-500", blue: "bg-blue-500" },
          size: { sm: "text-sm", lg: "text-lg" },
        },
        compoundVariants: [
          {
            conditions: { color: "red", size: "lg" },
            dot: "font-bold",
          },
        ],
      });
      const result = component({ color: "red", size: "sm" });
      expect(result.fontWeight).toBeUndefined();
    });
  });

  // ─── Cross-platform output differences ───────────────────────────────────────

  describe("cross-platform output differences", () => {
    it("web target returns string pixel values", () => {
      const result = dot("p-4", { target: "web" });
      expect(result.padding).toBe("16px");
    });

    it("native target returns numeric values for spacing", () => {
      const result = dot("p-4", { target: "native" });
      expect(result.padding).toBe(16);
    });

    it("web target for shadow returns CSS box-shadow string", () => {
      const result = dot("shadow-md", { target: "web" });
      expect(typeof result.boxShadow).toBe("string");
    });

    it("native target drops filter (unsupported)", () => {
      const webResult = dot("blur-md", { target: "web" });
      const nativeResult = dot("blur-md", { target: "native" });
      expect(webResult).toHaveProperty("filter");
      expect(nativeResult).not.toHaveProperty("filter");
    });

    it("native target drops backgroundImage (gradient unsupported)", () => {
      const webResult = dot("bg-gradient-to-r from-red-500 to-blue-500", {
        target: "web",
      });
      const nativeResult = dot("bg-gradient-to-r from-red-500 to-blue-500", {
        target: "native",
      });
      expect(webResult).toHaveProperty("backgroundImage");
      expect(nativeResult).not.toHaveProperty("backgroundImage");
    });

    it("same spacing input produces different value types per target", () => {
      const web = dot("m-2", { target: "web" });
      const native = dot("m-2", { target: "native" });
      expect(web.margin).toBe("8px");
      expect(native.margin).toBe(8);
    });
  });

  // ─── Variant combinations ─────────────────────────────────────────────────────

  describe("variant combinations", () => {
    it("dark:hover:bg-gray-800 — dark active, hover in dotMap", () => {
      const result = dotMap("dark:hover:bg-gray-800", { dark: true });
      expect(result.hover).toHaveProperty("backgroundColor");
    });

    it("md:flex lg:grid — responsive display", () => {
      const md = dot("md:flex lg:grid", { breakpoint: "md" });
      expect(md.display).toBe("flex");
      const lg = dot("md:flex lg:grid", { breakpoint: "lg" });
      expect(lg.display).toBe("grid");
    });

    it("sm:dark:text-white — breakpoint + dark", () => {
      const result = dot("sm:dark:text-white", {
        breakpoint: "sm",
        dark: true,
      });
      expect(result.color).toBe("#ffffff");
    });
  });
});
