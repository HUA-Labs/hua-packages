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
const MAX_GIT_OUTPUT_BYTES = 32 * 1024 * 1024;
const MAX_ROWS = 2048;
const GIT_EXECUTABLE = "/usr/bin/git";
const GIT_ENV = Object.freeze({
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_TERMINAL_PROMPT: "0",
  HOME: "/nonexistent",
  LANG: "C",
  LC_ALL: "C",
  PATH: "/usr/bin:/bin",
});
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

function runGit(
  root,
  args,
  {
    encoding = "utf8",
    errorCode = "git-authority-read-failed",
    maxBuffer = MAX_GIT_OUTPUT_BYTES,
  } = {},
) {
  try {
    return execFileSync(GIT_EXECUTABLE, ["--no-replace-objects", ...args], {
      cwd: root,
      encoding,
      env: GIT_ENV,
      maxBuffer,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    fail(errorCode, args[0] ?? "git");
  }
}

function gitValue(root, expression) {
  return runGit(root, ["rev-parse", expression]).trim();
}

function parseTreeManifest(output) {
  const result = new Map();
  for (const record of output.split("\0")) {
    if (!record) continue;
    const match = record.match(/^([0-7]{6}) blob ([0-9a-f]{40})\t([\s\S]+)$/);
    if (!match || result.has(match[3])) fail("unexpected-git-tree-row");
    result.set(match[3], { mode: match[1], object: match[2] });
  }
  return result;
}

function gitTreeMap(root, commit, prefix) {
  return parseTreeManifest(
    runGit(root, ["ls-tree", "-r", "-z", "--full-tree", commit, "--", prefix]),
  );
}

function authorityBlobSize(root, object) {
  const output = runGit(root, ["cat-file", "-s", object], {
    errorCode: "authority-blob-size-read-failed",
    maxBuffer: 128,
  }).trim();
  if (!/^(?:0|[1-9][0-9]*)$/.test(output)) {
    fail("authority-blob-size-invalid");
  }
  const size = Number(output);
  if (!Number.isSafeInteger(size)) fail("authority-blob-size-invalid");
  if (size > MAX_FILE_BYTES) fail("authority-file-too-large");
  return size;
}

function authorityBlob(root, object, expectedSize) {
  const bytes = runGit(root, ["cat-file", "blob", object], {
    encoding: null,
    errorCode: "authority-blob-read-failed",
    maxBuffer: MAX_FILE_BYTES + 1,
  });
  if (bytes.length !== expectedSize) fail("authority-blob-size-mismatch");
  return bytes;
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
  const tree = gitTreeMap(root, commit, "packages/hua-ui/src");
  for (const row of rows) {
    const expected = row[field];
    const entry = tree.get(row.path);
    if (!entry) {
      if (expected !== null) fail(code, row.path);
      continue;
    }
    if (entry.mode !== "100644" && entry.mode !== "100755") {
      fail("authority-entry-not-regular", row.path);
    }
    const size = authorityBlobSize(root, entry.object);
    if (expected === null) fail(code, row.path);
    const actual = sha256(authorityBlob(root, entry.object, size));
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
    .filter((path) => {
      const sourceEntry = source.get(path);
      const baseEntry = base.get(path);
      return (
        sourceEntry?.mode !== baseEntry?.mode ||
        sourceEntry?.object !== baseEntry?.object
      );
    })
    .sort();
  if (JSON.stringify(differences) !== JSON.stringify([...rowPaths].sort())) {
    fail("map-path-set-mismatch");
  }
}

function parseIndexManifest(output) {
  const result = new Map();
  for (const record of output.split("\0")) {
    if (!record) continue;
    const match = record.match(
      /^(.?) ([0-7]{6}) ([0-9a-f]{40}) ([0-3])\t([\s\S]+)$/,
    );
    if (!match || result.has(match[5])) fail("unexpected-git-index-row");
    if (match[1] !== "H" || match[4] !== "0") {
      fail("index-entry-not-ordinary", match[5]);
    }
    if (match[2] !== "100644" && match[2] !== "100755") {
      fail("index-entry-not-regular", match[5]);
    }
    result.set(match[5], { mode: match[2], object: match[3] });
  }
  return result;
}

function indexManifestBytes(root) {
  return runGit(
    root,
    [
      "ls-files",
      "--stage",
      "-t",
      "-v",
      "-f",
      "-z",
      "--",
      "packages/hua-ui/src",
    ],
    { encoding: null },
  );
}

function assertManifestEquality(tree, index) {
  const paths = [...new Set([...tree.keys(), ...index.keys()])].sort();
  for (const path of paths) {
    const treeEntry = tree.get(path);
    const indexEntry = index.get(path);
    if (
      treeEntry?.mode !== indexEntry?.mode ||
      treeEntry?.object !== indexEntry?.object
    ) {
      fail("head-index-manifest-mismatch", path);
    }
  }
}

function gitBlobObject(bytes) {
  return createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
}

function readCurrentFile(root, relativePath, expectedMode = null) {
  const absolute = join(root, ...relativePath.split("/"));
  let before;
  try {
    before = lstatSync(absolute, { bigint: true });
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    fail("current-file-read-failed", relativePath);
  }
  if (!before.isFile() || before.isSymbolicLink()) {
    fail("current-file-not-regular", relativePath);
  }
  if (before.size > BigInt(MAX_FILE_BYTES)) {
    fail("current-file-too-large", relativePath);
  }
  const actualMode = (before.mode & 0o111n) === 0n ? "100644" : "100755";
  if (expectedMode && actualMode !== expectedMode) {
    fail("current-file-mode-mismatch", relativePath);
  }
  const bytes = readFileSync(absolute);
  let after;
  try {
    after = lstatSync(absolute, { bigint: true });
  } catch {
    fail("current-file-drift", relativePath);
  }
  if (
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.mode !== after.mode ||
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    BigInt(bytes.length) !== before.size
  ) {
    fail("current-file-drift", relativePath);
  }
  return bytes;
}

function attestTrackedCurrentSource(root, rowPaths) {
  const headBefore = gitValue(root, "HEAD^{commit}");
  const treeBefore = gitTreeMap(root, headBefore, "packages/hua-ui/src");
  const indexBeforeBytes = indexManifestBytes(root);
  const indexBefore = parseIndexManifest(indexBeforeBytes.toString("utf8"));
  assertManifestEquality(treeBefore, indexBefore);

  for (const [path, entry] of indexBefore) {
    const bytes = readCurrentFile(root, path, entry.mode);
    if (!bytes || gitBlobObject(bytes) !== entry.object) {
      fail(
        rowPaths.has(path)
          ? "current-output-mismatch"
          : "unmapped-current-source-change",
        path,
      );
    }
  }

  const headAfter = gitValue(root, "HEAD^{commit}");
  const treeAfter = gitTreeMap(root, headAfter, "packages/hua-ui/src");
  const indexAfterBytes = indexManifestBytes(root);
  if (
    headAfter !== headBefore ||
    JSON.stringify([...treeAfter]) !== JSON.stringify([...treeBefore]) ||
    !indexAfterBytes.equals(indexBeforeBytes)
  ) {
    fail("current-source-manifest-drift");
  }

  return { head: headBefore, tree: treeBefore };
}

function currentFileSha(root, relativePath) {
  const bytes = readCurrentFile(root, relativePath);
  return bytes ? sha256(bytes) : null;
}

function verifyCurrentFiles(publicRoot, config, rowPaths) {
  const current = attestTrackedCurrentSource(publicRoot, rowPaths);
  runGit(publicRoot, [
    "merge-base",
    "--is-ancestor",
    config.publicBase.commit,
    current.head,
  ]);
  const base = gitTreeMap(
    publicRoot,
    config.publicBase.commit,
    "packages/hua-ui/src",
  );
  const changed = new Set(
    [...new Set([...base.keys(), ...current.tree.keys()])].filter((path) => {
      const baseEntry = base.get(path);
      const currentEntry = current.tree.get(path);
      return (
        baseEntry?.mode !== currentEntry?.mode ||
        baseEntry?.object !== currentEntry?.object
      );
    }),
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
