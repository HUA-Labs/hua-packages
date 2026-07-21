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
const checker = join(root, "scripts", "check-dot-lsp-source-authority.mjs");
const configPath = join(root, "config", "dot-lsp-source-authority.json");

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
  return `${JSON.stringify(canonicalValue(value), null, 2).replace(
    /\[\n\s+("(?:[^"\\]|\\.)*")\n\s*\]/gu,
    "[$1]",
  )}\n`;
}

function digestCanonical(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function admitsExactLowerBound(range, version) {
  const floor = /^>=(\d+)\.(\d+)\.(\d+)$/u.exec(range);
  const candidate = /^(\d+)\.(\d+)\.(\d+)$/u.exec(version);
  assert.ok(floor, `unsupported engine range: ${range}`);
  assert.ok(candidate, `unsupported version: ${version}`);
  for (let index = 1; index <= 3; index += 1) {
    const difference = Number(candidate[index]) - Number(floor[index]);
    if (difference !== 0) return difference > 0;
  }
  return true;
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
  const parent = mkdtempSync(join(tmpdir(), "dot-lsp-authority-"));
  const clone = join(parent, "repo");
  execFileSync("git", ["clone", "--quiet", "--shared", root, clone], {
    stdio: "ignore",
  });
  return { clone, parent };
}

function configFixture(mutator) {
  const parent = mkdtempSync(join(tmpdir(), "dot-lsp-config-"));
  const path = join(parent, "authority.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  mutator(config);
  writeFileSync(path, canonicalJson(config));
  return { parent, path };
}

test("derived public manifest preserves release authority and projects exact product fields", () => {
  const manifest = JSON.parse(text("packages/hua-dot-lsp/package.json"));
  const publicBase = JSON.parse(
    execFileSync(
      "git",
      [
        "show",
        "8a6bc52ceb46a716b2bedf9418fc59a29869bfb3:packages/hua-dot-lsp/package.json",
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );

  assert.equal(manifest.version, "0.1.4");
  assert.equal(manifest.engines.node, ">=20.16.0");
  assert.equal(manifest.dependencies["@hua-labs/dot"], "workspace:0.3.0");
  assert.equal(
    manifest.scripts.build,
    "tsup src/index.ts --format esm --shims && node -e \"require('node:fs').rmSync('dist/index.d.ts',{force:true})\"",
  );
  assert.deepEqual(manifest.repository, publicBase.repository);
  assert.deepEqual(manifest.publishConfig, publicBase.publishConfig);
  assert.deepEqual(manifest.files, publicBase.files);

  const normalized = structuredClone(manifest);
  normalized.version = publicBase.version;
  normalized.dependencies["@hua-labs/dot"] =
    publicBase.dependencies["@hua-labs/dot"];
  normalized.scripts.build = publicBase.scripts.build;
  normalized.engines = publicBase.engines;
  assert.deepEqual(normalized, publicBase);

  assert.equal(
    sha256("pnpm-lock.yaml"),
    "54fa28132c255d0cf70427534ad5ce6775ba63e7e4f306a065af2a0c40a82a06",
  );
});

test("the 15 platform-exact package rows retain byte-exact product authority", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rows = config.rows.filter(
    (row) => row.disposition === "platform-exact",
  );
  assert.equal(rows.length, 15);
  assert.deepEqual(
    rows.map((row) => row.path),
    [
      "packages/hua-dot-lsp/DETAILED_GUIDE.md",
      "packages/hua-dot-lsp/LICENSE",
      "packages/hua-dot-lsp/doc.yaml",
      "packages/hua-dot-lsp/src/__tests__/completions.test.ts",
      "packages/hua-dot-lsp/src/__tests__/diagnostics.test.ts",
      "packages/hua-dot-lsp/src/__tests__/server-info.test.ts",
      "packages/hua-dot-lsp/src/__tests__/settings.test.ts",
      "packages/hua-dot-lsp/src/completions.ts",
      "packages/hua-dot-lsp/src/diagnostics.ts",
      "packages/hua-dot-lsp/src/dot-regions.ts",
      "packages/hua-dot-lsp/src/index.ts",
      "packages/hua-dot-lsp/src/server-info.ts",
      "packages/hua-dot-lsp/src/settings.ts",
      "packages/hua-dot-lsp/tsconfig.json",
      "packages/hua-dot-lsp/vitest.config.ts",
    ],
  );
  for (const row of rows) {
    assert.equal(row.outputSha256, row.sourceSha256, row.path);
    assert.equal(sha256(row.path), row.sourceSha256, row.path);
  }
});

test("platform docs and derived projections preserve bounded LSP release truth", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const doc = text("packages/hua-dot-lsp/doc.yaml");
  const readme = text("packages/hua-dot-lsp/README.md");
  const ai = text("ai-docs/dot-lsp.ai.yaml");

  for (const marker of [
    "package-local bounded hand-maintained completion catalog",
    "direct runtime dependency",
    "manifest-derived initialize server identity",
    "channel-pending",
  ]) {
    assert.ok(doc.includes(marker), marker);
    assert.ok(readme.includes(marker), marker);
    assert.ok(ai.includes(marker), marker);
  }
  assert.match(doc, /does not publish a stable JavaScript import API/u);
  assert.match(readme, /does not publish a stable JavaScript import API/u);
  assert.match(ai, /does not create a JavaScript import API/u);
  assert.doesNotMatch(doc, /peer dependency|generated at build time/u);
  assert.doesNotMatch(readme, /peer dependency|generated at build time/u);
  assert.doesNotMatch(ai, /peer dependency|generated at build time/u);

  const row = config.rows.find(
    (candidate) => candidate.path === "packages/hua-dot-lsp/doc.yaml",
  );
  assert.equal(row.disposition, "platform-exact");
  assert.equal(row.outputSha256, sha256(row.path));
  assert.equal(row.outputSha256, row.sourceSha256);
  assert.notEqual(row.outputSha256, row.publicBaseSha256);

  assert.match(readme, /dot-lsp --stdio/u);
  assert.match(ai, /node: ">=20\.16\.0"/u);
});

test("the generated public README and AI projection bind the exact doc semantics", () => {
  const readme = text("packages/hua-dot-lsp/README.md");
  const ai = text("ai-docs/dot-lsp.ai.yaml");
  for (const marker of [
    "package-local bounded hand-maintained completion catalog",
    "direct runtime dependency",
    "manifest-derived initialize server identity",
    "does not claim Marketplace availability",
  ]) {
    assert.ok(readme.includes(marker), marker);
    assert.ok(ai.includes(marker), marker);
  }
  assert.match(ai, /# Version: 0\.1\.4/u);
  assert.match(ai, /node: ">=20\.16\.0"/u);
});

test("the public manifest and release docs bind the exact Node 20.16 floor", () => {
  const manifest = JSON.parse(text("packages/hua-dot-lsp/package.json"));
  const dotManifest = JSON.parse(text("packages/hua-dot/package.json"));
  const guide = text("packages/hua-dot-lsp/DETAILED_GUIDE.md");
  const doc = text("packages/hua-dot-lsp/doc.yaml");
  const readme = text("packages/hua-dot-lsp/README.md");
  const ai = text("ai-docs/dot-lsp.ai.yaml");

  assert.equal(manifest.engines.node, ">=20.16.0");
  assert.equal(dotManifest.engines.node, ">=20.16.0");
  assert.deepEqual(
    ["20.0.0", "20.15.1", "20.16.0"].map((version) => [
      version,
      admitsExactLowerBound(manifest.engines.node, version),
      admitsExactLowerBound(dotManifest.engines.node, version),
    ]),
    [
      ["20.0.0", false, false],
      ["20.15.1", false, false],
      ["20.16.0", true, true],
    ],
  );
  assert.match(guide, /supported minimum is \*\*Node\.js 20\.16\.0\*\*/u);
  assert.match(guide, /Package managers may warn or refuse installation/u);
  assert.match(
    guide,
    /Runtime behavior below the supported floor is not guaranteed/u,
  );
  assert.doesNotMatch(guide, /exit immediately|server crash/u);
  assert.match(ai, /node: ">=20\.16\.0"/u);
  assert.doesNotMatch(doc, />=20\.0\.0|Node\.js 20 or later/u);
  assert.doesNotMatch(readme, />=20\.0\.0|Node\.js 20 or later/u);
});

test("server identity is manifest-derived and ambient inputs are non-authority", () => {
  const serverInfo = text("packages/hua-dot-lsp/src/server-info.ts");
  const index = text("packages/hua-dot-lsp/src/index.ts");

  assert.match(
    serverInfo,
    /import packageManifest from "\.\.\/package\.json" with \{ type: "json" \};/u,
  );
  assert.match(
    serverInfo,
    /DOT_LSP_SERVER_INFO = createDotLspServerInfo\(\s*packageManifest\.version/u,
  );
  assert.doesNotMatch(
    serverInfo,
    /process\.env|node:fs|readFile|Date\.|new Date|npm(?:js)?/u,
  );
  assert.match(index, /serverInfo: DOT_LSP_SERVER_INFO/u);
  assert.doesNotMatch(index, /serverInfo:\s*\{[\s\S]*?version:/u);
});

test("stale public-first provenance is not source or base authority", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  assert.equal(
    config.publicBase.commit,
    "8a6bc52ceb46a716b2bedf9418fc59a29869bfb3",
  );
  assert.equal(
    config.sourceAuthority.commit,
    "19385e52e2f3694eb06fb15f2e13d5cce3270280",
  );
  assert.notEqual(
    config.publicBase.commit,
    "742da1e7dd5d53d06b0614ee53cea70c514e29ff",
  );
  assert.notEqual(
    config.sourceAuthority.commit,
    "31fdb629236dc58fdf7d415cab356fa8602399e1",
  );
});

test("the pack boundary invokes the dedicated Dot LSP source authority", () => {
  assert.equal(
    existsSync(join(root, "config", "dot-lsp-source-authority.json")),
    true,
  );
  assert.equal(
    existsSync(join(root, "scripts", "check-dot-lsp-source-authority.mjs")),
    true,
  );
  assert.match(
    text("scripts/check-pack-artifacts.js"),
    /check-dot-lsp-source-authority\.mjs/u,
  );
});

test("the complete package union and artifact authority are canonical", () => {
  const raw = readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  assert.equal(raw, canonicalJson(config));
  assert.equal(config.schema, "hua-dot-lsp-source-authority.v2");
  assert.equal(config.authorityKind, "platform-dot-lsp-package-projection");
  assert.equal(config.packagePath, "packages/hua-dot-lsp");
  assert.equal(config.rows.length, 18);
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
      "platform-exact": 15,
      "public-preserved": 0,
      "derived-reviewed": 3,
      "platform-only-excluded": 0,
    },
  );
  assert.equal(
    config.artifact.rosterDigest,
    digestCanonical(config.artifact.files),
  );
  assert.equal(config.artifact.files.length, 6);
  assert.equal(config.artifact.packageName, "@hua-labs/dot-lsp");
  assert.equal(config.artifact.packageVersion, "0.1.4");
  assert.equal(config.artifact.tarStreamBytes, 96768);
  assert.equal(
    config.artifact.tarStreamSha256,
    "41b370f78505a5f87cdf655e79fdbfb863094b740ad1a66cf213b638c424a119",
  );
  assert.equal(Object.hasOwn(config.artifact, "tarballBytes"), false);
  assert.equal(Object.hasOwn(config.artifact, "tarballSha256"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "repository"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "url"), false);
});

test("portable tar authority admits two gzip envelopes and rejects stream tamper", () => {
  const source = text("scripts/check-dot-lsp-source-authority.mjs");
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
    run(["--filter", "@hua-labs/dot-lsp", "build"]);
    run([
      "--dir",
      "packages/hua-dot-lsp",
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
      "41b370f78505a5f87cdf655e79fdbfb863094b740ad1a66cf213b638c424a119",
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
      (candidate) => candidate.path === "packages/hua-dot-lsp/LICENSE",
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
      (candidate) => candidate.path === "packages/hua-dot-lsp/doc.yaml",
    );
    row.sourceSha256 = createHash("sha256")
      .update("foreign platform semantic authority")
      .digest("hex");
    row.outputSha256 = row.sourceSha256;
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
        config.rows[0].path = "packages/hua-dot-lsp/../outside.ts";
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
          (row) => row.path === "packages/hua-dot-lsp/src/index.ts",
        );
        config.rows.push({
          ...template,
          path: "packages/hua-dot-lsp/zz-unexpected.ts",
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
  assert.match(result.stdout, /18 rows/u);
});

test("a one-byte generated or product-doc tamper rejects without leaking bytes", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-lsp/doc.yaml";
    writeFileSync(
      join(clone, relative),
      `${text(relative)}\nprivate-product-doc-sentinel\n`,
    );
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /current-output-mismatch/u);
    assert.doesNotMatch(result.stderr, /private-product-doc-sentinel/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a hidden tracked-byte change is rejected as a non-ordinary index", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-lsp/src/index.ts";
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
    const relative = "packages/hua-dot-lsp/src/index.ts";
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
      join(clone, "packages/hua-dot-lsp/src/unmapped.ts"),
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
