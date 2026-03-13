import { describe, it, expect } from "vitest";
import { dotCx } from "../index";

describe("dotCx() — extended coverage", () => {
  describe("all falsy types", () => {
    it("filters boolean false", () => {
      expect(dotCx("a", false as const)).toBe("a");
    });

    it("filters null", () => {
      expect(dotCx("a", null)).toBe("a");
    });

    it("filters undefined", () => {
      expect(dotCx("a", undefined)).toBe("a");
    });

    it("filters empty string", () => {
      expect(dotCx("a", "")).toBe("a");
    });

    it("filters 0", () => {
      expect(dotCx("a", 0)).toBe("a");
    });

    it("all falsy returns empty string", () => {
      expect(dotCx(false, null, undefined, "", 0)).toBe("");
    });
  });

  describe("whitespace handling", () => {
    it("preserves internal spaces in each argument", () => {
      // dotCx passes strings as-is; internal space is preserved
      expect(dotCx("p-4 flex", "bg-white")).toBe("p-4 flex bg-white");
    });

    it("single space between arguments", () => {
      expect(dotCx("a", "b", "c")).toBe("a b c");
    });
  });

  describe("conditional patterns", () => {
    it("ternary expression works", () => {
      const isActive = true;
      expect(dotCx("base", isActive ? "active" : "inactive")).toBe(
        "base active",
      );
    });

    it("falsy ternary expression", () => {
      const isActive = false;
      expect(dotCx("base", isActive ? "active" : false)).toBe("base");
    });

    it("complex variant selection", () => {
      const variant = "primary";
      expect(
        dotCx(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          variant === "ghost" && "btn-ghost",
        ),
      ).toBe("btn btn-primary");
    });

    it("multiple conditional classes combined", () => {
      const size = "lg";
      const disabled = false;
      const loading = true;
      expect(
        dotCx(
          "base-class",
          size === "sm" && "text-sm",
          size === "lg" && "text-lg",
          disabled && "opacity-50 cursor-not-allowed",
          loading && "cursor-wait",
        ),
      ).toBe("base-class text-lg cursor-wait");
    });
  });

  describe("with dot() output (integration)", () => {
    it("can be used to combine class strings before passing to dot()", () => {
      // Typical use: cx merges strings, dot() processes the merged string
      const base = "p-4 flex";
      const extra = "bg-white rounded-lg";
      const combined = dotCx(base, extra);
      expect(combined).toBe("p-4 flex bg-white rounded-lg");
    });
  });

  describe("no-op cases", () => {
    it("single truthy argument", () => {
      expect(dotCx("p-4")).toBe("p-4");
    });

    it("no arguments", () => {
      expect(dotCx()).toBe("");
    });

    it("large number of arguments", () => {
      const result = dotCx("a", "b", "c", "d", "e", "f", "g", "h", "i", "j");
      expect(result).toBe("a b c d e f g h i j");
    });

    it("large number of mixed arguments", () => {
      const result = dotCx(
        "a",
        false,
        "b",
        null,
        "c",
        undefined,
        "d",
        "",
        "e",
        0,
        "f",
      );
      expect(result).toBe("a b c d e f");
    });
  });

  describe("with dynamic class names", () => {
    it("handles template literal class names", () => {
      const shade = 500;
      const result = dotCx("flex", `bg-primary-${shade}`);
      expect(result).toBe(`flex bg-primary-${shade}`);
    });

    it("handles array-like spread (manual)", () => {
      const classes = ["p-4", "flex", "bg-white"];
      const result = dotCx(
        ...(classes as (string | false | null | undefined | 0 | "")[]),
      );
      expect(result).toBe("p-4 flex bg-white");
    });
  });
});
