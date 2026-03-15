/**
 * @hua-labs/hua/framework - renderJSONLD XSS / Security / Edge Case Tests
 */

import { describe, it, expect } from "vitest";
import { renderJSONLD } from "../../../seo/geo/generateGEOMetadata";

describe("renderJSONLD — XSS & security edge cases", () => {
  it("escapes a full <script>alert(1)</script> XSS payload", () => {
    const malicious = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "<script>alert(1)</script>",
      description: "XSS attempt",
    };
    const result = renderJSONLD(malicious);
    const html = result.dangerouslySetInnerHTML.__html;

    // Must not contain the raw script tag
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("</script>");
    // Must be unicode-escaped
    expect(html).toContain("\\u003cscript\\u003e");
  });

  it("escapes > characters for XSS prevention", () => {
    const payload = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "A > B",
      description: "Greater than in name",
    };
    const result = renderJSONLD(payload);
    expect(result.dangerouslySetInnerHTML.__html).not.toContain(" > ");
    expect(result.dangerouslySetInnerHTML.__html).toContain("\\u003e");
  });

  it("escapes nested XSS payload inside description", () => {
    const payload = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "App",
      description: '</script><script>alert("xss")</script>',
    };
    const result = renderJSONLD(payload);
    const html = result.dangerouslySetInnerHTML.__html;

    expect(html).not.toContain("</script>");
    expect(html).not.toContain("<script>");
  });

  it("escapes & in all fields", () => {
    const payload = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "A & B & C",
      description: "Ampersands & everywhere & in & here",
    };
    const result = renderJSONLD(payload);
    const html = result.dangerouslySetInnerHTML.__html;

    // None of the raw & should survive
    // JSON.stringify wraps strings in quotes, so check for the literal & in output
    expect(html).not.toContain("A & B");
    expect(html).toContain("\\u0026");
  });

  it("produces valid JSON after unescaping unicode sequences", () => {
    const payload = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "Safe <App> & Tools",
      description: "Description with <special> characters & symbols",
    };
    const result = renderJSONLD(payload);
    const html = result.dangerouslySetInnerHTML.__html;

    // Unescape and parse — should not throw
    const unescaped = html
      .replace(/\\u003c/g, "<")
      .replace(/\\u003e/g, ">")
      .replace(/\\u0026/g, "&");
    expect(() => JSON.parse(unescaped)).not.toThrow();
  });

  it('null input is handled as primitive — returns "null" string', () => {
    const result = renderJSONLD(null);
    expect(result.dangerouslySetInnerHTML.__html).toBe("null");
  });

  it('undefined input is handled as primitive — returns "undefined" string', () => {
    const result = renderJSONLD(undefined);
    expect(result.dangerouslySetInnerHTML.__html).toBe("undefined");
  });

  it("number input is returned as string representation", () => {
    const result = renderJSONLD(42);
    expect(result.dangerouslySetInnerHTML.__html).toBe("42");
  });

  it('boolean true input is returned as string "true"', () => {
    const result = renderJSONLD(true);
    expect(result.dangerouslySetInnerHTML.__html).toBe("true");
  });

  it("empty object produces valid JSON", () => {
    const result = renderJSONLD({});
    expect(() =>
      JSON.parse(result.dangerouslySetInnerHTML.__html),
    ).not.toThrow();
  });

  it("deeply nested XSS payload is escaped at all levels", () => {
    const nested = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "App",
      description: "Safe description here",
      author: {
        "@type": "Organization",
        name: "<img src=x onerror=alert(1)>",
      },
    };
    const result = renderJSONLD(nested);
    expect(result.dangerouslySetInnerHTML.__html).not.toContain("<img");
    expect(result.dangerouslySetInnerHTML.__html).toContain("\\u003cimg");
  });

  it("caches result for the same object reference — XSS escaping is not re-done", () => {
    const obj = {
      "@context": "https://schema.org" as const,
      "@type": "SoftwareApplication" as const,
      name: "Cached <App>",
      description: "Test",
    };
    const first = renderJSONLD(obj);
    const second = renderJSONLD(obj);

    // Same cached string
    expect(first.dangerouslySetInnerHTML.__html).toBe(
      second.dangerouslySetInnerHTML.__html,
    );
    // Still escaped
    expect(first.dangerouslySetInnerHTML.__html).not.toContain("<App>");
  });
});
