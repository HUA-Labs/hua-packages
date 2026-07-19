import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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

function createFixture({ exports, files }) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "hua-pack-artifact-test-"));
  ownedRoots.push(fixtureRoot);
  const packageRoot = join(fixtureRoot, "contents", "package");
  mkdirSync(packageRoot, { recursive: true });
  writeFileSync(
    join(packageRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "@hua-labs/ui",
        version: "0.0.0-test",
        exports,
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
  "src/components/icons/index.ts": "export type IconName = string;\n",
};

test("rejects TypeScript source used as an installed JavaScript runtime target", () => {
  const { tarball } = createFixture({
    exports: {
      ".": {
        "react-native": {
          types: "./src/components/icons/index.ts",
          default: "./src/components/icons/index.ts",
        },
        default: "./dist/index.mjs",
      },
      "./icons": {
        types: "./src/components/icons/index.ts",
        import: "./src/components/icons/index.ts",
        default: "./src/components/icons/index.ts",
      },
      "./icons-require": {
        types: "./src/components/icons/index.ts",
        require: "./src/components/icons/index.ts",
      },
    },
    files: {
      ...sourceTypes,
      "dist/index.mjs": "export {};\n",
    },
  });

  const result = runChecker(tarball);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /unsupported runtime refs:/);
  assert.match(
    result.stdout,
    /import: package\/src\/components\/icons\/index\.ts/,
  );
  assert.match(
    result.stdout,
    /default: package\/src\/components\/icons\/index\.ts/,
  );
  assert.match(
    result.stdout,
    /require: package\/src\/components\/icons\/index\.ts/,
  );
  assert.match(
    result.stdout,
    /react-native: package\/src\/components\/icons\/index\.ts/,
  );
});

test("accepts compiled ESM runtime targets with source-backed types", () => {
  const { tarball } = createFixture({
    exports: {
      "./icons": {
        types: "./src/components/icons/index.ts",
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
        types: "./src/components/icons/index.ts",
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
        default: "./src/styles/default.css",
      },
    },
    files: {
      "src/styles/default.css": ".fixture { color: currentColor; }\n",
    },
  });

  const result = runChecker(tarball);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("checks substituted tarball bytes instead of trusting the filename", () => {
  const fixture = createFixture({
    exports: {
      "./icons": {
        types: "./src/components/icons/index.ts",
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
