#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const defaultConfig = join(
  repositoryRoot,
  "config",
  "ui-source-authority.json",
);
const MAX_CONFIG_BYTES = 1024 * 1024;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_ROWS = 2048;
const GIT_HASH = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const ALLOWED_DISPOSITIONS = new Set([
  "platform-exact",
  "public-preserved",
  "derived-reviewed",
  "deferred",
]);

class AuthorityError extends Error {
  constructor(code, detail = "") {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

function fail(code, detail = "") {
  throw new AuthorityError(code, detail);
}

function parseArgs(argv) {
  const options = {
    config: defaultConfig,
    publicRoot: repositoryRoot,
    sourceRepo: null,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (
      arg === "--config" ||
      arg === "--public-root" ||
      arg === "--source-repo"
    ) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) fail("missing-option-value", arg);
      index += 1;
      if (arg === "--config") options.config = resolve(value);
      if (arg === "--public-root") options.publicRoot = resolve(value);
      if (arg === "--source-repo") options.sourceRepo = resolve(value);
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    fail("unknown-option", arg);
  }

  return options;
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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assertObject(value, code) {
  if (!value || Array.isArray(value) || typeof value !== "object") fail(code);
}

function assertExactKeys(value, expected, code) {
  assertObject(value, code);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail(code, `${actual.join(",")} != ${wanted.join(",")}`);
  }
}

function assertGitHash(value, code) {
  if (typeof value !== "string" || !GIT_HASH.test(value)) fail(code);
}

function assertShaOrNull(value, code) {
  if (value !== null && (typeof value !== "string" || !SHA256.test(value))) {
    fail(code);
  }
}

function expectedKind(path) {
  if (path.endsWith(".md")) return "docs";
  if (
    path.includes("/__tests__/") ||
    /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)
  ) {
    return "test";
  }
  return "production";
}

function hasControlCharacter(value) {
  for (const character of value) {
    const code = character.codePointAt(0);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

function validatePath(path) {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    path.length > 512 ||
    hasControlCharacter(path) ||
    path.includes("\\") ||
    path.startsWith("/") ||
    posix.normalize(path) !== path ||
    !path.startsWith("packages/hua-ui/src/")
  ) {
    fail("invalid-row-path", String(path).slice(0, 120));
  }
}

function validateAuthority(value, code) {
  assertExactKeys(value, ["commit", "packageTree", "sourceTree", "tree"], code);
  for (const key of ["commit", "packageTree", "sourceTree", "tree"]) {
    assertGitHash(value[key], `${code}-${key}`);
  }
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_ROWS) {
    fail("invalid-row-count");
  }

  const seen = new Set();
  let previous = "";
  for (const row of rows) {
    assertExactKeys(
      row,
      [
        "disposition",
        "kind",
        "outputSha256",
        "path",
        "publicBaseSha256",
        "sourceSha256",
      ],
      "invalid-row-keys",
    );
    validatePath(row.path);
    if (seen.has(row.path)) fail("duplicate-row", row.path);
    if (previous && previous >= row.path) fail("unsorted-rows", row.path);
    previous = row.path;
    seen.add(row.path);

    if (row.kind !== expectedKind(row.path)) fail("invalid-row-kind", row.path);
    if (!ALLOWED_DISPOSITIONS.has(row.disposition)) {
      fail("invalid-row-disposition", row.path);
    }
    assertShaOrNull(row.sourceSha256, "invalid-source-sha");
    assertShaOrNull(row.publicBaseSha256, "invalid-public-base-sha");
    assertShaOrNull(row.outputSha256, "invalid-output-sha");

    if (row.disposition === "platform-exact") {
      if (!row.sourceSha256 || row.outputSha256 !== row.sourceSha256) {
        fail("invalid-platform-exact-row", row.path);
      }
    } else if (row.disposition === "public-preserved") {
      if (!row.publicBaseSha256 || !row.outputSha256) {
        fail("invalid-public-preserved-row", row.path);
      }
    } else if (row.disposition === "derived-reviewed") {
      if (!row.outputSha256 || (!row.sourceSha256 && !row.publicBaseSha256)) {
        fail("invalid-derived-row", row.path);
      }
    } else if (row.outputSha256 !== null) {
      fail("invalid-deferred-row", row.path);
    }
  }

  return seen;
}

function runGit(root, args, encoding = "utf8") {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding,
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    fail("git-authority-read-failed", args[0] ?? "git");
  }
}

function gitValue(root, expression) {
  return runGit(root, ["rev-parse", expression]).trim();
}

function gitTreeMap(root, commit, prefix) {
  const output = runGit(root, ["ls-tree", "-r", commit, "--", prefix]);
  const result = new Map();
  for (const line of output.split("\n")) {
    if (!line) continue;
    const match = line.match(/^\d+ blob ([0-9a-f]{40})\t(.+)$/);
    if (!match) fail("unexpected-git-tree-row");
    result.set(match[2], match[1]);
  }
  return result;
}

