import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
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

function writePackageManifest(packageDir, files, extra = {}) {
  writeFileSync(
    join(packageDir, "package.json"),
    `${JSON.stringify(
      {
        name: "@hua-labs/example",
        version: "0.0.0-test",
        files,
        ...extra,
      },
      null,
      2,
    )}\n`,
  );
}

function npmPacklist(packageDir) {
  const result = spawnSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts", "--loglevel=silent"],
    {
      cwd: packageDir,
      encoding: "utf8",
      timeout: 30000,
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.length, 1);
  return parsed[0].files.map((entry) => entry.path);
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
  writePackageManifest(packageDir, ["docs/GUIDE.md", "dist"]);

  const packed = buildDocumentationAxProjection({
    detailedGuide: {
      path: "./docs/GUIDE.md",
      distribution: "packed",
      description: "The packed usage guide",
    },
    packageDir,
    packageDirName: "hua-example",
  });
  assert.deepEqual(packed, {
    description: "The packed usage guide",
    distribution: "packed",
    link: "./docs/GUIDE.md",
    packed: true,
    path: "./docs/GUIDE.md",
    state: "shipped",
  });

  writePackageManifest(packageDir, ["dist"]);
  const repository = buildDocumentationAxProjection({
    detailedGuide: {
      path: "./docs/GUIDE.md",
      distribution: "repository",
      description: "The repository usage guide",
    },
    packageDir,
    packageDirName: "hua-example",
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
    }),
    { state: "absent" },
  );
});

test("binds both distribution claims to the effective npm tarball roster", () => {
  const isolatedPacklistRoot = tempRoot("hua-public-packlist-test-");
  const cases = [
    {
      name: "directory allowlist",
      path: "docs/GUIDE.md",
      files: ["docs"],
      admitted: true,
    },
    {
      name: "glob allowlist",
      path: "docs/GUIDE.md",
      files: ["docs/*.md"],
      admitted: true,
    },
    {
      name: "npm mandatory README inclusion",
      path: "README.md",
      files: ["dist"],
      admitted: true,
    },
    {
      name: "excluded ordinary guide",
      path: "GUIDE.md",
      files: ["dist"],
      admitted: false,
    },
  ];

  for (const fixture of cases) {
    const packageDir = tempRoot("hua-public-doc-packlist-");
    mkdirSync(join(packageDir, "docs"), { recursive: true });
    writeFileSync(join(packageDir, fixture.path), `# ${fixture.name}\n`);
    writePackageManifest(packageDir, fixture.files, {
      scripts: {
        prepack:
          "node -e \"require('node:fs').writeFileSync('LIFECYCLE_RAN', 'true')\"",
      },
    });
    assert.equal(
      npmPacklist(packageDir).includes(fixture.path),
      fixture.admitted,
      fixture.name,
    );

    const project = (distribution) =>
      buildDocumentationAxProjection({
        detailedGuide: {
          path: `./${fixture.path}`,
          distribution,
          description: fixture.name,
        },
        packageDir,
        packageDirName: "hua-example",
      });

    const previousTmpdir = process.env.TMPDIR;
    process.env.TMPDIR = isolatedPacklistRoot;
    try {
      if (fixture.admitted) {
        assert.equal(project("packed").state, "shipped", fixture.name);
        assert.throws(() => project("repository"), /repository.*tarball/);
      } else {
        assert.throws(() => project("packed"), /packed.*tarball/);
        assert.equal(
          project("repository").state,
          "repository-only",
          fixture.name,
        );
      }
    } finally {
      if (previousTmpdir === undefined) delete process.env.TMPDIR;
      else process.env.TMPDIR = previousTmpdir;
    }
    assert.equal(
      readdirSync(packageDir).some(
        (name) => name === "LIFECYCLE_RAN" || name.endsWith(".tgz"),
      ),
      false,
      fixture.name,
    );
  }
  assert.deepEqual(
    readdirSync(isolatedPacklistRoot).filter((name) =>
      name.startsWith("hua-public-packlist-"),
    ),
    [],
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
  const project = (detailedGuide, packageFiles = ["GUIDE.md"]) => {
    writePackageManifest(packageDir, packageFiles);
    return buildDocumentationAxProjection({
      detailedGuide,
      packageDir,
      packageDirName: "hua-example",
    });
  };

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
  assert.throws(() => project(valid, ["dist"]), /packed.*tarball/);
  assert.throws(
    () => project({ ...valid, distribution: "repository" }),
    /repository.*tarball/,
  );

  const outside = tempRoot("hua-public-doc-outside-");
  writeFileSync(join(outside, "GUIDE.md"), "# Outside\n");
  symlinkSync(outside, join(packageDir, "linked"));
  assert.throws(
    () => project({ ...valid, path: "./linked/GUIDE.md" }, ["linked/GUIDE.md"]),
    /inside the package/,
  );
});
