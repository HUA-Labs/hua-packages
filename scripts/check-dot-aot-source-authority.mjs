#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
} from "node:fs";
import { posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const defaultConfig = resolve(
  repositoryRoot,
  "config/dot-aot-source-authority.json",
);
const PACKAGE_PATH = "packages/hua-dot-aot";
const PACKAGE_PREFIX = `${PACKAGE_PATH}/`;
const SCHEMA = "hua-dot-aot-source-authority.v1";
const AUTHORITY_KIND = "platform-dot-aot-package-projection";
const MAX_CONFIG_BYTES = 1024 * 1024;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TARBALL_BYTES = 32 * 1024 * 1024;
const MAX_TAR_BYTES = 96 * 1024 * 1024;
const MAX_GIT_OUTPUT_BYTES = 32 * 1024 * 1024;
const MAX_ROWS = 512;
const MAX_ARTIFACT_FILES = 4096;
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
const GIT_HASH = /^[0-9a-f]{40}$/u;
const SHA256 = /^[0-9a-f]{64}$/u;
const REVIEWED_MAP_DIGEST =
  "c5380b95eb184a80cac43eaa3f37b1cf555924e2efe1fe7ebe2ad263ea006523";
const REVIEWED_ARTIFACT_ROSTER_DIGEST =
  "c106d2ae9c415706a734d4f78e22f36a90deafa799275440bcfa5638bb341579";
const REVIEWED_TARBALL_SHA256 =
  "841e2b5c2c1a090a10c88ceaf3f0860a14eb236daef181552bfc468a970fb9a6";
const REVIEWED_PUBLIC_BASE = Object.freeze({
  commit: "fedf3ee4acd687be0fb85c16f8cd4e4a25eae4ea",
  packageTree: "ac3505b26893d82170e772243513df0b6e2ecfe3",
  tree: "c4f7f34b23c4d40561ef182d3d38de4bf3657093",
});
const REVIEWED_SOURCE_AUTHORITY = Object.freeze({
  commit: "72d311fa84c596397f338cd06b9bfc541448af61",
  packageTree: "f66caa572cdaa1c9d7bb2d1e56154c30b28798e4",
  tree: "516c1135a218413e7f7725f38379beca721594e9",
});
const ALLOWED_DISPOSITIONS = new Set([
  "platform-exact",
  "public-preserved",
  "derived-reviewed",
  "platform-only-excluded",
]);
const REQUIRED_TARGETS = Object.freeze([
  "package/dist/babel.d.mts",
  "package/dist/babel.mjs",
  "package/dist/index.d.mts",
  "package/dist/index.mjs",
  "package/dist/vite.d.mts",
  "package/dist/vite.mjs",
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
    tarball: null,
    json: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (
      arg === "--config" ||
      arg === "--public-root" ||
      arg === "--source-repo" ||
      arg === "--tarball"
    ) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) fail("missing-option-value", arg);
      index += 1;
      if (arg === "--config") options.config = resolve(value);
      if (arg === "--public-root") options.publicRoot = resolve(value);
      if (arg === "--source-repo") options.sourceRepo = resolve(value);
      if (arg === "--tarball") options.tarball = resolve(value);
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

function hasControlCharacter(value) {
  for (const character of value) {
    const code = character.codePointAt(0);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

function validateRepositoryPath(path, prefix, code) {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    path.length > 512 ||
    hasControlCharacter(path) ||
    path.includes("\\") ||
    path.startsWith("/") ||
    posix.normalize(path) !== path ||
    !path.startsWith(prefix)
  ) {
    fail(code);
  }
}

function expectedKind(path) {
  if (path === `${PACKAGE_PATH}/package.json`) return "manifest";
  if (path === `${PACKAGE_PATH}/tsup.config.ts`) return "build";
  if (path.endsWith(".md") || path.endsWith("/doc.yaml")) return "docs";
  if (
    path.includes("/__tests__/") ||
    /\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(path)
  ) {
    return "test";
  }
  return "production";
}

function assertShaOrNull(value, code) {
  if (value !== null && (typeof value !== "string" || !SHA256.test(value))) {
    fail(code);
  }
}

function assertGitHash(value, code) {
  if (typeof value !== "string" || !GIT_HASH.test(value)) fail(code);
}

function validateAuthority(value, code) {
  assertExactKeys(value, ["commit", "packageTree", "tree"], code);
  for (const key of ["commit", "packageTree", "tree"]) {
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
    validateRepositoryPath(row.path, PACKAGE_PREFIX, "invalid-row-path");
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
      if (!row.publicBaseSha256 || row.outputSha256 !== row.publicBaseSha256) {
        fail("invalid-public-preserved-row", row.path);
      }
    } else if (row.disposition === "derived-reviewed") {
      if (!row.sourceSha256 || !row.publicBaseSha256 || !row.outputSha256) {
        fail("invalid-derived-row", row.path);
      }
    } else if (
      !row.sourceSha256 ||
      row.publicBaseSha256 !== null ||
      row.outputSha256 !== null
    ) {
      fail("invalid-platform-only-excluded-row", row.path);
    }
  }
  return seen;
}

function validateArtifact(artifact, rows) {
  assertExactKeys(
    artifact,
    [
      "files",
      "packageName",
      "packageVersion",
      "packedManifestSha256",
      "requiredTargets",
      "rosterDigest",
      "sourceManifestSha256",
      "tarballBytes",
      "tarballSha256",
    ],
    "invalid-artifact-keys",
  );
  if (artifact.packageName !== "@hua-labs/dot-aot")
    fail("invalid-package-name");
  if (artifact.packageVersion !== "0.1.3") fail("invalid-package-version");
  if (!SHA256.test(artifact.sourceManifestSha256)) {
    fail("invalid-source-manifest-sha");
  }
  if (!SHA256.test(artifact.packedManifestSha256)) {
    fail("invalid-packed-manifest-sha");
  }
  if (!SHA256.test(artifact.rosterDigest)) fail("invalid-roster-digest");
  if (!SHA256.test(artifact.tarballSha256)) fail("invalid-tarball-sha");
  if (
    !Number.isSafeInteger(artifact.tarballBytes) ||
    artifact.tarballBytes <= 0 ||
    artifact.tarballBytes > MAX_TARBALL_BYTES
  ) {
    fail("invalid-tarball-bytes");
  }
  if (
    !Array.isArray(artifact.requiredTargets) ||
    JSON.stringify(artifact.requiredTargets) !==
      JSON.stringify(REQUIRED_TARGETS)
  ) {
    fail("invalid-required-targets");
  }
  if (
    !Array.isArray(artifact.files) ||
    artifact.files.length === 0 ||
    artifact.files.length > MAX_ARTIFACT_FILES
  ) {
    fail("invalid-artifact-file-count");
  }
  let previous = "";
  const seen = new Set();
  for (const file of artifact.files) {
    assertExactKeys(file, ["path", "sha256", "size"], "invalid-artifact-row");
    validateRepositoryPath(file.path, "package/", "invalid-artifact-path");
    if (seen.has(file.path) || (previous && previous >= file.path)) {
      fail("invalid-artifact-order", file.path);
    }
    previous = file.path;
    seen.add(file.path);
    if (!SHA256.test(file.sha256)) fail("invalid-artifact-file-sha");
    if (
      !Number.isSafeInteger(file.size) ||
      file.size < 0 ||
      file.size > MAX_FILE_BYTES
    ) {
      fail("invalid-artifact-file-size");
    }
  }
  if (sha256(canonicalJson(artifact.files)) !== artifact.rosterDigest) {
    fail("artifact-roster-digest-mismatch");
  }
  const manifestRow = rows.find(
    (row) => row.path === `${PACKAGE_PATH}/package.json`,
  );
  if (
    !manifestRow ||
    manifestRow.outputSha256 !== artifact.sourceManifestSha256
  ) {
    fail("artifact-manifest-authority-mismatch");
  }
}

function readRegularFile(path, maxBytes, code) {
  let before;
  try {
    before = lstatSync(path, { bigint: true });
  } catch {
    fail(`${code}-read-failed`);
  }
  if (!before.isFile() || before.isSymbolicLink()) fail(`${code}-not-regular`);
  if (before.size > BigInt(maxBytes)) fail(`${code}-too-large`);
  let descriptor;
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch {
    fail(`${code}-open-failed`);
  }
  try {
    const opened = fstatSync(descriptor, { bigint: true });
    if (
      opened.dev !== before.dev ||
      opened.ino !== before.ino ||
      opened.mode !== before.mode ||
      opened.size !== before.size ||
      opened.mtimeNs !== before.mtimeNs ||
      !opened.isFile()
    ) {
      fail(`${code}-identity-drift`);
    }
    const bytes = Buffer.alloc(Number(opened.size));
    let offset = 0;
    while (offset < bytes.length) {
      const count = readSync(
        descriptor,
        bytes,
        offset,
        bytes.length - offset,
        null,
      );
      if (count === 0) fail(`${code}-short-read`);
      offset += count;
    }
    const extra = Buffer.alloc(1);
    if (readSync(descriptor, extra, 0, 1, null) !== 0) {
      fail(`${code}-grew-during-read`);
    }
    const after = fstatSync(descriptor, { bigint: true });
    if (
      after.dev !== opened.dev ||
      after.ino !== opened.ino ||
      after.mode !== opened.mode ||
      after.size !== opened.size ||
      after.mtimeNs !== opened.mtimeNs
    ) {
      fail(`${code}-identity-drift`);
    }
    return bytes;
  } finally {
    closeSync(descriptor);
  }
}

function readConfig(path) {
  const raw = readRegularFile(path, MAX_CONFIG_BYTES, "config");
  let config;
  try {
    config = JSON.parse(raw.toString("utf8"));
  } catch {
    fail("config-json-invalid");
  }
  if (!raw.equals(Buffer.from(canonicalJson(config))))
    fail("config-not-canonical");
  return config;
}

function validateConfig(config) {
  assertExactKeys(
    config,
    [
      "artifact",
      "authorityKind",
      "mapDigest",
      "packagePath",
      "publicBase",
      "rows",
      "schema",
      "sourceAuthority",
    ],
    "invalid-config-keys",
  );
  if (config.schema !== SCHEMA) fail("unsupported-schema");
  if (config.authorityKind !== AUTHORITY_KIND) fail("invalid-authority-kind");
  if (config.packagePath !== PACKAGE_PATH) fail("invalid-package-path");
  if (!SHA256.test(config.mapDigest)) fail("invalid-map-digest");
  validateAuthority(config.sourceAuthority, "invalid-source-authority");
  validateAuthority(config.publicBase, "invalid-public-base");
  if (
    canonicalJson(config.publicBase) !== canonicalJson(REVIEWED_PUBLIC_BASE)
  ) {
    fail("reviewed-public-base-mismatch");
  }
  if (
    canonicalJson(config.sourceAuthority) !==
    canonicalJson(REVIEWED_SOURCE_AUTHORITY)
  ) {
    fail("reviewed-source-authority-mismatch");
  }
  const paths = validateRows(config.rows);
  if (sha256(canonicalJson(config.rows)) !== config.mapDigest) {
    fail("map-digest-mismatch");
  }
  validateArtifact(config.artifact, config.rows);
  if (config.mapDigest !== REVIEWED_MAP_DIGEST) {
    fail("reviewed-map-digest-mismatch");
  }
  if (config.artifact.rosterDigest !== REVIEWED_ARTIFACT_ROSTER_DIGEST) {
    fail("reviewed-artifact-roster-mismatch");
  }
  if (config.artifact.tarballSha256 !== REVIEWED_TARBALL_SHA256) {
    fail("reviewed-tarball-sha-mismatch");
  }
  return paths;
}

function runGit(root, args, options = {}) {
  try {
    return execFileSync(GIT_EXECUTABLE, ["--no-replace-objects", ...args], {
      cwd: root,
      encoding: Object.hasOwn(options, "encoding") ? options.encoding : "utf8",
      env: GIT_ENV,
      maxBuffer: options.maxBuffer ?? MAX_GIT_OUTPUT_BYTES,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    fail(options.errorCode ?? "git-authority-read-failed", args[0] ?? "git");
  }
}

function gitValue(root, expression) {
  return runGit(root, ["rev-parse", expression]).trim();
}

function parseTreeManifest(output) {
  const result = new Map();
  for (const record of output.split("\0")) {
    if (!record) continue;
    const match = record.match(/^([0-7]{6}) blob ([0-9a-f]{40})\t([\s\S]+)$/u);
    if (!match || result.has(match[3])) fail("unexpected-git-tree-row");
    if (match[1] !== "100644" && match[1] !== "100755") {
      fail("authority-entry-not-regular", match[3]);
    }
    result.set(match[3], { mode: match[1], object: match[2] });
  }
  return result;
}

function gitTreeMap(root, commit) {
  return parseTreeManifest(
    runGit(root, [
      "ls-tree",
      "-r",
      "-z",
      "--full-tree",
      commit,
      "--",
      PACKAGE_PATH,
    ]),
  );
}

function verifyAuthorityObject(root, authority, code) {
  if (gitValue(root, `${authority.commit}^{commit}`) !== authority.commit) {
    fail(`${code}-commit-mismatch`);
  }
  if (gitValue(root, `${authority.commit}^{tree}`) !== authority.tree) {
    fail(`${code}-tree-mismatch`);
  }
  if (
    gitValue(root, `${authority.commit}:${PACKAGE_PATH}`) !==
    authority.packageTree
  ) {
    fail(`${code}-package-tree-mismatch`);
  }
}

function gitArchiveMap(root, commit) {
  const archive = runGit(
    root,
    ["archive", "--format=tar", `${commit}:${PACKAGE_PATH}`],
    {
      encoding: null,
      errorCode: "authority-archive-read-failed",
      maxBuffer: MAX_TAR_BYTES,
    },
  );
  return new Map(
    [...parseTarArchive(archive, null)].map(([path, bytes]) => [
      `${PACKAGE_PREFIX}${path}`,
      bytes,
    ]),
  );
}

function verifyBlobMap(root, commit, rows, field, code) {
  const files = gitArchiveMap(root, commit);
  for (const row of rows) {
    const expected = row[field];
    const bytes = files.get(row.path);
    if (!bytes) {
      if (expected !== null) fail(code, row.path);
      continue;
    }
    if (expected === null) fail(code, row.path);
    if (sha256(bytes) !== expected) {
      fail(code, row.path);
    }
  }
}

function verifyCrossRepoCompleteness(publicRoot, sourceRepo, config, rowPaths) {
  const source = gitTreeMap(sourceRepo, config.sourceAuthority.commit);
  const base = gitTreeMap(publicRoot, config.publicBase.commit);
  const union = [...new Set([...source.keys(), ...base.keys()])].sort();
  if (JSON.stringify(union) !== JSON.stringify([...rowPaths].sort())) {
    fail("map-path-set-mismatch");
  }
}

function parseIndexManifest(output) {
  const result = new Map();
  for (const record of output.split("\0")) {
    if (!record) continue;
    const match = record.match(
      /^(.?) ([0-7]{6}) ([0-9a-f]{40}) ([0-3])\t([\s\S]+)$/u,
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
    ["ls-files", "--stage", "-t", "-v", "-f", "-z", "--", PACKAGE_PATH],
    { encoding: null },
  );
}

function gitBlobObject(bytes) {
  return createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
}

function verifyCurrentFiles(publicRoot, config, rowPaths) {
  const headBefore = gitValue(publicRoot, "HEAD^{commit}");
  runGit(publicRoot, [
    "merge-base",
    "--is-ancestor",
    config.publicBase.commit,
    headBefore,
  ]);
  const headTree = gitTreeMap(publicRoot, headBefore);
  const indexBeforeBytes = indexManifestBytes(publicRoot);
  const index = parseIndexManifest(indexBeforeBytes.toString("utf8"));
  const allPaths = [...new Set([...headTree.keys(), ...index.keys()])].sort();
  for (const path of allPaths) {
    const headEntry = headTree.get(path);
    const indexEntry = index.get(path);
    if (
      headEntry?.mode !== indexEntry?.mode ||
      headEntry?.object !== indexEntry?.object
    ) {
      fail("head-index-manifest-mismatch", path);
    }
  }
  if (
    JSON.stringify([...index.keys()].sort()) !==
    JSON.stringify(
      config.rows
        .filter((row) => row.outputSha256 !== null)
        .map((row) => row.path)
        .sort(),
    )
  ) {
    fail("current-path-set-mismatch");
  }
  for (const [path, entry] of index) {
    const bytes = readRegularFile(
      resolve(publicRoot, ...path.split("/")),
      MAX_FILE_BYTES,
      "current-file",
    );
    if (gitBlobObject(bytes) !== entry.object) {
      fail(
        rowPaths.has(path)
          ? "current-output-mismatch"
          : "unmapped-current-change",
        path,
      );
    }
    const row = config.rows.find((candidate) => candidate.path === path);
    if (!row || sha256(bytes) !== row.outputSha256) {
      fail(row ? "current-output-mismatch" : "unmapped-current-change", path);
    }
  }
  const untracked = runGit(publicRoot, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    PACKAGE_PATH,
  ])
    .split("\n")
    .filter(Boolean);
  if (untracked.length > 0) fail("untracked-package-path", untracked[0]);
  const headAfter = gitValue(publicRoot, "HEAD^{commit}");
  const indexAfterBytes = indexManifestBytes(publicRoot);
  if (headAfter !== headBefore || !indexAfterBytes.equals(indexBeforeBytes)) {
    fail("current-manifest-drift");
  }
}

function parseTarString(bytes) {
  const zero = bytes.indexOf(0);
  return bytes.subarray(0, zero === -1 ? bytes.length : zero).toString("utf8");
}

function parseTarNumber(bytes, code) {
  const value = parseTarString(bytes).trim();
  if (!/^[0-7]+$/u.test(value)) fail(code);
  const result = Number.parseInt(value, 8);
  if (!Number.isSafeInteger(result) || result < 0) fail(code);
  return result;
}

function validateArchivePath(path, prefix) {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    path.length > 512 ||
    hasControlCharacter(path) ||
    path.includes("\\") ||
    path.startsWith("/") ||
    posix.normalize(path) !== path ||
    path.endsWith("/") ||
    (prefix && !path.startsWith(prefix))
  ) {
    fail("tar-path-invalid");
  }
}

function parseTarArchive(tar, expectedPrefix) {
  const files = new Map();
  let offset = 0;
  let ended = false;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      ended = true;
      if (!tar.subarray(offset).every((byte) => byte === 0)) {
        fail("tarball-trailing-data");
      }
      break;
    }
    const storedChecksum = parseTarNumber(
      header.subarray(148, 156),
      "tar-header-checksum-invalid",
    );
    let checksum = 0;
    for (let index = 0; index < header.length; index += 1) {
      checksum += index >= 148 && index < 156 ? 32 : header[index];
    }
    if (checksum !== storedChecksum) fail("tar-header-checksum-mismatch");
    const name = parseTarString(header.subarray(0, 100));
    const headerPrefix = parseTarString(header.subarray(345, 500));
    const path = headerPrefix ? `${headerPrefix}/${name}` : name;
    const size = parseTarNumber(
      header.subarray(124, 136),
      "tar-entry-size-invalid",
    );
    const type = String.fromCharCode(header[156] || 48);
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;
    if (dataEnd > tar.length) fail("tar-entry-truncated");
    if (type === "5") {
      if (size !== 0) fail("tar-directory-has-data");
      const directoryPath = path.endsWith("/") ? path.slice(0, -1) : path;
      if (
        !directoryPath ||
        directoryPath.startsWith("/") ||
        directoryPath.includes("\\") ||
        hasControlCharacter(directoryPath) ||
        posix.normalize(directoryPath) !== directoryPath ||
        (expectedPrefix &&
          directoryPath !== expectedPrefix.slice(0, -1) &&
          !directoryPath.startsWith(expectedPrefix))
      ) {
        fail("tar-path-invalid");
      }
    } else if (type === "0") {
      validateArchivePath(path, expectedPrefix);
      if (files.has(path)) fail("tar-duplicate-path", path);
      if (size > MAX_FILE_BYTES) fail("tar-entry-too-large", path);
      files.set(path, Buffer.from(tar.subarray(dataStart, dataEnd)));
    } else {
      fail("tar-entry-not-regular", path);
    }
    offset = dataStart + Math.ceil(size / 512) * 512;
  }
  if (!ended) fail("tarball-terminator-missing");
  return files;
}

function parseTarball(bytes) {
  let tar;
  try {
    tar = gunzipSync(bytes, { maxOutputLength: MAX_TAR_BYTES });
  } catch {
    fail("tarball-gzip-invalid");
  }
  return parseTarArchive(tar, "package/");
}

function collectExportTargets(value, targets = new Set()) {
  if (typeof value === "string") {
    if (!value.startsWith("./")) fail("manifest-export-target-invalid");
    targets.add(`package/${value.slice(2)}`);
    return targets;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectExportTargets(entry, targets);
    return targets;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value))
      collectExportTargets(entry, targets);
  }
  return targets;
}

