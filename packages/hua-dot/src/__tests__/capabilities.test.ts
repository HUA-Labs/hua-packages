import { describe, it, expect } from "vitest";
import { dotExplain, getCapability, CAPABILITY_MATRIX } from "../index";

describe("getCapability", () => {
  it("returns native for spacing on web", () => {
    expect(getCapability("padding", "web")).toBe("native");
  });

  it("returns native for spacing on native", () => {
    expect(getCapability("padding", "native")).toBe("native");
  });

  it("returns unsupported for filter on native", () => {
    expect(getCapability("filter", "native")).toBe("unsupported");
  });

  it("returns unsupported for grid on native", () => {
    expect(getCapability("gridTemplateColumns", "native")).toBe("unsupported");
  });

  it("returns approximate for boxShadow on native", () => {
    expect(getCapability("boxShadow", "native")).toBe("approximate");
  });

  it("returns unsupported for unknown property", () => {
    expect(getCapability("__unknown__", "native")).toBe("unsupported");
  });

  it("maps directional border colors to color family", () => {
    expect(getCapability("borderTopColor", "native")).toBe("native");
    expect(getCapability("borderRightColor", "native")).toBe("native");
    expect(getCapability("borderBottomColor", "native")).toBe("native");
    expect(getCapability("borderLeftColor", "native")).toBe("native");
  });
});

describe("CAPABILITY_MATRIX", () => {
  it("has entries for all core families", () => {
    const families = [
      "spacing",
      "color",
      "typography",
      "layout",
      "sizing",
      "border",
      "borderRadius",
      "flexbox",
      "opacity",
      "zIndex",
      "shadow",
      "transform",
      "transition",
      "animation",
      "filter",
      "backdropFilter",
      "mixBlendMode",
      "grid",
    ];
    for (const family of families) {
      expect(CAPABILITY_MATRIX).toHaveProperty(family);
      expect(CAPABILITY_MATRIX[family]).toHaveProperty("web");
      expect(CAPABILITY_MATRIX[family]).toHaveProperty("native");
    }
  });
});

describe("dotExplain", () => {
  it("returns empty report for web target", () => {
    const result = dotExplain("p-4 blur-md", { target: "web" });
    expect(result.styles).toHaveProperty("padding");
    expect(result.styles).toHaveProperty("filter");
    expect(result.report).toEqual({});
  });

  it("reports dropped for unsupported native utilities", () => {
    const result = dotExplain("p-4 blur-md", { target: "native" });
    expect(result.styles).toHaveProperty("padding");
    expect(result.report._dropped).toContain("filter");
  });

  it("reports approximated for shadow on native", () => {
    const result = dotExplain("shadow-lg", { target: "native" });
    expect(result.report._approximated).toContain("boxShadow");
  });

  it("reports capabilities map", () => {
    const result = dotExplain("p-4 shadow-lg blur-md", { target: "native" });
    expect(result.report._capabilities).toBeDefined();
    expect(result.report._capabilities!.filter).toBe("unsupported");
    expect(result.report._capabilities!.boxShadow).toBe("approximate");
    // padding is native, so should NOT appear in capabilities
    expect(result.report._capabilities).not.toHaveProperty("padding");
  });

  it("returns empty report for empty input", () => {
    const result = dotExplain("", { target: "native" });
    expect(result.styles).toEqual({});
    expect(result.report).toEqual({});
  });

  it("returns empty report for null input", () => {
    const result = dotExplain(null, { target: "native" });
    expect(result.styles).toEqual({});
    expect(result.report).toEqual({});
  });

  it("line-clamp is NOT reported as dropped on native", () => {
    const result = dotExplain("line-clamp-3", { target: "native" });
    // line-clamp is natively supported on RN (numberOfLines)
    expect(result.report._dropped).toBeUndefined();
    // WebkitLineClamp/WebkitBoxOrient should map to lineClamp family
  });

  it("line-clamp + filter: only filter is dropped", () => {
    const result = dotExplain("line-clamp-3 blur-md", { target: "native" });
    expect(result.report._dropped).toContain("filter");
    // line-clamp related properties should NOT be in dropped
    if (result.report._dropped) {
      expect(result.report._dropped).not.toContain("WebkitLineClamp");
      expect(result.report._dropped).not.toContain("WebkitBoxOrient");
    }
  });

  it("directional border color is NOT dropped on native", () => {
    const result = dotExplain("border-t-red-500", { target: "native" });
    expect(result.styles).toHaveProperty("borderTopColor");
    expect(result.report._dropped).toBeUndefined();
  });

  it("border-x color resolves both sides without dropped report", () => {
    const result = dotExplain("border-x-red-500", { target: "native" });
    expect(result.styles).toHaveProperty("borderLeftColor");
    expect(result.styles).toHaveProperty("borderRightColor");
    expect(result.report._dropped).toBeUndefined();
  });

  it("divide-y-reverse is reported as class-mode-only on native", () => {
    const result = dotExplain("divide-y-reverse", { target: "native" });
    expect(result.report._dropped).toContain("divide-y/x (class-mode-only)");
    expect(result.report._capabilities?.["divide-y/x"]).toBe("unsupported");
  });

  it("divide-x-reverse is reported as class-mode-only on flutter", () => {
    const result = dotExplain("divide-x-reverse", { target: "flutter" });
    expect(result.report._dropped).toContain("divide-y/x (class-mode-only)");
    expect(result.report._capabilities?.["divide-y/x"]).toBe("unsupported");
  });
});
