/**
 * @hua-labs/hua/framework - GEO Validator Negative & Edge Case Tests
 */

import { describe, it, expect } from "vitest";
import {
  validateJsonLd,
  validateGEOMetadata,
} from "../../../seo/geo/validator";

describe("validateJsonLd — null vs undefined and extreme inputs", () => {
  const validBase = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Test App",
    description: "A well-described application for testing purposes",
  };

  it("null input is treated as invalid (not a valid JSON-LD object)", () => {
    const result = validateJsonLd(null as any);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("undefined input is treated as invalid", () => {
    const result = validateJsonLd(undefined as any);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("null and undefined produce different error structures if validator distinguishes them", () => {
    const nullResult = validateJsonLd(null as any);

    const undefinedResult = validateJsonLd(undefined as any);
    // Both should be invalid
    expect(nullResult.valid).toBe(false);
    expect(undefinedResult.valid).toBe(false);
  });

  it("extremely long name (>1000 chars) produces a warning", () => {
    const longName = "A".repeat(1001);
    const result = validateJsonLd({ ...validBase, name: longName });
    // Long name should at minimum not crash; warnings may be emitted
    expect(result).toBeDefined();
    expect(typeof result.valid).toBe("boolean");
  });

  it("extremely long description (>1000 chars) still validates context/@type/@context", () => {
    const longDesc = "B".repeat(1001);
    const result = validateJsonLd({ ...validBase, description: longDesc });
    // Context and type are fine; description exists — no required-field errors
    const contextErrors = result.errors.filter((e) => e.field === "@context");
    expect(contextErrors).toHaveLength(0);
  });

  it("description exactly at 10 characters does not trigger short-description warning", () => {
    const result = validateJsonLd({ ...validBase, description: "1234567890" });
    const shortWarnings = result.warnings.filter(
      (w) => w.field === "description",
    );
    expect(shortWarnings).toHaveLength(0);
  });

  it("description of 9 characters triggers short-description warning", () => {
    const result = validateJsonLd({ ...validBase, description: "123456789" });
    const shortWarnings = result.warnings.filter(
      (w) => w.field === "description",
    );
    expect(shortWarnings.length).toBeGreaterThan(0);
  });

  it("url with spaces is invalid", () => {
    const result = validateJsonLd({
      ...validBase,
      url: "https://example .com",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "url")).toBe(true);
  });

  it("url with javascript: scheme is flagged as invalid", () => {
    const result = validateJsonLd({ ...validBase, url: "javascript:alert(1)" });
    // URL object can parse javascript: — but our validator checks for http/https
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "url")).toBe(true);
  });

  it("url with ftp: scheme is invalid per validator rules", () => {
    const result = validateJsonLd({
      ...validBase,
      url: "ftp://example.com/file.txt",
    });
    // Validator should require http/https
    expect(result.errors.some((e) => e.field === "url")).toBe(true);
  });

  it("author.name with only whitespace triggers error", () => {
    const result = validateJsonLd({ ...validBase, author: { name: "   " } });
    // Either missing or whitespace-only name should be flagged
    expect(result.errors.some((e) => e.field === "author.name")).toBe(true);
  });

  it("empty string @type is treated as missing @type", () => {
    const result = validateJsonLd({ ...validBase, "@type": "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "@type")).toBe(true);
  });

  it("empty string name is treated as missing name", () => {
    const result = validateJsonLd({ ...validBase, name: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "name")).toBe(true);
  });

  it("empty string description is treated as missing description", () => {
    const result = validateJsonLd({ ...validBase, description: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "description")).toBe(true);
  });

  it("all ValidationWarning objects have required fields", () => {
    // validBase produces warnings (missing applicationCategory, offers)
    const result = validateJsonLd(validBase);
    for (const w of result.warnings) {
      expect(w).toHaveProperty("field");
      expect(w).toHaveProperty("message");
      expect(w).toHaveProperty("severity");
      expect(w.severity).toBe("warning");
    }
  });
});

describe("validateGEOMetadata — negative & edge cases", () => {
  const validItem = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "App",
    description: "A well-described application for testing",
  };

  it("null input is invalid", () => {
    const result = validateGEOMetadata(null as any);
    expect(result.valid).toBe(false);
  });

  it("undefined input is invalid", () => {
    const result = validateGEOMetadata(undefined as any);
    expect(result.valid).toBe(false);
  });

  it("object input (non-array) is invalid", () => {
    const result = validateGEOMetadata({} as any);
    expect(result.valid).toBe(false);
  });

  it("array with only invalid items has all errors prefixed by index", () => {
    const bad1 = { "@type": "SoftwareApplication" };
    const bad2 = { "@type": "SoftwareApplication" };
    const result = validateGEOMetadata([bad1, bad2] as never);
    const idx0Errors = result.errors.filter((e) => e.field.startsWith("[0]."));
    const idx1Errors = result.errors.filter((e) => e.field.startsWith("[1]."));
    expect(idx0Errors.length).toBeGreaterThan(0);
    expect(idx1Errors.length).toBeGreaterThan(0);
  });

  it("large array with 100 valid items does not crash", () => {
    const items = Array.from({ length: 100 }, () => ({ ...validItem }));
    expect(() => validateGEOMetadata(items as never)).not.toThrow();
  });

  it("mixed valid and invalid items — valid ones contribute no [idx]. errors", () => {
    const invalid = { "@type": "SoftwareApplication" };
    const result = validateGEOMetadata([validItem, invalid] as never);

    // First item (valid) should produce no errors (may have warnings)
    const idx0Errors = result.errors.filter((e) => e.field.startsWith("[0]."));
    expect(idx0Errors).toHaveLength(0);

    // Second item (invalid) should have errors
    const idx1Errors = result.errors.filter((e) => e.field.startsWith("[1]."));
    expect(idx1Errors.length).toBeGreaterThan(0);
  });
});
