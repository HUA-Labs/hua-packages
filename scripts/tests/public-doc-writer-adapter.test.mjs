import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test, { after } from "node:test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TSX = join(REPO_ROOT, "node_modules", ".bin", "tsx");
const TEMP_ROOTS = new Set();

after(() => {
  for (const root of TEMP_ROOTS) rmSync(root, { recursive: true, force: true });
});

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), "hua-public-doc-writer-"));
  TEMP_ROOTS.add(root);
  mkdirSync(join(root, "scripts", "templates"), { recursive: true });
  mkdirSync(join(root, "packages"), { recursive: true });
  mkdirSync(join(root, "ai-docs"), { recursive: true });
  copyFileSync(
    join(REPO_ROOT, "scripts", "generate-docs.ts"),
    join(root, "scripts", "generate-docs.ts"),
  );
  copyFileSync(
    join(REPO_ROOT, "scripts", "templates", "readme.hbs"),
    join(root, "scripts", "templates", "readme.hbs"),
  );
  copyFileSync(
    join(REPO_ROOT, "scripts", "templates", "ai-yaml.hbs"),
    join(root, "scripts", "templates", "ai-yaml.hbs"),
  );
  const packageAx = join(REPO_ROOT, "scripts", "package-ax.mjs");
  if (existsSync(packageAx)) {
    copyFileSync(packageAx, join(root, "scripts", "package-ax.mjs"));
  }
  symlinkSync(join(REPO_ROOT, "node_modules"), join(root, "node_modules"));
  return root;
}

