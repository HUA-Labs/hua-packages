import { describe, it, expect, beforeEach } from "vitest";
import { semanticVars, createDotConfig, dot, clearDotCache } from "../index";

describe("semanticVars()", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  describe("basic usage", () => {
    it("single name → CSS var with default prefix", () => {
      const result = semanticVars("primary");
      expect(result).toEqual({ primary: "var(--color-primary)" });
    });

    it("multiple names → all map to CSS vars", () => {
      const result = semanticVars("primary", "secondary", "muted");
      expect(result).toEqual({
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        muted: "var(--color-muted)",
      });
    });

    it("empty call → empty object", () => {
      const result = semanticVars();
      expect(result).toEqual({});
    });
  });

  describe("custom prefix", () => {
    it("custom prefix overrides --color", () => {
      const result = semanticVars({ prefix: "--brand" }, "primary", "accent");
      expect(result).toEqual({
        primary: "var(--brand-primary)",
        accent: "var(--brand-accent)",
      });
    });

    it("custom prefix with single name", () => {
      const result = semanticVars({ prefix: "--theme" }, "background");
      expect(result).toEqual({ background: "var(--theme-background)" });
    });
  });

  describe("hyphenated names", () => {
    it("hyphenated names → correct var name", () => {
      const result = semanticVars("muted-foreground", "sidebar-accent");
      expect(result).toEqual({
        "muted-foreground": "var(--color-muted-foreground)",
        "sidebar-accent": "var(--color-sidebar-accent)",
      });
    });
  });

  describe("integration with createDotConfig", () => {
    it("semantic vars used in dot() resolve to CSS vars", () => {
      createDotConfig({
        theme: {
          semanticColors: semanticVars("brand", "accent"),
        },
      });

      const result = dot("bg-brand");
      expect(result).toEqual({ backgroundColor: "var(--color-brand)" });
    });

    it("semantic vars with custom prefix in dot()", () => {
      createDotConfig({
        theme: {
          semanticColors: semanticVars(
            { prefix: "--theme" },
            "surface",
            "on-surface",
          ),
        },
      });

      const result = dot("bg-surface");
      expect(result).toEqual({ backgroundColor: "var(--theme-surface)" });
    });

    it("mixed semanticVars and explicit overrides", () => {
      createDotConfig({
        theme: {
          semanticColors: {
            ...semanticVars("primary", "secondary"),
            brand: "var(--my-brand)",
          },
        },
      });

      expect(dot("bg-primary")).toEqual({
        backgroundColor: "var(--color-primary)",
      });
      expect(dot("bg-brand")).toEqual({ backgroundColor: "var(--my-brand)" });
    });
  });
});
