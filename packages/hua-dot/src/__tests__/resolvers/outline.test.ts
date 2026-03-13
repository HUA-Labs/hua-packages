import { describe, it, expect } from "vitest";
import { dot } from "../../index";

describe("outline resolver", () => {
  describe("bare outline", () => {
    it("outline bare → 1px solid", () => {
      const result = dot("outline");
      expect(result).toEqual({ outlineWidth: "1px", outlineStyle: "solid" });
    });

    it("outline-none → transparent outline with offset", () => {
      const result = dot("outline-none");
      expect(result).toEqual({
        outline: "2px solid transparent",
        outlineOffset: "2px",
      });
    });
  });

  describe("outline widths", () => {
    it("outline-0 → 0px", () => {
      expect(dot("outline-0")).toEqual({ outlineWidth: "0px" });
    });

    it("outline-1 → 1px", () => {
      expect(dot("outline-1")).toEqual({ outlineWidth: "1px" });
    });

    it("outline-2 → 2px", () => {
      expect(dot("outline-2")).toEqual({ outlineWidth: "2px" });
    });

    it("outline-4 → 4px", () => {
      expect(dot("outline-4")).toEqual({ outlineWidth: "4px" });
    });

    it("outline-8 → 8px", () => {
      expect(dot("outline-8")).toEqual({ outlineWidth: "8px" });
    });
  });

  describe("outline styles", () => {
    it("outline-dashed → dashed", () => {
      expect(dot("outline-dashed")).toEqual({ outlineStyle: "dashed" });
    });

    it("outline-dotted → dotted", () => {
      expect(dot("outline-dotted")).toEqual({ outlineStyle: "dotted" });
    });

    it("outline-double → double", () => {
      expect(dot("outline-double")).toEqual({ outlineStyle: "double" });
    });
  });

  describe("outline-offset", () => {
    it("outline-offset-0 → 0px", () => {
      expect(dot("outline-offset-0")).toEqual({ outlineOffset: "0px" });
    });

    it("outline-offset-1 → 1px", () => {
      expect(dot("outline-offset-1")).toEqual({ outlineOffset: "1px" });
    });

    it("outline-offset-2 → 2px", () => {
      expect(dot("outline-offset-2")).toEqual({ outlineOffset: "2px" });
    });

    it("outline-offset-4 → 4px", () => {
      expect(dot("outline-offset-4")).toEqual({ outlineOffset: "4px" });
    });

    it("outline-offset-8 → 8px", () => {
      expect(dot("outline-offset-8")).toEqual({ outlineOffset: "8px" });
    });
  });

  describe("outline colors", () => {
    it("outline-red-500 → outlineColor", () => {
      const result = dot("outline-red-500");
      expect(result).toHaveProperty("outlineColor");
    });

    it("outline-blue-300 → outlineColor", () => {
      const result = dot("outline-blue-300");
      expect(result).toHaveProperty("outlineColor");
    });

    it("outline-primary-500 → outlineColor", () => {
      const result = dot("outline-primary-500");
      expect(result).toHaveProperty("outlineColor");
    });
  });

  describe("arbitrary outline values", () => {
    it("outline-[3px] → 3px outlineWidth", () => {
      expect(dot("outline-[3px]")).toEqual({ outlineWidth: "3px" });
    });

    it("outline-offset-[5px] → 5px outlineOffset", () => {
      expect(dot("outline-offset-[5px]")).toEqual({ outlineOffset: "5px" });
    });
  });

  describe("outline combinations", () => {
    it("focus ring pattern: outline-2 outline-offset-2 outline-blue-500", () => {
      const result = dot("outline-2 outline-offset-2 outline-blue-500");
      expect(result).toHaveProperty("outlineWidth", "2px");
      expect(result).toHaveProperty("outlineOffset", "2px");
      expect(result).toHaveProperty("outlineColor");
    });

    it("focus-visible outline pattern", () => {
      const result = dot("outline-none");
      expect(result).toHaveProperty("outline");
    });
  });
});
