import {
  createFlutterRecipeWire,
  serializeFlutterRecipeWire,
} from "@hua-labs/dot/flutter";

export const DOT_FLUTTER_WIRE_BREAKPOINTS = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
] as const;

export type DotFlutterWireBreakpoint =
  (typeof DOT_FLUTTER_WIRE_BREAKPOINTS)[number];

export interface DotFlutterWireArgs {
  input: string;
  dark?: boolean;
  breakpoint?: DotFlutterWireBreakpoint;
}

export interface DotFlutterWireDependencies {
  create: typeof createFlutterRecipeWire;
  serialize: typeof serializeFlutterRecipeWire;
}

export type DotFlutterWireToolResult =
  | {
      content: [{ type: "text"; text: string }];
    }
  | {
      content: [{ type: "text"; text: string }];
      isError: true;
    };

const DEFAULT_DEPENDENCIES: DotFlutterWireDependencies = {
  create: createFlutterRecipeWire,
  serialize: serializeFlutterRecipeWire,
};

/** Produce the exact canonical Flutter recipe bytes owned by @hua-labs/dot. */
export function createDotFlutterWireText(
  args: DotFlutterWireArgs,
  dependencies: DotFlutterWireDependencies = DEFAULT_DEPENDENCIES,
): string {
  return dependencies.serialize(
    dependencies.create(args.input, {
      dark: args.dark,
      breakpoint: args.breakpoint,
    }),
  );
}

/** Adapt the core producer into the bounded MCP text result shape. */
export function runDotFlutterWireTool(
  args: DotFlutterWireArgs,
  dependencies: DotFlutterWireDependencies = DEFAULT_DEPENDENCIES,
): DotFlutterWireToolResult {
  try {
    return {
      content: [
        { type: "text", text: createDotFlutterWireText(args, dependencies) },
      ],
    };
  } catch {
    return {
      content: [
        {
          type: "text",
          text: "Error: Failed to create Flutter recipe wire",
        },
      ],
      isError: true,
    };
  }
}
