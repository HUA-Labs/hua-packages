/**
 * @hua-labs/hua/framework - GEO Validator Tests
 */

import { describe, it, expect } from "vitest";
import {
  validateJsonLd,
  validateGEOMetadata,
  formatValidationResult,
} from "../../../seo/geo/validator";

describe("validateJsonLd", () => {
  const validSoftwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Test App",
    description: "A well-described test application for testing purposes",
  };

  it("returns valid=true for a correct SoftwareApplication JSON-LD", () => {
    const result = validateJsonLd(validSoftwareApp);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error when @context is missing", () => {
    const jsonLd = {
      "@type": "SoftwareApplication",
      name: "App",
      description: "Desc",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "@context")).toBe(true);
  });

  it('returns error when @context is not "https://schema.org"', () => {
    const jsonLd = {
      "@context": "http://schema.org",
      "@type": "SoftwareApplication",
      name: "App",
      description: "Desc",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "@context")).toBe(true);
  });

  it("returns error when @type is missing", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      name: "App",
      description: "Desc",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "@type")).toBe(true);
  });

  it("returns error when name is missing", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      description: "Desc",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "name")).toBe(true);
  });

  it("returns error when description is missing", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "App",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "description")).toBe(true);
  });

  it("returns warning when description is shorter than 10 characters", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "App",
      description: "Short",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.warnings.some((w) => w.field === "description")).toBe(true);
  });

  it("returns error when url is invalid", () => {
    const jsonLd = {
      ...validSoftwareApp,
      url: "not-a-url",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "url")).toBe(true);
  });

  it("accepts valid https URL", () => {
    const jsonLd = {
      ...validSoftwareApp,
      url: "https://example.com",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.errors.filter((e) => e.field === "url")).toHaveLength(0);
  });

  it("returns error when author object is missing name", () => {
    const jsonLd = {
      ...validSoftwareApp,
      author: { url: "https://example.com" },
    };
    const result = validateJsonLd(jsonLd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "author.name")).toBe(true);
  });

  it("returns warning for missing applicationCategory in SoftwareApplication", () => {
    const result = validateJsonLd(validSoftwareApp);
    expect(result.warnings.some((w) => w.field === "applicationCategory")).toBe(
      true,
    );
  });

  it("returns warning for missing offers in SoftwareApplication", () => {
    const result = validateJsonLd(validSoftwareApp);
    expect(result.warnings.some((w) => w.field === "offers")).toBe(true);
  });

  it("returns error for invalid offers.@type", () => {
    const jsonLd = {
      ...validSoftwareApp,
      offers: { "@type": "WrongType" },
    };
    const result = validateJsonLd(jsonLd);
    expect(result.errors.some((e) => e.field === "offers.@type")).toBe(true);
  });

  it("validates WebSite type — requires url", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "My Site",
      description: "A test website with a long enough description",
    };
    const result = validateJsonLd(jsonLd);
    expect(result.errors.some((e) => e.field === "url")).toBe(true);
  });

  it("all ValidationError objects have field, message, and severity", () => {
    const jsonLd = { "@type": "SoftwareApplication", name: "App" };
    const result = validateJsonLd(jsonLd);
    for (const error of result.errors) {
      expect(error).toHaveProperty("field");
      expect(error).toHaveProperty("message");
      expect(error).toHaveProperty("severity");
      expect(["error", "warning"]).toContain(error.severity);
    }
  });
});

describe("validateGEOMetadata (from validator)", () => {
  const validJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Test App",
    description: "A well-described test application for testing purposes",
  };

  it("returns error when input is not an array", () => {
    const result = validateGEOMetadata("not-an-array" as any);
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("root");
  });

  it("returns error when array is empty", () => {
    const result = validateGEOMetadata([]);
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("root");
  });

  it("returns valid=true for array with one valid JSON-LD", () => {
    const result = validateGEOMetadata([validJsonLd]);
    expect(result.valid).toBe(true);
  });

  it("prefixes error fields with array index", () => {
    const invalidJsonLd = { "@type": "SoftwareApplication", name: "App" };
    const result = validateGEOMetadata([invalidJsonLd]);
    expect(result.errors.every((e) => e.field.startsWith("[0]."))).toBe(true);
  });

  it("validates multiple items independently", () => {
    const invalid = { "@type": "SoftwareApplication" };
    const result = validateGEOMetadata([validJsonLd, invalid]);
    // First is valid (has warnings only), second has errors with [1]. prefix
    expect(result.errors.some((e) => e.field.startsWith("[1]."))).toBe(true);
    expect(result.errors.every((e) => !e.field.startsWith("[0]."))).toBe(true);
  });
});

describe("formatValidationResult", () => {
  it("includes success message when valid=true", () => {
    const result = { valid: true, errors: [], warnings: [] };
    const formatted = formatValidationResult(result);
    expect(formatted).toContain("valid");
  });

  it("includes failure indicator when valid=false", () => {
    const result = {
      valid: false,
      errors: [
        {
          field: "@context",
          message: "@context is required",
          severity: "error" as const,
        },
      ],
      warnings: [],
    };
    const formatted = formatValidationResult(result);
    expect(formatted).toContain("@context");
    expect(formatted).toContain("@context is required");
  });

  it("includes warnings section", () => {
    const result = {
      valid: true,
      errors: [],
      warnings: [
        {
          field: "offers",
          message: "offers is recommended",
          severity: "warning" as const,
        },
      ],
    };
    const formatted = formatValidationResult(result);
    expect(formatted).toContain("offers is recommended");
  });

  it("returns a non-empty string", () => {
    const result = { valid: true, errors: [], warnings: [] };
    expect(formatValidationResult(result).length).toBeGreaterThan(0);
  });
});