function gitBlob(root, commit, path) {
  try {
    return execFileSync("git", ["show", `${commit}:${path}`], {
      cwd: root,
      encoding: null,
      maxBuffer: MAX_FILE_BYTES + 1,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

function verifyAuthorityObject(root, authority, code) {
  if (gitValue(root, `${authority.commit}^{commit}`) !== authority.commit) {
    fail(`${code}-commit-mismatch`);
  }
  if (gitValue(root, `${authority.commit}^{tree}`) !== authority.tree) {
    fail(`${code}-tree-mismatch`);
  }
  if (
    gitValue(root, `${authority.commit}:packages/hua-ui`) !==
    authority.packageTree
  ) {
    fail(`${code}-package-tree-mismatch`);
  }
  if (
    gitValue(root, `${authority.commit}:packages/hua-ui/src`) !==
    authority.sourceTree
  ) {
    fail(`${code}-source-tree-mismatch`);
  }
}

function verifyBlobMap(root, commit, rows, field, code) {
  for (const row of rows) {
    const expected = row[field];
    const bytes = gitBlob(root, commit, row.path);
    if (bytes && bytes.length > MAX_FILE_BYTES)
      fail("authority-file-too-large");
    const actual = bytes ? sha256(bytes) : null;
    if (actual !== expected) fail(code, row.path);
  }
}

function verifyCrossRepoCompleteness(publicRoot, sourceRepo, config, rowPaths) {
  const source = gitTreeMap(
    sourceRepo,
    config.sourceAuthority.commit,
    "packages/hua-ui/src",
  );
  const base = gitTreeMap(
    publicRoot,
    config.publicBase.commit,
    "packages/hua-ui/src",
  );
  const differences = [...new Set([...source.keys(), ...base.keys()])]
    .filter((path) => source.get(path) !== base.get(path))
    .sort();
  if (JSON.stringify(differences) !== JSON.stringify([...rowPaths].sort())) {
    fail("map-path-set-mismatch");
  }
}

function currentFileSha(root, relativePath) {
  const absolute = join(root, ...relativePath.split("/"));
  let stat;
  try {
    stat = lstatSync(absolute);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    fail("current-file-read-failed", relativePath);
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    fail("current-file-not-regular", relativePath);
  }
  if (stat.size > MAX_FILE_BYTES) fail("current-file-too-large", relativePath);
  return sha256(readFileSync(absolute));
}

function verifyCurrentFiles(publicRoot, config, rowPaths) {
  runGit(publicRoot, [
    "merge-base",
    "--is-ancestor",
    config.publicBase.commit,
    "HEAD",
  ]);
  const changed = new Set(
    runGit(publicRoot, [
      "diff",
      "--name-only",
      "--no-renames",
      config.publicBase.commit,
      "--",
      "packages/hua-ui/src",
    ])
      .split("\n")
      .filter(Boolean),
  );
  for (const path of runGit(publicRoot, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    "packages/hua-ui/src",
  ])
    .split("\n")
    .filter(Boolean)) {
    changed.add(path);
  }
  for (const path of changed) {
    if (!rowPaths.has(path)) fail("unmapped-current-source-change", path);
  }

  for (const row of config.rows) {
    const expected =
      row.disposition === "deferred" ? row.publicBaseSha256 : row.outputSha256;
    if (currentFileSha(publicRoot, row.path) !== expected) {
      fail("current-output-mismatch", row.path);
    }
  }
}

function readConfig(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    fail("config-read-failed");
  }
  if (Buffer.byteLength(raw) > MAX_CONFIG_BYTES) fail("config-too-large");
  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    fail("config-json-invalid");
  }
  if (raw !== canonicalJson(config)) fail("config-not-canonical");
  return config;
}

function validateConfig(config) {
  assertExactKeys(
    config,
    ["mapDigest", "publicBase", "rows", "schema", "sourceAuthority"],
    "invalid-config-keys",
  );
  if (config.schema !== "hua-ui-source-authority.v1") {
    fail("unsupported-schema");
  }
  if (typeof config.mapDigest !== "string" || !SHA256.test(config.mapDigest)) {
    fail("invalid-map-digest");
  }
  validateAuthority(config.sourceAuthority, "invalid-source-authority");
  validateAuthority(config.publicBase, "invalid-public-base");
  const rowPaths = validateRows(config.rows);
  if (sha256(canonicalJson(config.rows)) !== config.mapDigest) {
    fail("map-digest-mismatch");
  }
  return rowPaths;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = readConfig(options.config);
  const rowPaths = validateConfig(config);

  verifyAuthorityObject(options.publicRoot, config.publicBase, "public-base");
  verifyBlobMap(
    options.publicRoot,
    config.publicBase.commit,
    config.rows,
    "publicBaseSha256",
    "public-base-blob-mismatch",
  );

  if (options.sourceRepo) {
    verifyAuthorityObject(
      options.sourceRepo,
      config.sourceAuthority,
      "source-authority",
    );
    verifyBlobMap(
      options.sourceRepo,
      config.sourceAuthority.commit,
      config.rows,
      "sourceSha256",
      "source-authority-blob-mismatch",
    );
    verifyCrossRepoCompleteness(
      options.publicRoot,
      options.sourceRepo,
      config,
      rowPaths,
    );
  }

  verifyCurrentFiles(options.publicRoot, config, rowPaths);

  const dispositions = Object.fromEntries(
    [...ALLOWED_DISPOSITIONS].map((value) => [value, 0]),
  );
  for (const row of config.rows) dispositions[row.disposition] += 1;
  const result = {
    schema: config.schema,
    mapDigest: config.mapDigest,
    rows: config.rows.length,
    dispositions,
    sourceVerified: Boolean(options.sourceRepo),
    status: "pass",
  };

  if (options.json) console.log(canonicalJson(result).trimEnd());
  else {
    console.log(
      `PASS UI source authority: ${result.rows} rows, map ${result.mapDigest}, sourceVerified=${result.sourceVerified}`,
    );
  }
}

try {
  main();
} catch (error) {
  const code =
    error instanceof AuthorityError ? error.code : "unexpected-error";
  const detail = error instanceof AuthorityError ? error.detail : "";
  console.error(
    `FAIL UI source authority: ${code}${detail ? ` (${detail})` : ""}`,
  );
  process.exitCode = 1;
}
