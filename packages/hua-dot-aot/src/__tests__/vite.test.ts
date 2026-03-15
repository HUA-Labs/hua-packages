import { describe, it, expect, vi } from "vitest";
import dotAotVite from "../vite";

// ---------------------------------------------------------------------------
// Helper — call the transform hook on a fake file
// ---------------------------------------------------------------------------
function runTransform(
  plugin: ReturnType<typeof dotAotVite>,
  code: string,
  id: string,
) {
  const hook = plugin.transform as (
    code: string,
    id: string,
  ) => { code: string; map: null } | null;
  return hook(code, id);
}

// ---------------------------------------------------------------------------
// Plugin initialization
// ---------------------------------------------------------------------------
describe("dotAotVite — plugin shape", () => {
  it("returns a vite plugin object", () => {
    const plugin = dotAotVite();
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe("dot-aot");
    expect(plugin.enforce).toBe("pre");
    expect(typeof plugin.transform).toBe("function");
    expect(typeof plugin.buildEnd).toBe("function");
  });

  it("creates a new plugin instance per call", () => {
    const a = dotAotVite();
    const b = dotAotVite();
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// File filtering — include extensions
// ---------------------------------------------------------------------------
describe("dotAotVite — file extension filtering", () => {
  it("processes .ts files", () => {
    const plugin = dotAotVite();
    const result = runTransform(plugin, `const s = dot('p-4');`, "/src/foo.ts");
    expect(result).not.toBeNull();
  });

  it("processes .tsx files", () => {
    const plugin = dotAotVite();
    const result = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.tsx",
    );
    expect(result).not.toBeNull();
  });

  it("processes .js files", () => {
    const plugin = dotAotVite();
    const result = runTransform(plugin, `const s = dot('p-4');`, "/src/foo.js");
    expect(result).not.toBeNull();
  });

  it("processes .jsx files", () => {
    const plugin = dotAotVite();
    const result = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.jsx",
    );
    expect(result).not.toBeNull();
  });

  it("skips .css files", () => {
    const plugin = dotAotVite();
    const result = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.css",
    );
    expect(result).toBeNull();
  });

  it("skips .json files", () => {
    const plugin = dotAotVite();
    const result = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.json",
    );
    expect(result).toBeNull();
  });

  it("skips .vue files by default", () => {
    const plugin = dotAotVite();
    const result = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.vue",
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// File filtering — exclude patterns
// ---------------------------------------------------------------------------
describe("dotAotVite — exclude filtering", () => {
  it("skips node_modules files", () => {
    const plugin = dotAotVite();
    const result = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/project/node_modules/some-lib/index.ts",
    );
    expect(result).toBeNull();
  });

  it("processes non-excluded files", () => {
    const plugin = dotAotVite();
    const result = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/project/src/app.ts",
    );
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Custom options
// ---------------------------------------------------------------------------
describe("dotAotVite — custom options", () => {
  it("respects custom include extensions", () => {
    const plugin = dotAotVite({ include: [".vue"] });
    const resultVue = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.vue",
    );
    const resultTs = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.ts",
    );
    expect(resultVue).not.toBeNull();
    expect(resultTs).toBeNull();
  });

  it("respects custom exclude patterns", () => {
    const plugin = dotAotVite({ exclude: ["dist"] });
    const resultDist = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/project/dist/output.ts",
    );
    expect(resultDist).toBeNull();
    // node_modules should now be processable (not in custom exclude)
    const resultNm = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/project/node_modules/lib/index.ts",
    );
    expect(resultNm).not.toBeNull();
  });

  it("respects custom functionNames", () => {
    const plugin = dotAotVite({ functionNames: ["css"] });
    const resultCss = runTransform(
      plugin,
      `const s = css('p-4');`,
      "/src/foo.ts",
    );
    const resultDot = runTransform(
      plugin,
      `const s = dot('p-4');`,
      "/src/foo.ts",
    );
    expect(resultCss).not.toBeNull();
    // dot() not in functionNames → fast-path skips, returns null
    expect(resultDot).toBeNull();
  });

  it("passes target option to transformSource", () => {
    const plugin = dotAotVite({ target: "native" });
    const result = runTransform(plugin, `const s = dot('p-4');`, "/src/foo.ts");
    expect(result).not.toBeNull();
    // Native adapter uses numeric values
    expect(result!.code).toContain("padding: 16");
  });
});

// ---------------------------------------------------------------------------
// Transform output
// ---------------------------------------------------------------------------
describe("dotAotVite — transform output", () => {
  it("returns { code, map: null } on successful transform", () => {
    const plugin = dotAotVite();
    const result = runTransform(plugin, `const s = dot('p-4');`, "/src/foo.ts");
    expect(result).toMatchObject({ map: null });
    expect(typeof result!.code).toBe("string");
  });

  it("returns null when code has no dot() calls", () => {
    const plugin = dotAotVite();
    const result = runTransform(plugin, `const x = 42;`, "/src/foo.ts");
    expect(result).toBeNull();
  });

  it("replaces dot() with inline style object", () => {
    const plugin = dotAotVite();
    const result = runTransform(plugin, `const s = dot('p-4');`, "/src/foo.ts");
    expect(result!.code).toContain('padding: "16px"');
    expect(result!.code).not.toContain("dot('p-4')");
  });

  it("preserves surrounding code", () => {
    const plugin = dotAotVite();
    const source = `const before = 1;\nconst s = dot('p-4');\nconst after = 2;`;
    const result = runTransform(plugin, source, "/src/foo.ts");
    expect(result!.code).toContain("const before = 1;");
    expect(result!.code).toContain("const after = 2;");
  });

  it("handles multiple dot() calls in one file", () => {
    const plugin = dotAotVite();
    const source = `const a = dot('p-4');\nconst b = dot('m-2');`;
    const result = runTransform(plugin, source, "/src/foo.ts");
    expect(result!.code).toContain('padding: "16px"');
    expect(result!.code).toContain('margin: "8px"');
  });

  it("skips files without the function name (fast path)", () => {
    const plugin = dotAotVite();
    // No 'dot(' substring — should skip without calling transformSource
    const result = runTransform(
      plugin,
      `const x = style('p-4');`,
      "/src/foo.ts",
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildEnd — counter logging
// ---------------------------------------------------------------------------
describe("dotAotVite — buildEnd", () => {
  it("does not log when no extractions occurred", () => {
    const plugin = dotAotVite();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const buildEnd = plugin.buildEnd as () => void;
    buildEnd();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("logs extraction count after transforms", () => {
    const plugin = dotAotVite();
    // Trigger a transform to increment the counter
    runTransform(plugin, `const s = dot('p-4');`, "/src/foo.ts");

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const buildEnd = plugin.buildEnd as () => void;
    buildEnd();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[dot-aot]"),
    );
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("1"));
    consoleSpy.mockRestore();
  });

  it("accumulates extractions across multiple transforms", () => {
    const plugin = dotAotVite();
    runTransform(plugin, `const s = dot('p-4');`, "/src/a.ts");
    runTransform(
      plugin,
      `const s = dot('m-2'); const t = dot('text-lg');`,
      "/src/b.ts",
    );

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const buildEnd = plugin.buildEnd as () => void;
    buildEnd();
    // 3 total extractions
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("3"));
    consoleSpy.mockRestore();
  });
});
