import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { test } from "node:test";

const root = fileURLToPath(new URL("../..", import.meta.url));
const checker = join(root, "scripts", "check-dot-aot-source-authority.mjs");
const configPath = join(root, "config", "dot-aot-source-authority.json");

function read(relativePath) {
  return readFileSync(join(root, ...relativePath.split("/")));
}

function text(relativePath) {
  return read(relativePath).toString("utf8");
}

function sha256(relativePath) {
  return createHash("sha256").update(read(relativePath)).digest("hex");
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalValue(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

function digestCanonical(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function runChecker(args = [], cwd = root) {
  return spawnSync(
    process.execPath,
    [join(cwd, "scripts", checker.split("/").at(-1)), ...args],
    {
      cwd,
      encoding: "utf8",
    },
  );
}

function cloneFixture() {
  const parent = mkdtempSync(join(tmpdir(), "dot-aot-authority-"));
  const clone = join(parent, "repo");
  execFileSync("git", ["clone", "--quiet", "--shared", root, clone], {
    stdio: "ignore",
  });
  return { clone, parent };
}

function configFixture(mutator) {
  const parent = mkdtempSync(join(tmpdir(), "dot-aot-config-"));
  const path = join(parent, "authority.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  mutator(config);
  writeFileSync(path, canonicalJson(config));
  return { parent, path };
}

test("derived public manifest preserves release authority and projects exact product fields", () => {
  const manifest = JSON.parse(text("packages/hua-dot-aot/package.json"));
  const publicBase = JSON.parse(
    execFileSync(
      "git",
      [
        "show",
        "fedf3ee4acd687be0fb85c16f8cd4e4a25eae4ea:packages/hua-dot-aot/package.json",
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );

  assert.equal(manifest.version, "0.2.0");
  assert.equal(manifest.engines.node, ">=20.16.0");
  assert.equal(manifest.dependencies["@babel/parser"], "^7.29.0");
  assert.equal(manifest.dependencies["@hua-labs/dot"], "workspace:0.3.0");
  assert.deepEqual(manifest.repository, publicBase.repository);
  assert.deepEqual(manifest.publishConfig, publicBase.publishConfig);
  assert.deepEqual(manifest.files, publicBase.files);

  const normalized = structuredClone(manifest);
  normalized.version = publicBase.version;
  normalized.dependencies["@hua-labs/dot"] =
    publicBase.dependencies["@hua-labs/dot"];
  delete normalized.dependencies["@babel/parser"];
  normalized.engines.node = ">=20.0.0";
  assert.deepEqual(normalized, publicBase);

  const lock = text("pnpm-lock.yaml");
  assert.match(
    lock,
    /packages\/hua-dot-aot:[\s\S]*?'@babel\/parser':\n\s+specifier: \^7\.29\.0\n\s+version: 7\.29\.7/u,
  );
});

test("the 12 platform-exact package rows retain byte-exact product authority", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rows = config.rows.filter(
    (row) => row.disposition === "platform-exact",
  );
  assert.equal(rows.length, 12);
  assert.deepEqual(
    rows.map((row) => row.path),
    [
      "packages/hua-dot-aot/DETAILED_GUIDE.md",
      "packages/hua-dot-aot/LICENSE",
      "packages/hua-dot-aot/src/__tests__/ax-boundary.test.ts",
      "packages/hua-dot-aot/src/__tests__/babel.test.ts",
      "packages/hua-dot-aot/src/__tests__/extract.test.ts",
      "packages/hua-dot-aot/src/__tests__/vite.test.ts",
      "packages/hua-dot-aot/src/babel.ts",
      "packages/hua-dot-aot/src/extract.ts",
      "packages/hua-dot-aot/src/index.ts",
      "packages/hua-dot-aot/src/vite.ts",
      "packages/hua-dot-aot/tsconfig.json",
      "packages/hua-dot-aot/tsup.config.ts",
    ],
  );
  for (const row of rows) {
    assert.equal(row.outputSha256, row.sourceSha256, row.path);
    assert.equal(sha256(row.path), row.sourceSha256, row.path);
  }
});

test("derived doc authority excludes platform-local classification while preserving product truth", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const doc = text("packages/hua-dot-aot/doc.yaml");
  const readme = text("packages/hua-dot-aot/README.md");
  const ai = text("ai-docs/dot-aot.ai.yaml");

  assert.doesNotMatch(doc, /^(?:status|access):/mu);
  assert.doesNotMatch(doc, /internal-core|pre-release/u);
  assert.doesNotMatch(readme, /internal-core|pre-release/u);
  assert.doesNotMatch(ai, /internal-core|pre-release/u);

  for (const marker of [
    "parser-backed Vite transform",
    "Exact import authority",
    "Static options support",
    "Binding And Parser Boundary",
    "Toolchain Boundary",
  ]) {
    assert.ok(doc.includes(marker), marker);
  }
  assert.match(
    doc,
    /default SWC pipeline does not execute\s+this Babel plugin/u,
  );
  for (const marker of [
    "Build-time extraction for static dot() calls",
    "Vite and Babel plugin entrypoints",
    "Dynamic or unsafe calls remain at runtime",
    'detailedGuide: "./DETAILED_GUIDE.md"',
  ]) {
    assert.ok(doc.includes(marker), marker);
  }

  const row = config.rows.find(
    (candidate) => candidate.path === "packages/hua-dot-aot/doc.yaml",
  );
  assert.equal(row.disposition, "derived-reviewed");
  assert.equal(
    row.sourceSha256,
    "57f3e75e86c20faf16fd4c13ff80f5d90c30677b1e730e13a5e5e3a5853090ee",
  );
  assert.equal(row.outputSha256, sha256(row.path));
  assert.notEqual(row.outputSha256, row.sourceSha256);
  assert.notEqual(row.outputSha256, row.publicBaseSha256);

  assert.match(readme, /@hua-labs\/dot-aot\/vite/u);
  assert.match(ai, /node: ">=20\.16\.0"/u);
});

test("the generated public README and AI projection bind the derived doc semantics", () => {
  const readme = text("packages/hua-dot-aot/README.md");
  const ai = text("ai-docs/dot-aot.ai.yaml");
  for (const marker of [
    "authorized static dot() calls",
    "Vite and Babel plugin entrypoints",
    "Dynamic or unsafe calls remain at runtime",
  ]) {
    assert.ok(readme.includes(marker), marker);
  }
  for (const marker of [
    "parser-backed Vite transform",
    "Exact import authority",
    "Static options support",
    'node: ">=20.16.0"',
  ]) {
    assert.ok(ai.includes(marker), marker);
  }
});

test("the pack boundary invokes the dedicated Dot AOT source authority", () => {
  assert.equal(
    existsSync(join(root, "config", "dot-aot-source-authority.json")),
    true,
  );
  assert.equal(
    existsSync(join(root, "scripts", "check-dot-aot-source-authority.mjs")),
    true,
  );
  assert.match(
    text("scripts/check-pack-artifacts.js"),
    /check-dot-aot-source-authority\.mjs/u,
  );
});

test("the complete package union and artifact authority are canonical", () => {
  const raw = readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  assert.equal(raw, canonicalJson(config));
  assert.equal(config.schema, "hua-dot-aot-source-authority.v2");
  assert.equal(config.authorityKind, "platform-dot-aot-package-projection");
  assert.equal(config.packagePath, "packages/hua-dot-aot");
  assert.equal(config.rows.length, 16);
  assert.equal(config.mapDigest, digestCanonical(config.rows));
  assert.deepEqual(
    Object.fromEntries(
      [
        "platform-exact",
        "public-preserved",
        "derived-reviewed",
        "platform-only-excluded",
      ].map((value) => [
        value,
        config.rows.filter((row) => row.disposition === value).length,
      ]),
    ),
    {
      "platform-exact": 12,
      "public-preserved": 0,
      "derived-reviewed": 4,
      "platform-only-excluded": 0,
    },
  );
  assert.equal(
    config.artifact.rosterDigest,
    digestCanonical(config.artifact.files),
  );
  assert.equal(config.artifact.files.length, 16);
  assert.equal(config.artifact.packageName, "@hua-labs/dot-aot");
  assert.equal(config.artifact.packageVersion, "0.2.0");
  assert.equal(config.artifact.tarStreamBytes, 101376);
  assert.equal(
    config.artifact.tarStreamSha256,
    "68f60a1d59496507de57945d8cedb667dd1b1e656fe254bad610a0b1cd938fe8",
  );
  assert.equal(Object.hasOwn(config.artifact, "tarballBytes"), false);
  assert.equal(Object.hasOwn(config.artifact, "tarballSha256"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "repository"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "url"), false);
});

test("portable tar authority admits two gzip envelopes and rejects stream tamper", () => {
  const source = text("scripts/check-dot-aot-source-authority.mjs");
  assert.match(source, /const tarStream = decompressTarball\(compressed\);/u);
  assert.match(source, /sha256\(tarStream\)/u);
  assert.doesNotMatch(source, /sha256\(compressed\)/u);
  assert.doesNotMatch(source, /artifact\.tarball(?:Bytes|Sha256)/u);

  const { clone, parent } = cloneFixture();
  const packDirectory = join(parent, "pack");
  mkdirSync(packDirectory);
  const childEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/(?:token|auth|credential)/iu.test(key),
    ),
  );
  Object.assign(childEnvironment, {
    CI: "true",
    npm_config_ignore_scripts: "true",
  });
  const run = (args) =>
    execFileSync("pnpm", args, {
      cwd: clone,
      env: childEnvironment,
      maxBuffer: 16 * 1024 * 1024,
      stdio: "ignore",
      timeout: 240000,
    });

  try {
    run(["install", "--offline", "--frozen-lockfile", "--ignore-scripts"]);
    run(["--filter", "@hua-labs/dot", "build"]);
    run(["--filter", "@hua-labs/dot-aot", "build"]);
    run([
      "--dir",
      "packages/hua-dot-aot",
      "pack",
      "--pack-destination",
      packDirectory,
    ]);
    const originalPath = join(
      packDirectory,
      readdirSync(packDirectory).find((entry) => entry.endsWith(".tgz")),
    );
    const originalEnvelope = readFileSync(originalPath);
    const tarStream = gunzipSync(originalEnvelope);
    const alternateEnvelope = gzipSync(tarStream, { level: 1 });
    const alternatePath = join(packDirectory, "alternate-envelope.tgz");
    writeFileSync(alternatePath, alternateEnvelope);
    assert.notEqual(
      createHash("sha256").update(originalEnvelope).digest("hex"),
      createHash("sha256").update(alternateEnvelope).digest("hex"),
    );
    assert.equal(
      createHash("sha256").update(tarStream).digest("hex"),
      "68f60a1d59496507de57945d8cedb667dd1b1e656fe254bad610a0b1cd938fe8",
    );
    for (const tarball of [originalPath, alternatePath]) {
      const result = runChecker(["--tarball", tarball], clone);
      assert.equal(result.status, 0, result.stderr);
    }
    const tampered = Buffer.from(tarStream);
    tampered[600] ^= 1;
    const tamperedPath = join(packDirectory, "tampered-stream.tgz");
    writeFileSync(tamperedPath, gzipSync(tampered));
    const rejected = runChecker(["--tarball", tamperedPath], clone);
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /tar-stream-bytes-mismatch/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("every projected package path agrees with its reviewed output digest", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  for (const row of config.rows) {
    const absolute = join(root, ...row.path.split("/"));
    if (row.disposition === "platform-only-excluded") {
      assert.equal(existsSync(absolute), false, row.path);
      continue;
    }
    assert.equal(existsSync(absolute), true, row.path);
    assert.equal(
      createHash("sha256").update(readFileSync(absolute)).digest("hex"),
      row.outputSha256,
      row.path,
    );
  }
});

test("a self-consistent unselected-row reclassification rejects", () => {
  const { parent, path } = configFixture((config) => {
    const row = config.rows.find(
      (candidate) => candidate.path === "packages/hua-dot-aot/LICENSE",
    );
    row.disposition = "public-preserved";
    config.mapDigest = digestCanonical(config.rows);
  });
  try {
    const result = runChecker(["--config", path]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /reviewed-map-digest-mismatch/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a self-consistent platform semantic digest drift rejects", () => {
  const { parent, path } = configFixture((config) => {
    const row = config.rows.find(
      (candidate) => candidate.path === "packages/hua-dot-aot/doc.yaml",
    );
    row.sourceSha256 = createHash("sha256")
      .update("foreign platform semantic authority")
      .digest("hex");
    config.mapDigest = digestCanonical(config.rows);
  });
  try {
    const result = runChecker(["--config", path]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /reviewed-map-digest-mismatch/u);
    assert.doesNotMatch(result.stderr, /foreign platform semantic authority/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("missing, extra, duplicate, shuffled, oversize, and escaped rows reject", () => {
  const cases = [
    {
      mutate: (config) => config.rows.splice(1, 0, { ...config.rows[0] }),
      expected: /duplicate-row/u,
    },
    {
      mutate: (config) => {
        config.rows[0].path = "packages/hua-dot-aot/../outside.ts";
      },
      expected: /invalid-row-path/u,
    },
    {
      mutate: (config) => config.rows.pop(),
      expected: /map-digest-mismatch/u,
    },
    {
      mutate: (config) => {
        const template = config.rows.find(
          (row) => row.path === "packages/hua-dot-aot/src/index.ts",
        );
        config.rows.push({
          ...template,
          path: "packages/hua-dot-aot/zz-unexpected.ts",
        });
      },
      expected: /map-digest-mismatch/u,
    },
    {
      mutate: (config) => config.rows.reverse(),
      expected: /unsorted-rows/u,
    },
    {
      mutate: (config) => {
        config.rows = [];
      },
      expected: /invalid-row-count/u,
    },
    {
      mutate: (config) => {
        config.rows = Array.from({ length: 513 }, () => ({
          ...config.rows[0],
        }));
      },
      expected: /invalid-row-count/u,
    },
  ];
  for (const { mutate, expected } of cases) {
    const { parent, path } = configFixture(mutate);
    try {
      const result = runChecker(["--config", path]);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, expected);
    } finally {
      rmSync(parent, { force: true, recursive: true });
    }
  }
});

test("an ordinary clean tracked package is admitted", () => {
  const result = runChecker();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /16 rows/u);
});

test("a platform-local classification leak in derived public doc rejects", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-aot/doc.yaml";
    writeFileSync(
      join(clone, relative),
      `${text(relative)}\naccess: internal-core\n`,
    );
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /current-output-mismatch/u);
    assert.doesNotMatch(result.stderr, /internal-core/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a hidden tracked-byte change is rejected as a non-ordinary index", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-aot/src/index.ts";
    writeFileSync(join(clone, relative), "hidden projection drift\n");
    execFileSync("git", ["update-index", "--assume-unchanged", relative], {
      cwd: clone,
    });
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /index-entry-not-ordinary/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a symlink substituted for a tracked package path is rejected", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-aot/src/index.ts";
    rmSync(join(clone, relative));
    symlinkSync("native.ts", join(clone, relative));
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /current-file-not-regular/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("an unmapped package file is rejected", () => {
  const { clone, parent } = cloneFixture();
  try {
    writeFileSync(
      join(clone, "packages/hua-dot-aot/src/unmapped.ts"),
      "export {};\n",
    );
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /untracked-package-path/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a substituted tarball is rejected before artifact admission", () => {
  const parent = mkdtempSync(join(tmpdir(), "dot-core-tar-"));
  try {
    const tarball = join(parent, "substituted.tgz");
    writeFileSync(tarball, gzipSync(Buffer.alloc(1024)));
    const result = runChecker(["--tarball", tarball]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /tar-stream-bytes-mismatch/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});
