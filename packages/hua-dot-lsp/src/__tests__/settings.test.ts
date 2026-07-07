import { describe, expect, it } from "vitest";
import { parseDotTarget, readDotLspSettings } from "../settings.js";

describe("dot LSP settings", () => {
  it("accepts known dot targets", () => {
    expect(parseDotTarget("web")).toBe("web");
    expect(parseDotTarget("native")).toBe("native");
    expect(parseDotTarget("flutter")).toBe("flutter");
  });

  it("ignores unknown target values", () => {
    expect(parseDotTarget("ios")).toBeUndefined();
    expect(parseDotTarget(true)).toBeUndefined();
    expect(parseDotTarget(undefined)).toBeUndefined();
  });

  it("reads direct initialization target", () => {
    expect(readDotLspSettings({ target: "native" })).toEqual({
      target: "native",
    });
  });

  it("reads VS Code nested dot target", () => {
    expect(readDotLspSettings({ dot: { target: "flutter" } })).toEqual({
      target: "flutter",
    });
  });

  it("keeps invalid settings as no-target diagnostics", () => {
    expect(readDotLspSettings({ dot: { target: "ios" } })).toEqual({});
    expect(readDotLspSettings(null)).toEqual({});
  });
});
