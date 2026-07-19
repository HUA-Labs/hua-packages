import { describe, expect, it } from "vitest";
import { joinWebClassNames } from "../web-classname";

describe("joinWebClassNames", () => {
  it("joins component, generated, raw, and child segments in exact order", () => {
    expect(
      joinWebClassNames(
        "component-base",
        "dot-generated",
        "raw__module--hash",
        "child-class",
      ),
    ).toBe("component-base dot-generated raw__module--hash child-class");
  });

  it("preserves caller bytes and duplicate tokens without trimming or merging", () => {
    expect(joinWebClassNames("  css__hash  ", "repeat repeat", "repeat")).toBe(
      "  css__hash   repeat repeat repeat",
    );
  });

  it("returns undefined when no class bytes are present", () => {
    expect(joinWebClassNames()).toBeUndefined();
    expect(joinWebClassNames(undefined, "")).toBeUndefined();
  });

  it("rejects non-string runtime values instead of coercing them", () => {
    expect(() => joinWebClassNames("safe", 0 as never)).toThrow(
      "web-classname-segment-invalid",
    );
  });
});
