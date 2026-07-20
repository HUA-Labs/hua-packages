import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

const root = fileURLToPath(new URL("../..", import.meta.url));
const checker = join(root, "scripts/check-pack-artifacts.js");
const ownedRoots = [];

afterEach(() => {
  for (const ownedRoot of ownedRoots.splice(0)) {
    rmSync(ownedRoot, { recursive: true, force: true });
  }
});

function createFixture({
  exports,
  files,
  name = "@hua-labs/fixture",
  version = "0.0.0-test",
  manifest = {},
}) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "hua-pack-artifact-test-"));
  ownedRoots.push(fixtureRoot);
  const packageRoot = join(fixtureRoot, "contents", "package");
  mkdirSync(packageRoot, { recursive: true });
  writeFileSync(
    join(packageRoot, "package.json"),
    `${JSON.stringify(
      {
        name,
        version,
        exports,
        ...manifest,
      },
      null,
      2,
    )}\n`,
  );

  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = join(packageRoot, relativePath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, contents);
  }

  const tarball = join(fixtureRoot, "candidate.tgz");
  packFixture(fixtureRoot, tarball);
  return { fixtureRoot, packageRoot, tarball };
}

function packFixture(fixtureRoot, tarball) {
  execFileSync("tar", [
    "-czf",
    tarball,
    "-C",
    join(fixtureRoot, "contents"),
    "package",
  ]);
}

function runChecker(...tarballs) {
  return spawnSync(process.execPath, [checker, ...tarballs], {
    encoding: "utf8",
  });
}

const sourceTypes = {
  "types/icons.d.ts": "export type IconName = string;\n",
};

const uiWorkspaceManifest = JSON.parse(
  readFileSync(join(root, "packages", "hua-ui", "package.json"), "utf8"),
);
const uiPublicProfile = JSON.parse(
  readFileSync(
    join(root, "packages", "hua-ui", "public-core-profile.json"),
    "utf8",
  ),
);
const dotWorkspaceManifest = JSON.parse(
  readFileSync(join(root, "packages", "hua-dot", "package.json"), "utf8"),
);

function collectProfileTargets(value, targets = new Set()) {
  if (typeof value === "string") {
    targets.add(value.replace(/^\.\//u, ""));
    return targets;
  }
  for (const child of Object.values(value))
    collectProfileTargets(child, targets);
  return targets;
}

function contentsForTarget(target) {
  if (target.endsWith(".css")) return ".fixture { color: currentColor; }\n";
  if (target.endsWith(".mjs")) return "export {};\n";
  return "export {};\n";
}

function createUiProfileFixture({
  omit = [],
  extraFiles = {},
  mutateManifest,
} = {}) {
  const packedManifest = structuredClone(uiWorkspaceManifest);
  packedManifest.dependencies["@hua-labs/dot"] = dotWorkspaceManifest.version;
  mutateManifest?.(packedManifest);
  const retainedTargets = new Set();
  for (const entry of uiPublicProfile.entries) {
    if (entry.disposition === "retained") {
      collectProfileTargets(entry.manifestTarget, retainedTargets);
    }
  }
  const omitted = new Set(omit);
  const files = Object.fromEntries(
    [...retainedTargets]
      .filter((target) => !omitted.has(target))
      .map((target) => [target, contentsForTarget(target)]),
  );
  files["DETAILED_GUIDE.md"] = "# UI guide\n";
  Object.assign(files, extraFiles);
  return createFixture({
    exports: packedManifest.exports,
    files,
    name: packedManifest.name,
    version: packedManifest.version,
    manifest: packedManifest,
  });
}

test("rejects TypeScript source used as an installed JavaScript runtime target", () => {
  const { tarball } = createFixture({
    exports: {
      ".": {
        "react-native": {
          types: "./types/icons.d.ts",
          default: "./types/icons.ts",
        },
        default: "./dist/index.mjs",
      },
      "./icons": {
        types: "./types/icons.d.ts",
        import: "./types/icons.ts",
        default: "./types/icons.ts",
      },
      "./icons-require": {
        types: "./types/icons.d.ts",
        require: "./types/icons.ts",
      },
    },
    files: {
      ...sourceTypes,
      "types/icons.ts": "export const Icon = {};\n",
      "dist/index.mjs": "export {};\n",
    },
  });

  const result = runChecker(tarball);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /unsupported runtime refs:/);
  assert.match(result.stdout, /import: package\/types\/icons\.ts/);
  assert.match(result.stdout, /default: package\/types\/icons\.ts/);
  assert.match(result.stdout, /require: package\/types\/icons\.ts/);
  assert.match(result.stdout, /react-native: package\/types\/icons\.ts/);
});

test("accepts compiled ESM runtime targets with source-backed types", () => {
  const { tarball } = createFixture({
    exports: {
      "./icons": {
        types: "./types/icons.d.ts",
        import: "./dist/icons.mjs",
        default: "./dist/icons.mjs",
      },
    },
    files: {
      ...sourceTypes,
      "dist/icons.mjs": "export const Icon = {};\n",
    },
  });

  const result = runChecker(tarball);

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Pack artifact check passed\./);
});