function writePackage(root, name, options = {}) {
  const packageDir = join(root, "packages", name);
  mkdirSync(join(packageDir, "src"), { recursive: true });
  const guide = options.guide;
  const guidePath = (guide?.path ?? "./GUIDE.md").replace(/^\.\//, "");
  const files = options.files ?? ["dist"];
  if (options.files === undefined && guide?.distribution === "packed") {
    files.unshift(guidePath);
  }
  writeFileSync(
    join(packageDir, "package.json"),
    `${JSON.stringify(
      {
        name: options.fullName ?? `@hua-labs/${name.replace(/^hua-/, "")}`,
        version: "1.2.3",
        description: `${name} package`,
        files,
        ...(options.exports === undefined ? {} : { exports: options.exports }),
        ...(options.nodeEngine === undefined
          ? {}
          : { engines: { node: options.nodeEngine } }),
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(packageDir, "src", "index.ts"),
    "export function example() { return true; }\n",
  );
  if (guide && options.writeGuide !== false) {
    const guideFile = join(packageDir, guidePath);
    mkdirSync(dirname(guideFile), { recursive: true });
    writeFileSync(guideFile, `# ${name} Guide\n`);
  }
  const guideYaml = guide
    ? `\ndetailedGuide:\n  path: ${JSON.stringify(guide.path ?? "./GUIDE.md")}\n  distribution: ${JSON.stringify(guide.distribution)}\n  description: ${JSON.stringify(guide.description ?? "Usage details")}\n${options.guideExtra ?? ""}`
    : "";
  writeFileSync(
    join(packageDir, "doc.yaml"),
    options.docContent ??
      `overview: ${JSON.stringify(`${name} overview`)}\nfeatures:\n  - ${JSON.stringify("Feature")}\nquickStart: ${JSON.stringify("example();")}\n${guideYaml}${options.docExtra ?? ""}`,
  );
  if (options.publicProfile !== undefined) {
    writeFileSync(
      join(packageDir, "public-core-profile.json"),
      `${JSON.stringify(options.publicProfile, null, 2)}\n`,
    );
  }
}

function runWriter(root, args = []) {
  return spawnSync(TSX, ["scripts/generate-docs.ts", ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

function output(root, name) {
  return {
    readme: readFileSync(join(root, "packages", name, "README.md"), "utf8"),
    ai: readFileSync(
      join(root, "ai-docs", `${name.replace(/^hua-/, "")}.ai.yaml`),
      "utf8",
    ),
  };
}

test("renders shipped, repository-only, and absent guide authority deterministically", () => {
  const root = makeRoot();
  writePackage(root, "hua-shipped", {
    guide: { distribution: "packed", description: "Packed details" },
  });
  writePackage(root, "hua-repository", {
    guide: { distribution: "repository", description: "Repository details" },
  });
  writePackage(root, "hua-plain");

  const first = runWriter(root);
  assert.equal(first.status, 0, first.stderr || first.stdout);
  const firstOutputs = {
    shipped: output(root, "hua-shipped"),
    repository: output(root, "hua-repository"),
    plain: output(root, "hua-plain"),
  };
  const second = runWriter(root);
  assert.equal(second.status, 0, second.stderr || second.stdout);
  assert.deepEqual(
    {
      shipped: output(root, "hua-shipped"),
      repository: output(root, "hua-repository"),
      plain: output(root, "hua-plain"),
    },
    firstOutputs,
  );

  assert.match(firstOutputs.shipped.readme, /Packed details/);
  assert.match(firstOutputs.shipped.readme, /included in the package tarball/);
  assert.match(firstOutputs.shipped.ai, /state: "shipped"/);
  assert.match(firstOutputs.repository.readme, /Repository details/);
  assert.match(
    firstOutputs.repository.readme,
    /https:\/\/github\.com\/HUA-Labs\/hua-packages\/blob\/main\/packages\/hua-repository\/GUIDE\.md/,
  );
  assert.match(
    firstOutputs.repository.readme,
    /not included in the package tarball/,
  );
  assert.match(firstOutputs.repository.ai, /state: "repository-only"/);
  assert.doesNotMatch(firstOutputs.plain.readme, /Detailed Guide/);
  assert.doesNotMatch(firstOutputs.plain.ai, /detailedGuide:/);

  const validate = runWriter(root, ["--validate"]);
  assert.equal(validate.status, 0, validate.stderr || validate.stdout);
  const templatePath = join(root, "scripts", "templates", "readme.hbs");
  const template = readFileSync(templatePath, "utf8");
  writeFileSync(templatePath, `${template}x`);
  const staleTemplate = runWriter(root, ["--validate"]);
  assert.equal(staleTemplate.status, 1);
  assert.match(staleTemplate.stdout, /README\.md/);
  writeFileSync(templatePath, template);
  writeFileSync(
    join(root, "packages", "hua-shipped", "README.md"),
    `${firstOutputs.shipped.readme}x`,
  );
  const stale = runWriter(root, ["--validate"]);
  assert.equal(stale.status, 1);
  assert.match(stale.stdout, /hua-shipped\/README\.md/);
});

test("projects the exact package Node engine with the platform fallback", () => {
  const root = makeRoot();
  writePackage(root, "hua-node-20", { nodeEngine: ">=20.16.0" });
  writePackage(root, "hua-node-22", { nodeEngine: ">=22.0.0" });
  writePackage(root, "hua-node-fallback");

  const result = runWriter(root);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(output(root, "hua-node-20").ai, /node: ">=20\.16\.0"/);
  assert.match(output(root, "hua-node-22").ai, /node: ">=22\.0\.0"/);
  assert.match(output(root, "hua-node-fallback").ai, /node: ">=20\.0\.0"/);
});

test("projects the exact UI public-core profile and filters deferred API authority", async (t) => {
  const sourceProfile = JSON.parse(
    readFileSync(
      join(REPO_ROOT, "packages", "hua-ui", "public-core-profile.json"),
      "utf8",
    ),
  );
  const retainedEntries = sourceProfile.entries.filter(
    (entry) => entry.disposition === "retained",
  );
  const deferredEntries = sourceProfile.entries.filter(
    (entry) => entry.disposition === "deferred",
  );
  const canonicalImport = (subpath) =>
    subpath === "."
      ? sourceProfile.package
      : `${sourceProfile.package}${subpath.slice(1)}`;
  const utf8Sorted = (values) =>
    [...values].sort((left, right) =>
      Buffer.from(left).compare(Buffer.from(right)),
    );
  const retained = utf8Sorted(
    retainedEntries.map((entry) => canonicalImport(entry.subpath)),
  );
  const deferred = utf8Sorted(
    deferredEntries.map((entry) => canonicalImport(entry.subpath)),
  );
  const features = [
    `Public 2.4 core candidate (source-ready only) retains exactly 27 package entries: ${retained.join(", ")}.`,
    `Public 2.4 core candidate defers exactly 10 package entries and they are unavailable: ${deferred.join(", ")}.`,
    "Source-ready is not release-ready: final tarball, DTS, installed-consumer, version, release-plan, and npm authority remain unproven.",
  ];
  const docContent = `overview: "Profile projection"\nfeatures:\n${features
    .map((feature) => `  - ${JSON.stringify(feature)}`)
    .join(
      "\n",
    )}\nquickStart: "example();"\ndetailedGuide:\n  path: "./DETAILED_GUIDE.md"\n  distribution: "packed"\n  description: "Full workspace usage plus the exact source-ready public 2.4 core-candidate boundary"\napiFilter: notes-only\napiNotes:\n  retainedRoot:\n    description: "Retained root API"\n    kind: "function"\n  deferredAx:\n    description: "Deferred AX API"\n    kind: "function"\n    importFrom: "@hua-labs/ui/ax"\n`;
  const exports = Object.fromEntries(
    retainedEntries.map((entry) => [entry.subpath, entry.manifestTarget]),
  );

  function writeFixture(root, profile = sourceProfile) {
    writePackage(root, "hua-profile", {
      fullName: "@hua-labs/ui",
      nodeEngine: ">=20.16.0",
      files: ["dist", "DETAILED_GUIDE.md"],
      guide: {
        path: "./DETAILED_GUIDE.md",
        distribution: "packed",
        description:
          "Full workspace usage plus the exact source-ready public 2.4 core-candidate boundary",
      },
      exports,
      publicProfile: profile,
      docContent,
    });
    for (const entry of profile.entries) {
      if (entry.kind !== "javascript") continue;
      const sourcePath = join(
        root,
        "packages",
        "hua-profile",
        entry.tsup.source,
      );
      mkdirSync(dirname(sourcePath), { recursive: true });
      writeFileSync(sourcePath, "export {};\n");
    }
  }

  const root = makeRoot();
  writeFixture(root);
  const result = runWriter(root, ["--package", "hua-profile"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generated = output(root, "hua-profile");
  assert.match(generated.readme, /Retained root API/u);
  assert.doesNotMatch(generated.readme, /Deferred AX API/u);
  assert.doesNotMatch(generated.ai, /name: "deferredAx"/u);
  assert.match(generated.ai, /public_core_profile:/u);
  assert.match(generated.ai, /candidate_status: "source-ready"/u);
  assert.match(generated.ai, /release_selection: null/u);
  assert.match(generated.ai, /entry_count: 37/u);
  assert.match(generated.ai, /retained_count: 27/u);
  assert.match(generated.ai, /deferred_count: 10/u);
  assert.match(generated.ai, /javascript_count: 30/u);
  assert.match(generated.ai, /asset_count: 7/u);

  await t.test("missing profile", () => {
    const missingRoot = makeRoot();
    writePackage(missingRoot, "hua-profile", {
      fullName: "@hua-labs/ui",
      nodeEngine: ">=20.16.0",
      files: ["dist", "DETAILED_GUIDE.md"],
      guide: { distribution: "packed" },
      exports,
      docContent,
    });
    const missing = runWriter(missingRoot, ["--package", "hua-profile"]);
    assert.notEqual(missing.status, 0);
    assert.match(
      `${missing.stdout}\n${missing.stderr}`,
      /requires public-core-profile/u,
    );
  });

  const invalidCases = [
    ["release selection", (profile) => (profile.releaseSelection = {})],
    [
      "padded engine",
      (profile) => (profile.installedEngineRange = " >=20.16.0"),
    ],
    [
      "duplicate subpath",
      (profile) => (profile.entries[1].subpath = profile.entries[0].subpath),
    ],
    ["path escape", (profile) => (profile.entries[1].subpath = "./../escape")],
    [
      "reclassified entry",
      (profile) => (profile.entries[0].disposition = "deferred"),
    ],
    [
      "stale tsup output",
      (profile) => (profile.entries[0].tsup.output = "dist/foreign.mjs"),
    ],
  ];
  for (const [name, mutate] of invalidCases) {
    await t.test(name, () => {
      const invalidRoot = makeRoot();
      const profile = structuredClone(sourceProfile);
      mutate(profile);
      writeFixture(invalidRoot, profile);
      const invalid = runWriter(invalidRoot, ["--package", "hua-profile"]);
      assert.notEqual(invalid.status, 0, name);
    });
  }
});

test("writer derives both guide claims from the effective npm tarball roster", async (t) => {
  const cases = [
    {
      name: "packed directory",
      guide: { path: "./docs/GUIDE.md", distribution: "packed" },
      files: ["docs"],
      accepted: true,
    },
    {
      name: "packed glob",
      guide: { path: "./docs/GUIDE.md", distribution: "packed" },
      files: ["docs/*.md"],
      accepted: true,
    },
    {
      name: "repository directory mismatch",
      guide: { path: "./docs/GUIDE.md", distribution: "repository" },
      files: ["docs"],
      accepted: false,
    },
    {
      name: "repository glob mismatch",
      guide: { path: "./docs/GUIDE.md", distribution: "repository" },
      files: ["docs/*.md"],
      accepted: false,
    },
    {
      name: "packed mandatory inclusion",
      guide: { path: "./LICENSE", distribution: "packed" },
      files: ["dist"],
      accepted: true,
    },
    {
      name: "repository mandatory-inclusion mismatch",
      guide: { path: "./LICENSE", distribution: "repository" },
      files: ["dist"],
      accepted: false,
    },
    {
      name: "repository excluded guide",
      guide: { path: "./GUIDE.md", distribution: "repository" },
      files: ["dist"],
      accepted: true,
    },
    {
      name: "packed excluded-guide mismatch",
      guide: { path: "./GUIDE.md", distribution: "packed" },
      files: ["dist"],
      accepted: false,
    },
  ];

  for (const fixture of cases) {
    await t.test(fixture.name, () => {
      const root = makeRoot();
      writePackage(root, "hua-packlist", {
        guide: {
          ...fixture.guide,
          description: fixture.name,
        },
        files: fixture.files,
      });
      const result = runWriter(root, ["--package", "hua-packlist"]);
      if (!fixture.accepted) {
        assert.notEqual(result.status, 0);
        assert.match(
          `${result.stdout}\n${result.stderr}`,
          new RegExp(`${fixture.guide.distribution}.*tarball`),
        );
        return;
      }

      assert.equal(result.status, 0, result.stderr || result.stdout);
      const generated = output(root, "hua-packlist");
      assert.match(generated.readme, new RegExp(fixture.name));
      assert.match(
        generated.ai,
        new RegExp(
          fixture.guide.distribution === "packed"
            ? 'state: "shipped"'
            : 'state: "repository-only"',
        ),
      );
    });
  }
});

test("fails closed on malformed guide and package-root authority", async (t) => {
  const cases = [
    [
      "unknown top-level field",
      { docExtra: "unknownAuthority: true\n" },
      /unknown doc\.yaml key/,
    ],
    [
      "duplicate yaml key",
      { docExtra: "overview: duplicate\n" },
      /Map keys must be unique/,
    ],
    [
      "duplicate guide authority",
      {
        guide: { distribution: "packed" },
        docExtra: "readme:\n  detailedGuide: ./GUIDE.md\n",
      },
      /cannot be declared twice/,
    ],
    [
      "unknown guide field",
      {
        guide: { distribution: "packed" },
        guideExtra: "  unknownAuthority: true\n",
      },
      /unknown key/,
    ],
    [
      "path escape",
      { guide: { distribution: "packed", path: "../GUIDE.md" } },
      /safe/,
    ],
    [
      "missing guide",
      { guide: { distribution: "packed" }, writeGuide: false },
      /regular file/,
    ],
    [
      "distribution mismatch",
      { guide: { distribution: "repository" }, docExtra: "" },
      null,
    ],
  ];

  for (const [name, options, pattern] of cases) {
    await t.test(name, () => {
      const root = makeRoot();
      writePackage(root, "hua-invalid", options);
      if (name === "distribution mismatch") {
        const packagePath = join(
          root,
          "packages",
          "hua-invalid",
          "package.json",
        );
        const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
        pkg.files.unshift("GUIDE.md");
        writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
      }
      const result = runWriter(root, [
        "--validate",
        "--package",
        "hua-invalid",
      ]);
      assert.notEqual(result.status, 0);
      if (pattern) assert.match(`${result.stdout}\n${result.stderr}`, pattern);
    });
  }

  const escaped = runWriter(makeRoot(), [
    "--validate",
    "--package",
    "../escape",
  ]);
  assert.notEqual(escaped.status, 0);
  assert.match(
    `${escaped.stdout}\n${escaped.stderr}`,
    /package.*safe|invalid package/i,
  );

  const linkedPackageRoot = makeRoot();
  writePackage(linkedPackageRoot, "hua-linked");
  renameSync(
    join(linkedPackageRoot, "packages", "hua-linked"),
    join(linkedPackageRoot, "foreign-package"),
  );
  symlinkSync(
    join(linkedPackageRoot, "foreign-package"),
    join(linkedPackageRoot, "packages", "hua-linked"),
  );
  const linkedPackage = runWriter(linkedPackageRoot, [
    "--validate",
    "--package",
    "hua-linked",
  ]);
  assert.notEqual(linkedPackage.status, 0);
  assert.match(
    `${linkedPackage.stdout}\n${linkedPackage.stderr}`,
    /package root.*regular directory/,
  );

  const linkedOutputRoot = makeRoot();
  writePackage(linkedOutputRoot, "hua-output");
  rmSync(join(linkedOutputRoot, "ai-docs"), { recursive: true });
  mkdirSync(join(linkedOutputRoot, "foreign-ai"));
  symlinkSync(
    join(linkedOutputRoot, "foreign-ai"),
    join(linkedOutputRoot, "ai-docs"),
  );
  const linkedOutput = runWriter(linkedOutputRoot, ["--validate"]);
  assert.notEqual(linkedOutput.status, 0);
  assert.match(
    `${linkedOutput.stdout}\n${linkedOutput.stderr}`,
    /AI output root.*regular directory/,
  );
});

test("current UI docs derive the exact retained profile without copyable deferred routes", () => {
  const packageRoot = join(REPO_ROOT, "packages", "hua-ui");
  const manifest = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8"),
  );
  const profileBytes = readFileSync(
    join(packageRoot, "public-core-profile.json"),
  );
  const profile = JSON.parse(profileBytes.toString("utf8"));
  const doc = readFileSync(join(packageRoot, "doc.yaml"), "utf8");
  const guide = readFileSync(join(packageRoot, "DETAILED_GUIDE.md"), "utf8");
  const readme = readFileSync(join(packageRoot, "README.md"), "utf8");
  const ai = readFileSync(join(REPO_ROOT, "ai-docs", "ui.ai.yaml"), "utf8");
  const canonicalImport = (subpath) =>
    subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
  const classified = { retained: [], deferred: [] };
  for (const entry of profile.entries) {
    classified[entry.disposition].push(canonicalImport(entry.subpath));
  }
  for (const values of Object.values(classified)) {
    values.sort((left, right) => Buffer.from(left).compare(Buffer.from(right)));
  }
  const retainedFeature = `Public 2.4 core candidate (source-ready only) retains exactly 27 package entries: ${classified.retained.join(", ")}.`;
  const deferredFeature = `Public 2.4 core candidate defers exactly 10 package entries and they are unavailable: ${classified.deferred.join(", ")}.`;

  assert.equal(profile.schema, "hua-ui-public-core-profile.v1");
  assert.equal(profile.package, manifest.name);
  assert.equal(profile.releaseSelection, null);
  assert.equal(profile.entries.length, 37);
  assert.equal(classified.retained.length, 27);
  assert.equal(classified.deferred.length, 10);
  assert.equal(
    profile.entries.filter((entry) => entry.kind === "javascript").length,
    30,
  );
  assert.equal(
    profile.entries.filter((entry) => entry.kind === "asset").length,
    7,
  );
  assert.equal(manifest.engines.node, ">=20.16.0");
  assert.equal(manifest.version, "2.3.0");
  assert.ok(manifest.files.includes("DETAILED_GUIDE.md"));
  assert.ok(!manifest.files.includes("public-core-profile.json"));
  assert.deepEqual(
    Object.keys(manifest.exports).sort(),
    profile.entries
      .filter((entry) => entry.disposition === "retained")
      .map((entry) => entry.subpath)
      .sort(),
  );
  for (const generated of [doc, readme, ai]) {
    assert.ok(generated.includes(retainedFeature));
    assert.ok(generated.includes(deferredFeature));
    assert.match(generated, /Source-ready is not release-ready/u);
  }
  assert.match(
    ai,
    new RegExp(
      `digest: "${createHash("sha256").update(profileBytes).digest("hex")}"`,
      "u",
    ),
  );
  for (const deferredImport of classified.deferred) {
    for (const match of guide.matchAll(
      /```(?:tsx?|jsx?|bash|sh)\n([\s\S]*?)```/gu,
    )) {
      assert.ok(
        !match[1].includes(deferredImport),
        `copyable guide exposes ${deferredImport}`,
      );
    }
  }
  for (const deferredApi of [
    "getUiAxCatalog",
    "getDefaultThemeFoundationPreview",
    "validateSDUIPageSchemaV1",
    "getDefaultSDUIManifest",
  ]) {
    assert.doesNotMatch(readme, new RegExp("\\| `" + deferredApi + "`", "u"));
    assert.doesNotMatch(ai, new RegExp(`name: "${deferredApi}"`, "u"));
  }
  assert.doesNotMatch(guide, /<IconProvider set="lucide">/u);
});

test("current public package outputs remain byte-identical under validate", () => {
  assert.ok(lstatSync(join(REPO_ROOT, "ai-docs")).isDirectory());
  const result = spawnSync(TSX, ["scripts/generate-docs.ts", "--validate"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("writer, AX adapter, and README template bytes are review-locked", () => {
  const expected = {
    "scripts/generate-docs.ts":
      "914f6624aebdf3e8bb6d31aac6b55b535f2f2f4b2b58398132e4ddda77db4b01",
    "scripts/package-ax.mjs":
      "c8b07a3291e4733eba9c9689932586749333dc33e5f0ee3bc1ecfa69f954bcd6",
    "scripts/templates/ai-yaml.hbs":
      "7c195e7f33acd1c432083c103e5ccf287e8b7d2cd4e5e2975097b296fe25989b",
    "scripts/templates/readme.hbs":
      "bcae04c0249c22f4d7dafa079347876be474dbb48bf95c6f8f33d9953fca3879",
  };
  for (const [path, digest] of Object.entries(expected)) {
    const bytes = readFileSync(join(REPO_ROOT, path));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      digest,
      path,
    );
  }
});
