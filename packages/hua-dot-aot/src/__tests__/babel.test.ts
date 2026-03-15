import { describe, it, expect } from "vitest";
import * as babel from "@babel/core";
import dotAotBabel from "../babel";

// ---------------------------------------------------------------------------
// Helper — run babel transform with the dot-aot plugin
// ---------------------------------------------------------------------------
function transform(
  code: string,
  pluginOptions?: Parameters<typeof dotAotBabel>[1],
): string | null | undefined {
  const result = babel.transformSync(code, {
    plugins: [[dotAotBabel, pluginOptions]],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  return result?.code;
}

// ---------------------------------------------------------------------------
// Plugin shape
// ---------------------------------------------------------------------------
describe("dotAotBabel — plugin shape", () => {
  it("returns a babel plugin object with name and visitor", () => {
    const fakeTypes = {} as Parameters<typeof dotAotBabel>[0]["types"];
    const plugin = dotAotBabel({ types: fakeTypes });
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe("dot-aot");
    expect(plugin.visitor).toBeDefined();
    expect(typeof plugin.visitor.CallExpression).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// Basic extraction
// ---------------------------------------------------------------------------
describe("dotAotBabel — basic extraction", () => {
  it("replaces dot() with static style object", () => {
    const code = transform(`const s = dot('p-4');`);
    expect(code).toBeDefined();
    expect(code).toContain("padding");
    expect(code).toContain("16px");
    expect(code).not.toContain("dot('p-4')");
  });

  it("replaces multiple dot() calls", () => {
    const code = transform(`const a = dot('p-4');\nconst b = dot('m-2');`);
    expect(code).toContain("padding");
    expect(code).toContain("margin");
  });

  it("preserves surrounding code", () => {
    const code = transform(`const x = 1;\nconst s = dot('p-4');\nconst y = 2;`);
    expect(code).toContain("const x = 1");
    expect(code).toContain("const y = 2");
  });

  it("handles double-quoted string argument", () => {
    const code = transform(`const s = dot("p-4");`);
    expect(code).toContain("padding");
    expect(code).not.toContain('dot("p-4")');
  });

  it("handles multiple utilities in one call", () => {
    const code = transform(`const s = dot('p-4 m-2');`);
    expect(code).toContain("padding");
    expect(code).toContain("margin");
  });
});

// ---------------------------------------------------------------------------
// Options handling
// ---------------------------------------------------------------------------
describe("dotAotBabel — options object argument", () => {
  it("respects target: native", () => {
    const code = transform(`const s = dot('p-4', { target: 'native' });`);
    // Native adapter returns numbers, not px strings
    expect(code).toContain("padding");
    expect(code).toContain("16");
    expect(code).not.toContain("16px");
  });

  it("respects target: web (explicit)", () => {
    const code = transform(`const s = dot('p-4', { target: 'web' });`);
    expect(code).toContain('"16px"');
  });

  it("respects dark: true option", () => {
    const code = transform(`const s = dot('text-white', { dark: true });`);
    expect(code).toBeDefined();
    // dark mode produces different color output
    expect(code).not.toContain("dot('text-white'");
  });

  it("skips extraction when breakpoint option is present", () => {
    const code = transform(`const s = dot('md:p-8', { breakpoint: 'md' });`);
    // Should leave the call as-is (runtime)
    expect(code).toContain("dot(");
    expect(code).toContain("breakpoint");
  });

  it("skips when breakpoint combined with other options", () => {
    const code = transform(
      `const s = dot('p-4', { target: 'native', breakpoint: 'md' });`,
    );
    expect(code).toContain("dot(");
    expect(code).toContain("breakpoint");
  });
});

// ---------------------------------------------------------------------------
// Plugin-level options
// ---------------------------------------------------------------------------
describe("dotAotBabel — plugin options", () => {
  it("respects custom functionNames", () => {
    const code = transform(`const s = css('p-4');`, { functionNames: ["css"] });
    expect(code).toContain("padding");
    expect(code).not.toContain("css('p-4')");
  });

  it("does not extract unlisted function names", () => {
    const code = transform(`const s = css('p-4');`, { functionNames: ["dot"] });
    // css() not in list — left as-is
    expect(code).toContain("css('p-4')");
  });

  it("respects default target from plugin options", () => {
    const code = transform(`const s = dot('p-4');`, { target: "native" });
    expect(code).toContain("16");
    expect(code).not.toContain('"16px"');
  });

  it("call-site target overrides plugin-level target", () => {
    // Plugin default: native, but call specifies web
    const code = transform(`const s = dot('p-4', { target: 'web' });`, {
      target: "native",
    });
    expect(code).toContain('"16px"');
  });

  it("supports multiple custom function names", () => {
    const code = transform(`const a = myDot('p-4');\nconst b = myCss('m-2');`, {
      functionNames: ["myDot", "myCss"],
    });
    expect(code).toContain("padding");
    expect(code).toContain("margin");
    expect(code).not.toContain("myDot(");
    expect(code).not.toContain("myCss(");
  });
});

// ---------------------------------------------------------------------------
// Edge cases — skip conditions
// ---------------------------------------------------------------------------
describe("dotAotBabel — skip conditions", () => {
  it("skips dot() with no arguments", () => {
    const code = transform(`const s = dot();`);
    expect(code).toContain("dot()");
  });

  it("skips dot() with non-string first argument (variable)", () => {
    const code = transform(`const s = dot(myVar);`);
    expect(code).toContain("dot(myVar)");
  });

  it("skips dot() with template literal argument", () => {
    // Template literals are not string literals in AST
    const code = transform("const s = dot(`p-4`);");
    expect(code).toContain("dot(");
  });

  it("leaves method calls alone (obj.dot)", () => {
    const code = transform(`const s = obj.dot('p-4');`);
    // Member expression callee — not matched by identifier check
    expect(code).toContain("obj.dot('p-4')");
  });

  it("handles empty string gracefully", () => {
    const code = transform(`const s = dot('');`);
    // Empty string produces empty object
    expect(code).toBeDefined();
    expect(code).not.toContain("dot('')");
  });
});

// ---------------------------------------------------------------------------
// valueToAst — AST node generation (verified via transform output)
// ---------------------------------------------------------------------------
describe("dotAotBabel — valueToAst round-trip", () => {
  it("generates valid JS for native (numeric) output", () => {
    const code = transform(`const s = dot('p-4 m-2', { target: 'native' });`);
    // Should be parseable valid JS
    const reparsed = babel.transformSync(code!, {
      configFile: false,
      babelrc: false,
    });
    expect(reparsed?.code).toBeDefined();
  });

  it("generates valid JS for flutter (nested object) output", () => {
    const code = transform(`const s = dot('p-4', { target: 'flutter' });`);
    expect(code).not.toContain("[object Object]");
    const reparsed = babel.transformSync(code!, {
      configFile: false,
      babelrc: false,
    });
    expect(reparsed?.code).toBeDefined();
  });

  it("generates valid JS for native transform array", () => {
    const code = transform(`const s = dot('rotate-45', { target: 'native' });`);
    expect(code).not.toContain("[object Object]");
    const reparsed = babel.transformSync(code!, {
      configFile: false,
      babelrc: false,
    });
    expect(reparsed?.code).toBeDefined();
  });
});
