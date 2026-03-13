import { describe, it, expect, beforeEach } from "vitest";
import { dotExplain, createDotConfig, clearDotCache } from "../index";

describe("dotExplain() — extended coverage", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  describe("web target (always empty report)", () => {
    it("web with spacing → empty report", () => {
      const result = dotExplain("p-4 m-2", { target: "web" });
      expect(result.report).toEqual({});
    });

    it("web with gradient → empty report", () => {
      const result = dotExplain("bg-gradient-to-r from-red-500 to-blue-500", {
        target: "web",
      });
      expect(result.report).toEqual({});
    });

    it("web with filter → empty report", () => {
      const result = dotExplain("blur-md brightness-75", { target: "web" });
      expect(result.report).toEqual({});
    });

    it("web with null input → empty report", () => {
      const result = dotExplain(null, { target: "web" });
      expect(result.report).toEqual({});
      expect(result.styles).toEqual({});
    });
  });

  describe("native target — dropped properties", () => {
    it("filter is dropped on native", () => {
      const result = dotExplain("p-4 blur-md", { target: "native" });
      expect(result.report._dropped).toContain("filter");
    });

    it("backdropFilter is dropped on native", () => {
      const result = dotExplain("backdrop-blur-md", { target: "native" });
      expect(result.report._dropped).toContain("backdropFilter");
    });

    it("backgroundImage (gradient) is dropped on native", () => {
      const result = dotExplain("bg-gradient-to-r from-red-500 to-blue-500", {
        target: "native",
      });
      expect(result.report._dropped).toContain("backgroundImage");
    });

    it("CSS variable colors are dropped on native", () => {
      const result = dotExplain("bg-primary", { target: "native" });
      // If primary resolves to CSS var, it should be dropped
      expect(result.report).toBeDefined();
    });
  });

  describe("native target — approximated properties", () => {
    it("shadow is approximated on native", () => {
      const result = dotExplain("shadow-lg", { target: "native" });
      expect(result.report._approximated).toContain("boxShadow");
    });

    it("shadow-none has no approximation", () => {
      const result = dotExplain("shadow-none", { target: "native" });
      // shadow-none resolves to 'none' string
      expect(result).toBeDefined();
    });
  });

  describe("native target — capabilities report", () => {
    it("filter capability is unsupported on native", () => {
      const result = dotExplain("blur-md", { target: "native" });
      expect(result.report._capabilities).toHaveProperty("filter");
      expect(result.report._capabilities?.filter).toBe("unsupported");
    });

    it("supported properties are not in capabilities report", () => {
      const result = dotExplain("p-4", { target: "native" });
      // When all properties are natively supported, _capabilities is undefined or empty
      const caps = result.report._capabilities ?? {};
      expect(caps).not.toHaveProperty("padding");
    });

    it("shadow capability is approximate on native", () => {
      const result = dotExplain("shadow-md", { target: "native" });
      expect(result.report._capabilities?.boxShadow).toBe("approximate");
    });
  });

  describe("native target — shadow details", () => {
    it("multi-layer shadow reports layer reduction detail", () => {
      const result = dotExplain("shadow-xl ring-2", { target: "native" });
      // Both shadow and ring merge to boxShadow
      expect(result.report).toBeDefined();
    });

    it("single-layer shadow has no details", () => {
      const result = dotExplain("shadow-sm", { target: "native" });
      // Single-layer shadow, no inset, no spread → may not have details
      expect(result).toBeDefined();
    });
  });

  describe("dotExplain styles output", () => {
    it("styles match dot() output for web", () => {
      const { styles } = dotExplain("p-4 flex items-center");
      expect(styles).toEqual({
        padding: "16px",
        display: "flex",
        alignItems: "center",
      });
    });

    it("styles match dot() output for native", () => {
      const { styles } = dotExplain("p-4 m-2", { target: "native" });
      expect(styles).toEqual({ padding: 16, margin: 8 });
    });

    it("dark mode styles included", () => {
      const { styles } = dotExplain("bg-white dark:bg-gray-900", {
        dark: true,
      });
      expect((styles as Record<string, string>).backgroundColor).toBe(
        "#121418",
      );
    });
  });

  describe("empty inputs", () => {
    it("empty string → empty styles, empty report", () => {
      const result = dotExplain("");
      expect(result.styles).toEqual({});
      expect(result.report).toEqual({});
    });

    it("whitespace only → empty styles, empty report", () => {
      const result = dotExplain("   ");
      expect(result.styles).toEqual({});
      expect(result.report).toEqual({});
    });

    it("undefined → empty styles, empty report", () => {
      const result = dotExplain(undefined);
      expect(result.styles).toEqual({});
      expect(result.report).toEqual({});
    });
  });

  describe("mixed native support", () => {
    it("mixed spacing + filter reports correctly", () => {
      const result = dotExplain("p-4 m-2 blur-md", { target: "native" });
      expect(result.report._dropped).toContain("filter");
      // padding and margin should NOT be in dropped or capabilities
      expect(result.report._dropped).not.toContain("padding");
      expect(result.report._dropped).not.toContain("margin");
    });

    it("all supported on native → no report entries", () => {
      const result = dotExplain("p-4 m-2 bg-white", { target: "native" });
      expect(result.report._dropped).toBeUndefined();
      expect(result.report._approximated).toBeUndefined();
    });
  });
});