function verifyTarball(path, config) {
  const compressed = readRegularFile(path, MAX_TARBALL_BYTES, "tarball");
  if (
    compressed.length !== config.artifact.tarballBytes ||
    sha256(compressed) !== config.artifact.tarballSha256
  ) {
    fail("tarball-bytes-mismatch");
  }
  const files = parseTarball(compressed);
  const actualRows = [...files.entries()]
    .map(([filePath, bytes]) => ({
      path: filePath,
      sha256: sha256(bytes),
      size: bytes.length,
    }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
  if (canonicalJson(actualRows) !== canonicalJson(config.artifact.files)) {
    fail("tarball-roster-mismatch");
  }
  const manifestBytes = files.get("package/package.json");
  if (
    !manifestBytes ||
    sha256(manifestBytes) !== config.artifact.packedManifestSha256
  ) {
    fail("tarball-manifest-mismatch");
  }
  let manifest;
  try {
    manifest = JSON.parse(manifestBytes.toString("utf8"));
  } catch {
    fail("tarball-manifest-json-invalid");
  }
  if (
    manifest.name !== config.artifact.packageName ||
    manifest.version !== config.artifact.packageVersion
  ) {
    fail("tarball-package-identity-mismatch");
  }
  const workspaceSpecs = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ].flatMap((field) =>
    Object.values(manifest[field] ?? {}).filter(
      (value) => typeof value === "string" && value.startsWith("workspace:"),
    ),
  );
  if (workspaceSpecs.length > 0) fail("tarball-workspace-residue");
  const filePaths = new Set(files.keys());
  for (const target of collectExportTargets(manifest.exports)) {
    if (!filePaths.has(target)) fail("tarball-export-target-missing", target);
  }
  for (const target of REQUIRED_TARGETS) {
    if (!filePaths.has(target)) fail("tarball-required-target-missing", target);
  }
  for (const filePath of filePaths) {
    if (
      filePath.startsWith("package/src/") ||
      filePath.includes("/__tests__/") ||
      /\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(filePath) ||
      filePath.endsWith(".tsbuildinfo")
    ) {
      fail("tarball-source-leak", filePath);
    }
  }
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
  if (options.tarball) verifyTarball(options.tarball, config);
  const dispositions = Object.fromEntries(
    [...ALLOWED_DISPOSITIONS].map((value) => [value, 0]),
  );
  for (const row of config.rows) dispositions[row.disposition] += 1;
  const result = {
    artifactVerified: Boolean(options.tarball),
    dispositions,
    mapDigest: config.mapDigest,
    rows: config.rows.length,
    schema: config.schema,
    sourceVerified: Boolean(options.sourceRepo),
    status: "pass",
  };
  if (options.json) console.log(canonicalJson(result).trimEnd());
  else {
    console.log(
      `PASS Dot AOT source authority: ${result.rows} rows, map ${result.mapDigest}, sourceVerified=${result.sourceVerified}, artifactVerified=${result.artifactVerified}`,
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
    `FAIL Dot AOT source authority: ${code}${detail ? ` (${detail})` : ""}`,
  );
  process.exitCode = 1;
}
