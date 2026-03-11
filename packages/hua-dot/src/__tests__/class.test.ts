import { describe, it, expect, beforeEach } from "vitest";
import {
  dotClass,
  dotCSS,
  dotFlush,
  dotReset,
  syncClassConfig,
} from "../class";
import { createDotConfig } from "../index";

beforeEach(() => {
  dotReset();
});

// ── Happy Path ──

describe("dotClass — happy path", () => {
  it("returns a class name for basic utility", () => {
    const cls = dotClass("p-4");
    expect(cls).toMatch(/^dot-/);
    expect(cls.length).toBeGreaterThan(4);
  });

  it("generates valid CSS for a single utility", () => {
    const { className, css } = dotCSS("p-4");
    expect(css).toContain(`.${className}`);
    expect(css).toContain("padding: 16px");
  });

  it("handles multiple utilities", () => {
    const { className, css } = dotCSS("p-4 m-2 bg-red-500");
    expect(css).toContain(`.${className}`);
    expect(css).toContain("padding: 16px");
    expect(css).toContain("margin: 8px");
    expect(css).toContain("background-color");
  });

  it("same input produces same class name (deterministic)", () => {
    const a = dotClass("p-4 flex");
    const b = dotClass("p-4 flex");
    expect(a).toBe(b);
  });

  it("different inputs produce different class names", () => {
    const a = dotClass("p-4");
    const b = dotClass("m-4");
    expect(a).not.toBe(b);
  });
});

// ── Hover / State Variants ──

describe("dotClass — state variants", () => {
  it("generates :hover pseudo-class", () => {
    const { css } = dotCSS("hover:bg-red-500");
    expect(css).toMatch(/:hover/);
    expect(css).toContain("background-color");
  });

  it("generates :focus pseudo-class", () => {
    const { css } = dotCSS("focus:border-blue-500");
    expect(css).toMatch(/:focus/);
    expect(css).toContain("border-color");
  });

  it("generates :active pseudo-class", () => {
    const { css } = dotCSS("active:opacity-50");
    expect(css).toMatch(/:active/);
    expect(css).toContain("opacity");
  });

  it("generates :disabled pseudo-class", () => {
    const { css } = dotCSS("disabled:opacity-50");
    expect(css).toMatch(/:disabled/);
  });

  it("generates :focus-visible pseudo-class", () => {
    const { css } = dotCSS("focus-visible:ring-2");
    expect(css).toMatch(/:focus-visible/);
  });

  it("base + hover combined", () => {
    const { className, css } = dotCSS("p-4 hover:bg-red-500");
    // Should have base rule and hover rule
    expect(css).toContain(`${className} {`);
    expect(css).toContain(`${className}:hover {`);
    expect(css).toContain("padding: 16px");
    expect(css).toContain("background-color");
  });
});

// ── Group / Peer Variants (NEW — class mode exclusive) ──

describe("dotClass — group/peer variants", () => {
  it("generates group-hover selector", () => {
    const { css } = dotCSS("group-hover:text-white");
    expect(css).toContain(".group:hover");
    expect(css).toContain("color");
  });

  it("generates group-focus selector", () => {
    const { css } = dotCSS("group-focus:opacity-100");
    expect(css).toContain(".group:focus");
  });

  it("generates peer-checked selector", () => {
    const { css } = dotCSS("peer-checked:bg-green-500");
    expect(css).toContain(".peer:checked ~");
    expect(css).toContain("background-color");
  });

  it("generates peer-focus selector", () => {
    const { css } = dotCSS("peer-focus:ring-2");
    expect(css).toContain(".peer:focus ~");
  });
});

// ── Child Position Pseudo-classes (NEW) ──

describe("dotClass — child position variants", () => {
  it("generates :first-child", () => {
    const { css } = dotCSS("first:mt-0");
    expect(css).toMatch(/:first-child/);
    expect(css).toContain("margin-top: 0px");
  });

  it("generates :last-child", () => {
    const { css } = dotCSS("last:mb-0");
    expect(css).toMatch(/:last-child/);
    expect(css).toContain("margin-bottom: 0");
  });

  it("generates :nth-child(odd)", () => {
    const { css } = dotCSS("odd:bg-gray-100");
    expect(css).toMatch(/:nth-child\(odd\)/);
  });

  it("generates :nth-child(even)", () => {
    const { css } = dotCSS("even:bg-gray-50");
    expect(css).toMatch(/:nth-child\(even\)/);
  });
});

// ── Pseudo-elements (NEW) ──

