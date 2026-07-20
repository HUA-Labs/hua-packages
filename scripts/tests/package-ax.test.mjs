import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after } from "node:test";

import {
  buildDocumentationAxProjection,
  buildPublicSurfaceDocsProjection,
  executionForSupportLevel,
  normalizeHuaPackageAxCatalog,
  summarizeHuaPackageAxCatalog,
} from "../package-ax.mjs";

const source = {
  catalogKind: "style-capability",
  sourcePackage: "@hua-labs/example",
  sourcePackageVersion: "0.0.0",
  sourcePath: "packages/example/src/ax.ts",
  exportName: "getExampleAxCatalog",
};
const TEMP_ROOTS = new Set();

function tempRoot(prefix) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  TEMP_ROOTS.add(root);
  return root;
}

after(() => {
  for (const root of TEMP_ROOTS) rmSync(root, { recursive: true, force: true });
});

test("normalizes package AX rows deterministically without promoting metadata", () => {
  const normalized = normalizeHuaPackageAxCatalog(
    {
      sourcePackage: "@hua-labs/example",
      entries: [
        {
          id: "spacing",
          category: "box-model",
          description: "Spacing utilities.",
          targets: ["web", "native"],
          support: {
            web: { level: "native" },
            native: { level: "native" },
          },
        },
        {
          id: "gradient",
          category: "color",
          description: "Gradient utilities.",
          targets: ["sdui", "web"],
          support: {
            web: { level: "native" },
            sdui: { level: "manifest-only" },
          },
        },
      ],
    },
    source,
  );

  assert.equal(normalized.schemaVersion, "hua-package-ax.v1");
  assert.deepEqual(
    normalized.entries.map((entry) => entry.id),
    ["gradient", "spacing"],
  );
  assert.deepEqual(normalized.targets, ["native", "sdui", "web"]);
  assert.equal(
    normalized.entries[0].targets.find((row) => row.target === "sdui")
      .execution,
    "declaration-only",
  );
  assert.equal(JSON.stringify(normalized), JSON.stringify({ ...normalized }));

  const summary = summarizeHuaPackageAxCatalog(normalized);
  assert.equal(summary.entryCount, 2);
  assert.equal(summary.targetRowCount, 4);
  assert.deepEqual(summary.executionSummary, [
    { key: "declaration-only", count: 1 },
    { key: "runtime", count: 3 },
  ]);
});

test("maps only runtime-capable support levels to runtime execution", () => {
  for (const level of [
    "recipe-only",
    "plugin-backed",
    "manifest-only",
    "diagnostic-only",
    "planned",
    "unsupported",
  ]) {
    assert.notEqual(executionForSupportLevel(level), "runtime", level);
  }
  for (const level of ["direct", "selected-subset", "approximate"]) {
    assert.equal(executionForSupportLevel(level), "runtime", level);
  }
});

test("binds public-surface symbols to exact canonical imports", () => {
  const catalog = normalizeHuaPackageAxCatalog(
    {
      entries: [
        {
          id: ".",
          category: "compat-root",
          description: "Compatibility root.",
          targets: ["web"],
          support: { web: { level: "direct" } },
          canonicalImport: "@hua-labs/example",
          routing: ["web"],
          deprecated: false,
          allowedOptionalPeers: [],
        },
        {
          id: "./form",
          category: "web-runtime",
          description: "Form components.",
          targets: ["web"],
          support: { web: { level: "direct" } },
          canonicalImport: "@hua-labs/example/form",
          routing: ["web"],
          deprecated: false,
          allowedOptionalPeers: [],
        },
      ],
    },
    { ...source, catalogKind: "public-surface" },
  );

  const projection = buildPublicSurfaceDocsProjection({
    catalog,
    rootExportNames: ["Button"],
    routeExportNames: {
      "@hua-labs/example": ["Button"],
      "@hua-labs/example/form": ["Form"],
    },
    apiNotes: {
      Button: { description: "Root button.", kind: "component" },
      Form: {
        description: "Subpath form.",
        kind: "component",
        importFrom: "@hua-labs/example/form",
      },
    },
  });

  assert.deepEqual(
    projection.rootExports.map((entry) => entry.name),
    ["Button"],
  );
  assert.throws(
    () =>
      buildPublicSurfaceDocsProjection({
        catalog,
        rootExportNames: ["Button"],
        routeExportNames: {
          "@hua-labs/example": ["Button"],
          "@hua-labs/example/form": ["Form"],
        },
        apiNotes: {
          Phantom: { description: "Missing ownership.", kind: "function" },
        },
      }),
    /requires importFrom/,
  );
});

