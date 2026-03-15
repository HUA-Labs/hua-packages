/**
 * @hua-labs/hua/framework - renderJSONLD and isValidGEOConfig Tests
 */

import { describe, it, expect } from "vitest";
import { renderJSONLD } from "../../../seo/geo/generateGEOMetadata";
import { isValidGEOConfig } from "../../../seo/geo/types";

describe("renderJSONLD", () => {
  const jsonLd = {
    "@context": "https://schema.org" as const,
    "@type": "SoftwareApplication" as const,
    name: "Test App",
    description: "A test application",
  };

  it("returns an object with id, type, and dangerouslySetInnerHTML", () => {
    const result = renderJSONLD(jsonLd);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("dangerouslySetInnerHTML");
    expect(result.dangerouslySetInnerHTML).toHaveProperty("__html");
  });

  it('sets type to "application/ld+json"', () => {
    const result = renderJSONLD(jsonLd);
    expect(result.type).toBe("application/ld+json");
  });

  it("produces valid JSON in __html", () => {
    const result = renderJSONLD(jsonLd);
    expect(() => {
      // Unescape unicode sequences for parsing
      const unescaped = result.dangerouslySetInnerHTML.__html
        .replace(/\\u003c/g, "<")
        .replace(/\\u003e/g, ">")
        .replace(/\\u0026/g, "&");
      JSON.parse(unescaped);
    }).not.toThrow();
  });

  it("escapes < characters for XSS prevention", () => {
    const malicious = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "App",
      description: "A </script> injection attempt with enough text",
    };
    const result = renderJSONLD(malicious);
    expect(result.dangerouslySetInnerHTML.__html).not.toContain("</script>");
    expect(result.dangerouslySetInnerHTML.__html).toContain("\\u003c");
  });

  it("escapes & characters for XSS prevention", () => {
    const withAmpersand = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "App & Tools",
      description: "A test & application with ampersands in the content",
    };
    const result = renderJSONLD(withAmpersand);
    expect(result.dangerouslySetInnerHTML.__html).not.toContain("& Tools");
    expect(result.dangerouslySetInnerHTML.__html).toContain("\\u0026");
  });

  it("uses provided id", () => {
    const result = renderJSONLD(jsonLd, "my-custom-id");
    expect(result.id).toBe("my-custom-id");
  });

  it("generates unique id when not provided", () => {
    const result1 = renderJSONLD({
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "A",
      description: "B",
    });
    const result2 = renderJSONLD({
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "C",
      description: "D",
    });
    expect(result1.id).not.toBe(result2.id);
  });

  it("caches serialized result for the same object reference", () => {
    const result1 = renderJSONLD(jsonLd);
    const result2 = renderJSONLD(jsonLd);
    // Same object reference — __html should be identical (cached)
    expect(result1.dangerouslySetInnerHTML.__html).toBe(
      result2.dangerouslySetInnerHTML.__html,
    );
  });

  it("handles primitive (string) input", () => {
    const result = renderJSONLD("test-string");
    expect(result.dangerouslySetInnerHTML.__html).toBe("test-string");
  });
});

describe("isValidGEOConfig", () => {
  it("returns true for valid GEOConfig", () => {
    expect(isValidGEOConfig({ name: "App", description: "Desc" })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidGEOConfig(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidGEOConfig(undefined)).toBe(false);
  });

  it("returns false for primitive types", () => {
    expect(isValidGEOConfig("string")).toBe(false);
    expect(isValidGEOConfig(42)).toBe(false);
    expect(isValidGEOConfig(true)).toBe(false);
  });

  it("returns false when name is missing", () => {
    expect(isValidGEOConfig({ description: "Desc" })).toBe(false);
  });

  it("returns false when description is missing", () => {
    expect(isValidGEOConfig({ name: "App" })).toBe(false);
  });

  it("returns false when name is not a string", () => {
    expect(isValidGEOConfig({ name: 42, description: "Desc" })).toBe(false);
  });

  it("returns false when description is not a string", () => {
    expect(isValidGEOConfig({ name: "App", description: 42 })).toBe(false);
  });

  it("returns true for config with optional fields", () => {
    expect(
      isValidGEOConfig({
        name: "App",
        description: "Desc",
        version: "1.0.0",
        keywords: ["react"],
      }),
    ).toBe(true);
  });

  it("returns false for empty object", () => {
    expect(isValidGEOConfig({})).toBe(false);
  });
});
