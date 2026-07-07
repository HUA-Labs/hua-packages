import { describe, expect, it } from "vitest";
import {
  CAPABILITY_MATRIX,
  DOT_AX_CATALOG_SCHEMA_VERSION,
  DOT_AX_CATALOG_SOURCE_PACKAGE,
  DOT_AX_SURFACES,
  DOT_AX_TARGETS,
  PROPERTY_TO_FAMILY,
  getDotAxCatalog,
} from "../index";

describe("dot AX catalog", () => {
  it("exposes stable schema and source package metadata", () => {
    const catalog = getDotAxCatalog();

    expect(catalog.schemaVersion).toBe(DOT_AX_CATALOG_SCHEMA_VERSION);
    expect(catalog.schemaVersion).toBe("dot-ax-catalog.v1");
    expect(catalog.sourcePackage).toBe(DOT_AX_CATALOG_SOURCE_PACKAGE);
    expect(catalog.sourcePackage).toBe("@hua-labs/dot");
    expect(catalog.targets).toEqual(DOT_AX_TARGETS);
    expect(catalog.surfaces).toEqual(DOT_AX_SURFACES);
  });

  it("derives one stable ordered entry for every capability matrix family", () => {
    const catalog = getDotAxCatalog();
    const expectedFamilies = Object.keys(CAPABILITY_MATRIX).sort();

    expect(catalog.entries.map((entry) => entry.id)).toEqual(expectedFamilies);
    expect(new Set(catalog.entries.map((entry) => entry.id)).size).toBe(
      expectedFamilies.length,
    );
  });

  it("preserves target support levels from CAPABILITY_MATRIX", () => {
    const catalog = getDotAxCatalog();

    for (const entry of catalog.entries) {
      const matrixRow = CAPABILITY_MATRIX[entry.id];
      expect(matrixRow, entry.id).toBeDefined();
      expect(entry.targets).toEqual(["web", "native", "flutter"]);

      for (const target of DOT_AX_TARGETS) {
        expect(entry.support[target].target).toBe(target);
        expect(entry.support[target].level).toBe(
          matrixRow?.[target] ?? "unsupported",
        );
      }
    }
  });

  it("keeps tool surfaces separate from runtime target support", () => {
    const catalog = getDotAxCatalog();
    const surfaceNames = catalog.surfaces;

    expect(surfaceNames).toContain("mcp");
    expect(surfaceNames).toContain("lsp");
    expect(surfaceNames).toContain("aot");
    expect(surfaceNames).not.toContain("web");
    expect(surfaceNames).not.toContain("native");
    expect(surfaceNames).not.toContain("flutter");

    for (const entry of catalog.entries) {
      expect(Object.keys(entry.support).sort()).toEqual([
        "flutter",
        "native",
        "web",
      ]);
      expect(entry.surfaces.map((surface) => surface.surface)).toEqual(
        surfaceNames,
      );
    }
  });

  it("maps PROPERTY_TO_FAMILY properties back to catalog entries", () => {
    const catalog = getDotAxCatalog();
    const entries = new Map(catalog.entries.map((entry) => [entry.id, entry]));

    for (const [property, family] of Object.entries(PROPERTY_TO_FAMILY)) {
      const entry = entries.get(family);
      expect(entry, `${family} entry for ${property}`).toBeDefined();
      expect(entry?.properties).toContain(property);
    }
  });

  it("classifies animation composition longhands and custom properties as animation", () => {
    const catalog = getDotAxCatalog();
    const animation = catalog.entries.find((entry) => entry.id === "animation");
    const properties = [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-opacity",
      "--tw-enter-scale",
      "--tw-exit-opacity",
      "--tw-exit-scale",
      "--tw-enter-translate-x",
      "--tw-enter-translate-y",
      "--tw-exit-translate-x",
      "--tw-exit-translate-y",
    ];

    expect(animation?.label).toBe("Animation");
    expect(animation?.category).toBe("visual-effect");
    for (const property of properties) {
      expect(PROPERTY_TO_FAMILY[property]).toBe("animation");
      expect(animation?.properties).toContain(property);
    }
  });

  it("describes composed families without rewriting CSS property capability lookup", () => {
    const catalog = getDotAxCatalog();
    const entries = new Map(catalog.entries.map((entry) => [entry.id, entry]));
    const ring = entries.get("ring");
    const divide = entries.get("divide");

    expect(ring?.properties).toEqual([]);
    expect(ring?.composition).toEqual({
      kind: "finalized-style",
      markers: ["__dot_ringLayer"],
      outputProperties: ["boxShadow"],
      notes: [
        "Ring tokens resolve to an internal ring layer before final boxShadow composition.",
        "The CSS property lookup remains boxShadow=shadow; ring capability stays family-level metadata.",
      ],
    });
    expect(ring?.provenance).toContain(
      "packages/hua-dot/src/resolvers/ring.ts",
    );
    expect(ring?.provenance).toContain(
      "packages/hua-dot/src/index.ts#finalizeStyle",
    );
    expect(PROPERTY_TO_FAMILY.boxShadow).toBe("shadow");

    expect(divide?.properties).toEqual([]);
    expect(divide?.examples).toEqual(["divide-y-2", "divide-gray-200"]);
    expect(divide?.composition).toEqual({
      kind: "class-child-selector",
      markers: [
        "__dot_divideX",
        "__dot_divideXReverse",
        "__dot_divideY",
        "__dot_divideYReverse",
      ],
      outputProperties: [
        "borderBottomWidth",
        "borderColor",
        "borderLeftWidth",
        "borderRightWidth",
        "borderStyle",
        "borderTopWidth",
      ],
      notes: [
        "Divide width and reverse tokens resolve to internal markers consumed by class-mode child-combinator CSS.",
        "Divide color tokens resolve through borderColor and are propagated to generated child rules when divide markers are present.",
      ],
    });
    expect(divide?.provenance).toContain(
      "packages/hua-dot/src/resolvers/divide.ts",
    );
    expect(PROPERTY_TO_FAMILY.borderColor).toBe("color");
  });

  it("captures representative direct, approximate, recipe, plugin, and unsupported caveats", () => {
    const catalog = getDotAxCatalog();
    const entries = new Map(catalog.entries.map((entry) => [entry.id, entry]));

    expect(entries.get("spacing")?.support.native.level).toBe("native");
    expect(entries.get("shadow")?.support.native.level).toBe("approximate");
    expect(entries.get("gradient")?.support.flutter.level).toBe("recipe-only");
    expect(entries.get("filter")?.support.flutter.level).toBe("plugin-backed");
    expect(entries.get("interactivity")?.support.native.level).toBe(
      "unsupported",
    );
    expect(entries.get("gradient")?.caveats).toContain("native: unsupported");
    expect(entries.get("gradient")?.caveats).toContain("flutter: recipe-only");
  });

  it("is JSON-serializable and read-only for consumers", () => {
    const catalog = getDotAxCatalog();
    const roundTrip = JSON.parse(JSON.stringify(catalog));

    expect(roundTrip).toEqual(catalog);
    expect(Object.isFrozen(catalog)).toBe(true);
    expect(Object.isFrozen(catalog.entries)).toBe(true);

    const first = catalog.entries[0];
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.targets)).toBe(true);
    expect(Object.isFrozen(first.support)).toBe(true);
    expect(Object.isFrozen(first.support.web)).toBe(true);
    expect(Object.isFrozen(first.surfaces)).toBe(true);
    expect(Object.isFrozen(first.properties)).toBe(true);
    expect(Object.isFrozen(first.examples)).toBe(true);
    expect(Object.isFrozen(first.caveats)).toBe(true);
    expect(Object.isFrozen(first.provenance)).toBe(true);

    const ring = catalog.entries.find((entry) => entry.id === "ring");
    expect(Object.isFrozen(ring?.composition)).toBe(true);
    expect(Object.isFrozen(ring?.composition?.markers)).toBe(true);
    expect(Object.isFrozen(ring?.composition?.outputProperties)).toBe(true);
    expect(Object.isFrozen(ring?.composition?.notes)).toBe(true);
  });

  it("is available from the native entry without changing the native target", async () => {
    const nativeEntry = await import("../native");

    expect(nativeEntry.getDotAxCatalog().schemaVersion).toBe(
      DOT_AX_CATALOG_SCHEMA_VERSION,
    );
    expect(nativeEntry.getDotAxCatalog().targets).toEqual([
      "web",
      "native",
      "flutter",
    ]);
    expect(nativeEntry.getDotAxCatalog().entries.length).toBe(
      getDotAxCatalog().entries.length,
    );
  });
});
