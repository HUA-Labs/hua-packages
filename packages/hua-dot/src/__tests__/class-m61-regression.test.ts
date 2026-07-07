import { describe, it, expect, beforeEach } from "vitest";
import {
  dotClass,
  dotCSS,
  dotFlush,
  dotRunInScope,
  dotRunInScopeAsync,
  dotReset,
  syncClassConfig,
} from "../class";
import { createDotConfig } from "../index";

beforeEach(() => {
  dotReset();
});

// ── Bug 1: SSR scope isolation ──

describe("dotRunInScope — request-isolated SSR CSS collection", () => {
  it("scoped CSS does not leak into global buffer", () => {
    // Generate some CSS in global scope
    dotCSS("p-4");
    const globalBefore = dotFlush();
    expect(globalBefore).toContain("padding: 16px");

    // Run in scope
    const { css: scopedCSS } = dotRunInScope(() => {
      dotCSS("m-2");
      return "rendered";
    });

    expect(scopedCSS).toContain("margin: 8px");

    // Global buffer should be empty (nothing added outside scope)
    const globalAfter = dotFlush();
    expect(globalAfter).not.toContain("margin: 8px");
  });

  it("scope returns both result and collected CSS", () => {
    const { result, css } = dotRunInScope(() => {
      dotCSS("p-4");
      dotCSS("bg-red-500");
      return 42;
    });

    expect(result).toBe(42);
    expect(css).toContain("padding: 16px");
    expect(css).toContain("background-color");
  });

  it("after scope ends, CSS goes to global buffer again", () => {
    dotRunInScope(() => {
      dotCSS("p-4");
    });

    // Now outside scope — CSS should go to global
    dotCSS("m-2");
    const global = dotFlush();
    expect(global).toContain("margin: 8px");
    expect(global).not.toContain("padding: 16px");
  });

  it("empty scope returns empty CSS", () => {
    const { css } = dotRunInScope(() => "nothing");
    expect(css).toBe("");
  });
});

describe("dotRunInScopeAsync — async SSR request isolation", () => {
  it("captures CSS from post-await dotCSS calls", async () => {
    const { result, css } = await dotRunInScopeAsync(async () => {
      dotCSS("p-4");
      // Simulate async work (e.g., data fetching during SSR)
      await new Promise((resolve) => setTimeout(resolve, 10));
      dotCSS("m-2");
      return "rendered";
    });

    expect(result).toBe("rendered");
    expect(css).toContain("padding: 16px");
    expect(css).toContain("margin: 8px");
  });

  it("async scope does not leak into global buffer", async () => {
    await dotRunInScopeAsync(async () => {
      dotCSS("p-4");
      await new Promise((resolve) => setTimeout(resolve, 5));
      dotCSS("bg-red-500");
    });

    const global = dotFlush();
    expect(global).not.toContain("padding: 16px");
    expect(global).not.toContain("background-color");
  });

  it("interleaved async scopes isolate correctly", async () => {
    // Simulate two concurrent SSR requests
    const requestA = dotRunInScopeAsync(async () => {
      dotCSS("p-4");
      await new Promise((resolve) => setTimeout(resolve, 20));
      dotCSS("bg-red-500");
      return "A";
    });

    const requestB = dotRunInScopeAsync(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      dotCSS("m-2");
      await new Promise((resolve) => setTimeout(resolve, 5));
      dotCSS("bg-blue-500");
      return "B";
    });

    const [a, b] = await Promise.all([requestA, requestB]);

    expect(a.result).toBe("A");
    expect(a.css).toContain("padding: 16px");
    expect(a.css).toContain("background-color");
    expect(a.css).not.toContain("margin: 8px");

    expect(b.result).toBe("B");
    expect(b.css).toContain("margin: 8px");
    expect(b.css).not.toContain("padding: 16px");
  });
});

// ── Bug 2: syncClassConfig cache invalidation ──

describe("syncClassConfig — cache invalidation", () => {
  it("cache is invalidated after syncClassConfig", () => {
    // First call with default config
    const before = dotCSS("p-18");
    dotFlush();
    expect(before.css).not.toContain("padding: 99px");

    // Change config with custom spacing
    createDotConfig({ theme: { spacing: { "18": "99px" } } });
    syncClassConfig();

    // Same input should produce different CSS
    const after = dotCSS("p-18");
    expect(after.css).toContain("padding: 99px");

    // Restore defaults
    createDotConfig();
    syncClassConfig();
  });

  it("atomic mode emission state is also cleared", () => {
    // Emit in atomic mode
    dotCSS("p-18", { naming: "atomic" });
    const firstFlush = dotFlush();

    // Change config
    createDotConfig({ theme: { spacing: { "18": "50px" } } });
    syncClassConfig();

    // After sync, re-emitting same input should produce new CSS
    dotCSS("p-18", { naming: "atomic" });
    const secondFlush = dotFlush();
    expect(secondFlush).toContain("padding: 50px");

    // Restore defaults
    createDotConfig();
    syncClassConfig();
  });
});

// ── Bug 3: darkMode media + breakpoint composition ──

describe("darkMode media + breakpoint — nested media queries", () => {
  it("md:dark: produces nested media queries in media dark mode", () => {
    const { css } = dotCSS("md:dark:bg-white", { darkMode: "media" });

    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("@media (min-width:");
    expect(css).toContain("background-color");
  });

  it("dark:md: produces nested media queries (reverse order)", () => {
    const { css } = dotCSS("dark:md:bg-white", { darkMode: "media" });

    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("@media (min-width:");
    expect(css).toContain("background-color");
  });

  it("dark:lg:text-white produces correct nested output", () => {
    const { css } = dotCSS("dark:lg:text-white", { darkMode: "media" });

    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("@media (min-width:");
    expect(css).toContain("color");
  });

  it("single dark media still works (no regression)", () => {
    const { css } = dotCSS("dark:bg-black", { darkMode: "media" });
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("background-color");
  });

  it("single breakpoint still works (no regression)", () => {
    const { css } = dotCSS("md:p-4");
    expect(css).toContain("@media (min-width:");
    expect(css).toContain("padding: 16px");
  });

  it("dark class mode + breakpoint is unaffected", () => {
    const { css } = dotCSS("dark:md:bg-white", { darkMode: "class" });
    expect(css).toContain("dark");
    expect(css).toContain("@media (min-width:");
    expect(css).not.toContain("prefers-color-scheme");
  });
});
