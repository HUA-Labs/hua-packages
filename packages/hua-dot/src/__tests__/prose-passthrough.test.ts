import { describe, it, expect, beforeEach } from "vitest";
import { dot } from "../index";
import { dotClass, dotCSS, dotReset } from "../class";

beforeEach(() => {
  dotReset();
});

// ── prose passthrough — inline dot() ──

describe("dot() — prose tokens return empty style object", () => {
  it("dot('prose') returns {}", () => {
    expect(dot("prose")).toEqual({});
  });

  it("dot('prose-gray') returns {}", () => {
    expect(dot("prose-gray")).toEqual({});
  });

  it("dot('prose-lg') returns {}", () => {
    expect(dot("prose-lg")).toEqual({});
  });

  it("dot('prose-slate') returns {}", () => {
    expect(dot("prose-slate")).toEqual({});
  });

  it("dot('prose-sm') returns {}", () => {
    expect(dot("prose-sm")).toEqual({});
  });

  it("dot('prose-xl') returns {}", () => {
    expect(dot("prose-xl")).toEqual({});
  });

  it("dot('prose-2xl') returns {}", () => {
    expect(dot("prose-2xl")).toEqual({});
  });

  it("dot('prose prose-gray prose-lg') returns {}", () => {
    expect(dot("prose prose-gray prose-lg")).toEqual({});
  });
});

// ── prose passthrough — dotClass / dotCSS ──

describe("dotClass / dotCSS — prose tokens pass through as literal class names", () => {
  it("dotClass('prose') returns 'prose' with no dot- hash class", () => {
    const cls = dotClass("prose");
    expect(cls).toBe("prose");
    expect(cls).not.toMatch(/^dot-/);
  });

  it("dotClass('prose-gray') returns 'prose-gray'", () => {
    const cls = dotClass("prose-gray");
    expect(cls).toBe("prose-gray");
    expect(cls).not.toMatch(/^dot-/);
  });

  it("dotClass('prose-lg') returns 'prose-lg'", () => {
    const cls = dotClass("prose-lg");
    expect(cls).toBe("prose-lg");
    expect(cls).not.toMatch(/^dot-/);
  });

  it("dotClass('prose prose-gray prose-lg') includes all three class names", () => {
    const cls = dotClass("prose prose-gray prose-lg");
    const classes = cls.split(" ");
    expect(classes).toContain("prose");
    expect(classes).toContain("prose-gray");
    expect(classes).toContain("prose-lg");
  });

  it("dotCSS('prose prose-gray prose-lg') — no CSS rules generated for prose tokens", () => {
    const { css } = dotCSS("prose prose-gray prose-lg");
    // No dot- hash class is generated since there are no style tokens
    expect(css).toBe("");
  });

  it("dotCSS('prose prose-gray prose-lg').className includes all three", () => {
    const { className } = dotCSS("prose prose-gray prose-lg");
    const classes = className.split(" ");
    expect(classes).toContain("prose");
    expect(classes).toContain("prose-gray");
    expect(classes).toContain("prose-lg");
  });

  it("prose mixed with style tokens — CSS only for style tokens, prose in className", () => {
    const { className, css } = dotCSS("prose prose-lg p-4");
    const classes = className.split(" ");
    expect(classes).toContain("prose");
    expect(classes).toContain("prose-lg");
    expect(css).toContain("padding: 16px");
    // CSS should not contain 'prose' as a selector
    expect(css).not.toMatch(/prose/);
  });

  it("all prose size variants pass through", () => {
    const sizes = [
      "prose-sm",
      "prose-base",
      "prose-lg",
      "prose-xl",
      "prose-2xl",
    ];
    for (const size of sizes) {
      dotReset();
      const cls = dotClass(size);
      expect(cls).toBe(size);
    }
  });

  it("prose color variants pass through", () => {
    const colors = [
      "prose-gray",
      "prose-slate",
      "prose-zinc",
      "prose-neutral",
      "prose-stone",
    ];
    for (const color of colors) {
      dotReset();
      const cls = dotClass(color);
      expect(cls).toBe(color);
    }
  });

  it("atomic mode — prose tokens appear as literal class names", () => {
    const cls = dotClass("prose prose-gray prose-lg p-4", { naming: "atomic" });
    const classes = cls.split(" ");
    expect(classes).toContain("prose");
    expect(classes).toContain("prose-gray");
    expect(classes).toContain("prose-lg");
  });

  it("dark:prose-invert preserves variant prefix", () => {
    const cls = dotClass("prose dark:prose-invert");
    const classes = cls.split(" ");
    expect(classes).toContain("prose");
    expect(classes).toContain("dark:prose-invert");
  });

  it("prose prose-gray dark:prose-invert — all variants preserved", () => {
    const cls = dotClass("prose prose-gray dark:prose-invert");
    const classes = cls.split(" ");
    expect(classes).toContain("prose");
    expect(classes).toContain("prose-gray");
    expect(classes).toContain("dark:prose-invert");
    expect(classes).not.toContain("prose-invert");
  });
});

// ── existing standalone tokens not broken ──

describe("group/peer — still work after prose addition", () => {
  it("dotClass('group') returns 'group'", () => {
    expect(dotClass("group")).toBe("group");
  });

  it("dotClass('peer') returns 'peer'", () => {
    expect(dotClass("peer")).toBe("peer");
  });

  it("group + prose + p-4 — all passthrough and style tokens coexist", () => {
    const { className, css } = dotCSS("group prose prose-lg p-4");
    const classes = className.split(" ");
    expect(classes).toContain("group");
    expect(classes).toContain("prose");
    expect(classes).toContain("prose-lg");
    expect(css).toContain("padding: 16px");
  });
});
