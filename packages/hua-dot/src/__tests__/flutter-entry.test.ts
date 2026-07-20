import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";
import {
  adaptFlutter,
  clearDotCache,
  createDotConfig,
  dot,
  dotExplain,
  dotMap,
} from "../flutter";
import { dot as dotRoot, dotExplain as dotExplainRoot } from "../index";
import * as flutterEntry from "../flutter";
import type { FlutterDotExplainResult, FlutterRecipe } from "../flutter";

describe("@hua-labs/dot/flutter subpath", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it("pre-binds dot() to the existing Flutter adapter", () => {
    const input = "p-4 bg-primary-500 rounded-lg cursor-pointer";

    expect(dot(input)).toEqual(dotRoot(input, { target: "flutter" }));
    expectTypeOf(dot(input)).toEqualTypeOf<FlutterRecipe>();
  });

  it("pre-binds dotMap() state recipes to Flutter", () => {
    const result = dotMap("p-4 hover:bg-primary-500 focus:opacity-50");

    expect(result.base).toEqual({
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    });
    expect(result.hover?.decoration?.color).toBe("#2b6cd6");
    expect(result.focus?.opacity).toBe(0.5);
  });

  it("pre-binds dotExplain() without changing report semantics", () => {
    const input = "p-4 cursor-pointer";
    const result = dotExplain(input);

    expect(result).toEqual(dotExplainRoot(input, { target: "flutter" }));
    expect(result.styles._dropped).toContain("cursor");
    expect(result.report._dropped).toContain("cursor");
    expect(result.report._capabilities?.cursor).toBe("unsupported");
    expectTypeOf(result).toEqualTypeOf<FlutterDotExplainResult>();
  });

  it("keeps non-target options while callers cannot select another target", () => {
    const result = dot("p-4 md:p-8 dark:opacity-50", {
      breakpoint: "md",
      dark: true,
    });

    expect(result.padding).toEqual({
      top: 32,
      right: 32,
      bottom: 32,
      left: 32,
    });
    expect(result.opacity).toBe(0.5);
  });

  it("re-exports the existing Flutter adapter", () => {
    expect(adaptFlutter({ padding: "16px" })).toEqual({
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    });
  });

  it("does not expose the web-only dotVariants contract", () => {
    expect(Object.hasOwn(flutterEntry, "dotVariants")).toBe(false);
  });
});