describe("dotClass — pseudo-elements", () => {
  it("generates ::before", () => {
    const { css } = dotCSS("before:block");
    expect(css).toMatch(/::before/);
    expect(css).toContain("display: block");
  });

  it("generates ::after", () => {
    const { css } = dotCSS("after:hidden");
    expect(css).toMatch(/::after/);
    expect(css).toContain("display: none");
  });

  it("generates ::placeholder", () => {
    const { css } = dotCSS("placeholder:text-gray-400");
    expect(css).toMatch(/::placeholder/);
  });
});

// ── Responsive (@media) ──

describe("dotClass — responsive variants", () => {
  it("generates @media for sm:", () => {
    const { css } = dotCSS("sm:p-8");
    expect(css).toContain("@media");
    expect(css).toContain("min-width");
    expect(css).toContain("padding: 32px");
  });

  it("generates @media for md:", () => {
    const { css } = dotCSS("md:flex");
    expect(css).toContain("@media");
    expect(css).toContain("display: flex");
  });

  it("generates @media for lg:", () => {
    const { css } = dotCSS("lg:grid");
    expect(css).toContain("@media");
    expect(css).toContain("display: grid");
  });

  it("base + responsive combined", () => {
    const { css } = dotCSS("p-4 md:p-8");
    expect(css).toContain("padding: 16px");
    expect(css).toContain("@media");
    expect(css).toContain("padding: 32px");
  });
});

// ── Dark Mode ──

describe("dotClass — dark mode", () => {
  it("generates .dark ancestor selector by default", () => {
    const { css } = dotCSS("dark:bg-gray-900");
    expect(css).toContain(".dark");
    expect(css).toContain("background-color");
  });

  it("generates @media prefers-color-scheme when darkMode is media", () => {
    const { css } = dotCSS("dark:bg-gray-900", { darkMode: "media" });
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });
});

// ── Atomic Naming ──

describe("dotClass — atomic naming", () => {
  it("produces per-token class names", () => {
    const cls = dotClass("p-4 m-2", { naming: "atomic" });
    const classes = cls.split(" ");
    expect(classes.length).toBe(2);
    expect(classes[0]).toContain("p-4");
    expect(classes[1]).toContain("m-2");
  });

  it("atomic CSS has one rule per class", () => {
    const { css } = dotCSS("p-4 m-2", { naming: "atomic" });
    expect(css).toContain("padding: 16px");
    expect(css).toContain("margin: 8px");
  });
});

// ── !important ──

describe("dotClass — !important", () => {
  it("applies !important flag", () => {
    const { css } = dotCSS("!p-4");
    expect(css).toContain("!important");
    expect(css).toContain("padding");
  });
});

// ── Flush / Reset ──

describe("dotFlush / dotReset", () => {
  it("dotFlush returns collected CSS and clears buffer", () => {
    dotCSS("p-4");
    dotCSS("m-2");
    const flushed = dotFlush();
    expect(flushed).toContain("padding: 16px");
    expect(flushed).toContain("margin: 8px");

    // Second flush should be empty
    const second = dotFlush();
    expect(second).toBe("");
  });

  it("dotReset clears cache and buffer", () => {
    dotCSS("p-4");
    dotReset();
    const flushed = dotFlush();
    expect(flushed).toBe("");
  });
});

// ── Edge Cases ──

describe("dotClass — edge cases", () => {
  it("returns empty string for empty input", () => {
    expect(dotClass("")).toBe("");
    expect(dotClass("   ")).toBe("");
  });

  it("handles null/undefined gracefully", () => {
    // @ts-expect-error — testing runtime safety
    expect(dotClass(null)).toBe("");
    // @ts-expect-error — testing runtime safety
    expect(dotClass(undefined)).toBe("");
  });

  it("handles unknown variants gracefully (no crash)", () => {
    const { css } = dotCSS("banana:p-4");
    // Unknown variant → the utility should still resolve, variant is silently ignored
    expect(css).toContain("padding");
  });

  it("handles shadow composition", () => {
    const { css } = dotCSS("shadow-lg");
    expect(css).toContain("box-shadow");
  });

  it("handles gradient composition", () => {
    const { css } = dotCSS("bg-gradient-to-r from-red-500 to-blue-500");
    expect(css).toContain("background-image");
    expect(css).toContain("linear-gradient");
  });

  it("handles transform accumulation", () => {
    const { css } = dotCSS("rotate-45 scale-110");
    expect(css).toContain("transform");
  });

  it("camelCase to kebab-case conversion", () => {
    const { css } = dotCSS("items-center");
    expect(css).toContain("align-items");
    expect(css).not.toContain("alignItems");
  });
});

// ── Negative Cases ──

describe("dotClass — negative values", () => {
  it("handles negative margin", () => {
    const { css } = dotCSS("-m-4");
    expect(css).toContain("margin");
    expect(css).toContain("-16px");
  });

  it("handles negative top", () => {
    const { css } = dotCSS("-top-2");
    expect(css).toContain("top");
  });
});

