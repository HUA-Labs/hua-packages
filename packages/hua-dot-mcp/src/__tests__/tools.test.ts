/**
 * Tests for hua-dot-mcp tool handlers.
 *
 * The MCP server defines four tools (dot_resolve, dot_explain, dot_complete,
 * dot_validate). Each handler calls @hua-labs/dot directly, so we test by
 * running the same operations the handlers perform and asserting on the
 * response shape that would be returned to the MCP client.
 */
import { describe, it, expect } from "vitest";
import { dot, dotExplain, getDotAxCatalog } from "@hua-labs/dot";
import { buildDotCapabilitiesResponse } from "../capabilities";

type Target = "web" | "native" | "flutter";
type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";
const GRADIENT_DIRECTION_VALUES = new Set([
  "r",
  "l",
  "t",
  "b",
  "tr",
  "tl",
  "br",
  "bl",
]);

type ExplainParityCase = {
  name: string;
  input: string;
  target: Target;
  present?: string[];
  dropped?: string[];
  approximated?: string[];
  capabilities?: Record<string, string>;
};

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (
      current &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, value);
}

function isGradientToken(token: string): boolean {
  return (
    token.startsWith("bg-gradient-to-") ||
    token.startsWith("from-") ||
    token.startsWith("via-") ||
    token.startsWith("to-")
  );
}

function isGradientPositionToken(token: string): boolean {
  const value = token.slice(token.indexOf("-") + 1);
  if (value.endsWith("%")) return true;
  return value.startsWith("[") && value.endsWith("%]");
}

function hasDifferentBackgroundImage(input: string, baseline: string): boolean {
  const result = dot(input) as Record<string, unknown>;
  const baselineResult = dot(baseline) as Record<string, unknown>;
  return result.backgroundImage !== baselineResult.backgroundImage;
}

function isRecognizedGradientToken(token: string): boolean {
  if (token.startsWith("bg-gradient-to-")) {
    return GRADIENT_DIRECTION_VALUES.has(token.slice("bg-gradient-to-".length));
  }

  if (token.startsWith("from-")) {
    return isGradientPositionToken(token)
      ? hasDifferentBackgroundImage(
          `bg-gradient-to-r from-red-500 ${token} to-blue-500`,
          "bg-gradient-to-r from-red-500 to-blue-500",
        )
      : hasDifferentBackgroundImage(
          `bg-gradient-to-r ${token} to-blue-500`,
          "bg-gradient-to-r to-blue-500",
        );
  }

  if (token.startsWith("via-")) {
    return isGradientPositionToken(token)
      ? hasDifferentBackgroundImage(
          `bg-gradient-to-r from-red-500 via-yellow-500 ${token} to-blue-500`,
          "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500",
        )
      : hasDifferentBackgroundImage(
          `bg-gradient-to-r from-red-500 ${token} to-blue-500`,
          "bg-gradient-to-r from-red-500 to-blue-500",
        );
  }

  if (token.startsWith("to-")) {
    return isGradientPositionToken(token)
      ? hasDifferentBackgroundImage(
          `bg-gradient-to-r from-red-500 to-blue-500 ${token}`,
          "bg-gradient-to-r from-red-500 to-blue-500",
        )
      : hasDifferentBackgroundImage(
          `bg-gradient-to-r from-red-500 ${token}`,
          "bg-gradient-to-r from-red-500",
        );
  }

  return false;
}

