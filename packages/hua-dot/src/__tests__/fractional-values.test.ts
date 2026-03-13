import { describe, it, expect, beforeEach } from "vitest";
import { dot, createDotConfig, clearDotCache } from "../index";

describe("fractional values — sizing and positioning", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  describe("width fractions", () => {
    it("w-1/2 → 50%", () => {
      expect(dot("w-1/2")).toEqual({ width: "50%" });
    });

    it("w-1/3 → 33.333333%", () => {
      expect(dot("w-1/3")).toEqual({ width: "33.333333%" });
    });

    it("w-2/3 → 66.666667%", () => {
      expect(dot("w-2/3")).toEqual({ width: "66.666667%" });
    });

    it("w-1/4 → 25%", () => {
      expect(dot("w-1/4")).toEqual({ width: "25%" });
    });

    it("w-3/4 → 75%", () => {
      expect(dot("w-3/4")).toEqual({ width: "75%" });
    });

    it("w-1/5 → 20%", () => {
      expect(dot("w-1/5")).toEqual({ width: "20%" });
    });

    it("w-2/5 → 40%", () => {
      expect(dot("w-2/5")).toEqual({ width: "40%" });
    });

    it("w-3/5 → 60%", () => {
      expect(dot("w-3/5")).toEqual({ width: "60%" });
    });

    it("w-4/5 → 80%", () => {
      expect(dot("w-4/5")).toEqual({ width: "80%" });
    });

    it("w-1/6 → 16.666667%", () => {
      expect(dot("w-1/6")).toEqual({ width: "16.666667%" });
    });

    it("w-5/6 → 83.333333%", () => {
      expect(dot("w-5/6")).toEqual({ width: "83.333333%" });
    });

    it("w-full → 100%", () => {
      expect(dot("w-full")).toEqual({ width: "100%" });
    });
  });

  describe("height fractions", () => {
    it("h-1/2 → 50%", () => {
      expect(dot("h-1/2")).toEqual({ height: "50%" });
    });

    it("h-1/3 → 33.333333%", () => {
      expect(dot("h-1/3")).toEqual({ height: "33.333333%" });
    });

    it("h-2/3 → 66.666667%", () => {
      expect(dot("h-2/3")).toEqual({ height: "66.666667%" });
    });

    it("h-1/4 → 25%", () => {
      expect(dot("h-1/4")).toEqual({ height: "25%" });
    });

    it("h-3/4 → 75%", () => {
      expect(dot("h-3/4")).toEqual({ height: "75%" });
    });

    it("h-full → 100%", () => {
      expect(dot("h-full")).toEqual({ height: "100%" });
    });
  });

  describe("position fractions", () => {
    it("top-1/2 → 50%", () => {
      expect(dot("top-1/2")).toEqual({ top: "50%" });
    });

    it("left-1/3 → 33.333333%", () => {
      expect(dot("left-1/3")).toEqual({ left: "33.333333%" });
    });

    it("right-2/3 → 66.666667%", () => {
      expect(dot("right-2/3")).toEqual({ right: "66.666667%" });
    });

    it("bottom-1/4 → 25%", () => {
      expect(dot("bottom-1/4")).toEqual({ bottom: "25%" });
    });

    it("top-full → 100%", () => {
      expect(dot("top-full")).toEqual({ top: "100%" });
    });

    it("left-full → 100%", () => {
      expect(dot("left-full")).toEqual({ left: "100%" });
    });
  });

  describe("negative fractions", () => {
    it("-top-1/2 → -50%", () => {
      expect(dot("-top-1/2")).toEqual({ top: "-50%" });
    });

    it("-left-1/3 → negated fraction", () => {
      expect(dot("-left-1/3")).toEqual({ left: "-33.333333%" });
    });

    it("-translate-x-1/2 → translateX(-50%)", () => {
      expect(dot("-translate-x-1/2")).toEqual({
        transform: "translateX(-50%)",
      });
    });

    it("-translate-y-1/2 → translateY(-50%)", () => {
      expect(dot("-translate-y-1/2")).toEqual({
        transform: "translateY(-50%)",
      });
    });

    it("-left-full → -100%", () => {
      expect(dot("-left-full")).toEqual({ left: "-100%" });
    });
  });

  describe("flex basis fractions", () => {
    it("basis-1/2 → 50%", () => {
      expect(dot("basis-1/2")).toEqual({ flexBasis: "50%" });
    });

    it("basis-1/3 → 33.333333%", () => {
      expect(dot("basis-1/3")).toEqual({ flexBasis: "33.333333%" });
    });

    it("basis-2/3 → 66.666667%", () => {
      expect(dot("basis-2/3")).toEqual({ flexBasis: "66.666667%" });
    });

    it("basis-1/4 → 25%", () => {
      expect(dot("basis-1/4")).toEqual({ flexBasis: "25%" });
    });

    it("basis-full → 100%", () => {
      expect(dot("basis-full")).toEqual({ flexBasis: "100%" });
    });

    it("basis-auto → auto", () => {
      expect(dot("basis-auto")).toEqual({ flexBasis: "auto" });
    });
  });

  describe("inset fractions", () => {
    it("inset-x-1/2 → left: 50%, right: 50%", () => {
      expect(dot("inset-x-1/2")).toEqual({ left: "50%", right: "50%" });
    });

    it("inset-y-1/4 → top: 25%, bottom: 25%", () => {
      expect(dot("inset-y-1/4")).toEqual({ top: "25%", bottom: "25%" });
    });
  });

  describe("fractional combinations", () => {
    it("absolute centering with fractional translate", () => {
      const result = dot(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      );
      expect(result).toMatchObject({
        position: "absolute",
        top: "50%",
        left: "50%",
      });
      const transform = String(result.transform);
      expect(transform).toContain("translateX(-50%)");
      expect(transform).toContain("translateY(-50%)");
    });

    it("two-column responsive layout", () => {
      const result = dot("w-1/2 px-2");
      expect(result).toMatchObject({
        width: "50%",
        paddingLeft: "8px",
        paddingRight: "8px",
      });
    });
  });
});