// ── Complex Combinations ──

describe("dotClass — complex combinations", () => {
  it("base + hover + responsive", () => {
    const { css } = dotCSS("p-4 hover:bg-red-500 md:p-8");
    expect(css).toContain("padding: 16px");
    expect(css).toContain(":hover");
    expect(css).toContain("@media");
    expect(css).toContain("padding: 32px");
  });

  it("group-hover + first + responsive", () => {
    const { className, css } = dotCSS(
      "group-hover:text-white first:mt-0 lg:p-12",
    );
    expect(className).toMatch(/^dot-/);
    expect(css).toContain(".group:hover");
    expect(css).toContain(":first-child");
    expect(css).toContain("@media");
  });
});

// ── Codex R1 Regression — Multi-variant selector (Finding 1) ──

describe("dotClass — multi-variant compound selectors", () => {
  it("group-hover:first produces ONE combined rule, not two", () => {
    const { css } = dotCSS("group-hover:first:mt-0");
    const ruleCount = (css.match(/\{/g) || []).length;
    // Should be exactly 1 rule: .group:hover .dot-xxx:first-child { ... }
    expect(ruleCount).toBe(1);
    expect(css).toContain(".group:hover");
    expect(css).toContain(":first-child");
  });

  it("hover:focus produces single combined pseudo selector", () => {
    const { css } = dotCSS("hover:focus:bg-red-500");
    const ruleCount = (css.match(/\{/g) || []).length;
    expect(ruleCount).toBe(1);
    expect(css).toContain(":hover");
    expect(css).toContain(":focus");
  });

  it("dark:hover combines dark ancestor with pseudo-class", () => {
    const { css } = dotCSS("dark:hover:bg-gray-900");
    const ruleCount = (css.match(/\{/g) || []).length;
    expect(ruleCount).toBe(1);
    expect(css).toContain(".dark");
    expect(css).toContain(":hover");
  });

  it("sm:hover combines @media with pseudo-class", () => {
    const { css } = dotCSS("sm:hover:bg-blue-500");
    expect(css).toContain("@media");
    expect(css).toContain(":hover");
    const ruleCount = (css.match(/\{/g) || []).length;
    // @media { .selector:hover { ... } } = 2 opening braces (media + rule)
    expect(ruleCount).toBe(2);
  });
});

// ── Codex R1 Regression — Atomic dedup (Finding 3) ──

describe("dotClass — atomic dedup", () => {
  it("duplicate atomic tokens emit CSS only once in flush", () => {
    dotCSS("p-4", { naming: "atomic" });
    dotCSS("p-4 m-2", { naming: "atomic" });
    const flushed = dotFlush();
    // p-4 should appear only once in flushed CSS
    const p4Matches = flushed.match(/dot-p-4/g) || [];
    expect(p4Matches.length).toBe(1);
  });

  it("conflicting order is a CSS limitation (stylesheet order wins, like Tailwind)", () => {
    // This documents expected behavior: atomic mode uses stylesheet order,
    // NOT HTML class attribute order. Use hash mode for per-call ordering.
    const r1 = dotCSS("p-8 p-4", { naming: "atomic" });
    const r2 = dotCSS("p-4 p-8", { naming: "atomic" });
    // Both calls produce the same set of class names (order may differ)
    const classes1 = r1.className.split(" ").sort();
    const classes2 = r2.className.split(" ").sort();
    expect(classes1).toEqual(classes2);
  });
});

// ── Codex R2 Regression — syncClassConfig + createDotConfig (Finding 1) ──

describe("syncClassConfig — picks up createDotConfig()", () => {
  it("custom tokens resolve after sync", () => {
    createDotConfig({
      theme: {
        colors: { brand: { "500": "#123456" } },
        spacing: { "18": "72px" },
      },
    });
    syncClassConfig();

    const { css: colorCSS } = dotCSS("bg-brand-500");
    expect(colorCSS).toContain("background-color");
    expect(colorCSS).toContain("#123456");

    const { css: spacingCSS } = dotCSS("p-18");
    expect(spacingCSS).toContain("padding");
    expect(spacingCSS).toContain("72px");

    // Restore defaults for other tests
    createDotConfig();
    syncClassConfig();
  });

  it("custom breakpointWidths produce @media", () => {
    createDotConfig({
      breakpoints: ["tablet", "desktop"],
      breakpointWidths: { tablet: "900px", desktop: "1200px" },
    });
    syncClassConfig();

    const { css } = dotCSS("tablet:p-8");
    expect(css).toContain("@media (min-width: 900px)");
    expect(css).toContain("padding: 32px");

    // Restore defaults
    createDotConfig();
    syncClassConfig();
  });
});
