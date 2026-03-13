#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { dot, dotExplain } from "@hua-labs/dot";

const server = new McpServer({
  name: "dot-mcp",
  version: "0.1.0",
});

// Token completion data organized by category
const COMPLETION_TOKENS: Record<string, string[]> = {
  spacing: [
    "p-0",
    "p-1",
    "p-2",
    "p-3",
    "p-4",
    "p-5",
    "p-6",
    "p-8",
    "p-10",
    "p-12",
    "p-16",
    "p-20",
    "p-24",
    "px-0",
    "px-1",
    "px-2",
    "px-3",
    "px-4",
    "px-5",
    "px-6",
    "px-8",
    "px-10",
    "px-12",
    "py-0",
    "py-1",
    "py-2",
    "py-3",
    "py-4",
    "py-5",
    "py-6",
    "py-8",
    "py-10",
    "py-12",
    "pt-0",
    "pt-1",
    "pt-2",
    "pt-3",
    "pt-4",
    "pt-6",
    "pt-8",
    "pb-0",
    "pb-1",
    "pb-2",
    "pb-3",
    "pb-4",
    "pb-6",
    "pb-8",
    "pl-0",
    "pl-1",
    "pl-2",
    "pl-3",
    "pl-4",
    "pl-6",
    "pl-8",
    "pr-0",
    "pr-1",
    "pr-2",
    "pr-3",
    "pr-4",
    "pr-6",
    "pr-8",
    "m-0",
    "m-1",
    "m-2",
    "m-3",
    "m-4",
    "m-5",
    "m-6",
    "m-8",
    "m-10",
    "m-12",
    "m-auto",
    "mx-0",
    "mx-1",
    "mx-2",
    "mx-3",
    "mx-4",
    "mx-auto",
    "my-0",
    "my-1",
    "my-2",
    "my-3",
    "my-4",
    "my-auto",
    "mt-0",
    "mt-1",
    "mt-2",
    "mt-3",
    "mt-4",
    "mt-6",
    "mt-8",
    "mt-auto",
    "mb-0",
    "mb-1",
    "mb-2",
    "mb-3",
    "mb-4",
    "mb-6",
    "mb-8",
    "mb-auto",
    "ml-0",
    "ml-1",
    "ml-2",
    "ml-3",
    "ml-4",
    "ml-auto",
    "mr-0",
    "mr-1",
    "mr-2",
    "mr-3",
    "mr-4",
    "mr-auto",
    "gap-0",
    "gap-1",
    "gap-2",
    "gap-3",
    "gap-4",
    "gap-5",
    "gap-6",
    "gap-8",
    "gap-x-0",
    "gap-x-1",
    "gap-x-2",
    "gap-x-4",
    "gap-x-6",
    "gap-x-8",
    "gap-y-0",
    "gap-y-1",
    "gap-y-2",
    "gap-y-4",
    "gap-y-6",
    "gap-y-8",
    "space-x-1",
    "space-x-2",
    "space-x-4",
    "space-x-6",
    "space-y-1",
    "space-y-2",
    "space-y-4",
    "space-y-6",
  ],
  colors: [
    "bg-white",
    "bg-black",
    "bg-transparent",
    "bg-current",
    "bg-gray-50",
    "bg-gray-100",
    "bg-gray-200",
    "bg-gray-300",
    "bg-gray-400",
    "bg-gray-500",
    "bg-gray-600",
    "bg-gray-700",
    "bg-gray-800",
    "bg-gray-900",
    "bg-red-500",
    "bg-red-600",
    "bg-blue-500",
    "bg-blue-600",
    "bg-green-500",
    "bg-green-600",
    "bg-yellow-400",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-purple-600",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-primary-500",
    "bg-secondary-500",
    "text-white",
    "text-black",
    "text-transparent",
    "text-current",
    "text-gray-400",
    "text-gray-500",
    "text-gray-600",
    "text-gray-700",
    "text-gray-800",
    "text-gray-900",
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "text-yellow-500",
    "text-purple-500",
    "text-pink-500",
    "text-cyan-500",
    "text-primary-500",
    "text-secondary-500",
    "border-gray-200",
    "border-gray-300",
    "border-gray-400",
    "border-red-500",
    "border-blue-500",
    "border-green-500",
  ],
  sizing: [
    "w-0",
    "w-1",
    "w-2",
    "w-4",
    "w-6",
    "w-8",
    "w-10",
    "w-12",
    "w-16",
    "w-20",
    "w-24",
    "w-32",
    "w-40",
    "w-48",
    "w-56",
    "w-64",
    "w-72",
    "w-80",
    "w-96",
    "w-auto",
    "w-full",
    "w-screen",
    "w-fit",
    "w-min",
    "w-max",
    "w-1/2",
    "w-1/3",
    "w-2/3",
    "w-1/4",
    "w-3/4",
    "w-1/5",
    "w-2/5",
    "w-3/5",
    "w-4/5",
    "h-0",
    "h-1",
    "h-2",
    "h-4",
    "h-6",
    "h-8",
    "h-10",
    "h-12",
    "h-16",
    "h-20",
    "h-24",
    "h-32",
    "h-40",
    "h-48",
    "h-56",
    "h-64",
    "h-72",
    "h-80",
    "h-96",
    "h-auto",
    "h-full",
    "h-screen",
    "h-fit",
    "h-min",
    "h-max",
    "min-w-0",
    "min-w-full",
    "min-h-0",
    "min-h-full",
    "min-h-screen",
    "max-w-sm",
    "max-w-md",
    "max-w-lg",
    "max-w-xl",
    "max-w-2xl",
    "max-w-3xl",
    "max-w-4xl",
    "max-w-5xl",
    "max-w-6xl",
    "max-w-7xl",
    "max-w-full",
    "max-w-screen-xl",
    "max-h-full",
    "max-h-screen",
  ],
  typography: [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "text-6xl",
    "font-thin",
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-extrabold",
    "font-black",
    "font-sans",
    "font-serif",
    "font-mono",
    "italic",
    "not-italic",
    "underline",
    "line-through",
    "no-underline",
    "uppercase",
    "lowercase",
    "capitalize",
    "normal-case",
    "leading-none",
    "leading-tight",
    "leading-snug",
    "leading-normal",
    "leading-relaxed",
    "leading-loose",
    "tracking-tighter",
    "tracking-tight",
    "tracking-normal",
    "tracking-wide",
    "tracking-wider",
    "tracking-widest",
    "text-left",
    "text-center",
    "text-right",
    "text-justify",
    "whitespace-normal",
    "whitespace-nowrap",
    "whitespace-pre",
    "whitespace-pre-wrap",
    "truncate",
    "text-ellipsis",
    "text-clip",
    "break-normal",
    "break-words",
    "break-all",
    "break-keep",
  ],
  layout: [
    "flex",
    "inline-flex",
    "grid",
    "inline-grid",
    "block",
    "inline-block",
    "inline",
    "hidden",
    "contents",
    "table",
    "table-row",
    "table-cell",
    "flex-row",
    "flex-col",
    "flex-row-reverse",
    "flex-col-reverse",
    "flex-wrap",
    "flex-nowrap",
    "flex-wrap-reverse",
    "flex-1",
    "flex-auto",
    "flex-initial",
    "flex-none",
    "flex-grow",
    "flex-shrink",
    "flex-grow-0",
    "flex-shrink-0",
    "items-start",
    "items-end",
    "items-center",
    "items-baseline",
    "items-stretch",
    "justify-start",
    "justify-end",
    "justify-center",
    "justify-between",
    "justify-around",
    "justify-evenly",
    "content-start",
    "content-end",
    "content-center",
    "content-between",
    "self-auto",
    "self-start",
    "self-end",
    "self-center",
    "self-stretch",
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-5",
    "grid-cols-6",
    "grid-cols-12",
    "grid-rows-1",
    "grid-rows-2",
    "grid-rows-3",
    "grid-rows-4",
    "col-span-1",
    "col-span-2",
    "col-span-3",
    "col-span-4",
    "col-span-full",
    "row-span-1",
    "row-span-2",
    "row-span-full",
    "relative",
    "absolute",
    "fixed",
    "sticky",
    "static",
    "inset-0",
    "inset-x-0",
    "inset-y-0",
    "top-0",
    "right-0",
    "bottom-0",
    "left-0",
    "top-auto",
    "right-auto",
    "bottom-auto",
    "left-auto",
    "overflow-auto",
    "overflow-hidden",
    "overflow-scroll",
    "overflow-visible",
    "overflow-x-auto",
    "overflow-x-hidden",
    "overflow-y-auto",
    "overflow-y-hidden",
    "z-0",
    "z-10",
    "z-20",
    "z-30",
    "z-40",
    "z-50",
    "z-auto",
    "container",
    "mx-auto",
  ],
  border: [
    "border",
    "border-0",
    "border-2",
    "border-4",
    "border-8",
    "border-t",
    "border-r",
    "border-b",
    "border-l",
    "border-t-0",
    "border-r-0",
    "border-b-0",
    "border-l-0",
    "border-solid",
    "border-dashed",
    "border-dotted",
    "border-double",
    "border-none",
    "rounded",
    "rounded-sm",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-2xl",
    "rounded-3xl",
    "rounded-full",
    "rounded-none",
    "rounded-t",
    "rounded-r",
    "rounded-b",
    "rounded-l",
    "rounded-tl",
    "rounded-tr",
    "rounded-bl",
    "rounded-br",
    "outline",
    "outline-none",
    "outline-dashed",
    "outline-dotted",
    "ring",
    "ring-0",
    "ring-1",
    "ring-2",
    "ring-4",
    "ring-8",
    "ring-inset",
    "ring-offset-1",
    "ring-offset-2",
    "ring-offset-4",
  ],
  effects: [
    "opacity-0",
    "opacity-25",
    "opacity-50",
    "opacity-75",
    "opacity-100",
    "shadow",
    "shadow-sm",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
    "shadow-inner",
    "shadow-none",
    "blur",
    "blur-sm",
    "blur-md",
    "blur-lg",
    "blur-xl",
    "blur-2xl",
    "blur-none",
    "brightness-50",
    "brightness-75",
    "brightness-100",
    "brightness-125",
    "brightness-150",
    "contrast-50",
    "contrast-75",
    "contrast-100",
    "contrast-125",
    "grayscale",
    "grayscale-0",
    "invert",
    "invert-0",
    "sepia",
    "sepia-0",
    "drop-shadow",
    "drop-shadow-sm",
    "drop-shadow-md",
    "drop-shadow-lg",
  ],
  transitions: [
    "transition",
    "transition-all",
    "transition-colors",
    "transition-opacity",
    "transition-transform",
    "transition-none",
    "duration-75",
    "duration-100",
    "duration-150",
    "duration-200",
    "duration-300",
    "duration-500",
    "duration-700",
    "duration-1000",
    "ease-linear",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "delay-75",
    "delay-100",
    "delay-150",
    "delay-200",
    "delay-300",
    "animate-none",
    "animate-spin",
    "animate-ping",
    "animate-pulse",
    "animate-bounce",
  ],
  transforms: [
    "scale-0",
    "scale-50",
    "scale-75",
    "scale-90",
    "scale-95",
    "scale-100",
    "scale-105",
    "scale-110",
    "scale-125",
    "scale-150",
    "scale-x-50",
    "scale-x-75",
    "scale-x-100",
    "scale-x-125",
    "scale-y-50",
    "scale-y-75",
    "scale-y-100",
    "scale-y-125",
    "rotate-0",
    "rotate-1",
    "rotate-2",
    "rotate-3",
    "rotate-6",
    "rotate-12",
    "rotate-45",
    "rotate-90",
    "rotate-180",
    "-rotate-1",
    "-rotate-2",
    "-rotate-3",
    "-rotate-6",
    "-rotate-12",
    "translate-x-0",
    "translate-x-1",
    "translate-x-2",
    "translate-x-4",
    "translate-y-0",
    "translate-y-1",
    "translate-y-2",
    "translate-y-4",
    "-translate-x-1",
    "-translate-x-2",
    "-translate-y-1",
    "-translate-y-2",
    "skew-x-0",
    "skew-x-1",
    "skew-x-2",
    "skew-y-0",
    "skew-y-1",
    "skew-y-2",
  ],
  interactivity: [
    "cursor-auto",
    "cursor-default",
    "cursor-pointer",
    "cursor-wait",
    "cursor-text",
    "cursor-move",
    "cursor-not-allowed",
    "cursor-grab",
    "cursor-grabbing",
    "pointer-events-none",
    "pointer-events-auto",
    "select-none",
    "select-text",
    "select-all",
    "select-auto",
    "resize",
    "resize-none",
    "resize-x",
    "resize-y",
    "appearance-none",
  ],
  accessibility: ["sr-only", "not-sr-only", "visible", "invisible"],
  gradient: [
    "bg-gradient-to-t",
    "bg-gradient-to-tr",
    "bg-gradient-to-r",
    "bg-gradient-to-br",
    "bg-gradient-to-b",
    "bg-gradient-to-bl",
    "bg-gradient-to-l",
    "bg-gradient-to-tl",
    "from-white",
    "from-black",
    "from-transparent",
    "from-gray-50",
    "from-gray-100",
    "from-gray-200",
    "from-gray-900",
    "from-blue-500",
    "from-purple-500",
    "from-pink-500",
    "from-cyan-500",
    "via-white",
    "via-transparent",
    "via-gray-500",
    "via-blue-500",
    "to-white",
    "to-black",
    "to-transparent",
    "to-gray-900",
    "to-blue-500",
    "to-purple-500",
    "to-pink-500",
  ],
};

