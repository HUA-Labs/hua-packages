/**
 * @hua-labs/hua/framework - structuredData Negative & Edge Case Tests
 */

import { describe, it, expect } from "vitest";
import {
  generateSoftwareApplicationLD,
  generateFAQPageLD,
  generateHowToLD,
} from "../../../seo/geo/structuredData";
import type { GEOConfig } from "../../../seo/geo/types";

const baseConfig: GEOConfig = {
  name: "Test App",
  description: "A test application",
};

describe("generateSoftwareApplicationLD — edge cases", () => {
  it("invalid URL in url field is passed through without validation (validator handles it)", () => {
    // structuredData does not validate URLs — that is validator's job
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      url: "not-a-url",
    });
    expect(result.url).toBe("not-a-url");
  });

  it("special characters in name are preserved verbatim", () => {
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      name: 'App <Special> & "Quoted"',
    });
    expect(result.name).toBe('App <Special> & "Quoted"');
  });

  it("empty string alternateName entries are filtered out", () => {
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      alternateName: ["valid-name", "", "  ", "another-valid"],
    });
    // Only non-empty names should appear
    expect(result.alternateName).toEqual(["valid-name", "another-valid"]);
  });

  it("empty applicationCategory array produces no applicationCategory field", () => {
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      applicationCategory: [],
    });
    expect(result.applicationCategory).toBeUndefined();
  });

  it("applicationCategory with only whitespace strings is omitted", () => {
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      applicationCategory: ["  ", ""],
    });
    expect(result.applicationCategory).toBeUndefined();
  });

  it("empty keywords array produces no keywords field", () => {
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      keywords: [],
    });
    expect(result.keywords).toBeUndefined();
  });

  it("features with empty strings are filtered", () => {
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      features: ["i18n", "", "Motion", "  "],
    });
    expect(result.featureList).toBe("i18n, Motion");
  });

  it("author without url field does not include url in output", () => {
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      author: { name: "Test Author" },
    });
    expect(result.author?.url).toBeUndefined();
    expect(result.author?.name).toBe("Test Author");
  });

  it("unicode characters in name and description are preserved", () => {
    const result = generateSoftwareApplicationLD({
      name: "한국어 앱 🚀",
      description: "설명: 테스트 앱입니다",
    });
    expect(result.name).toBe("한국어 앱 🚀");
    expect(result.description).toBe("설명: 테스트 앱입니다");
  });

  it("very long version string is preserved", () => {
    const longVersion = "1.2.3-" + "alpha".repeat(100);
    const result = generateSoftwareApplicationLD({
      ...baseConfig,
      version: longVersion,
    });
    expect(result.softwareVersion).toBe(longVersion);
  });
});

describe("generateFAQPageLD — negative edge cases", () => {
  it("throws when passed an empty array", () => {
    expect(() => generateFAQPageLD([])).toThrow();
  });

  it("throws when all FAQ items have empty questions", () => {
    expect(() =>
      generateFAQPageLD([{ question: "", answer: "Some answer" }]),
    ).toThrow();
  });

  it("throws when all FAQ items have empty answers", () => {
    expect(() =>
      generateFAQPageLD([{ question: "A question?", answer: "" }]),
    ).toThrow();
  });

  it("throws when all FAQ items have whitespace-only question and answer", () => {
    expect(() =>
      generateFAQPageLD([{ question: "  ", answer: "  " }]),
    ).toThrow();
  });

  it("filters out invalid FAQ items but keeps valid ones", () => {
    const faqs = [
      { question: "Valid question?", answer: "Valid answer" },
      { question: "", answer: "No question" },
      { question: "Missing answer", answer: "" },
    ];
    const result = generateFAQPageLD(faqs);
    // Only the first item is valid
    expect(result.mainEntity).toHaveLength(1);
    expect(result.mainEntity[0].name).toBe("Valid question?");
  });

  it("trims whitespace from questions and answers", () => {
    const faqs = [{ question: "  What?  ", answer: "  Because.  " }];
    const result = generateFAQPageLD(faqs);
    expect(result.mainEntity[0].name).toBe("What?");
    expect(result.mainEntity[0].acceptedAnswer.text).toBe("Because.");
  });

  it("FAQ items with special characters in question/answer are preserved", () => {
    const faqs = [
      { question: "What is <b>this</b>?", answer: 'It\'s "special" & tricky' },
    ];
    const result = generateFAQPageLD(faqs);
    expect(result.mainEntity[0].name).toBe("What is <b>this</b>?");
  });
});

describe("generateHowToLD — negative edge cases", () => {
  it("throws when name is empty", () => {
    expect(() =>
      generateHowToLD({ name: "", steps: [{ name: "Step", text: "Do it" }] }),
    ).toThrow();
  });

  it("throws when name is only whitespace", () => {
    expect(() =>
      generateHowToLD({
        name: "   ",
        steps: [{ name: "Step", text: "Do it" }],
      }),
    ).toThrow();
  });

  it("throws when steps array is empty", () => {
    expect(() => generateHowToLD({ name: "Guide", steps: [] })).toThrow();
  });

  it("throws when all steps have empty names or text", () => {
    expect(() =>
      generateHowToLD({ name: "Guide", steps: [{ name: "", text: "" }] }),
    ).toThrow();
  });

  it("filters out invalid steps but keeps valid ones", () => {
    const steps = [
      { name: "Valid step", text: "Do this" },
      { name: "", text: "No name" },
      { name: "No text", text: "" },
    ];
    const result = generateHowToLD({ name: "Guide", steps });
    expect(result.step).toHaveLength(1);
    expect(result.step[0].name).toBe("Valid step");
  });

  it("step positions are re-numbered after filtering invalid steps", () => {
    const steps = [
      { name: "", text: "" }, // filtered
      { name: "Step 2", text: "Do step 2" }, // becomes position 1
      { name: "Step 3", text: "Do step 3" }, // becomes position 2
    ];
    const result = generateHowToLD({ name: "Guide", steps });
    expect(result.step[0].position).toBe(1);
    expect(result.step[1].position).toBe(2);
  });

  it("totalTime undefined does not appear in output", () => {
    const result = generateHowToLD({
      name: "Guide",
      steps: [{ name: "Step", text: "Do it" }],
    });
    expect(result.totalTime).toBeUndefined();
  });

  it("step with image includes image in output", () => {
    const result = generateHowToLD({
      name: "Guide",
      steps: [
        { name: "Step", text: "Do it", image: "https://example.com/img.png" },
      ],
    });
    expect(result.step[0].image).toBe("https://example.com/img.png");
  });

  it("special characters in step name and text are preserved", () => {
    const result = generateHowToLD({
      name: "Guide",
      steps: [{ name: "Run <command>", text: "Execute & confirm" }],
    });
    expect(result.step[0].name).toBe("Run <command>");
    expect(result.step[0].text).toBe("Execute & confirm");
  });
});
