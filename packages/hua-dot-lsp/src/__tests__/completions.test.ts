import { describe, it, expect, beforeAll } from "vitest";
import {
  getAllCompletions,
  getCompletionsForPrefix,
  getCompletionByLabel,
  type CompletionEntry,
} from "../completions.js";

// ---------------------------------------------------------------------------
// getAllCompletions
// ---------------------------------------------------------------------------

describe("getAllCompletions", () => {
  let all: CompletionEntry[];

  beforeAll(() => {
    all = getAllCompletions();
  });

  it("returns a non-empty array", () => {
    expect(all.length).toBeGreaterThan(0);
  });

  it("every entry has a non-empty label and detail", () => {
    for (const entry of all) {
      expect(typeof entry.label).toBe("string");
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.detail).toBe("string");
      expect(entry.detail.length).toBeGreaterThan(0);
    }
  });

  it("is stable across multiple calls (cached)", () => {
    const second = getAllCompletions();
    expect(second).toBe(all); // same reference — cached
  });

  it("contains expected spacing token p-4", () => {
    const found = all.find((e) => e.label === "p-4");
    expect(found).toBeDefined();
    expect(found!.detail).toContain("16px");
  });

  it("contains expected color token bg-white", () => {
    const found = all.find((e) => e.label === "bg-white");
    expect(found).toBeDefined();
    expect(found!.detail).toContain("backgroundColor");
    expect(found!.documentation).toBe("#ffffff");
  });

  it("contains expected typography token text-lg", () => {
    const found = all.find((e) => e.label === "text-lg");
    expect(found).toBeDefined();
    expect(found!.detail).toContain("18px");
  });

  it("contains expected layout token flex", () => {
    const found = all.find((e) => e.label === "flex");
    expect(found).toBeDefined();
    expect(found!.detail).toContain("display");
  });

  it("contains variant-prefixed token hover:p-4", () => {
    const found = all.find((e) => e.label === "hover:p-4");
    expect(found).toBeDefined();
    expect(found!.detail).toContain("[hover]");
  });

  it("contains dark variant token dark:bg-white", () => {
    const found = all.find((e) => e.label === "dark:bg-white");
    expect(found).toBeDefined();
  });

  it("has no duplicate labels", () => {
    const labels = all.map((e) => e.label);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });
});

// ---------------------------------------------------------------------------
// getCompletionsForPrefix
// ---------------------------------------------------------------------------

describe("getCompletionsForPrefix", () => {
  it("returns all completions when prefix is empty string", () => {
    const all = getAllCompletions();
    const result = getCompletionsForPrefix("");
    expect(result).toBe(all);
  });

  it("filters by prefix correctly", () => {
    const result = getCompletionsForPrefix("p-");
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.label.startsWith("p-")).toBe(true);
    }
  });

  it("returns empty array for a prefix that matches nothing", () => {
    const result = getCompletionsForPrefix("zzz-not-a-real-prefix");
    expect(result).toHaveLength(0);
  });

  it("is case-insensitive (prefix lowercased before matching)", () => {
    const lower = getCompletionsForPrefix("text-");
    const upper = getCompletionsForPrefix("TEXT-");
    expect(upper.length).toBe(lower.length);
  });

  it("prefix 'font-' returns font-related entries", () => {
    const result = getCompletionsForPrefix("font-");
    expect(result.length).toBeGreaterThan(0);
    // font-bold, font-sans, font-mono etc.
    const labels = result.map((e) => e.label);
    expect(labels).toContain("font-bold");
    expect(labels).toContain("font-sans");
    expect(labels).toContain("font-mono");
  });

  it("prefix 'hover:p-' returns variant-prefixed spacing tokens", () => {
    const result = getCompletionsForPrefix("hover:p-");
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.label.startsWith("hover:p-")).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// getCompletionByLabel
// ---------------------------------------------------------------------------

describe("getCompletionByLabel", () => {
  it("returns the correct entry for an exact label", () => {
    const entry = getCompletionByLabel("p-4");
    expect(entry).toBeDefined();
    expect(entry!.label).toBe("p-4");
    expect(entry!.detail).toContain("16px");
  });

  it("returns undefined for an unknown label", () => {
    const entry = getCompletionByLabel("not-a-real-token-xyz");
    expect(entry).toBeUndefined();
  });

  it("returns undefined for a partial / prefix-only label", () => {
    // 'p-' alone is not a full label
    const entry = getCompletionByLabel("p-");
    expect(entry).toBeUndefined();
  });

  it("returns entry with documentation for color tokens", () => {
    const entry = getCompletionByLabel("bg-black");
    expect(entry).toBeDefined();
    expect(entry!.documentation).toBe("#000000");
  });

  it("returns variant-prefixed entry", () => {
    const entry = getCompletionByLabel("dark:text-lg");
    expect(entry).toBeDefined();
    expect(entry!.detail).toContain("[dark]");
  });
});

// ---------------------------------------------------------------------------
// CompletionEntry shape
// ---------------------------------------------------------------------------

describe("CompletionEntry shape", () => {
  it("optional documentation field is string when present", () => {
    const all = getAllCompletions();
    const withDoc = all.filter((e) => e.documentation !== undefined);
    expect(withDoc.length).toBeGreaterThan(0);
    for (const entry of withDoc) {
      expect(typeof entry.documentation).toBe("string");
    }
  });

  it("documentation is absent on non-color entries like p-4", () => {
    const entry = getCompletionByLabel("p-4");
    expect(entry).toBeDefined();
    expect(entry!.documentation).toBeUndefined();
  });
});