const ALL_TOKENS = Object.values(COMPLETION_TOKENS).flat();

server.tool(
  "dot_resolve",
  "Resolve a dot utility string into a style object for web, native (React Native), or flutter targets",
  {
    input: z
      .string()
      .describe(
        "Space-separated dot utility string (e.g. 'p-4 flex items-center bg-blue-500')",
      ),
    target: z
      .enum(["web", "native", "flutter"])
      .optional()
      .describe("Target platform (default: web)"),
    dark: z.boolean().optional().describe("Apply dark mode styles"),
    breakpoint: z
      .enum(["sm", "md", "lg", "xl", "2xl"])
      .optional()
      .describe("Active breakpoint for responsive styles"),
  },
  async (args) => {
    try {
      const result = dot(args.input, {
        target: args.target as "web" | "native" | "flutter" | undefined,
        dark: args.dark,
        breakpoint: args.breakpoint,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
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
  },
);

server.tool(
  "dot_explain",
  "Resolve a dot utility string and get a capability report showing what works, what's dropped, and what's approximated on the target platform",
  {
    input: z
      .string()
      .describe(
        "Space-separated dot utility string (e.g. 'p-4 blur-md grid grid-cols-3')",
      ),
    target: z
      .enum(["web", "native", "flutter"])
      .optional()
      .describe("Target platform (default: web)"),
    dark: z.boolean().optional().describe("Apply dark mode styles"),
    breakpoint: z
      .enum(["sm", "md", "lg", "xl", "2xl"])
      .optional()
      .describe("Active breakpoint for responsive styles"),
  },
  async (args) => {
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
        content: [
          {
            type: "text",
            text: JSON.stringify(output, null, 2),
          },
        ],
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
  },
);

server.tool(
  "dot_complete",
  "Get completion suggestions for a partial dot utility string",
  {
    partial: z
      .string()
      .describe(
        "Partial utility token to complete (e.g. 'p-', 'bg-', 'flex', 'text-')",
      ),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of suggestions to return (default: 20)"),
  },
  async (args) => {
    const partial = args.partial.trim().toLowerCase();
    const limit = args.limit ?? 20;

    let suggestions: string[];

    if (!partial) {
      // Return one token from each category as examples
      suggestions = Object.entries(COMPLETION_TOKENS)
        .map(([category, tokens]) => ({ category, token: tokens[0] }))
        .slice(0, limit)
        .map(({ category, token }) => `${token} (${category})`);
    } else {
      // Find all tokens starting with the partial string
      const matches = ALL_TOKENS.filter((token) => token.startsWith(partial));

      // Also find tokens that contain the partial string (lower priority)
      const contains = ALL_TOKENS.filter(
        (token) => !token.startsWith(partial) && token.includes(partial),
      );

      suggestions = [...matches, ...contains].slice(0, limit);
    }

    // Annotate with category
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
            {
              partial,
              count: annotated.length,
              suggestions: annotated,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.tool(
  "dot_validate",
  "Validate a dot utility string and check if all utilities resolve successfully",
  {
    input: z
      .string()
      .describe("Space-separated dot utility string to validate"),
  },
  async (args) => {
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
      // Try resolving as web target to check for issues
      const result = dot(input);
      resolvedCount = Object.keys(result).length;

      // Also check each token individually for empty results (unrecognized tokens)
      const tokens = input.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        // Skip variant prefixes — strip them before checking
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
            {
              valid: errors.length === 0,
              errors,
              resolved_count: resolvedCount,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
