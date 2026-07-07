import { dot, getDotAxCatalog } from "@hua-labs/dot";
import { describe, expect, it } from "vitest";

import * as dotAot from "../index";
import { extractStaticCalls } from "../extract";

describe("dot-aot AX boundary", () => {
  it("does not expose an independent AX or capability catalog API", () => {
    expect(Object.keys(dotAot).sort()).toEqual([
      "extractStaticCalls",
      "styleToObjectLiteral",
      "transformSource",
    ]);

    expect(dotAot).not.toHaveProperty("getDotAxCatalog");
    expect(dotAot).not.toHaveProperty("dotAxCatalog");
    expect(dotAot).not.toHaveProperty("CAPABILITY_MATRIX");
    expect(dotAot).not.toHaveProperty("PROPERTY_TO_FAMILY");
    expect(dotAot).not.toHaveProperty("getCapability");
    expect(dotAot).not.toHaveProperty("dotExplain");
  });

  it("keeps AOT output delegated to the dot resolver for AX catalog families", () => {
    const catalog = getDotAxCatalog();
    const gradient = catalog.entries.find((entry) => entry.id === "gradient");
    const filter = catalog.entries.find((entry) => entry.id === "filter");
    const interactivity = catalog.entries.find(
      (entry) => entry.id === "interactivity",
    );

    expect(gradient?.surfaces).toContainEqual(
      expect.objectContaining({ surface: "aot" }),
    );
    expect(filter?.surfaces).toContainEqual(
      expect.objectContaining({ surface: "aot" }),
    );
    expect(interactivity?.surfaces).toContainEqual(
      expect.objectContaining({ surface: "aot" }),
    );

    const cases = [
      {
        input: "bg-gradient-to-r from-red-500 to-blue-500",
        target: "web" as const,
      },
      {
        input: "blur-md",
        target: "flutter" as const,
      },
      {
        input: "cursor-pointer select-none pointer-events-none",
        target: "native" as const,
      },
    ];

    for (const { input, target } of cases) {
      const source = `const style = dot(${JSON.stringify(input)}, { target: ${JSON.stringify(target)} });`;
      const calls = extractStaticCalls(source);

      expect(calls).toHaveLength(1);
      expect(calls[0].result).toEqual(dot(input, { target }));
    }
  });

  it("keeps AOT output delegated to the dot resolver for composed AX families", () => {
    const catalog = getDotAxCatalog();
    const ring = catalog.entries.find((entry) => entry.id === "ring");
    const divide = catalog.entries.find((entry) => entry.id === "divide");

    expect(ring?.composition?.kind).toBe("finalized-style");
    expect(ring?.surfaces).toContainEqual(
      expect.objectContaining({ surface: "aot" }),
    );
    expect(divide?.composition?.kind).toBe("class-child-selector");
    expect(divide?.surfaces).toContainEqual(
      expect.objectContaining({ surface: "aot" }),
    );

    const cases = [
      {
        input: "ring-2",
        target: "web" as const,
      },
      {
        input: "ring-2",
        target: "native" as const,
      },
      {
        input: "ring-2",
        target: "flutter" as const,
      },
      {
        input: "divide-y-2",
        target: "web" as const,
      },
      {
        input: "divide-y-2",
        target: "native" as const,
      },
      {
        input: "divide-y-2",
        target: "flutter" as const,
      },
    ];

    for (const { input, target } of cases) {
      const source = `const style = dot(${JSON.stringify(input)}, { target: ${JSON.stringify(target)} });`;
      const calls = extractStaticCalls(source);

      expect(calls).toHaveLength(1);
      expect(calls[0].result).toEqual(dot(input, { target }));
    }
  });
});