test("projects packed, repository-only, and absent guide authority exactly", () => {
  const packageDir = tempRoot("hua-public-doc-ax-");
  mkdirSync(join(packageDir, "docs"));
  writeFileSync(join(packageDir, "docs", "GUIDE.md"), "# Guide\n");

  const packed = buildDocumentationAxProjection({
    detailedGuide: {
      path: "./docs/GUIDE.md",
      distribution: "packed",
      description: "The packed usage guide",
    },
    packageDir,
    packageDirName: "hua-example",
    packageFiles: ["docs/GUIDE.md", "dist"],
  });
  assert.deepEqual(packed, {
    description: "The packed usage guide",
    distribution: "packed",
    link: "./docs/GUIDE.md",
    packed: true,
    path: "./docs/GUIDE.md",
    state: "shipped",
  });

  const repository = buildDocumentationAxProjection({
    detailedGuide: {
      path: "./docs/GUIDE.md",
      distribution: "repository",
      description: "The repository usage guide",
    },
    packageDir,
    packageDirName: "hua-example",
    packageFiles: ["dist"],
  });
  assert.deepEqual(repository, {
    description: "The repository usage guide",
    distribution: "repository",
    link: "https://github.com/HUA-Labs/hua-packages/blob/main/packages/hua-example/docs/GUIDE.md",
    packed: false,
    path: "./docs/GUIDE.md",
    state: "repository-only",
  });

  assert.deepEqual(
    buildDocumentationAxProjection({
      detailedGuide: undefined,
      packageDir,
      packageDirName: "hua-example",
      packageFiles: ["dist"],
    }),
    { state: "absent" },
  );
});

test("rejects malformed guide authority and distribution drift", () => {
  const packageDir = tempRoot("hua-public-doc-ax-red-");
  writeFileSync(join(packageDir, "GUIDE.md"), "# Guide\n");
  const valid = {
    path: "./GUIDE.md",
    distribution: "packed",
    description: "Guide",
  };
  const project = (detailedGuide, packageFiles = ["GUIDE.md"]) =>
    buildDocumentationAxProjection({
      detailedGuide,
      packageDir,
      packageDirName: "hua-example",
      packageFiles,
    });

  assert.throws(() => project({ ...valid, extra: true }), /unknown key/);
  assert.throws(() => project({ ...valid, path: "../GUIDE.md" }), /safe/);
  assert.throws(
    () => project({ ...valid, distribution: "remote" }),
    /distribution/,
  );
  assert.throws(() => project({ ...valid, description: "" }), /description/);
  assert.throws(
    () => project({ ...valid, path: "./MISSING.md" }),
    /regular file/,
  );
  assert.throws(() => project(valid, ["dist"]), /packed.*files/);
  assert.throws(
    () => project({ ...valid, distribution: "repository" }),
    /repository.*files/,
  );

  const outside = tempRoot("hua-public-doc-outside-");
  writeFileSync(join(outside, "GUIDE.md"), "# Outside\n");
  symlinkSync(outside, join(packageDir, "linked"));
  assert.throws(
    () => project({ ...valid, path: "./linked/GUIDE.md" }, ["linked/GUIDE.md"]),
    /inside the package/,
  );
});
