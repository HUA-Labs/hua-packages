/**
 * @hua-labs/hua/framework - GEO Test Utilities Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateGEOMetadata,
  prettyPrintGEOMetadata,
  compareGEOMetadata,
} from "../../../seo/geo/test-utils";
import { generateGEOMetadata } from "../../../seo/geo/generateGEOMetadata";
import type { GEOMetadata } from "../../../seo/geo/types";

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeMetadata(): GEOMetadata {
  return generateGEOMetadata({
    name: "Test App",
    description: "A test application for validation purposes",
  });
}

describe("validateGEOMetadata (test-utils)", () => {
  it("returns valid=true for valid metadata", () => {
    const meta = makeMetadata();
    const result = validateGEOMetadata(meta);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error when description meta tag is missing", () => {
    const meta = makeMetadata();
    // Remove the description meta
    const filteredMeta: GEOMetadata = {
      ...meta,
      meta: meta.meta.filter((m) => m.name !== "description"),
    };
    const result = validateGEOMetadata(filteredMeta);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("description"))).toBe(true);
  });

  it("returns warning when description exceeds 160 characters", () => {
    const longDescription = "A".repeat(161);
    // Build metadata manually with long description
    const meta: GEOMetadata = {
      meta: [{ name: "description", content: longDescription }],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "App",
          description: longDescription,
        },
      ],
      openGraph: [
        { property: "og:title", content: "App" },
        { property: "og:description", content: longDescription },
        { property: "og:type", content: "website" },
      ],
      twitter: [],
    };
    const result = validateGEOMetadata(meta);
    expect(result.warnings.some((w) => w.includes("160"))).toBe(true);
  });

  it("returns error when JSON-LD is empty", () => {
    const meta = makeMetadata();
    const noJsonLd: GEOMetadata = { ...meta, jsonLd: [] };
    const result = validateGEOMetadata(noJsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("JSON-LD"))).toBe(true);
  });

  it("returns error for invalid @context in JSON-LD", () => {
    const meta = makeMetadata();
    const badJsonLd: GEOMetadata = {
      ...meta,
      jsonLd: [
        {
          "@context": "http://schema.org",
          "@type": "SoftwareApplication",
        } as any,
      ],
    };
    const result = validateGEOMetadata(badJsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("@context"))).toBe(true);
  });

  it("returns error for missing @type in JSON-LD", () => {
    const meta = makeMetadata();
    const badJsonLd: GEOMetadata = {
      ...meta,
      jsonLd: [{ "@context": "https://schema.org" } as any],
    };
    const result = validateGEOMetadata(badJsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("@type"))).toBe(true);
  });

  it("includes warning for missing og:title", () => {
    const meta = makeMetadata();
    const noOgTitle: GEOMetadata = {
      ...meta,
      openGraph:
        meta.openGraph?.filter((og) => og.property !== "og:title") || [],
    };
    const result = validateGEOMetadata(noOgTitle);
    expect(result.warnings.some((w) => w.includes("og:title"))).toBe(true);
  });

  it("result has valid, errors, and warnings properties", () => {
    const result = validateGEOMetadata(makeMetadata());
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("errors");
    expect(result).toHaveProperty("warnings");
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

describe("prettyPrintGEOMetadata", () => {
  it("returns a non-empty JSON string", () => {
    const meta = makeMetadata();
    const output = prettyPrintGEOMetadata(meta);
    expect(typeof output).toBe("string");
    expect(output.length).toBeGreaterThan(0);
  });

  it("produces valid JSON", () => {
    const meta = makeMetadata();
    const output = prettyPrintGEOMetadata(meta);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("output includes meta and jsonLd keys", () => {
    const meta = makeMetadata();
    const output = prettyPrintGEOMetadata(meta);
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty("meta");
    expect(parsed).toHaveProperty("jsonLd");
  });

  it("is pretty-printed (indented)", () => {
    const meta = makeMetadata();
    const output = prettyPrintGEOMetadata(meta);
    // Pretty-printed JSON contains newlines
    expect(output).toContain("\n");
  });
});

describe("compareGEOMetadata", () => {
  it("returns same=true for identical metadata", () => {
    const meta = makeMetadata();
    const result = compareGEOMetadata(meta, meta);
    expect(result.same).toBe(true);
    expect(result.differences).toHaveLength(0);
  });

  it("returns same=false when meta tags differ", () => {
    const meta1 = generateGEOMetadata({
      name: "App One",
      description: "Description for app one",
    });
    const meta2 = generateGEOMetadata({
      name: "App Two",
      description: "Different description here",
    });
    const result = compareGEOMetadata(meta1, meta2);
    expect(result.same).toBe(false);
    expect(result.differences.length).toBeGreaterThan(0);
  });

  it("reports JSON-LD count difference", () => {
    const meta1 = makeMetadata();
    const meta2: GEOMetadata = {
      ...meta1,
      jsonLd: [...meta1.jsonLd, ...meta1.jsonLd],
    };
    const result = compareGEOMetadata(meta1, meta2);
    expect(result.same).toBe(false);
    expect(result.differences.some((d) => d.includes("JSON-LD"))).toBe(true);
  });

  it("reports version difference", () => {
    const meta1 = makeMetadata();
    const meta2: GEOMetadata = { ...meta1, version: "2.0.0" };
    const result = compareGEOMetadata(meta1, meta2);
    expect(result.same).toBe(false);
    expect(result.differences.some((d) => d.includes("Version"))).toBe(true);
  });

  it("reports missing meta tag in first metadata", () => {
    const meta1 = makeMetadata();
    const meta2 = generateGEOMetadata({
      name: "Test App",
      description: "A test application for validation purposes",
      keywords: ["extra-key"],
    });
    const result = compareGEOMetadata(meta1, meta2);
    expect(result.same).toBe(false);
  });

  it("returns differences array", () => {
    const meta = makeMetadata();
    const result = compareGEOMetadata(meta, meta);
    expect(Array.isArray(result.differences)).toBe(true);
  });
});
