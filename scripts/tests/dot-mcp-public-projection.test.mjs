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
const checker = join(root, "scripts", "check-dot-mcp-source-authority.mjs");
const configPath = join(root, "config", "dot-mcp-source-authority.json");

function read(relativePath) {
  return readFileSync(join(root, ...relativePath.split("/")));
}

function text(relativePath) {
  return read(relativePath).toString("utf8");
}

function manifest(relativePath) {
  return JSON.parse(text(relativePath));
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
    { cwd, encoding: "utf8" },
  );
}

function cloneFixture() {
  const parent = mkdtempSync(join(tmpdir(), "dot-mcp-authority-"));
  const clone = join(parent, "repo");
  execFileSync("git", ["clone", "--quiet", "--shared", root, clone], {
    stdio: "ignore",
  });
  return { clone, parent };
}

function configFixture(mutator) {
  const parent = mkdtempSync(join(tmpdir(), "dot-mcp-config-"));
  const path = join(parent, "authority.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  mutator(config);
  writeFileSync(path, canonicalJson(config));
  return { parent, path };
}

test("the public MCP manifest preserves release fields and projects the effective Node floor", () => {
  const mcp = manifest("packages/hua-dot-mcp/package.json");
  const dot = manifest("packages/hua-dot/package.json");

  assert.equal(mcp.version, "0.2.0");
  assert.equal(mcp.dependencies["@hua-labs/dot"], "workspace:0.3.0");
  assert.equal(mcp.engines.node, ">=20.16.0");
  assert.equal(dot.engines.node, ">=20.16.0");
});

test("the projected source registers the exact six-tool surface", () => {
  const source = text("packages/hua-dot-mcp/src/index.ts");
  const names = [
    ...source.matchAll(
      /server\.(?:tool|registerTool)\(\s*\n?\s*["']([^"']+)["']/gu,
    ),
  ].map((match) => match[1]);

  assert.deepEqual(names, [
    "dot_resolve",
    "dot_explain",
    "dot_flutter_wire",
    "dot_complete",
    "dot_capabilities",
    "dot_validate",
  ]);
  assert.equal(new Set(names).size, names.length);
  assert.match(source, /\.object\([\s\S]*?\)\s*\.strict\(\)/u);
});

test("manifest-derived server identity replaces the stale literal", () => {
  const source = text("packages/hua-dot-mcp/src/index.ts");
  assert.equal(
    existsSync(join(root, "packages/hua-dot-mcp/src/server-info.ts")),
    true,
  );
  assert.match(source, /new McpServer\(DOT_MCP_SERVER_INFO\)/u);
  assert.doesNotMatch(source, /version:\s*["']0\.1\.0["']/u);
});

test("Flutter wire source and focused evidence are present", () => {
  for (const relativePath of [
    "packages/hua-dot-mcp/src/flutter-wire.ts",
    "packages/hua-dot-mcp/src/__tests__/flutter-wire.test.ts",
    "packages/hua-dot-mcp/src/__tests__/server-info.test.ts",
  ]) {
    assert.equal(existsSync(join(root, relativePath)), true, relativePath);
  }
});

test("release docs bind the six tools, SDK boundary, identity, and Node floor", () => {
  const combined = [
    text("packages/hua-dot-mcp/doc.yaml"),
    text("packages/hua-dot-mcp/README.md"),
    text("packages/hua-dot-mcp/DETAILED_GUIDE.md"),
    text("ai-docs/dot-mcp.ai.yaml"),
  ].join("\n");

  for (const marker of ["dot_flutter_wire", "package-local bounded", "SDK"]) {
    assert.ok(combined.includes(marker), marker);
  }
  assert.match(combined, />=20\.16\.0|Node\.js 20\.16\.0/u);
  assert.doesNotMatch(combined, /exit immediately|server crash/u);
});

test("the public pack boundary invokes a dedicated MCP authority checker", () => {
  assert.equal(
    existsSync(join(root, "config/dot-mcp-source-authority.json")),
    true,
  );
  assert.equal(
    existsSync(join(root, "scripts/check-dot-mcp-source-authority.mjs")),
    true,
  );
  assert.match(
    text("scripts/check-pack-artifacts.js"),
    /check-dot-mcp-source-authority\.mjs/u,
  );
});

test("the derived manifest preserves the public release boundary exactly", () => {
  const current = manifest("packages/hua-dot-mcp/package.json");
  const publicBase = JSON.parse(
    execFileSync(
      "git",
      [
        "show",
        "5f0fa9feb54de4cfc343c5c7c4fe73a54c4e14a9:packages/hua-dot-mcp/package.json",
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );

  assert.equal(current.version, publicBase.version);
  assert.deepEqual(current.repository, publicBase.repository);
  assert.deepEqual(current.publishConfig, publicBase.publishConfig);
  assert.deepEqual(current.files, publicBase.files);
  assert.deepEqual(current.bin, publicBase.bin);
  assert.deepEqual(current.dependencies, publicBase.dependencies);
  assert.equal(current.dependencies["@hua-labs/dot"], "workspace:0.3.0");
  assert.equal(current.engines.node, ">=20.16.0");
  assert.equal(
    current.scripts.build,
    "tsup src/index.ts --format esm --target es2022 && node -e \"require('node:fs').rmSync('dist/index.d.ts',{force:true})\"",
  );

  const normalized = structuredClone(current);
  normalized.scripts.build = publicBase.scripts.build;
  normalized.engines = publicBase.engines;
  assert.deepEqual(normalized, publicBase);
});

test("the 12 platform-exact rows retain byte-exact product authority", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rows = config.rows.filter(
    (row) => row.disposition === "platform-exact",
  );
  assert.equal(rows.length, 12);
  assert.deepEqual(
    rows.map((row) => row.path),
    [
      "packages/hua-dot-mcp/DETAILED_GUIDE.md",
      "packages/hua-dot-mcp/LICENSE",
      "packages/hua-dot-mcp/doc.yaml",
      "packages/hua-dot-mcp/src/__tests__/flutter-wire.test.ts",
      "packages/hua-dot-mcp/src/__tests__/server-info.test.ts",
      "packages/hua-dot-mcp/src/__tests__/tools.test.ts",
      "packages/hua-dot-mcp/src/capabilities.ts",
      "packages/hua-dot-mcp/src/flutter-wire.ts",
      "packages/hua-dot-mcp/src/index.ts",
      "packages/hua-dot-mcp/src/server-info.ts",
      "packages/hua-dot-mcp/tsconfig.json",
      "packages/hua-dot-mcp/vitest.config.ts",
    ],
  );
  for (const row of rows) {
    assert.equal(row.outputSha256, row.sourceSha256, row.path);
    assert.equal(sha256(row.path), row.sourceSha256, row.path);
  }
});

test("generated MCP AI truth binds the reviewed public identity and support floor", () => {
  const ai = text("ai-docs/dot-mcp.ai.yaml");
  assert.equal(
    sha256("ai-docs/dot-mcp.ai.yaml"),
    "561218733d104f13e8c9b461d675903d8b3a2631591798f25bd99320a340c109",
  );
  assert.match(ai, /version: "0\.1\.3"/u);
  assert.match(ai, /node: ">=20\.16\.0"/u);
  assert.match(ai, /dot_flutter_wire/u);
  assert.match(ai, /package-local bounded completion catalog/u);
  assert.match(
    ai,
    /SDK or schema validation can fail before a registered handler/u,
  );
});

test("the exact Node floor rejects pre-floor versions without a runtime promise", () => {
  const range = manifest("packages/hua-dot-mcp/package.json").engines.node;
  assert.deepEqual(
    ["20.0.0", "20.15.1", "20.16.0"].map((version) => [
      version,
      admitsExactLowerBound(range, version),
    ]),
    [
      ["20.0.0", false],
      ["20.15.1", false],
      ["20.16.0", true],
    ],
  );
  const combined = [
    text("packages/hua-dot-mcp/DETAILED_GUIDE.md"),
    text("packages/hua-dot-mcp/README.md"),
    text("packages/hua-dot-mcp/doc.yaml"),
    text("ai-docs/dot-mcp.ai.yaml"),
  ].join("\n");
  assert.doesNotMatch(combined, /exit immediately|server crash/u);
});

test("server identity is manifest-derived and ambient inputs are non-authority", () => {
  const serverInfo = text("packages/hua-dot-mcp/src/server-info.ts");
  const index = text("packages/hua-dot-mcp/src/index.ts");
  assert.match(
    serverInfo,
    /import packageManifest from "\.\.\/package\.json";/u,
  );
  assert.match(
    serverInfo,
    /DOT_MCP_SERVER_INFO = createDotMcpServerInfo\(\s*packageManifest\.version/u,
  );
  assert.match(serverInfo, /Object\.freeze\(\{ name: "dot-mcp", version \}\)/u);
  assert.doesNotMatch(
    serverInfo,
    /process\.env|node:fs|readFile|Date\.|new Date|npm(?:js)?/u,
  );
  assert.match(index, /new McpServer\(DOT_MCP_SERVER_INFO\)/u);
  assert.doesNotMatch(index, /version:\s*["']0\.1\.0["']/u);
});

test("the source and public-base tuples are exact and opaque", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  assert.deepEqual(config.publicBase, {
    commit: "5f0fa9feb54de4cfc343c5c7c4fe73a54c4e14a9",
    packageTree: "70942905900e26e8c14e8d6bd4bf0ace8759f867",
    tree: "36a9a87cc14d85b2ec016fa648ecc35c549082a2",
  });
  assert.deepEqual(config.sourceAuthority, {
    commit: "19385e52e2f3694eb06fb15f2e13d5cce3270280",
    packageTree: "10aa33008bd5c46d141a1ad2dbc14d20f62a2de2",
    tree: "7ab93813e0e098c98379460be4acf3016e61a8d1",
  });
  assert.equal(Object.hasOwn(config.sourceAuthority, "repository"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "url"), false);
});

test("the complete package union and artifact authority are canonical", () => {
  const raw = readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  assert.equal(raw, canonicalJson(config));
  assert.equal(config.schema, "hua-dot-mcp-source-authority.v1");
  assert.equal(config.authorityKind, "platform-dot-mcp-package-projection");
  assert.equal(config.packagePath, "packages/hua-dot-mcp");
  assert.equal(config.rows.length, 15);
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
      "derived-reviewed": 3,
      "platform-only-excluded": 0,
    },
  );
  assert.equal(
    config.artifact.rosterDigest,
    digestCanonical(config.artifact.files),
  );
  assert.equal(config.artifact.files.length, 6);
  assert.equal(config.artifact.packageName, "@hua-labs/dot-mcp");
  assert.equal(config.artifact.packageVersion, "0.2.0");
  assert.equal(config.artifact.tarStreamBytes, 68608);
  assert.equal(
    config.artifact.tarStreamSha256,
    "52ea19941a439cd4a15c2a9afc31975e99616fad8694a6b996f49c67cc02c71e",
  );
  assert.equal(Object.hasOwn(config.artifact, "tarballBytes"), false);
  assert.equal(Object.hasOwn(config.artifact, "tarballSha256"), false);
});

test("every projected package path agrees with its reviewed output digest", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  for (const row of config.rows) {
    const absolute = join(root, ...row.path.split("/"));
    assert.equal(existsSync(absolute), true, row.path);
    assert.equal(sha256(row.path), row.outputSha256, row.path);
  }
});

test("tar authority binds the decompressed stream instead of the host gzip envelope", () => {
  const source = text("scripts/check-dot-mcp-source-authority.mjs");
  assert.match(source, /const tarStream = decompressTarball\(compressed\);/u);
  assert.match(source, /sha256\(tarStream\)/u);
  assert.doesNotMatch(source, /sha256\(compressed\)/u);
  assert.doesNotMatch(source, /artifact\.tarball(?:Bytes|Sha256)/u);
});

test("two gzip envelopes of the canonical tar pass while one tar byte rejects", () => {
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
      timeout: 120000,
    });

  try {
    run(["install", "--offline", "--frozen-lockfile", "--ignore-scripts"]);
    run(["--filter", "@hua-labs/dot", "build"]);
    run(["--filter", "@hua-labs/dot-mcp", "build"]);
    run([
      "--dir",
      "packages/hua-dot-mcp",
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
      "52ea19941a439cd4a15c2a9afc31975e99616fad8694a6b996f49c67cc02c71e",
    );
    for (const tarball of [originalPath, alternatePath]) {
      const result = runChecker(["--tarball", tarball], clone);
      assert.equal(result.status, 0, result.stderr);
    }

    const tamperedTarStream = Buffer.from(tarStream);
    tamperedTarStream[600] ^= 1;
    const tamperedPath = join(packDirectory, "tampered-stream.tgz");
    writeFileSync(tamperedPath, gzipSync(tamperedTarStream));
    const rejected = runChecker(["--tarball", tamperedPath], clone);
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /tar-stream-bytes-mismatch/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("self-consistent row reclassification and semantic drift reject", () => {
  const cases = [
    (config) => {
      const row = config.rows.find(
        (candidate) => candidate.path === "packages/hua-dot-mcp/LICENSE",
      );
      row.disposition = "public-preserved";
      config.mapDigest = digestCanonical(config.rows);
    },
    (config) => {
      const row = config.rows.find(
        (candidate) => candidate.path === "packages/hua-dot-mcp/doc.yaml",
      );
      row.sourceSha256 = createHash("sha256")
        .update("foreign semantic authority")
        .digest("hex");
      row.outputSha256 = row.sourceSha256;
      config.mapDigest = digestCanonical(config.rows);
    },
  ];
  for (const mutate of cases) {
    const { parent, path } = configFixture(mutate);
    try {
      const result = runChecker(["--config", path]);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /reviewed-map-digest-mismatch/u);
      assert.doesNotMatch(result.stderr, /foreign semantic authority/u);
    } finally {
      rmSync(parent, { force: true, recursive: true });
    }
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
        config.rows[0].path = "packages/hua-dot-mcp/../outside.ts";
      },
      expected: /invalid-row-path/u,
    },
    { mutate: (config) => config.rows.pop(), expected: /map-digest-mismatch/u },
    {
      mutate: (config) => {
        const template = config.rows.find(
          (row) => row.path === "packages/hua-dot-mcp/src/index.ts",
        );
        config.rows.push({
          ...template,
          path: "packages/hua-dot-mcp/zz-unexpected.ts",
        });
      },
      expected: /map-digest-mismatch/u,
    },
    { mutate: (config) => config.rows.reverse(), expected: /unsorted-rows/u },
    { mutate: (config) => (config.rows = []), expected: /invalid-row-count/u },
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
  assert.match(result.stdout, /15 rows/u);
});

test("a one-byte generated or product-doc tamper rejects without leaking bytes", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-mcp/doc.yaml";
    writeFileSync(
      join(clone, relative),
      `${text(relative)}\nprivate-sentinel\n`,
    );
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /current-output-mismatch/u);
    assert.doesNotMatch(result.stderr, /private-sentinel/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("hidden index state, symlink substitution, and unmapped files reject", () => {
  const fixtures = [
    ({ clone }) => {
      const relative = "packages/hua-dot-mcp/src/index.ts";
      writeFileSync(join(clone, relative), "hidden drift\n");
      execFileSync("git", ["update-index", "--assume-unchanged", relative], {
        cwd: clone,
      });
      return /index-entry-not-ordinary/u;
    },
    ({ clone }) => {
      const relative = "packages/hua-dot-mcp/src/index.ts";
      rmSync(join(clone, relative));
      symlinkSync("capabilities.ts", join(clone, relative));
      return /current-file-not-regular/u;
    },
    ({ clone }) => {
      writeFileSync(
        join(clone, "packages/hua-dot-mcp/src/unmapped.ts"),
        "export {};\n",
      );
      return /untracked-package-path/u;
    },
  ];
  for (const prepare of fixtures) {
    const { clone, parent } = cloneFixture();
    try {
      const expected = prepare({ clone });
      const result = runChecker([], clone);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, expected);
    } finally {
      rmSync(parent, { force: true, recursive: true });
    }
  }
});

test("a substituted tarball is rejected before artifact admission", () => {
  const parent = mkdtempSync(join(tmpdir(), "dot-mcp-tar-"));
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