test("rejects a missing installed runtime target", () => {
  const { tarball } = createFixture({
    exports: {
      "./icons": {
        types: "./types/icons.d.ts",
        import: "./dist/icons.mjs",
        default: "./dist/icons.mjs",
      },
    },
    files: sourceTypes,
  });

  const result = runChecker(tarball);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /missing runtime refs:/);
  assert.match(result.stdout, /import: package\/dist\/icons\.mjs/);
  assert.match(result.stdout, /default: package\/dist\/icons\.mjs/);
});

test("preserves intentional style assets under a default condition", () => {
  const { tarball } = createFixture({
    exports: {
      "./styles.css": {
        default: "./styles/default.css",
      },
    },
    files: {
      "styles/default.css": ".fixture { color: currentColor; }\n",
    },
  });

  const result = runChecker(tarball);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("checks substituted tarball bytes instead of trusting the filename", () => {
  const fixture = createFixture({
    exports: {
      "./icons": {
        types: "./types/icons.d.ts",
        import: "./dist/icons.mjs",
        default: "./dist/icons.mjs",
      },
    },
    files: {
      ...sourceTypes,
      "dist/icons.mjs": "export const Icon = {};\n",
    },
  });

  assert.equal(runChecker(fixture.tarball).status, 0);
  rmSync(join(fixture.packageRoot, "dist"), { recursive: true, force: true });
  packFixture(fixture.fixtureRoot, fixture.tarball);

  const substituted = runChecker(fixture.tarball);
  assert.equal(substituted.status, 1);
  assert.match(substituted.stdout, /missing runtime refs:/);
});

test("admits only the exact UI retained profile tar boundary", async (t) => {
  const exact = createUiProfileFixture();
  const accepted = runChecker(exact.tarball);
  assert.equal(accepted.status, 0, accepted.stdout + accepted.stderr);

  await t.test("missing retained target", () => {
    const target = "dist/interactive-kanban.mjs";
    const fixture = createUiProfileFixture({ omit: [target] });
    const result = runChecker(fixture.tarball);
    assert.equal(result.status, 1);
    assert.match(
      result.stdout,
      /missing retained target: package\/dist\/interactive-kanban\.mjs/u,
    );
  });

  await t.test("deferred target present", () => {
    const fixture = createUiProfileFixture({
      extraFiles: { "dist/lucide.mjs": "export {};\n" },
    });
    const result = runChecker(fixture.tarball);
    assert.equal(result.status, 1);
    assert.match(
      result.stdout,
      /deferred target present: package\/dist\/lucide\.mjs/u,
    );
  });

  await t.test("profile leaked", () => {
    const fixture = createUiProfileFixture({
      extraFiles: { "public-core-profile.json": "{}\n" },
    });
    const result = runChecker(fixture.tarball);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /non-shipped public-core profile is present/u);
  });

  await t.test("test hidden below an allowed source prefix", () => {
    const fixture = createUiProfileFixture({
      extraFiles: {
        "src/components/icons/__tests__/hidden.test.ts": "throw new Error();\n",
      },
    });
    const result = runChecker(fixture.tarball);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /UI public-core profile issues:/u);
    assert.match(result.stdout, /hidden\.test\.ts/u);
  });

  await t.test("manifest engine drift", () => {
    const fixture = createUiProfileFixture({
      mutateManifest(manifest) {
        manifest.engines.node = ">=20.0.0";
      },
    });
    const result = runChecker(fixture.tarball);
    assert.equal(result.status, 1);
    assert.match(
      result.stdout,
      /package manifest does not match UI public-core authority/u,
    );
  });

  await t.test("packed files omit the shipped guide authority", () => {
    const fixture = createUiProfileFixture({
      mutateManifest(manifest) {
        manifest.files = manifest.files.filter(
          (entry) => entry !== "DETAILED_GUIDE.md",
        );
      },
    });
    const result = runChecker(fixture.tarball);
    assert.equal(result.status, 1);
    assert.match(
      result.stdout,
      /package manifest does not match UI public-core authority/u,
    );
  });

  await t.test("guide omitted", () => {
    const fixture = createUiProfileFixture({ omit: ["DETAILED_GUIDE.md"] });
    rmSync(join(fixture.packageRoot, "DETAILED_GUIDE.md"), { force: true });
    packFixture(fixture.fixtureRoot, fixture.tarball);
    const result = runChecker(fixture.tarball);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /missing public-core document/u);
  });
});
