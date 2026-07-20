import { describe, expect, it } from "vitest";
import {
  createFlutterRecipeWire,
  serializeFlutterRecipeWire,
} from "@hua-labs/dot/flutter";
import {
  createDotFlutterWireText,
  runDotFlutterWireTool,
} from "../flutter-wire";

describe("dot_flutter_wire", () => {
  it("returns the canonical core producer bytes without rebuilding the envelope", () => {
    const args = {
      input: "p-4 cursor-pointer",
    } as const;
    const expected = serializeFlutterRecipeWire(
      createFlutterRecipeWire(args.input),
    );

    const response = runDotFlutterWireTool(args);

    expect(response).toEqual({
      content: [{ type: "text", text: expected }],
    });
    expect(response.content[0].text).toBe(expected);
    expect(JSON.parse(response.content[0].text)).toMatchObject({
      schema: "hua.dot.flutter.recipe",
      version: 1,
      target: "flutter",
      recipe: {
        padding: { top: 16, right: 16, bottom: 16, left: 16 },
        _dropped: ["cursor"],
      },
      metadata: {
        dropped: ["cursor"],
        capabilities: { cursor: "unsupported" },
      },
    });
  });

  it("forwards dark and breakpoint options to the pre-bound Flutter producer", () => {
    const args = {
      input: "p-4 md:p-8 bg-white dark:bg-gray-900",
      dark: true,
      breakpoint: "md",
    } as const;
    const expected = serializeFlutterRecipeWire(
      createFlutterRecipeWire(args.input, {
        dark: args.dark,
        breakpoint: args.breakpoint,
      }),
    );

    const response = runDotFlutterWireTool(args);
    const parsed = JSON.parse(response.content[0].text);

    expect(response.content[0].text).toBe(expected);
    expect(parsed.recipe.padding).toEqual({
      top: 32,
      right: 32,
      bottom: 32,
      left: 32,
    });
    expect(parsed.recipe.decoration.color).not.toBe("#ffffff");
  });

  it("is deterministic for repeated exact calls", () => {
    const args = {
      input: "p-4 bg-primary-500 rounded-lg cursor-pointer",
      dark: false,
      breakpoint: "lg",
    } as const;

    expect(createDotFlutterWireText(args)).toBe(createDotFlutterWireText(args));
    expect(runDotFlutterWireTool(args)).toEqual(runDotFlutterWireTool(args));
  });

  it("returns a bounded MCP error result when the core producer fails", () => {
    const response = runDotFlutterWireTool(
      { input: "p-4" },
      {
        create() {
          throw new Error("SECRET_CORE_FAILURE");
        },
        serialize() {
          throw new Error("must not serialize after create failure");
        },
      },
    );

    expect(response).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Failed to create Flutter recipe wire",
        },
      ],
      isError: true,
    });
    expect(response.content[0].text).not.toContain("SECRET_CORE_FAILURE");
  });

  it("returns a bounded MCP error result when canonical serialization fails", () => {
    const response = runDotFlutterWireTool(
      { input: "p-4" },
      {
        create: createFlutterRecipeWire,
        serialize() {
          throw new Error("SECRET_SERIALIZER_FAILURE");
        },
      },
    );

    expect(response).toEqual({
      content: [
        {
          type: "text",
          text: "Error: Failed to create Flutter recipe wire",
        },
      ],
      isError: true,
    });
    expect(response.content[0].text).not.toContain("SECRET_SERIALIZER_FAILURE");
  });
});
