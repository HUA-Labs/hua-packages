/**
 * @hua-labs/hua/framework - GEO Presets Tests
 */

import { describe, it, expect } from "vitest";
import { GEO_PRESETS } from "../../../seo/geo/presets";
import { generateGEOMetadata } from "../../../seo/geo/generateGEOMetadata";
import type { GEOConfig } from "../../../seo/geo/types";

describe("GEO_PRESETS", () => {
  it("NEXTJS_FRAMEWORK preset has correct applicationType", () => {
    expect(GEO_PRESETS.NEXTJS_FRAMEWORK.applicationType).toBe(
      "DeveloperApplication",
    );
  });

  it("NEXTJS_FRAMEWORK preset includes TypeScript as programming language", () => {
    expect(GEO_PRESETS.NEXTJS_FRAMEWORK.programmingLanguage).toContain(
      "TypeScript",
    );
  });

  it("NEXTJS_FRAMEWORK preset includes Next.js and React in technology stack", () => {
    expect(GEO_PRESETS.NEXTJS_FRAMEWORK.technologyStack).toContain("Next.js");
    expect(GEO_PRESETS.NEXTJS_FRAMEWORK.technologyStack).toContain("React");
  });

  it("NEXTJS_FRAMEWORK preset has correct applicationCategory", () => {
    expect(GEO_PRESETS.NEXTJS_FRAMEWORK.applicationCategory).toBe(
      "Developer Tool",
    );
  });

  it("UI_LIBRARY preset has correct applicationType", () => {
    expect(GEO_PRESETS.UI_LIBRARY.applicationType).toBe("DeveloperApplication");
  });

  it("UI_LIBRARY preset has correct applicationCategory", () => {
    expect(GEO_PRESETS.UI_LIBRARY.applicationCategory).toBe(
      "Component Library",
    );
  });

  it("REACT_APP preset has WebApplication applicationType", () => {
    expect(GEO_PRESETS.REACT_APP.applicationType).toBe("WebApplication");
  });

  it("REACT_APP preset includes TypeScript and JavaScript", () => {
    expect(GEO_PRESETS.REACT_APP.programmingLanguage).toContain("TypeScript");
    expect(GEO_PRESETS.REACT_APP.programmingLanguage).toContain("JavaScript");
  });

  it("REACT_APP preset includes React in technology stack", () => {
    expect(GEO_PRESETS.REACT_APP.technologyStack).toContain("React");
  });

  it("NPM_PACKAGE preset has DeveloperApplication applicationType", () => {
    expect(GEO_PRESETS.NPM_PACKAGE.applicationType).toBe(
      "DeveloperApplication",
    );
  });

  it("NPM_PACKAGE preset has Developer Tool category", () => {
    expect(GEO_PRESETS.NPM_PACKAGE.applicationCategory).toBe("Developer Tool");
  });

  it("all presets are partial GEOConfig objects", () => {
    for (const preset of Object.values(GEO_PRESETS)) {
      expect(preset).toBeDefined();
      expect(typeof preset).toBe("object");
    }
  });

  it("can be spread into GEOConfig and generate valid metadata", () => {
    const config: GEOConfig = {
      name: "My Framework",
      description: "A test Next.js framework built for demonstration purposes",
      ...GEO_PRESETS.NEXTJS_FRAMEWORK,
    };

    const result = generateGEOMetadata(config);
    expect(result.meta).toBeDefined();
    expect(result.jsonLd.length).toBeGreaterThan(0);

    const categoryMeta = result.meta.find(
      (m) => m.name === "software:category",
    );
    expect(categoryMeta?.content).toBe("Developer Tool");
  });

  it("REACT_APP preset can produce valid metadata", () => {
    const config: GEOConfig = {
      name: "My React App",
      description:
        "A production-ready React application built with modern tooling",
      ...GEO_PRESETS.REACT_APP,
    };

    expect(() => generateGEOMetadata(config)).not.toThrow();
  });
});
