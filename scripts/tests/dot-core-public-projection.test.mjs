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
const checker = join(root, "scripts", "check-dot-core-source-authority.mjs");
const configPath = join(root, "config", "dot-core-source-authority.json");

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
  const parent = mkdtempSync(join(tmpdir(), "dot-core-authority-"));
  const clone = join(parent, "repo");
  execFileSync("git", ["clone", "--quiet", "--shared", root, clone], {
    stdio: "ignore",
  });
  return { clone, parent };
}

function configFixture(mutator) {
  const parent = mkdtempSync(join(tmpdir(), "dot-core-config-"));
  const path = join(parent, "authority.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  mutator(config);
  writeFileSync(path, canonicalJson(config));
  return { parent, path };
}

test("public manifest preserves release fields and exposes the landed Flutter entry", () => {
  const manifest = JSON.parse(text("packages/hua-dot/package.json"));
  const publicBase = JSON.parse(
    execFileSync(
      "git",
      [
        "show",
        "92aa99a1957e8514f9ae7ca271f1765f8d6974fa:packages/hua-dot/package.json",
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );

  assert.equal(manifest.version, "0.3.0");
  assert.deepEqual(manifest.repository, {
    type: "git",
    url: "https://github.com/HUA-Labs/hua-packages.git",
    directory: "packages/hua-dot",
  });
  assert.deepEqual(manifest.files, [
    "CHANGELOG.md",
    "AI_GUIDE.md",
    "DETAILED_GUIDE.md",
    "dist",
  ]);
  assert.deepEqual(manifest.exports["./flutter"], {
    types: "./dist/flutter.d.mts",
    import: "./dist/flutter.mjs",
    default: "./dist/flutter.mjs",
  });
  assert.equal(manifest.engines.node, ">=20.16.0");

  const normalized = structuredClone(manifest);
  normalized.version = publicBase.version;
  delete normalized.exports["./flutter"];
  normalized.files = normalized.files.filter(
    (entry) => entry !== "AI_GUIDE.md",
  );
  assert.deepEqual(normalized, publicBase);
});

test("tsup owns the Flutter runtime and declaration entry", () => {
  const source = text("packages/hua-dot/tsup.config.ts");
  assert.match(source, /flutter:\s*"src\/flutter\.ts"/u);
});

test("M746 Flutter source and focused tests are byte-exact platform projections", () => {
  const expected = new Map([
    [
      "packages/hua-dot/src/flutter.ts",
      "41a42b78d5a85732a63e22e52036cbb47d3cfc24c1c550a9c0d8109af5fc9716",
    ],
    [
      "packages/hua-dot/src/flutter-wire.ts",
      "f37621f3828d1eb9325921c7ce3a5a24c29644f49a1f2c72bcddd7e29e632527",
    ],
    [
      "packages/hua-dot/src/__tests__/flutter-entry.test.ts",
      "4180fff1c6884487f9789e3f05ef2bbcbed615948cf27e8b78f3c8de2a33f478",
    ],
    [
      "packages/hua-dot/src/__tests__/flutter-wire.test.ts",
      "e7d5ad2a229f8b943c4233671d94bbd9729e3e929f3eb4a08739be5a52eacd33",
    ],
  ]);

  for (const [path, digest] of expected) {
    assert.equal(existsSync(join(root, ...path.split("/"))), true, path);
    assert.equal(sha256(path), digest, path);
  }
});

test("M826 documentation truth and packed AI guide are present", () => {
  assert.equal(
    sha256("packages/hua-dot/AI_GUIDE.md"),
    "2fba56c5a00939873142e7f307fbc8a97c6860b63639492db3c778b298a1859a",
  );
  const guide = text("packages/hua-dot/DETAILED_GUIDE.md");
  const doc = text("packages/hua-dot/doc.yaml");
  for (const value of [
    "@hua-labs/dot/flutter",
    "FlutterRecipeWireEnvelope",
    "createFlutterRecipeWire",
    "serializeFlutterRecipeWire",
  ]) {
    assert.match(guide, new RegExp(value.replaceAll("/", "\\/"), "u"));
    assert.match(doc, new RegExp(value.replaceAll("/", "\\/"), "u"));
  }
});

test("the pack boundary invokes a dedicated Dot source/tar authority", () => {
  assert.equal(
    existsSync(join(root, "config", "dot-core-source-authority.json")),
    true,
  );
  assert.equal(
    existsSync(join(root, "scripts", "check-dot-core-source-authority.mjs")),
    true,
  );
  assert.match(
    text("scripts/check-pack-artifacts.js"),
    /check-dot-core-source-authority\.mjs/u,
  );
});

test("the complete package union and artifact authority are canonical", () => {
  const raw = readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  assert.equal(raw, canonicalJson(config));
  assert.equal(config.schema, "hua-dot-core-source-authority.v2");
  assert.equal(config.authorityKind, "platform-dot-package-projection");
  assert.equal(config.packagePath, "packages/hua-dot");
  assert.equal(config.rows.length, 188);
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
      "platform-exact": 184,
      "public-preserved": 0,
      "derived-reviewed": 3,
      "platform-only-excluded": 1,
    },
  );
  assert.equal(
    config.artifact.rosterDigest,
    digestCanonical(config.artifact.files),
  );
  assert.equal(config.artifact.files.length, 31);
  assert.equal(config.artifact.packageName, "@hua-labs/dot");
  assert.equal(config.artifact.packageVersion, "0.3.0");
  assert.equal(config.artifact.tarStreamBytes, 956416);
  assert.equal(
    config.artifact.tarStreamSha256,
    "265af3212f228f82aa036c164d0f641aa6841e73c38268de277ea3d80db1d29d",
  );
  assert.equal(Object.hasOwn(config.artifact, "tarballBytes"), false);
  assert.equal(Object.hasOwn(config.artifact, "tarballSha256"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "repository"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "url"), false);
});

test("portable tar authority admits two gzip envelopes and rejects stream tamper", () => {
  const source = text("scripts/check-dot-core-source-authority.mjs");
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
    run([
      "--dir",
      "packages/hua-dot",
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
      "265af3212f228f82aa036c164d0f641aa6841e73c38268de277ea3d80db1d29d",
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
      (candidate) => candidate.path === "packages/hua-dot/LICENSE",
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

test("duplicate and path-escaped map rows reject before Git authority", () => {
  const cases = [
    (config) => config.rows.splice(1, 0, { ...config.rows[0] }),
    (config) => {
      config.rows[0].path = "packages/hua-dot/../outside.ts";
    },
  ];
  for (const mutate of cases) {
    const { parent, path } = configFixture(mutate);
    try {
      const result = runChecker(["--config", path]);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /(?:duplicate-row|invalid-row-path)/u);
    } finally {
      rmSync(parent, { force: true, recursive: true });
    }
  }
});

test("an ordinary clean tracked package is admitted", () => {
  const result = runChecker();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /188 rows/u);
});

test("a hidden tracked-byte change is rejected as a non-ordinary index", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot/src/index.ts";
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
    const relative = "packages/hua-dot/src/index.ts";
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
      join(clone, "packages/hua-dot/src/unmapped.ts"),
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
