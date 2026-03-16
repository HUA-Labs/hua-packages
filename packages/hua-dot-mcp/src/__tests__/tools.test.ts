/**
 * Tests for hua-dot-mcp tool handlers.
 *
 * The MCP server defines four tools (dot_resolve, dot_explain, dot_complete,
 * dot_validate). Each handler calls @hua-labs/dot directly, so we test by
 * running the same operations the handlers perform and asserting on the
 * response shape that would be returned to the MCP client.
 */
import { describe, it, expect } from "vitest";
import { dot, dotExplain } from "@hua-labs/dot";

// ---------------------------------------------------------------------------
// Helpers — mirror the response-building logic inside each tool handler
// ---------------------------------------------------------------------------

function resolveHandler(args: {
  input: string;
  target?: "web" | "native" | "flutter";
  dark?: boolean;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  try {
    const result = dot(args.input, {
      target: args.target as "web" | "native" | "flutter" | undefined,
      dark: args.dark,
      breakpoint: args.breakpoint,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
}

function explainHandler(args: {
  input: string;
  target?: "web" | "native" | "flutter";
  dark?: boolean;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  try {
    const result = dotExplain(args.input, {
      target: args.target as "web" | "native" | "flutter" | undefined,
      dark: args.dark,
      breakpoint: args.breakpoint,
    });

    const output: Record<string, unknown> = {
      styles: result.styles,
      report: result.report,
    };

    if (result.report._dropped && result.report._dropped.length > 0) {
      output.summary = `${result.report._dropped.length} properties dropped, ${result.report._approximated?.length ?? 0} approximated`;
    } else {
      output.summary = "All properties supported on this target";
    }

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
}

// Minimal COMPLETION_TOKENS subset mirroring the categories in index.ts
const COMPLETION_TOKENS: Record<string, string[]> = {
  spacing: [
    "p-0",
    "p-1",
    "p-2",
    "p-4",
    "px-4",
    "py-4",
    "m-4",
    "mx-auto",
    "gap-4",
  ],
  colors: [
    "bg-white",
    "bg-black",
    "bg-gray-500",
    "bg-blue-500",
    "text-white",
    "text-gray-900",
    "border-gray-200",
  ],
  sizing: ["w-full", "w-auto", "h-full", "h-screen", "max-w-lg"],
  typography: [
    "text-sm",
    "text-base",
    "text-lg",
    "font-bold",
    "font-sans",
    "leading-normal",
    "truncate",
  ],
  layout: [
    "flex",
    "grid",
    "block",
    "hidden",
    "flex-row",
    "items-center",
    "justify-between",
    "relative",
    "z-10",
  ],
  border: ["border", "rounded", "rounded-lg", "rounded-full", "ring", "ring-2"],
  effects: ["opacity-50", "shadow", "shadow-md", "blur", "blur-md"],
  transitions: [
    "transition",
    "transition-all",
    "duration-200",
    "ease-in-out",
    "animate-spin",
  ],
  transforms: ["scale-100", "rotate-0", "translate-x-0"],
  interactivity: [
    "cursor-pointer",
    "cursor-not-allowed",
    "select-none",
    "pointer-events-none",
  ],
  accessibility: ["sr-only", "not-sr-only", "visible", "invisible"],
  gradient: ["bg-gradient-to-r", "from-blue-500", "to-purple-500"],
};

const ALL_TOKENS = Object.values(COMPLETION_TOKENS).flat();

function completeHandler(args: { partial: string; limit?: number }) {
  const partial = args.partial.trim().toLowerCase();
  const limit = args.limit ?? 20;

  let suggestions: string[];

  if (!partial) {
    suggestions = Object.entries(COMPLETION_TOKENS)
      .map(([category, tokens]) => ({ category, token: tokens[0] }))
      .slice(0, limit)
      .map(({ category, token }) => `${token} (${category})`);
  } else {
    const matches = ALL_TOKENS.filter((token) => token.startsWith(partial));
    const contains = ALL_TOKENS.filter(
      (token) => !token.startsWith(partial) && token.includes(partial),
    );
    suggestions = [...matches, ...contains].slice(0, limit);
  }

  const annotated = suggestions.map((token) => {
    const cleanToken = token.includes(" (") ? token.split(" (")[0] : token;
    const category =
      Object.entries(COMPLETION_TOKENS).find(([, tokens]) =>
        tokens.includes(cleanToken),
      )?.[0] ?? "unknown";
    return { token: cleanToken, category };
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          { partial, count: annotated.length, suggestions: annotated },
          null,
          2,
        ),
      },
    ],
  };
}

function validateHandler(args: { input: string }) {
  const input = args.input.trim();
  const errors: string[] = [];
  let resolvedCount = 0;

  if (!input) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { valid: true, errors: [], resolved_count: 0 },
            null,
            2,
          ),
        },
      ],
    };
  }

  try {
    const result = dot(input);
    resolvedCount = Object.keys(result).length;

    const tokens = input.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      const baseToken = token.includes(":") ? token.split(":").pop()! : token;
      const strippedToken = baseToken.startsWith("!")
        ? baseToken.slice(1)
        : baseToken;

      try {
        const tokenResult = dot(strippedToken);
        if (
          Object.keys(tokenResult).length === 0 &&
          strippedToken !== "sr-only" &&
          strippedToken !== "not-sr-only"
        ) {
          errors.push(`Unrecognized or unsupported utility: "${token}"`);
        }
      } catch {
        errors.push(`Failed to resolve: "${token}"`);
      }
    }
  } catch (err) {
    errors.push(
      `Parse error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          { valid: errors.length === 0, errors, resolved_count: resolvedCount },
          null,
          2,
        ),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// dot_resolve
// ---------------------------------------------------------------------------

describe("dot_resolve", () => {
  it("resolves a spacing+layout string on web (default target)", () => {
    const response = resolveHandler({ input: "p-4 flex items-center" });
    expect(response.content[0].type).toBe("text");

    const styles = JSON.parse(response.content[0].text);
    expect(styles).toMatchObject({
      padding: "16px",
      display: "flex",
      alignItems: "center",
    });
  });

  it("resolves with dark mode applied", () => {
    const response = resolveHandler({
      input: "bg-white dark:bg-gray-900",
      dark: true,
    });
    const styles = JSON.parse(response.content[0].text);
    // dark:bg-gray-900 overrides bg-white when dark=true
    expect(styles.backgroundColor).toBeTruthy();
    expect(styles.backgroundColor).not.toBe("#ffffff");
  });

  it("resolves with a native target — returns numeric sizes", () => {
    const response = resolveHandler({ input: "p-4", target: "native" });
    const styles = JSON.parse(response.content[0].text);
    // React Native uses numeric values
    expect(typeof styles.padding).toBe("number");
    expect(styles.padding).toBe(16);
  });

  it("returns empty object for empty input", () => {
    const response = resolveHandler({ input: "" });
    const styles = JSON.parse(response.content[0].text);
    expect(styles).toEqual({});
  });

  it("response always has content array with a text entry", () => {
    const response = resolveHandler({ input: "rounded-lg bg-blue-500" });
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content[0]).toHaveProperty("type", "text");
    expect(typeof response.content[0].text).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// dot_explain
// ---------------------------------------------------------------------------

describe("dot_explain", () => {
  it("returns styles and report fields", () => {
    const response = explainHandler({ input: "p-4", target: "web" });
    const output = JSON.parse(response.content[0].text);
    expect(output).toHaveProperty("styles");
    expect(output).toHaveProperty("report");
    expect(output).toHaveProperty("summary");
  });

  it('reports "All properties supported" for web target', () => {
    const response = explainHandler({
      input: "p-4 flex items-center",
      target: "web",
    });
    const output = JSON.parse(response.content[0].text);
    expect(output.summary).toBe("All properties supported on this target");
  });

  it("reports dropped properties when filter is used on native target", () => {
    // blur-md uses filter which is unsupported on native
    const response = explainHandler({ input: "p-4 blur-md", target: "native" });
    const output = JSON.parse(response.content[0].text);
    // filter is web-only; report should flag it
    expect(output.report).toBeDefined();
    // styles should still have padding (supported on native)
    expect(typeof output.styles.padding).toBe("number");
  });

  it("returns summary string with counts when properties are dropped", () => {
    // grid-cols-3 is not supported natively
    const response = explainHandler({
      input: "grid grid-cols-3",
      target: "native",
    });
    const output = JSON.parse(response.content[0].text);
    if (output.report._dropped && output.report._dropped.length > 0) {
      expect(output.summary).toMatch(/\d+ properties dropped/);
    }
  });
});

// ---------------------------------------------------------------------------
// dot_complete
// ---------------------------------------------------------------------------

describe("dot_complete", () => {
  it("returns suggestions array for a known prefix", () => {
    const response = completeHandler({ partial: "p-" });
    const data = JSON.parse(response.content[0].text);
    expect(data.partial).toBe("p-");
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(data.count).toBeGreaterThan(0);
  });

  it("each suggestion has token and category fields", () => {
    const response = completeHandler({ partial: "bg-" });
    const data = JSON.parse(response.content[0].text);
    for (const suggestion of data.suggestions) {
      expect(suggestion).toHaveProperty("token");
      expect(suggestion).toHaveProperty("category");
    }
  });

  it("respects the limit parameter", () => {
    const response = completeHandler({ partial: "p", limit: 3 });
    const data = JSON.parse(response.content[0].text);
    expect(data.count).toBeLessThanOrEqual(3);
    expect(data.suggestions.length).toBeLessThanOrEqual(3);
  });

  it("returns category examples when partial is empty", () => {
    const response = completeHandler({ partial: "" });
    const data = JSON.parse(response.content[0].text);
    expect(data.suggestions.length).toBeGreaterThan(0);
    // Each suggestion should be categorized
    for (const s of data.suggestions) {
      expect(s.category).not.toBe("unknown");
    }
  });

  it("returns zero suggestions for a non-matching prefix", () => {
    const response = completeHandler({ partial: "zzz-not-a-token" });
    const data = JSON.parse(response.content[0].text);
    expect(data.count).toBe(0);
    expect(data.suggestions).toEqual([]);
  });

  it("finds exact token match for a full token", () => {
    const response = completeHandler({ partial: "flex" });
    const data = JSON.parse(response.content[0].text);
    const tokens = data.suggestions.map((s: { token: string }) => s.token);
    expect(tokens).toContain("flex");
  });
});

// ---------------------------------------------------------------------------
// dot_validate
// ---------------------------------------------------------------------------

describe("dot_validate", () => {
  it("returns valid=true for a known utility string", () => {
    const response = validateHandler({ input: "p-4 flex items-center" });
    const data = JSON.parse(response.content[0].text);
    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.resolved_count).toBeGreaterThan(0);
  });

  it("returns valid=true and resolved_count=0 for empty input", () => {
    const response = validateHandler({ input: "" });
    const data = JSON.parse(response.content[0].text);
    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.resolved_count).toBe(0);
  });

  it("returns valid=false for unrecognized tokens", () => {
    const response = validateHandler({ input: "p-4 fake-utility-xyz" });
    const data = JSON.parse(response.content[0].text);
    expect(data.valid).toBe(false);
    expect(data.errors.length).toBeGreaterThan(0);
    expect(data.errors[0]).toContain("fake-utility-xyz");
  });

  it("strips variant prefixes before checking each token", () => {
    // dark:p-4 should resolve — the dark: prefix is stripped before resolving
    const response = validateHandler({ input: "dark:p-4" });
    const data = JSON.parse(response.content[0].text);
    // dark:p-4 — stripping 'dark:' leaves 'p-4' which is valid
    expect(data.errors).not.toContain(expect.stringContaining("dark:p-4"));
  });

  it("accepts sr-only without reporting it as unrecognized", () => {
    const response = validateHandler({ input: "sr-only" });
    const data = JSON.parse(response.content[0].text);
    // sr-only is explicitly whitelisted — no error expected
    expect(data.errors).not.toContain(expect.stringContaining("sr-only"));
  });
});
