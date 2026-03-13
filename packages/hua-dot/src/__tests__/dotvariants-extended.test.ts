import { describe, it, expect, beforeEach } from "vitest";
import { dotVariants, createDotConfig, clearDotCache } from "../index";

describe("dotVariants() — extended coverage", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  describe("edge cases with empty strings in variant values", () => {
    it("handles empty string in variants dot string", () => {
      const fn = dotVariants({
        base: "p-4",
        variants: {
          variant: {
            default: "bg-white",
            none: "",
          },
        },
        defaultVariants: { variant: "none" },
      });
      const result = fn();
      expect(result).toHaveProperty("padding", "16px");
      // 'none' maps to empty string → no extra styles
      expect(result).not.toHaveProperty("backgroundColor");
    });
  });

  describe("many variant axes", () => {
    it("handles 4 variant axes simultaneously", () => {
      const fn = dotVariants({
        base: "inline-flex",
        variants: {
          size: {
            sm: "text-sm px-2 py-1",
            md: "text-base px-4 py-2",
            lg: "text-lg px-6 py-3",
          },
          variant: {
            primary: "bg-primary-500 text-white",
            secondary: "bg-gray-200 text-gray-900",
          },
          rounded: {
            none: "rounded-none",
            md: "rounded-md",
            full: "rounded-full",
          },
          disabled: {
            true: "opacity-50",
            false: "opacity-100",
          },
        },
        defaultVariants: {
          size: "md",
          variant: "primary",
          rounded: "md",
          disabled: false,
        },
      });

      const result = fn({ size: "sm", rounded: "full", disabled: true });
      expect(result).toHaveProperty("display", "inline-flex");
      expect(result).toHaveProperty("fontSize", "14px");
      expect(result).toHaveProperty("borderRadius", "9999px");
      expect(result).toHaveProperty("opacity", "0.5");
      expect(result).toHaveProperty("backgroundColor", "#2b6cd6"); // default variant
    });
  });

  describe("compound variants — multiple conditions", () => {
    it("applies compound when all three conditions match", () => {
      const fn = dotVariants({
        base: "p-4",
        variants: {
          a: { x: "flex", y: "grid" },
          b: { one: "gap-2", two: "gap-4" },
          c: { alpha: "rounded-sm", beta: "rounded-lg" },
        },
        defaultVariants: { a: "x", b: "one", c: "alpha" },
        compoundVariants: [
          {
            conditions: { a: "y", b: "two", c: "beta" },
            dot: "shadow-xl opacity-75",
          },
        ],
      });

      const noMatch = fn({ a: "x", b: "two", c: "beta" });
      expect(noMatch).not.toHaveProperty("opacity");

      const match = fn({ a: "y", b: "two", c: "beta" });
      expect(match).toHaveProperty("opacity", "0.75");
      expect(match).toHaveProperty("boxShadow");
    });

    it("multiple compound variants can match simultaneously", () => {
      const fn = dotVariants({
        base: "p-4",
        variants: {
          size: { sm: "text-sm", lg: "text-lg" },
          variant: { primary: "bg-primary-500", danger: "bg-red-500" },
        },
        defaultVariants: { size: "sm", variant: "primary" },
        compoundVariants: [
          { conditions: { size: "lg" }, dot: "px-6 py-3" },
          { conditions: { variant: "danger" }, dot: "font-bold" },
          {
            conditions: { size: "lg", variant: "danger" },
            dot: "shadow-red-500/50",
          },
        ],
      });

      const result = fn({ size: "lg", variant: "danger" });
      expect(result).toHaveProperty("paddingLeft", "24px");
      expect(result).toHaveProperty("fontWeight", "700");
      // Third compound also matches
    });
  });

  describe("variant caching consistency", () => {
    it("repeated calls with same props return equivalent results", () => {
      const fn = dotVariants({
        base: "p-4 flex",
        variants: {
          v: { a: "bg-red-500", b: "bg-blue-500" },
        },
        defaultVariants: { v: "a" },
      });

      const r1 = fn({ v: "a" });
      const r2 = fn({ v: "a" });
      const r3 = fn({ v: "b" });
      const r4 = fn({ v: "b" });

      expect(r1).toEqual(r2);
      expect(r3).toEqual(r4);
      expect(r1).not.toEqual(r3);
    });
  });

  describe("base with complex utilities", () => {
    it("base with shadow and border radius", () => {
      const fn = dotVariants({
        base: "rounded-lg shadow-md p-6",
        variants: {
          variant: {
            default: "bg-white",
            dark: "bg-gray-800",
          },
        },
        defaultVariants: { variant: "default" },
      });

      const result = fn();
      expect(result).toHaveProperty("borderRadius", "8px");
      expect(result).toHaveProperty("boxShadow");
      expect(result).toHaveProperty("padding", "24px");
      expect(result).toHaveProperty("backgroundColor", "#ffffff");
    });

    it("base with transform", () => {
      const fn = dotVariants({
        base: "rotate-45 scale-110",
        variants: {
          v: { on: "opacity-100", off: "opacity-0" },
        },
      });

      const result = fn({ v: "on" });
      expect(result).toHaveProperty("transform");
      expect(result).toHaveProperty("opacity", "1");
    });
  });

  describe("without variants key", () => {
    it("returns base styles only when variants is undefined", () => {
      const fn = dotVariants({ base: "p-8 flex items-center" });
      const result = fn();
      expect(result).toMatchObject({
        padding: "32px",
        display: "flex",
        alignItems: "center",
      });
    });

    it("returns empty object when no base and no variants", () => {
      const fn = dotVariants({});
      expect(fn()).toEqual({});
    });
  });

  describe("defaultVariants partial coverage", () => {
    it("only some axes have defaults — missing ones skipped", () => {
      const fn = dotVariants({
        base: "p-4",
        variants: {
          color: { red: "bg-red-500", blue: "bg-blue-500" },
          size: { sm: "text-sm", lg: "text-lg" },
        },
        defaultVariants: { color: "red" }, // size has no default
      });

      const result = fn();
      expect(result).toHaveProperty("backgroundColor", "#ca2c22"); // red
      expect(result).not.toHaveProperty("fontSize"); // no size default
    });

    it("explicit prop overrides missing default", () => {
      const fn = dotVariants({
        base: "p-4",
        variants: {
          color: { red: "bg-red-500", blue: "bg-blue-500" },
          size: { sm: "text-sm", lg: "text-lg" },
        },
        defaultVariants: { color: "red" },
      });

      const result = fn({ size: "lg" });
      expect(result).toHaveProperty("backgroundColor", "#ca2c22");
      expect(result).toHaveProperty("fontSize", "18px");
    });
  });

  describe("real-world component variants", () => {
    it("alert component variants", () => {
      const alert = dotVariants({
        base: "flex items-start rounded-lg p-4 border",
        variants: {
          type: {
            info: "bg-blue-50 border-blue-200 text-blue-800",
            success: "bg-green-50 border-green-200 text-green-800",
            warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
            error: "bg-red-50 border-red-200 text-red-800",
          },
        },
        defaultVariants: { type: "info" },
      });

      const info = alert();
      expect(info).toHaveProperty("display", "flex");
      expect(info).toHaveProperty("borderRadius", "8px");
      expect(info).toHaveProperty("padding", "16px");
      expect(info).toHaveProperty("borderWidth", "1px");

      const error = alert({ type: "error" });
      expect(error).toHaveProperty("color");
    });

    it("avatar size variants", () => {
      const avatar = dotVariants({
        base: "rounded-full overflow-hidden flex-shrink-0",
        variants: {
          size: {
            xs: "w-6 h-6",
            sm: "w-8 h-8",
            md: "w-10 h-10",
            lg: "w-12 h-12",
            xl: "w-16 h-16",
          },
        },
        defaultVariants: { size: "md" },
      });

      expect(avatar()).toMatchObject({
        width: "40px",
        height: "40px",
        borderRadius: "9999px",
      });
      expect(avatar({ size: "xl" })).toMatchObject({
        width: "64px",
        height: "64px",
      });
      expect(avatar({ size: "xs" })).toMatchObject({
        width: "24px",
        height: "24px",
      });
    });

    it("input component with error state compound", () => {
      const input = dotVariants({
        base: "block w-full rounded-md border px-3 py-2 text-sm",
        variants: {
          error: {
            true: "border-red-500 bg-red-50",
            false: "border-gray-300 bg-white",
          },
          size: {
            sm: "px-2 py-1 text-xs",
            md: "px-3 py-2 text-sm",
            lg: "px-4 py-3 text-base",
          },
        },
        defaultVariants: { error: false, size: "md" },
        compoundVariants: [
          {
            conditions: { error: true, size: "lg" },
            dot: "text-red-900 font-medium",
          },
        ],
      });

      const normal = input();
      expect(normal).toHaveProperty("borderColor", "#a3a7ae");
      expect(normal).toHaveProperty("backgroundColor", "#ffffff");

      const errorState = input({ error: true });
      expect(errorState).toHaveProperty("backgroundColor");

      const errorLg = input({ error: true, size: "lg" });
      expect(errorLg).toHaveProperty("fontWeight", "500");
    });
  });
});
