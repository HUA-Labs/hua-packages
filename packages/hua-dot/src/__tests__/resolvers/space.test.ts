import { describe, it, expect } from "vitest";
import { dot } from "../../index";

describe("space-x/y utilities", () => {
  describe("space-x (maps to columnGap + auto display:flex)", () => {
    it("space-x-4", () => {
      expect(dot("space-x-4")).toEqual({ display: "flex", columnGap: "16px" });
    });
    it("space-x-0", () => {
      expect(dot("space-x-0")).toEqual({ display: "flex", columnGap: "0px" });
    });
    it("space-x-2", () => {
      expect(dot("space-x-2")).toEqual({ display: "flex", columnGap: "8px" });
    });
    it("space-x-[12px] (arbitrary)", () => {
      expect(dot("space-x-[12px]")).toEqual({
        display: "flex",
        columnGap: "12px",
      });
    });
  });

  describe("space-y (maps to rowGap + auto display:flex + flexDirection:column)", () => {
    it("space-y-4", () => {
      expect(dot("space-y-4")).toEqual({
        display: "flex",
        flexDirection: "column",
        rowGap: "16px",
      });
    });
    it("space-y-0", () => {
      expect(dot("space-y-0")).toEqual({
        display: "flex",
        flexDirection: "column",
        rowGap: "0px",
      });
    });
    it("space-y-8", () => {
      expect(dot("space-y-8")).toEqual({
        display: "flex",
        flexDirection: "column",
        rowGap: "32px",
      });
    });
    it("space-y-[1.5rem] (arbitrary)", () => {
      expect(dot("space-y-[1.5rem]")).toEqual({
        display: "flex",
        flexDirection: "column",
        rowGap: "1.5rem",
      });
    });
  });

  describe("with explicit display — no auto-injection", () => {
    it("flex flex-col space-y-4 (already flex)", () => {
      expect(dot("flex flex-col space-y-4")).toEqual({
        display: "flex",
        flexDirection: "column",
        rowGap: "16px",
      });
    });
    it("flex space-x-2 (already flex)", () => {
      expect(dot("flex space-x-2")).toEqual({
        display: "flex",
        columnGap: "8px",
      });
    });
    it("grid space-y-4 (grid display preserved)", () => {
      expect(dot("grid space-y-4")).toEqual({
        display: "grid",
        rowGap: "16px",
      });
    });
    it("inline-flex space-x-4 (inline-flex preserved)", () => {
      expect(dot("inline-flex space-x-4")).toEqual({
        display: "inline-flex",
        columnGap: "16px",
      });
    });
    it("space-y-4 grid grid-cols-2 (grid overrides auto-flex)", () => {
      const result = dot("space-y-4 grid grid-cols-2");
      expect(result.display).toBe("grid");
      expect(result.rowGap).toBe("16px");
    });
    it("grid-cols-2 space-y-4 (grid props detected without explicit display)", () => {
      const result = dot("grid-cols-2 space-y-4");
      expect(result.display).toBe("grid");
      expect(result.rowGap).toBe("16px");
      expect(result.flexDirection).toBeUndefined();
    });
    it("grid-flow-col space-x-4 (gridAutoFlow detected)", () => {
      const result = dot("grid-flow-col space-x-4");
      expect(result.display).toBe("grid");
      expect(result.columnGap).toBe("16px");
    });
  });

  describe("with variants", () => {
    it("md:space-y-8", () => {
      expect(dot("space-y-4 md:space-y-8", { breakpoint: "md" })).toEqual({
        display: "flex",
        flexDirection: "column",
        rowGap: "32px",
      });
    });
  });

  describe("space-y without flex-direction does not override existing", () => {
    it("flex flex-row space-y-4 (flex-row preserved)", () => {
      expect(dot("flex flex-row space-y-4")).toEqual({
        display: "flex",
        flexDirection: "row",
        rowGap: "16px",
      });
    });
  });
});