function hasAggregateGradientEvidence(
  input: string,
  options: {
    target?: Target;
    dark?: boolean;
    breakpoint?: Breakpoint;
  },
): boolean {
  const styles = dot(input, options);
  const decoration = (styles as Record<string, unknown>).decoration;
  const hasGradientDecoration =
    decoration && typeof decoration === "object" && "gradient" in decoration;
  if (
    "backgroundImage" in styles ||
    hasGradientDecoration ||
    (
      (styles as Record<string, unknown>)._dropped as string[] | undefined
    )?.includes("backgroundImage")
  ) {
    return true;
  }

  if (!options.target) return false;

  const explain = dotExplain(
    input,
    options as typeof options & {
      target: Target;
    },
  );
  return Boolean(
    explain.report._dropped?.includes("backgroundImage") ||
    explain.report._approximated?.includes("backgroundImage") ||
    explain.report._capabilities?.backgroundImage,
  );
}

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

    const droppedCount = result.report._dropped?.length ?? 0;
    const approximatedCount = result.report._approximated?.length ?? 0;
    if (droppedCount > 0 || approximatedCount > 0) {
      output.summary = `${droppedCount} properties dropped, ${approximatedCount} approximated`;
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

function validateHandler(args: {
  input: string;
  target?: "web" | "native" | "flutter";
  dark?: boolean;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
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
    const targetOptions = {
      target: args.target as "web" | "native" | "flutter" | undefined,
      dark: args.dark,
      breakpoint: args.breakpoint,
    };
    const result = dot(input, targetOptions);
    resolvedCount = Object.keys(result).length;
    const hasGradientEvidence = hasAggregateGradientEvidence(
      input,
      targetOptions,
    );

    const tokens = input.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      const baseToken = token.includes(":") ? token.split(":").pop()! : token;
      const strippedToken = baseToken.startsWith("!")
        ? baseToken.slice(1)
        : baseToken;
      if (
        hasGradientEvidence &&
        isGradientToken(strippedToken) &&
        isRecognizedGradientToken(strippedToken)
      ) {
        continue;
      }

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

  const output: Record<string, unknown> = {
    valid: errors.length === 0,
    errors,
    resolved_count: resolvedCount,
  };

  if (args.target) {
    const explain = dotExplain(input, {
      target: args.target,
      dark: args.dark,
      breakpoint: args.breakpoint,
    });
    const droppedCount = explain.report._dropped?.length ?? 0;
    const approximatedCount = explain.report._approximated?.length ?? 0;

    output.report = explain.report;
    output.summary =
      droppedCount > 0 || approximatedCount > 0
        ? `${droppedCount} properties dropped, ${approximatedCount} approximated`
        : "All properties supported on this target";
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(output, null, 2),
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

  it("keeps target caveats out of the default response shape", () => {
    const response = resolveHandler({
      input: "p-4 blur-md",
      target: "native",
    });
    const styles = JSON.parse(response.content[0].text);

    expect(styles.padding).toBe(16);
    expect(styles.filter).toBeUndefined();
    expect(styles.report).toBeUndefined();
    expect(styles.summary).toBeUndefined();
    expect(styles.styles).toBeUndefined();
  });

  it("leaves flutter capability notes to explain and validate", () => {
    const response = resolveHandler({
      input: "relative",
      target: "flutter",
    });
    const styles = JSON.parse(response.content[0].text);

    expect(styles.position).toBeUndefined();
    expect(styles.report).toBeUndefined();
    expect(styles.summary).toBeUndefined();
    expect(styles.styles).toBeUndefined();
  });

  it("uses dot_explain and target dot_validate as the caveat-bearing paths", () => {
    const input = "p-4 blur-md";
    const resolveResponse = resolveHandler({ input, target: "native" });
    const explainResponse = explainHandler({ input, target: "native" });
    const validateResponse = validateHandler({ input, target: "native" });

    const resolved = JSON.parse(resolveResponse.content[0].text);
    const explained = JSON.parse(explainResponse.content[0].text);
    const validated = JSON.parse(validateResponse.content[0].text);

    expect(resolved.padding).toBe(16);
    expect(resolved.report).toBeUndefined();
    expect(explained.styles).toEqual(resolved);
    expect(explained.report._dropped).toContain("filter");
    expect(explained.report._capabilities.filter).toBe("unsupported");
    expect(validated.valid).toBe(true);
    expect(validated.report).toEqual(explained.report);
    expect(validated.summary).toBe(explained.summary);
  });
});

// ---------------------------------------------------------------------------
// dot_explain
// ---------------------------------------------------------------------------

describe("dot_explain", () => {
  const parityCases: ExplainParityCase[] = [
    {
      name: "web gradient output",
      input: "p-4 bg-gradient-to-r from-red-500 to-blue-500",
      target: "web",
      present: ["padding", "backgroundImage"],
    },
    {
      name: "web gradient stop position output",
      input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
      target: "web",
      present: ["backgroundImage"],
    },
    {
      name: "native unsupported composed gradient drop",
      input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
      target: "native",
      dropped: ["backgroundImage"],
      capabilities: { backgroundImage: "unsupported" },
    },
    {
      name: "native renderable shadow approximation",
      input: "shadow-xl ring-2",
      target: "native",
      present: ["shadowColor", "shadowOffset", "shadowOpacity", "elevation"],
      approximated: ["boxShadow"],
      capabilities: { boxShadow: "approximate" },
    },
    {
      name: "native unsupported ring-only drop",
      input: "ring-2",
      target: "native",
      dropped: ["boxShadow"],
      capabilities: { boxShadow: "unsupported" },
    },
    {
      name: "native arbitrary var() shadow drop",
      input: "shadow-[0_4px_6px_var(--shadow-color)]",
      target: "native",
      dropped: ["boxShadow"],
      capabilities: { boxShadow: "unsupported" },
    },
    {
      name: "native unsupported filter drop",
      input: "p-4 blur-md",
      target: "native",
      present: ["padding"],
      dropped: ["filter"],
      capabilities: { filter: "unsupported" },
    },
    {
      name: "native unsupported backdrop filter drop",
      input: "p-4 backdrop-blur-md",
      target: "native",
      present: ["padding"],
      dropped: ["backdropFilter"],
      capabilities: { backdropFilter: "unsupported" },
    },
    {
      name: "flutter gradient recipe",
      input: "bg-gradient-to-r from-red-500 to-blue-500",
      target: "flutter",
      present: ["decoration.gradient"],
      capabilities: { backgroundImage: "recipe-only" },
    },
    {
      name: "flutter gradient stop position recipe",
      input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
      target: "flutter",
      present: ["decoration.gradient.colors", "decoration.gradient.stops"],
      capabilities: { backgroundImage: "recipe-only" },
    },
    {
      name: "flutter unsupported CSS variable gradient stop drop",
      input: "bg-gradient-to-r from-[#ff0000] to-[var(--color-brand)]",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["backgroundImage"],
      capabilities: { backgroundImage: "unsupported" },
    },
    {
      name: "flutter adapter-dropped filter evidence",
      input: "blur-md",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["filter"],
      capabilities: { filter: "plugin-backed" },
    },
    {
      name: "flutter adapter-dropped backdrop filter evidence",
      input: "backdrop-blur-md",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["backdropFilter"],
      capabilities: { backdropFilter: "plugin-backed" },
    },
    {
      name: "web overflow object-fit output",
      input: "overflow-hidden object-cover",
      target: "web",
      present: ["overflow", "objectFit"],
    },
    {
      name: "native object-fit resizeMode approximation",
      input: "overflow-hidden object-cover",
      target: "native",
      present: ["overflow", "resizeMode"],
      approximated: ["objectFit"],
      capabilities: { objectFit: "approximate" },
    },
    {
      name: "flutter object-fit recipe-only drop",
      input: "object-cover",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["objectFit"],
      capabilities: { objectFit: "recipe-only" },
    },
    {
      name: "web object-position output",
      input: "object-left-bottom",
      target: "web",
      present: ["objectPosition"],
    },
    {
      name: "native unsupported object-position drop",
      input: "object-center",
      target: "native",
      dropped: ["objectPosition"],
      capabilities: { objectPosition: "unsupported" },
    },
    {
      name: "flutter unsupported object-position drop",
      input: "object-center",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["objectPosition"],
      capabilities: { objectPosition: "unsupported" },
    },
    {
      name: "web overflow axis output",
      input: "overflow-x-auto overflow-y-hidden",
      target: "web",
      present: ["overflowX", "overflowY"],
    },
    {
      name: "native unsupported overflow axis drop",
      input: "overflow-x-auto overflow-y-hidden",
      target: "native",
      dropped: ["overflowX", "overflowY"],
      capabilities: {
        overflowX: "unsupported",
        overflowY: "unsupported",
      },
    },
    {
      name: "flutter unsupported overflow axis drop",
      input: "overflow-x-auto overflow-y-hidden",
      target: "flutter",
      dropped: ["overflowX", "overflowY"],
      capabilities: {
        overflowX: "unsupported",
        overflowY: "unsupported",
      },
    },
    {
      name: "web scroll output",
      input: "scroll-smooth scroll-mt-4 scroll-px-2",
      target: "web",
      present: [
        "scrollBehavior",
        "scrollMarginTop",
        "scrollPaddingLeft",
        "scrollPaddingRight",
      ],
    },
    {
      name: "native unsupported scroll drop",
      input: "scroll-smooth scroll-mt-4 scroll-px-2",
      target: "native",
      dropped: [
        "scrollBehavior",
        "scrollMarginTop",
        "scrollPaddingLeft",
        "scrollPaddingRight",
      ],
      capabilities: {
        scrollBehavior: "unsupported",
        scrollMarginTop: "unsupported",
        scrollPaddingLeft: "unsupported",
        scrollPaddingRight: "unsupported",
      },
    },
    {
      name: "flutter unsupported scroll drop",
      input: "scroll-smooth scroll-mt-4 scroll-px-2",
      target: "flutter",
      present: ["_dropped"],
      dropped: [
        "scrollBehavior",
        "scrollMarginTop",
        "scrollPaddingLeft",
        "scrollPaddingRight",
      ],
      capabilities: {
        scrollBehavior: "unsupported",
        scrollMarginTop: "unsupported",
        scrollPaddingLeft: "unsupported",
        scrollPaddingRight: "unsupported",
      },
    },
    {
      name: "web transition output",
      input: "transition-all duration-300 ease-in-out",
      target: "web",
      present: [
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ],
    },
    {
      name: "native unsupported transition drop",
      input: "transition-all duration-300 ease-in-out",
      target: "native",
      dropped: [
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ],
      capabilities: {
        transitionProperty: "unsupported",
        transitionDuration: "unsupported",
        transitionTimingFunction: "unsupported",
      },
    },
    {
      name: "flutter unsupported transition drop",
      input: "transition-all duration-300 ease-in-out",
      target: "flutter",
      present: ["_dropped"],
      dropped: [
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ],
      capabilities: {
        transitionProperty: "unsupported",
        transitionDuration: "unsupported",
        transitionTimingFunction: "unsupported",
      },
    },
    {
      name: "web animation output",
      input: "animate-spin",
      target: "web",
      present: ["animation"],
    },
    {
      name: "native unsupported animation drop",
      input: "animate-spin",
      target: "native",
      dropped: ["animation"],
      capabilities: { animation: "unsupported" },
    },
    {
      name: "flutter unsupported animation drop",
      input: "animate-spin",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["animation"],
      capabilities: { animation: "unsupported" },
    },
    {
      name: "web animation composition output",
      input: "animate-in fade-in-50 zoom-in-95",
      target: "web",
      present: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-opacity",
        "--tw-enter-scale",
      ],
    },
    {
      name: "native unsupported animation composition drop",
      input: "animate-in fade-in-50 zoom-in-95",
      target: "native",
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-opacity",
        "--tw-enter-scale",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-enter-opacity": "unsupported",
        "--tw-enter-scale": "unsupported",
      },
    },
    {
      name: "flutter unsupported animation composition drop",
      input: "animate-in fade-in-50 zoom-in-95",
      target: "flutter",
      present: ["_dropped"],
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-opacity",
        "--tw-enter-scale",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-enter-opacity": "unsupported",
        "--tw-enter-scale": "unsupported",
      },
    },
    {
      name: "web animation exit composition output",
      input: "animate-out fade-out-0 zoom-out-95",
      target: "web",
      present: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-opacity",
        "--tw-exit-scale",
      ],
    },
    {
      name: "native unsupported animation exit composition drop",
      input: "animate-out fade-out-0 zoom-out-95",
      target: "native",
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-opacity",
        "--tw-exit-scale",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-exit-opacity": "unsupported",
        "--tw-exit-scale": "unsupported",
      },
    },
    {
      name: "flutter unsupported animation exit composition drop",
      input: "animate-out fade-out-0 zoom-out-95",
      target: "flutter",
      present: ["_dropped"],
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-opacity",
        "--tw-exit-scale",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-exit-opacity": "unsupported",
        "--tw-exit-scale": "unsupported",
      },
    },
    {
      name: "web animation enter slide composition output",
      input: "animate-in slide-in-from-top-2",
      target: "web",
      present: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-translate-y",
      ],
    },
    {
      name: "native unsupported animation enter slide composition drop",
      input: "animate-in slide-in-from-top-2",
      target: "native",
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-translate-y",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-enter-translate-y": "unsupported",
      },
    },
    {
      name: "flutter unsupported animation enter slide composition drop",
      input: "animate-in slide-in-from-top-2",
      target: "flutter",
      present: ["_dropped"],
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-translate-y",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-enter-translate-y": "unsupported",
      },
    },
    {
      name: "web animation exit slide composition output",
      input: "animate-out slide-out-to-right-2",
      target: "web",
      present: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-translate-x",
      ],
    },
    {
      name: "native unsupported animation exit slide composition drop",
      input: "animate-out slide-out-to-right-2",
      target: "native",
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-translate-x",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-exit-translate-x": "unsupported",
      },
    },
    {
      name: "flutter unsupported animation exit slide composition drop",
      input: "animate-out slide-out-to-right-2",
      target: "flutter",
      present: ["_dropped"],
      dropped: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-translate-x",
      ],
      capabilities: {
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-exit-translate-x": "unsupported",
      },
    },
    {
      name: "web grid output",
      input: "grid grid-cols-3 gap-4",
      target: "web",
      present: ["display", "gridTemplateColumns", "gap"],
    },
    {
      name: "native grid target caveats",
      input: "grid grid-cols-3 gap-4",
      target: "native",
      present: ["gap"],
      dropped: ["gridTemplateColumns"],
      approximated: ["display"],
      capabilities: {
        display: "approximate",
        gridTemplateColumns: "unsupported",
      },
    },
    {
      name: "native grid placement start/end target caveats",
      input:
        "grid grid-cols-3 gap-4 col-start-2 row-start-2 col-end-4 row-end-4",
      target: "native",
      present: ["gap"],
      dropped: [
        "gridTemplateColumns",
        "gridColumnStart",
        "gridRowStart",
        "gridColumnEnd",
        "gridRowEnd",
      ],
      approximated: ["display"],
      capabilities: {
        display: "approximate",
        gridTemplateColumns: "unsupported",
        gridColumnStart: "unsupported",
        gridRowStart: "unsupported",
        gridColumnEnd: "unsupported",
        gridRowEnd: "unsupported",
      },
    },
    {
      name: "native grid auto-flow target caveats",
      input: "grid grid-flow-col gap-4",
      target: "native",
      present: ["gap"],
      dropped: ["gridAutoFlow"],
      approximated: ["display"],
      capabilities: {
        display: "approximate",
        gridAutoFlow: "unsupported",
      },
    },
    {
      name: "native grid auto-track target caveats",
      input: "grid auto-cols-fr auto-rows-min gap-4",
      target: "native",
      present: ["gap"],
      dropped: ["gridAutoColumns", "gridAutoRows"],
      approximated: ["display"],
      capabilities: {
        display: "approximate",
        gridAutoColumns: "unsupported",
        gridAutoRows: "unsupported",
      },
    },
    {
      name: "native grid span target caveats",
      input: "grid grid-cols-3 gap-4 col-span-2 row-span-2",
      target: "native",
      present: ["gap"],
      dropped: ["gridTemplateColumns", "gridColumn", "gridRow"],
      approximated: ["display"],
      capabilities: {
        display: "approximate",
        gridTemplateColumns: "unsupported",
        gridColumn: "unsupported",
        gridRow: "unsupported",
      },
    },
    {
      name: "flutter grid recipe caveats",
      input: "grid grid-cols-3 gap-4",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["gridTemplateColumns"],
      approximated: ["display"],
      capabilities: {
        display: "approximate",
        gridTemplateColumns: "recipe-only",
      },
    },
    {
      name: "flutter transform recipe",
      input: "rotate-45 scale-110",
      target: "flutter",
      present: ["transform.rotate", "transform.scaleX", "transform.scaleY"],
    },
    {
      name: "web accumulated transform output",
      input: "rotate-45 scale-110 translate-x-4",
      target: "web",
      present: ["transform"],
    },
    {
      name: "native transform array output",
      input: "rotate-45 scale-110 translate-x-4",
      target: "native",
      present: [
        "transform.0.rotate",
        "transform.1.scale",
        "transform.2.translateX",
      ],
    },
    {
      name: "flutter transform origin recipe",
      input: "origin-top-left rotate-45 translate-y-2",
      target: "flutter",
      present: ["transform.origin", "transform.rotate", "transform.translateY"],
    },
    {
      name: "web typography output",
      input: "text-lg font-bold leading-7 tracking-wide italic text-center",
      target: "web",
      present: [
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
        "fontStyle",
        "textAlign",
      ],
    },
    {
      name: "native typography output",
      input: "text-lg font-bold leading-7 tracking-wide italic text-center",
      target: "native",
      present: [
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
        "fontStyle",
        "textAlign",
      ],
    },
    {
      name: "flutter text style typography output",
      input: "text-lg font-bold leading-7 tracking-wide italic text-center",
      target: "flutter",
      present: [
        "textStyle.fontSize",
        "textStyle.fontWeight",
        "textStyle.height",
        "textStyle.letterSpacing",
        "textStyle.fontStyle",
        "textStyle.textAlign",
      ],
    },
    {
      name: "web layout and positioning output",
      input: "flex flex-col items-center justify-between absolute top-4 left-0",
      target: "web",
      present: [
        "display",
        "flexDirection",
        "alignItems",
        "justifyContent",
        "position",
        "top",
        "left",
      ],
    },
    {
      name: "native layout and positioning output",
      input: "flex flex-col items-center justify-between absolute top-4 left-0",
      target: "native",
      present: [
        "display",
        "flexDirection",
        "alignItems",
        "justifyContent",
        "position",
        "top",
        "left",
      ],
    },
    {
      name: "flutter layout and positioning recipe",
      input: "flex flex-col items-center justify-between absolute top-4 left-0",
      target: "flutter",
      present: [
        "layout.direction",
        "layout.crossAxisAlignment",
        "layout.mainAxisAlignment",
        "positioning.type",
        "positioning.top",
        "positioning.left",
      ],
      capabilities: {
        position: "recipe-only",
        top: "recipe-only",
        left: "recipe-only",
      },
    },
    {
      name: "web sizing and dimensions output",
      input: "w-full h-full max-w-lg min-h-0",
      target: "web",
      present: ["width", "height", "maxWidth", "minHeight"],
    },
    {
      name: "native sizing and dimensions output",
      input: "w-full h-full max-w-lg min-h-0",
      target: "native",
      present: ["width", "height", "maxWidth", "minHeight"],
    },
    {
      name: "flutter sizing and dimensions constraints output",
      input: "w-full h-full max-w-lg min-h-0",
      target: "flutter",
      present: [
        "constraints.expandWidth",
        "constraints.expandHeight",
        "constraints.maxWidth",
        "constraints.minHeight",
      ],
    },
    {
      name: "web spacing and radius box-model output",
      input: "p-4 m-2 rounded-lg",
      target: "web",
      present: ["padding", "margin", "borderRadius"],
    },
    {
      name: "native spacing and radius box-model output",
      input: "p-4 m-2 rounded-lg",
      target: "native",
      present: ["padding", "margin", "borderRadius"],
    },
    {
      name: "flutter spacing and radius box-model recipe output",
      input: "p-4 m-2 rounded-lg",
      target: "flutter",
      present: [
        "padding.top",
        "padding.right",
        "padding.bottom",
        "padding.left",
        "margin.top",
        "margin.right",
        "margin.bottom",
        "margin.left",
        "decoration.borderRadius.topLeft",
        "decoration.borderRadius.topRight",
        "decoration.borderRadius.bottomLeft",
        "decoration.borderRadius.bottomRight",
      ],
    },
    {
      name: "web color and background output",
      input: "bg-red-500 text-white",
      target: "web",
      present: ["backgroundColor", "color"],
    },
    {
      name: "native color and background output",
      input: "bg-red-500 text-white",
      target: "native",
      present: ["backgroundColor", "color"],
    },
    {
      name: "flutter color and background recipe output",
      input: "bg-red-500 text-white",
      target: "flutter",
      present: ["decoration.color", "textStyle.color"],
    },
    {
      name: "web border output",
      input: "border-2 border-solid border-red-500",
      target: "web",
      present: ["borderWidth", "borderStyle", "borderColor"],
    },
    {
      name: "native border output",
      input: "border-2 border-solid border-red-500",
      target: "native",
      present: ["borderWidth", "borderStyle", "borderColor"],
    },
    {
      name: "flutter border decoration recipe output",
      input: "border-2 border-solid border-red-500",
      target: "flutter",
      present: [
        "decoration.border.width",
        "decoration.border.style",
        "decoration.border.color",
      ],
    },
    {
      name: "web aspect-ratio output",
      input: "aspect-video",
      target: "web",
      present: ["aspectRatio"],
    },
    {
      name: "native aspect-ratio output",
      input: "aspect-video",
      target: "native",
      present: ["aspectRatio"],
    },
    {
      name: "flutter aspect-ratio output",
      input: "aspect-video",
      target: "flutter",
      present: ["aspectRatio"],
    },
    {
      name: "web opacity and z-index output",
      input: "opacity-50 z-10",
      target: "web",
      present: ["opacity", "zIndex"],
    },
    {
      name: "native opacity and z-index output",
      input: "opacity-50 z-10",
      target: "native",
      present: ["opacity", "zIndex"],
    },
    {
      name: "flutter opacity output with approximate z-index caveat",
      input: "opacity-50 z-10",
      target: "flutter",
      present: ["opacity", "zIndex"],
      approximated: ["zIndex"],
      capabilities: { zIndex: "approximate" },
    },
    {
      name: "web interactivity output",
      input: "cursor-pointer select-none pointer-events-none",
      target: "web",
      present: ["cursor", "userSelect", "pointerEvents"],
    },
    {
      name: "native interactivity pointer events output with cursor/select drops",
      input: "cursor-pointer select-none pointer-events-none",
      target: "native",
      present: ["pointerEvents"],
      dropped: ["cursor", "userSelect"],
      capabilities: {
        cursor: "unsupported",
        userSelect: "unsupported",
      },
    },
    {
      name: "flutter interactivity unsupported drop evidence",
      input: "cursor-pointer select-none pointer-events-none",
      target: "flutter",
      present: ["_dropped"],
      dropped: ["cursor", "userSelect", "pointerEvents"],
      capabilities: {
        cursor: "unsupported",
        userSelect: "unsupported",
        pointerEvents: "unsupported",
      },
    },
  ];

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

  it.each(parityCases)("matches core dotExplain for $name", (testCase) => {
    const response = explainHandler({
      input: testCase.input,
      target: testCase.target,
    });
    const output = JSON.parse(response.content[0].text);
    const core = dotExplain(testCase.input, { target: testCase.target });

    expect(output.styles).toEqual(core.styles);
    expect(output.report).toEqual(core.report);

    for (const path of testCase.present ?? []) {
      expect(getPath(output.styles, path), path).toBeDefined();
    }

    for (const prop of testCase.dropped ?? []) {
      expect(output.report._dropped ?? []).toContain(prop);
    }

    for (const prop of testCase.approximated ?? []) {
      expect(output.report._approximated ?? []).toContain(prop);
    }

    for (const [prop, capability] of Object.entries(
      testCase.capabilities ?? {},
    )) {
      expect(output.report._capabilities?.[prop]).toBe(capability);
    }

    const droppedCount = core.report._dropped?.length ?? 0;
    const approximatedCount = core.report._approximated?.length ?? 0;
    if (droppedCount > 0 || approximatedCount > 0) {
      expect(output.summary).toBe(
        `${droppedCount} properties dropped, ${approximatedCount} approximated`,
      );
    } else {
      expect(output.summary).toBe("All properties supported on this target");
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
// dot_capabilities
// ---------------------------------------------------------------------------

describe("dot_capabilities", () => {
  it("returns a compact read-only projection of the dot AX catalog", () => {
    const response = buildDotCapabilitiesResponse();
    const catalog = getDotAxCatalog();

    expect(response.schemaVersion).toBe(catalog.schemaVersion);
    expect(response.sourcePackage).toBe(catalog.sourcePackage);
    expect(response.sourceExport).toBe("getDotAxCatalog");
    expect(response.totalEntries).toBe(catalog.entries.length);
    expect(response.count).toBeLessThanOrEqual(20);
    expect(response.entries.length).toBe(response.count);
    expect(response.entries[0]).not.toHaveProperty("properties");
    expect(response.entries[0]).not.toHaveProperty("examples");
    expect(response.entries[0]).not.toHaveProperty("composition");
  });

  it("filters support by target and level without executing dot()", () => {
    const response = buildDotCapabilitiesResponse({
      target: "native",
      level: "unsupported",
      limit: 100,
    });

    expect(response.count).toBeGreaterThan(0);
    for (const entry of response.entries) {
      expect(entry.support).toHaveProperty("target", "native");
      expect(entry.support).toHaveProperty("level", "unsupported");
    }
  });

  it("returns exact family details only when explicitly requested", () => {
    const response = buildDotCapabilitiesResponse({
      family: "gradient",
      includeExamples: true,
      includeProperties: true,
    });

    expect(response.totalMatches).toBe(1);
    expect(response.entries).toHaveLength(1);
    expect(response.entries[0]).toMatchObject({
      id: "gradient",
      category: "color",
    });
    expect(response.entries[0].examples).toContain("bg-gradient-to-r");
    expect(response.entries[0].properties).toContain("backgroundImage");
    expect(response.entries[0]).not.toHaveProperty("composition");
  });

  it("returns ring composition metadata only when explicitly requested", () => {
    const compact = buildDotCapabilitiesResponse({ family: "ring" });
    const detailed = buildDotCapabilitiesResponse({
      family: "ring",
      includeComposition: true,
    });

    expect(compact.totalMatches).toBe(1);
    expect(compact.entries[0]).not.toHaveProperty("composition");
    expect(detailed.totalMatches).toBe(1);
    expect(detailed.entries[0]).toMatchObject({
      id: "ring",
      composition: {
        kind: "finalized-style",
        markers: ["__dot_ringLayer"],
        outputProperties: ["boxShadow"],
      },
    });
    expect(detailed.entries[0].composition?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("final boxShadow composition"),
      ]),
    );
  });

  it("returns divide composition separately from property details", () => {
    const response = buildDotCapabilitiesResponse({
      family: "divide",
      includeComposition: true,
    });

    expect(response.totalMatches).toBe(1);
    expect(response.entries[0]).not.toHaveProperty("properties");
    expect(response.entries[0].composition).toMatchObject({
      kind: "class-child-selector",
      markers: [
        "__dot_divideX",
        "__dot_divideXReverse",
        "__dot_divideY",
        "__dot_divideYReverse",
      ],
      outputProperties: expect.arrayContaining([
        "borderBottomWidth",
        "borderColor",
        "borderLeftWidth",
        "borderRightWidth",
        "borderStyle",
        "borderTopWidth",
      ]),
    });
  });

  it("matches any target row when level is provided without target", () => {
    const response = buildDotCapabilitiesResponse({
      level: "plugin-backed",
      limit: 100,
    });

    expect(response.count).toBeGreaterThan(0);
    for (const entry of response.entries) {
      expect(Object.values(entry.support)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ level: "plugin-backed" }),
        ]),
      );
    }
  });

  it("limits and reports truncation deterministically", () => {
    const response = buildDotCapabilitiesResponse({
      category: "layout",
      limit: 2,
    });

    expect(response.count).toBe(2);
    expect(response.totalMatches).toBeGreaterThan(2);
    expect(response.truncated).toBe(true);
    expect(response.entries.map((entry) => entry.id)).toEqual(
      getDotAxCatalog()
        .entries.filter((entry) => entry.category === "layout")
        .slice(0, 2)
        .map((entry) => entry.id),
    );
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
    expect(data.report).toBeUndefined();
    expect(data.summary).toBeUndefined();
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

  it("validates composed web gradients as aggregate utilities", () => {
    const input =
      "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500";
    const response = validateHandler({ input });
    const data = JSON.parse(response.content[0].text);

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.resolved_count).toBeGreaterThan(0);
    expect(data.report).toBeUndefined();
    expect(data.summary).toBeUndefined();
  });

  it("does not let unrelated flutter decoration hide invalid gradient tokens", () => {
    const response = validateHandler({
      input: "rounded-md from-not-a-color",
      target: "flutter",
    });
    const data = JSON.parse(response.content[0].text);

    expect(data.valid).toBe(false);
    expect(data.errors).toEqual([
      'Unrecognized or unsupported utility: "from-not-a-color"',
    ]);
  });

  it("does not let aggregate gradients hide malformed color stops", () => {
    const response = validateHandler({
      input: "bg-gradient-to-r from-not-a-color to-blue-500",
    });
    const data = JSON.parse(response.content[0].text);

    expect(data.valid).toBe(false);
    expect(data.errors).toEqual([
      'Unrecognized or unsupported utility: "from-not-a-color"',
    ]);
  });

  it("does not let valid gradient stops hide later malformed gradient fragments", () => {
    const response = validateHandler({
      input: "bg-gradient-to-r from-red-500 to-blue-500 from-not-a-color",
    });
    const data = JSON.parse(response.content[0].text);

    expect(data.valid).toBe(false);
    expect(data.errors).toEqual([
      'Unrecognized or unsupported utility: "from-not-a-color"',
    ]);
  });

  it("does not let color stops hide malformed gradient directions", () => {
    const response = validateHandler({
      input: "bg-gradient-to-z from-red-500 to-blue-500",
    });
    const data = JSON.parse(response.content[0].text);

    expect(data.valid).toBe(false);
    expect(data.errors).toEqual([
      'Unrecognized or unsupported utility: "bg-gradient-to-z"',
    ]);
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

  it("includes target caveats for native validation without making recognized tokens invalid", () => {
    const response = validateHandler({
      input: "p-4 blur-md",
      target: "native",
    });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain("p-4 blur-md", { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toContain("filter");
    expect(data.report._capabilities.filter).toBe("unsupported");
    expect(data.summary).toBe("1 properties dropped, 0 approximated");
  });

  it("includes recipe-only capabilities for flutter validation", () => {
    const input = "relative";
    const response = validateHandler({ input, target: "flutter" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "flutter" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._capabilities.position).toBe("recipe-only");
    expect(data.summary).toBe("All properties supported on this target");
  });

  it("includes plugin-backed backdrop filter caveats for flutter validation", () => {
    const input = "backdrop-blur-md";
    const response = validateHandler({ input, target: "flutter" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "flutter" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toContain("backdropFilter");
    expect(data.report._capabilities.backdropFilter).toBe("plugin-backed");
    expect(data.summary).toBe("1 properties dropped, 0 approximated");
  });

  it("includes native composed gradient drop caveats for target validation", () => {
    const input =
      "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500";
    const response = validateHandler({ input, target: "native" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toContain("backgroundImage");
    expect(data.report._capabilities.backgroundImage).toBe("unsupported");
    expect(data.summary).toBe("1 properties dropped, 0 approximated");
  });

  it("keeps malformed gradient stops invalid during target validation", () => {
    const input = "bg-gradient-to-r from-not-a-color to-blue-500";
    for (const target of ["native", "flutter"] as const) {
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);

      expect(data.valid).toBe(false);
      expect(data.errors).toEqual([
        'Unrecognized or unsupported utility: "from-not-a-color"',
      ]);
      expect(data.report).toEqual(dotExplain(input, { target }).report);
    }
  });

  it("keeps malformed gradient directions invalid during target validation", () => {
    const input = "bg-gradient-to-z from-red-500 to-blue-500";
    for (const target of ["native", "flutter"] as const) {
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);

      expect(data.valid).toBe(false);
      expect(data.errors).toEqual([
        'Unrecognized or unsupported utility: "bg-gradient-to-z"',
      ]);
      expect(data.report).toEqual(dotExplain(input, { target }).report);
    }
  });

  it("keeps native object-fit valid while reporting resizeMode approximation", () => {
    const input = "overflow-hidden object-cover";
    const response = validateHandler({ input, target: "native" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._approximated).toContain("objectFit");
    expect(data.report._capabilities.objectFit).toBe("approximate");
    expect(data.summary).toBe("0 properties dropped, 1 approximated");
  });

  it("keeps flutter object-fit valid while reporting recipe-only drop", () => {
    const input = "object-cover";
    const response = validateHandler({ input, target: "flutter" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "flutter" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toContain("objectFit");
    expect(data.report._capabilities.objectFit).toBe("recipe-only");
    expect(data.summary).toBe("1 properties dropped, 0 approximated");
  });

  it("keeps native object-position valid while reporting unsupported drop", () => {
    const input = "object-center";
    const response = validateHandler({ input, target: "native" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toContain("objectPosition");
    expect(data.report._capabilities.objectPosition).toBe("unsupported");
    expect(data.summary).toBe("1 properties dropped, 0 approximated");
  });

  it("keeps flutter object-position valid while reporting unsupported drop", () => {
    const input = "object-center";
    const response = validateHandler({ input, target: "flutter" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "flutter" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toContain("objectPosition");
    expect(data.report._capabilities.objectPosition).toBe("unsupported");
    expect(data.summary).toBe("1 properties dropped, 0 approximated");
  });

  it("keeps web overflow axis utilities caveat-free during target validation", () => {
    const input = "overflow-x-auto overflow-y-hidden";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps overflow axis utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "overflow-x-auto overflow-y-hidden";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual(["overflowX", "overflowY"]);
      expect(data.report._capabilities).toMatchObject({
        overflowX: "unsupported",
        overflowY: "unsupported",
      });
      expect(data.summary).toBe("2 properties dropped, 0 approximated");
    },
  );

  it("keeps web scroll utilities caveat-free during target validation", () => {
    const input = "scroll-smooth scroll-mt-4 scroll-px-2";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps scroll utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "scroll-smooth scroll-mt-4 scroll-px-2";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual([
        "scrollBehavior",
        "scrollMarginTop",
        "scrollPaddingLeft",
        "scrollPaddingRight",
      ]);
      expect(data.report._capabilities).toMatchObject({
        scrollBehavior: "unsupported",
        scrollMarginTop: "unsupported",
        scrollPaddingLeft: "unsupported",
        scrollPaddingRight: "unsupported",
      });
      expect(data.summary).toBe("4 properties dropped, 0 approximated");
    },
  );

  it("keeps web transition utilities caveat-free during target validation", () => {
    const input = "transition-all duration-300 ease-in-out";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps transition utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "transition-all duration-300 ease-in-out";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual([
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ]);
      expect(data.report._capabilities).toMatchObject({
        transitionProperty: "unsupported",
        transitionDuration: "unsupported",
        transitionTimingFunction: "unsupported",
      });
      expect(data.summary).toBe("3 properties dropped, 0 approximated");
    },
  );

  it("keeps web animation utilities caveat-free during target validation", () => {
    const input = "animate-spin";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps animation utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "animate-spin";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual(["animation"]);
      expect(data.report._capabilities).toMatchObject({
        animation: "unsupported",
      });
      expect(data.summary).toBe("1 properties dropped, 0 approximated");
    },
  );

  it("keeps web animation composition utilities caveat-free during target validation", () => {
    const input = "animate-in fade-in-50 zoom-in-95";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps animation composition utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "animate-in fade-in-50 zoom-in-95";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual([
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-opacity",
        "--tw-enter-scale",
      ]);
      expect(data.report._capabilities).toMatchObject({
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-enter-opacity": "unsupported",
        "--tw-enter-scale": "unsupported",
      });
      expect(data.summary).toBe("6 properties dropped, 0 approximated");
    },
  );

  it("keeps web animation exit composition utilities caveat-free during target validation", () => {
    const input = "animate-out fade-out-0 zoom-out-95";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps animation exit composition utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "animate-out fade-out-0 zoom-out-95";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual([
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-opacity",
        "--tw-exit-scale",
      ]);
      expect(data.report._capabilities).toMatchObject({
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-exit-opacity": "unsupported",
        "--tw-exit-scale": "unsupported",
      });
      expect(data.summary).toBe("6 properties dropped, 0 approximated");
    },
  );

  it("keeps web animation enter slide composition utilities caveat-free during target validation", () => {
    const input = "animate-in slide-in-from-top-2";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps animation enter slide composition utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "animate-in slide-in-from-top-2";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual([
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-translate-y",
      ]);
      expect(data.report._capabilities).toMatchObject({
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-enter-translate-y": "unsupported",
      });
      expect(data.summary).toBe("5 properties dropped, 0 approximated");
    },
  );

  it("keeps web animation exit slide composition utilities caveat-free during target validation", () => {
    const input = "animate-out slide-out-to-right-2";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["native", "flutter"] as const)(
    "keeps animation exit slide composition utilities valid while reporting %s unsupported drops",
    (target) => {
      const input = "animate-out slide-out-to-right-2";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual([
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-translate-x",
      ]);
      expect(data.report._capabilities).toMatchObject({
        animationName: "unsupported",
        animationDuration: "unsupported",
        animationTimingFunction: "unsupported",
        animationFillMode: "unsupported",
        "--tw-exit-translate-x": "unsupported",
      });
      expect(data.summary).toBe("5 properties dropped, 0 approximated");
    },
  );

  it("keeps web grid utilities caveat-free during target validation", () => {
    const input = "grid grid-cols-3 gap-4";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each([
    ["native", "unsupported"],
    ["flutter", "recipe-only"],
  ] as const)(
    "keeps grid utilities valid while reporting %s target caveats",
    (target, columnCapability) => {
      const input = "grid grid-cols-3 gap-4";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report._dropped).toEqual(["gridTemplateColumns"]);
      expect(data.report._approximated).toEqual(["display"]);
      expect(data.report._capabilities).toMatchObject({
        display: "approximate",
        gridTemplateColumns: columnCapability,
      });
      expect(data.summary).toBe("1 properties dropped, 1 approximated");
    },
  );

  it("keeps native grid placement valid while dropping unsupported style fields", () => {
    const input =
      "grid grid-cols-3 gap-4 col-start-2 row-start-2 col-end-4 row-end-4";
    const response = validateHandler({ input, target: "native" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toEqual([
      "gridTemplateColumns",
      "gridColumnStart",
      "gridRowStart",
      "gridColumnEnd",
      "gridRowEnd",
    ]);
    expect(data.report._approximated).toEqual(["display"]);
    expect(data.report._capabilities).toMatchObject({
      display: "approximate",
      gridTemplateColumns: "unsupported",
      gridColumnStart: "unsupported",
      gridRowStart: "unsupported",
      gridColumnEnd: "unsupported",
      gridRowEnd: "unsupported",
    });
    expect(data.summary).toBe("5 properties dropped, 1 approximated");
  });

  it("keeps native grid auto fields valid while dropping unsupported style fields", () => {
    const input = "grid grid-flow-col auto-cols-fr auto-rows-min gap-4";
    const response = validateHandler({ input, target: "native" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toEqual([
      "gridAutoFlow",
      "gridAutoColumns",
      "gridAutoRows",
    ]);
    expect(data.report._approximated).toEqual(["display"]);
    expect(data.report._capabilities).toMatchObject({
      display: "approximate",
      gridAutoFlow: "unsupported",
      gridAutoColumns: "unsupported",
      gridAutoRows: "unsupported",
    });
    expect(data.summary).toBe("3 properties dropped, 1 approximated");
  });

  it("keeps supported transform utilities caveat-free for native validation", () => {
    const input = "rotate-45 scale-110 translate-x-4";
    const response = validateHandler({ input, target: "native" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["web", "native", "flutter"] as const)(
    "keeps supported typography utilities caveat-free for %s validation",
    (target) => {
      const input =
        "text-lg font-bold leading-7 tracking-wide italic text-center";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it.each(["web", "native"] as const)(
    "keeps layout and positioning utilities caveat-free for %s validation",
    (target) => {
      const input =
        "flex flex-col items-center justify-between absolute top-4 left-0";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it("keeps flutter layout valid while reporting positioning recipe capabilities", () => {
    const input =
      "flex flex-col items-center justify-between absolute top-4 left-0";
    const response = validateHandler({ input, target: "flutter" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "flutter" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._capabilities).toMatchObject({
      position: "recipe-only",
      top: "recipe-only",
      left: "recipe-only",
    });
    expect(data.summary).toBe("All properties supported on this target");
  });

  it.each(["web", "native", "flutter"] as const)(
    "keeps sizing and dimensions utilities caveat-free for %s validation",
    (target) => {
      const input = "w-full h-full max-w-lg min-h-0";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "keeps spacing and radius utilities caveat-free for %s validation",
    (target) => {
      const input = "p-4 m-2 rounded-lg";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "keeps color and background utilities caveat-free for %s validation",
    (target) => {
      const input = "bg-red-500 text-white";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "keeps border utilities caveat-free for %s validation",
    (target) => {
      const input = "border-2 border-solid border-red-500";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it.each(["web", "native", "flutter"] as const)(
    "keeps aspect-ratio utilities caveat-free for %s validation",
    (target) => {
      const input = "aspect-video";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it.each(["web", "native"] as const)(
    "keeps opacity and z-index utilities caveat-free for %s validation",
    (target) => {
      const input = "opacity-50 z-10";
      const response = validateHandler({ input, target });
      const data = JSON.parse(response.content[0].text);
      const core = dotExplain(input, { target });

      expect(data.valid).toBe(true);
      expect(data.errors).toEqual([]);
      expect(data.report).toEqual(core.report);
      expect(data.report).toEqual({});
      expect(data.summary).toBe("All properties supported on this target");
    },
  );

  it("keeps flutter opacity and z-index valid while reporting z-index approximation", () => {
    const input = "opacity-50 z-10";
    const response = validateHandler({ input, target: "flutter" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "flutter" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._approximated).toContain("zIndex");
    expect(data.report._capabilities.zIndex).toBe("approximate");
    expect(data.summary).toBe("0 properties dropped, 1 approximated");
  });

  it("keeps web interactivity utilities caveat-free for validation", () => {
    const input = "cursor-pointer select-none pointer-events-none";
    const response = validateHandler({ input, target: "web" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "web" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report).toEqual({});
    expect(data.summary).toBe("All properties supported on this target");
  });

  it("keeps native interactivity valid while reporting cursor/select drops", () => {
    const input = "cursor-pointer select-none pointer-events-none";
    const response = validateHandler({ input, target: "native" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "native" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toEqual(["cursor", "userSelect"]);
    expect(data.report._capabilities.cursor).toBe("unsupported");
    expect(data.report._capabilities.userSelect).toBe("unsupported");
    expect(data.report._capabilities).not.toHaveProperty("pointerEvents");
    expect(data.summary).toBe("2 properties dropped, 0 approximated");
  });

  it("keeps flutter interactivity valid while reporting unsupported drops", () => {
    const input = "cursor-pointer select-none pointer-events-none";
    const response = validateHandler({ input, target: "flutter" });
    const data = JSON.parse(response.content[0].text);
    const core = dotExplain(input, { target: "flutter" });

    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.report).toEqual(core.report);
    expect(data.report._dropped).toEqual([
      "cursor",
      "userSelect",
      "pointerEvents",
    ]);
    expect(data.report._capabilities.cursor).toBe("unsupported");
    expect(data.report._capabilities.userSelect).toBe("unsupported");
    expect(data.report._capabilities.pointerEvents).toBe("unsupported");
    expect(data.summary).toBe("3 properties dropped, 0 approximated");
  });
});
