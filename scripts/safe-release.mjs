#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants as fsConstants,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  writeSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = resolve(moduleDirectory, "..");
export const POLICY_RELATIVE_PATH = "config/publish-allowlist.json";
export const PLAN_RELATIVE_PATH = "config/release-plan.json";

export const PLATFORM_AUTHORITY = Object.freeze({
  repositoryOwner: "HUA-Labs",
  repositorySlugPrefix: "hua-",
  repositorySlugSuffix: "platform",
  commit: "049aa34d8b6ea06316f126310ebc89a16b445e86",
  tree: "33bf31608b735a66d8b7ce3571d8bdcc66a78ffc",
  registryPath: "config/workspaceRegistry.yaml",
  registryBlob: "7127872f2f042cdaa2c2497500ae71e31d25ddac",
  registrySha256:
    "81d27860b099f1e9aecd80c909687cfa88c3d4c2769df92a650d5ca19732ba38",
});

const POLICY_MAX_BYTES = 128 * 1024;
const PLAN_MAX_BYTES = 2 * 1024 * 1024;
const MANIFEST_MAX_BYTES = 256 * 1024;
const CHANGESET_MAX_BYTES = 256 * 1024;
const STATUS_MAX_BYTES = 2 * 1024 * 1024;
const MAX_JSON_DEPTH = 32;
const MAX_JSON_NODES = 50000;
const MAX_STRING_BYTES = 8 * 1024;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9-]+\/[a-z0-9-]+|[a-z0-9-]+)$/;
const PACKAGE_PATH_PATTERN = /^packages\/[a-z0-9-]+$/;
const CHANGESET_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const RELEASE_TYPES = new Set(["patch", "minor", "major"]);
const RELEASE_INTENTS = new Set([
  "active-public",
  "held",
  "channel-pending",
  "never-publish",
]);
const RELEASE_MODES = new Set([
  "public-npm",
  "no-publish",
  "private-workspace",
]);
const RELEASE_AUTHORITIES = new Set(["hua-packages", "none", "unresolved"]);
const RELEASE_CHANNELS = new Set(["npm-public", "none", "pending"]);
const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function assert(condition, code) {
  if (!condition) fail(code);
}

function isRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function exactKeys(value, expected, code) {
  assert(isRecord(value), code);
  const actual = Object.keys(value).sort(compareUtf8);
  const wanted = [...expected].sort(compareUtf8);
  assert(JSON.stringify(actual) === JSON.stringify(wanted), code);
}

function stringValue(value, pattern, code, maxBytes = 512) {
  assert(typeof value === "string", code);
  assert(Buffer.byteLength(value, "utf8") <= maxBytes, code);
  assert(pattern.test(value), code);
  return value;
}

function validateScalarString(value, label) {
  assert(
    Buffer.byteLength(value, "utf8") <= MAX_STRING_BYTES,
    `${label}-string-oversize`,
  );
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (
      code <= 0x1f ||
      (code >= 0x7f && code <= 0x9f) ||
      code === 0x2028 ||
      code === 0x2029
    ) {
      fail(`${label}-control`);
    }
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      assert(next >= 0xdc00 && next <= 0xdfff, `${label}-surrogate`);
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      fail(`${label}-surrogate`);
    }
  }
}

class StrictJsonParser {
  constructor(text, label) {
    this.text = text;
    this.label = label;
    this.index = 0;
    this.nodes = 0;
  }

  parse() {
    this.skipWhitespace();
    const value = this.parseValue(0);
    this.skipWhitespace();
    assert(this.index === this.text.length, `${this.label}-trailing-bytes`);
    return value;
  }

  skipWhitespace() {
    while (
      this.index < this.text.length &&
      (this.text[this.index] === " " ||
        this.text[this.index] === "\n" ||
        this.text[this.index] === "\r" ||
        this.text[this.index] === "\t")
    ) {
      this.index += 1;
    }
  }

  parseValue(depth) {
    assert(depth <= MAX_JSON_DEPTH, `${this.label}-depth`);
    this.nodes += 1;
    assert(this.nodes <= MAX_JSON_NODES, `${this.label}-nodes`);
    this.skipWhitespace();
    const character = this.text[this.index];
    if (character === "{") return this.parseObject(depth + 1);
    if (character === "[") return this.parseArray(depth + 1);
    if (character === '"') return this.parseString();
    if (this.text.startsWith("true", this.index)) {
      this.index += 4;
      return true;
    }
    if (this.text.startsWith("false", this.index)) {
      this.index += 5;
      return false;
    }
    if (this.text.startsWith("null", this.index)) {
      this.index += 4;
      return null;
    }
    return this.parseNumber();
  }

  parseObject(depth) {
    this.index += 1;
    this.skipWhitespace();
    const value = Object.create(null);
    const keys = new Set();
    if (this.text[this.index] === "}") {
      this.index += 1;
      return value;
    }
    while (this.index < this.text.length) {
      assert(this.text[this.index] === '"', `${this.label}-object-key`);
      const key = this.parseString();
      assert(!DANGEROUS_KEYS.has(key), `${this.label}-prototype-key`);
      assert(!keys.has(key), `${this.label}-duplicate-key`);
      keys.add(key);
      this.skipWhitespace();
      assert(this.text[this.index] === ":", `${this.label}-object-colon`);
      this.index += 1;
      value[key] = this.parseValue(depth);
      this.skipWhitespace();
      if (this.text[this.index] === "}") {
        this.index += 1;
        return value;
      }
      assert(this.text[this.index] === ",", `${this.label}-object-comma`);
      this.index += 1;
      this.skipWhitespace();
    }
    fail(`${this.label}-object-unclosed`);
  }

  parseArray(depth) {
    this.index += 1;
    this.skipWhitespace();
    const value = [];
    if (this.text[this.index] === "]") {
      this.index += 1;
      return value;
    }
    while (this.index < this.text.length) {
      value.push(this.parseValue(depth));
      this.skipWhitespace();
      if (this.text[this.index] === "]") {
        this.index += 1;
        return value;
      }
      assert(this.text[this.index] === ",", `${this.label}-array-comma`);
      this.index += 1;
    }
    fail(`${this.label}-array-unclosed`);
  }

  parseString() {
    const start = this.index;
    this.index += 1;
    while (this.index < this.text.length) {
      const character = this.text[this.index];
      if (character === '"') {
        this.index += 1;
        let value;
        try {
          value = JSON.parse(this.text.slice(start, this.index));
        } catch {
          fail(`${this.label}-string`);
        }
        validateScalarString(value, this.label);
        return value;
      }
      assert(character.charCodeAt(0) > 0x1f, `${this.label}-raw-control`);
      if (character === "\\") {
        this.index += 1;
        const escape = this.text[this.index];
        assert('"\\/bfnrtu'.includes(escape ?? ""), `${this.label}-escape`);
        if (escape === "u") {
          const digits = this.text.slice(this.index + 1, this.index + 5);
          assert(
            /^[0-9a-fA-F]{4}$/.test(digits),
            `${this.label}-unicode-escape`,
          );
          this.index += 4;
        }
      }
      this.index += 1;
    }
    fail(`${this.label}-string-unclosed`);
  }

  parseNumber() {
    const tail = this.text.slice(this.index);
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(tail);
    assert(match !== null, `${this.label}-value`);
    this.index += match[0].length;
    const value = Number(match[0]);
    assert(
      Number.isFinite(value) && Number.isSafeInteger(value),
      `${this.label}-number`,
    );
    return value;
  }
}

export function parseStrictJsonBytes(bytes, options = {}) {
  const { maxBytes = PLAN_MAX_BYTES, label = "json" } = options;
  assert(bytes instanceof Uint8Array, `${label}-bytes`);
  assert(bytes.byteLength <= maxBytes, `${label}-oversize`);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(`${label}-invalid-utf8`);
  }
  return new StrictJsonParser(text, label).parse();
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (isRecord(value)) {
    const result = Object.create(null);
    for (const key of Object.keys(value).sort(compareUtf8)) {
      result[key] = canonicalValue(value[key]);
    }
    return result;
  }
  return value;
}

export function canonicalJson(value) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function sameIdentity(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.size === right.size &&
    left.mode === right.mode
  );
}

export function readRegularFile(filePath, maxBytes, label) {
  const before = lstatSync(filePath);
  assert(before.isFile() && !before.isSymbolicLink(), `${label}-non-regular`);
  assert(before.size <= maxBytes, `${label}-oversize`);
  const flags = fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0);
  let descriptor;
  try {
    descriptor = openSync(filePath, flags);
    const opened = fstatSync(descriptor);
    assert(
      opened.isFile() && sameIdentity(before, opened),
      `${label}-identity`,
    );
    const buffer = Buffer.alloc(opened.size + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const count = readSync(
        descriptor,
        buffer,
        offset,
        buffer.length - offset,
        offset,
      );
      if (count === 0) break;
      offset += count;
    }
    assert(offset === opened.size, `${label}-byte-count`);
    const after = fstatSync(descriptor);
    assert(sameIdentity(opened, after), `${label}-drift`);
    return buffer.subarray(0, offset);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function safeRelativePath(root, packagePath) {
  stringValue(packagePath, PACKAGE_PATH_PATTERN, "package-path");
  const absoluteRoot = realpathSync(root);
  const absolutePath = resolve(absoluteRoot, packagePath);
  const relativePath = relative(absoluteRoot, absolutePath);
  assert(
    relativePath === packagePath &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath),
    "package-path-boundary",
  );
  const stats = lstatSync(absolutePath);
  assert(
    stats.isDirectory() && !stats.isSymbolicLink(),
    "package-path-non-directory",
  );
  assert(realpathSync(absolutePath) === absolutePath, "package-path-symlink");
  return absolutePath;
}

function validatePublishConfig(value, code) {
  if (value === null) return null;
  exactKeys(value, ["access", "provenance"], code);
  assert(value.access === "public" && value.provenance === true, code);
  return { access: "public", provenance: true };
}

function normalizeExpectedManifest(value) {
  exactKeys(value, ["private", "publishConfig"], "policy-manifest-shape");
  assert(typeof value.private === "boolean", "policy-manifest-private");
  return {
    private: value.private,
    publishConfig: validatePublishConfig(
      value.publishConfig,
      "policy-manifest-publish-config",
    ),
  };
}

function normalizeReleaseAuthority(value) {
  exactKeys(
    value,
    ["mode", "intent", "authority", "channel"],
    "policy-release-shape",
  );
  assert(RELEASE_MODES.has(value.mode), "policy-release-mode");
  assert(RELEASE_INTENTS.has(value.intent), "policy-release-intent");
  assert(RELEASE_AUTHORITIES.has(value.authority), "policy-release-authority");
  assert(RELEASE_CHANNELS.has(value.channel), "policy-release-channel");
  return {
    mode: value.mode,
    intent: value.intent,
    authority: value.authority,
    channel: value.channel,
  };
}

function derivedEligibility(release) {
  return release.mode === "public-npm" &&
    release.intent === "active-public" &&
    release.authority === "hua-packages" &&
    release.channel === "npm-public"
    ? "eligible"
    : "blocked";
}

function assertSortedUnique(records, property, code) {
  for (let index = 0; index < records.length; index += 1) {
    if (index > 0) {
      assert(
        compareUtf8(records[index - 1][property], records[index][property]) < 0,
        code,
      );
    }
  }
}

function assertNoNormalizedCollisions(records, property, code) {
  const seen = new Set();
  for (const record of records) {
    const normalized = record[property].normalize("NFC").toLowerCase();
    assert(!seen.has(normalized), code);
    seen.add(normalized);
  }
}

export function validatePolicy(value, expectedAuthority = PLATFORM_AUTHORITY) {
  exactKeys(
    value,
    ["schemaVersion", "platformAuthority", "packages"],
    "policy-shape",
  );
  assert(value.schemaVersion === 1, "policy-schema-version");
  exactKeys(
    value.platformAuthority,
    [
      "repositoryOwner",
      "repositorySlugPrefix",
      "repositorySlugSuffix",
      "commit",
      "tree",
      "registryPath",
      "registryBlob",
      "registrySha256",
    ],
    "policy-authority-shape",
  );
  for (const [key, expected] of Object.entries(expectedAuthority)) {
    assert(
      value.platformAuthority[key] === expected,
      `policy-authority-${key}`,
    );
  }
  assert(
    Array.isArray(value.packages) && value.packages.length > 0,
    "policy-packages",
  );
  assert(value.packages.length <= 128, "policy-package-count");
  const packages = value.packages.map((entry) => {
    exactKeys(
      entry,
      ["name", "path", "release", "eligibility", "reason", "expectedManifest"],
      "policy-package-shape",
    );
    const name = stringValue(
      entry.name,
      PACKAGE_NAME_PATTERN,
      "policy-package-name",
    );
    const packagePath = stringValue(
      entry.path,
      PACKAGE_PATH_PATTERN,
      "policy-package-path",
    );
    const release = normalizeReleaseAuthority(entry.release);
    const eligibility = derivedEligibility(release);
    assert(entry.eligibility === eligibility, "policy-package-eligibility");
    stringValue(entry.reason, /^[a-z0-9-]{1,80}$/, "policy-package-reason");
    if (eligibility === "eligible") {
      assert(
        entry.reason === "active-public",
        "policy-package-eligible-reason",
      );
    } else {
      assert(entry.reason !== "active-public", "policy-package-blocked-reason");
    }
    const expectedManifest = normalizeExpectedManifest(entry.expectedManifest);
    if (eligibility === "eligible") {
      assert(expectedManifest.private === false, "policy-eligible-private");
    }
    return {
      name,
      path: packagePath,
      release,
      eligibility,
      reason: entry.reason,
      expectedManifest,
    };
  });
  assertSortedUnique(packages, "name", "policy-package-order");
  assertNoNormalizedCollisions(
    packages,
    "name",
    "policy-package-name-collision",
  );
  assertNoNormalizedCollisions(
    packages,
    "path",
    "policy-package-path-collision",
  );
  return {
    schemaVersion: 1,
    platformAuthority: { ...expectedAuthority },
    packages,
  };
}

function readStrictJsonFile(filePath, maxBytes, label) {
  const bytes = readRegularFile(filePath, maxBytes, label);
  return { bytes, value: parseStrictJsonBytes(bytes, { maxBytes, label }) };
}

function normalizeManifest(value, label) {
  assert(isRecord(value), `${label}-shape`);
  const name = stringValue(value.name, PACKAGE_NAME_PATTERN, `${label}-name`);
  const version = stringValue(
    value.version,
    SEMVER_PATTERN,
    `${label}-version`,
  );
  parseSemver(version);
  const isPrivate = value.private === true;
  const publishConfig =
    value.publishConfig === undefined
      ? null
      : validatePublishConfig(value.publishConfig, `${label}-publish-config`);
  return { name, version, private: isPrivate, publishConfig };
}

export function discoverWorkspaceManifests(root) {
  const packagesDirectory = join(root, "packages");
  const entries = readdirSync(packagesDirectory, { withFileTypes: true });
  const records = [];
  for (const entry of entries) {
    assert(
      entry.isDirectory() && !entry.isSymbolicLink(),
      "workspace-entry-non-directory",
    );
    const packagePath = `packages/${entry.name}`;
    const absoluteDirectory = safeRelativePath(root, packagePath);
    const manifestPath = join(absoluteDirectory, "package.json");
    const { bytes, value } = readStrictJsonFile(
      manifestPath,
      MANIFEST_MAX_BYTES,
      "workspace-manifest",
    );
    const manifest = normalizeManifest(value, "workspace-manifest");
    records.push({
      name: manifest.name,
      path: packagePath,
      version: manifest.version,
      private: manifest.private,
      publishConfig: manifest.publishConfig,
      sha256: sha256(bytes),
    });
  }
  records.sort((left, right) => compareUtf8(left.name, right.name));
  assertSortedUnique(records, "name", "workspace-name-order");
  assertNoNormalizedCollisions(records, "name", "workspace-name-collision");
  assertNoNormalizedCollisions(records, "path", "workspace-path-collision");
  return records;
}

export function loadPolicy(root = DEFAULT_ROOT) {
  const policyPath = join(root, POLICY_RELATIVE_PATH);
  const { bytes, value } = readStrictJsonFile(
    policyPath,
    POLICY_MAX_BYTES,
    "policy",
  );
  const policy = validatePolicy(value);
  assert(
    Buffer.from(canonicalJson(policy)).equals(bytes),
    "policy-noncanonical",
  );
  const manifests = discoverWorkspaceManifests(root);
  assert(manifests.length === policy.packages.length, "policy-workspace-count");
  for (let index = 0; index < policy.packages.length; index += 1) {
    const entry = policy.packages[index];
    const manifest = manifests[index];
    assert(
      entry.name === manifest.name && entry.path === manifest.path,
      "policy-workspace-identity",
    );
    assert(
      entry.expectedManifest.private === manifest.private,
      "policy-workspace-private",
    );
    assert(
      JSON.stringify(entry.expectedManifest.publishConfig) ===
        JSON.stringify(manifest.publishConfig),
      "policy-workspace-publish-config",
    );
  }
  return { policy, policyBytes: bytes, policySha256: sha256(bytes), manifests };
}

function normalizeSnapshot(value) {
  exactKeys(
    value,
    ["name", "path", "version", "sha256"],
    "plan-snapshot-shape",
  );
  return {
    name: stringValue(value.name, PACKAGE_NAME_PATTERN, "plan-snapshot-name"),
    path: stringValue(value.path, PACKAGE_PATH_PATTERN, "plan-snapshot-path"),
    version: stringValue(
      value.version,
      SEMVER_PATTERN,
      "plan-snapshot-version",
    ),
    sha256: stringValue(value.sha256, SHA256_PATTERN, "plan-snapshot-sha256"),
  };
}

function parseSemver(value) {
  const match = SEMVER_PATTERN.exec(value);
  assert(match !== null, "plan-semver");
  if (match[4] !== undefined) {
    for (const identifier of match[4].split(".")) {
      assert(
        !/^\d+$/.test(identifier) ||
          identifier === "0" ||
          !identifier.startsWith("0"),
        "plan-semver",
      );
    }
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  };
}

function compareSemver(leftValue, rightValue) {
  const left = parseSemver(leftValue);
  const right = parseSemver(rightValue);
  for (const key of ["major", "minor", "patch"]) {
    if (left[key] !== right[key]) return Math.sign(left[key] - right[key]);
  }
  if (left.prerelease === right.prerelease) return 0;
  if (left.prerelease === null) return 1;
  if (right.prerelease === null) return -1;
  return compareUtf8(left.prerelease, right.prerelease);
}

function normalizeRelease(value) {
  exactKeys(
    value,
    [
      "name",
      "path",
      "type",
      "fromVersion",
      "toVersion",
      "sourceManifestSha256",
      "manifestSha256",
      "changesets",
    ],
    "plan-release-shape",
  );
  const release = {
    name: stringValue(value.name, PACKAGE_NAME_PATTERN, "plan-release-name"),
    path: stringValue(value.path, PACKAGE_PATH_PATTERN, "plan-release-path"),
    type: value.type,
    fromVersion: stringValue(
      value.fromVersion,
      SEMVER_PATTERN,
      "plan-release-from",
    ),
    toVersion: stringValue(value.toVersion, SEMVER_PATTERN, "plan-release-to"),
    sourceManifestSha256: stringValue(
      value.sourceManifestSha256,
      SHA256_PATTERN,
      "plan-release-source-sha256",
    ),
    manifestSha256: stringValue(
      value.manifestSha256,
      SHA256_PATTERN,
      "plan-release-manifest-sha256",
    ),
    changesets: value.changesets,
  };
  assert(RELEASE_TYPES.has(release.type), "plan-release-type");
  assert(
    compareSemver(release.toVersion, release.fromVersion) > 0,
    "plan-release-order",
  );
  assert(
    Array.isArray(release.changesets) && release.changesets.length > 0,
    "plan-release-changesets",
  );
  release.changesets = release.changesets.map((changeset) => {
    exactKeys(changeset, ["id", "sha256"], "plan-changeset-shape");
    return {
      id: stringValue(changeset.id, CHANGESET_ID_PATTERN, "plan-changeset-id"),
      sha256: stringValue(
        changeset.sha256,
        SHA256_PATTERN,
        "plan-changeset-sha256",
      ),
    };
  });
  assertSortedUnique(release.changesets, "id", "plan-changeset-order");
  return release;
}

function planDigestBody(plan) {
  return {
    schemaVersion: plan.schemaVersion,
    policy: plan.policy,
    status: plan.status,
    workspaceManifests: plan.workspaceManifests,
    releases: plan.releases,
  };
}

export function computePlanDigest(plan) {
  return sha256(Buffer.from(canonicalJson(planDigestBody(plan))));
}

export function finalizeReleasePlan(value) {
  const plan = {
    schemaVersion: 1,
    policy: value.policy,
    status: value.status,
    workspaceManifests: value.workspaceManifests,
    releases: value.releases,
  };
  return { ...plan, planDigest: computePlanDigest(plan) };
}

export function validateReleasePlan(value, policyState, options = {}) {
  const { requireNonempty = false } = options;
  exactKeys(
    value,
    [
      "schemaVersion",
      "policy",
      "status",
      "workspaceManifests",
      "releases",
      "planDigest",
    ],
    "plan-shape",
  );
  assert(value.schemaVersion === 1, "plan-schema-version");
  exactKeys(
    value.policy,
    ["platformCommit", "registryBlob", "policySha256"],
    "plan-policy-shape",
  );
  assert(
    value.policy.platformCommit === policyState.policy.platformAuthority.commit,
    "plan-policy-commit",
  );
  assert(
    value.policy.registryBlob ===
      policyState.policy.platformAuthority.registryBlob,
    "plan-policy-registry",
  );
  assert(
    value.policy.policySha256 === policyState.policySha256,
    "plan-policy-sha256",
  );
  assert(value.status === "empty" || value.status === "planned", "plan-status");
  assert(Array.isArray(value.workspaceManifests), "plan-workspace-manifests");
  assert(Array.isArray(value.releases), "plan-releases");
  assert(
    value.workspaceManifests.length === policyState.manifests.length,
    "plan-workspace-count",
  );
  const workspaceManifests = value.workspaceManifests.map(normalizeSnapshot);
  assertSortedUnique(workspaceManifests, "name", "plan-workspace-order");
  const releases = value.releases.map(normalizeRelease);
  assertSortedUnique(releases, "name", "plan-release-name-order");
  assert(
    value.status === (releases.length === 0 ? "empty" : "planned"),
    "plan-status-releases",
  );
  if (requireNonempty) assert(releases.length > 0, "plan-empty");
  const policyByName = new Map(
    policyState.policy.packages.map((entry) => [entry.name, entry]),
  );
  const snapshotByName = new Map(
    workspaceManifests.map((entry) => [entry.name, entry]),
  );
  for (let index = 0; index < workspaceManifests.length; index += 1) {
    const snapshot = workspaceManifests[index];
    const current = policyState.manifests[index];
    assert(
      snapshot.name === current.name &&
        snapshot.path === current.path &&
        snapshot.version === current.version &&
        snapshot.sha256 === current.sha256,
      "plan-workspace-drift",
    );
  }
  for (const release of releases) {
    const policyEntry = policyByName.get(release.name);
    assert(policyEntry !== undefined, "plan-release-unknown");
    assert(policyEntry.eligibility === "eligible", "plan-release-ineligible");
    assert(policyEntry.path === release.path, "plan-release-path-drift");
    const snapshot = snapshotByName.get(release.name);
    assert(snapshot !== undefined, "plan-release-missing-snapshot");
    assert(
      snapshot.version === release.toVersion,
      "plan-release-version-drift",
    );
    assert(
      snapshot.sha256 === release.manifestSha256,
      "plan-release-manifest-drift",
    );
  }
  const normalized = {
    schemaVersion: 1,
    policy: {
      platformCommit: value.policy.platformCommit,
      registryBlob: value.policy.registryBlob,
      policySha256: value.policy.policySha256,
    },
    status: value.status,
    workspaceManifests,
    releases,
    planDigest: stringValue(value.planDigest, SHA256_PATTERN, "plan-digest"),
  };
  assert(
    normalized.planDigest === computePlanDigest(normalized),
    "plan-digest-mismatch",
  );
  return normalized;
}

function workspaceSnapshots(manifests) {
  return manifests.map(({ name, path, version, sha256: manifestSha256 }) => ({
    name,
    path,
    version,
    sha256: manifestSha256,
  }));
}

export function createEmptyReleasePlan(policyState) {
  return finalizeReleasePlan({
    policy: {
      platformCommit: policyState.policy.platformAuthority.commit,
      registryBlob: policyState.policy.platformAuthority.registryBlob,
      policySha256: policyState.policySha256,
    },
    status: "empty",
    workspaceManifests: workspaceSnapshots(policyState.manifests),
    releases: [],
  });
}

export function loadReleaseState(root = DEFAULT_ROOT, options = {}) {
  const policyState = loadPolicy(root);
  const planPath = join(root, PLAN_RELATIVE_PATH);
  const { bytes, value } = readStrictJsonFile(planPath, PLAN_MAX_BYTES, "plan");
  const plan = validateReleasePlan(value, policyState, options);
  assert(Buffer.from(canonicalJson(plan)).equals(bytes), "plan-noncanonical");
  return { ...policyState, plan, planBytes: bytes };
}

function normalizeChangesetsStatus(value) {
  exactKeys(value, ["changesets", "releases"], "changesets-status-shape");
  assert(Array.isArray(value.changesets), "changesets-status-changesets");
  assert(Array.isArray(value.releases), "changesets-status-releases");
  const changesets = value.changesets.map((entry) => {
    exactKeys(entry, ["releases", "summary", "id"], "changesets-status-entry");
    const id = stringValue(
      entry.id,
      CHANGESET_ID_PATTERN,
      "changesets-status-id",
    );
    assert(typeof entry.summary === "string", "changesets-status-summary");
    validateScalarString(entry.summary, "changesets-status-summary");
    assert(
      Array.isArray(entry.releases) && entry.releases.length > 0,
      "changesets-status-entry-releases",
    );
    const releases = entry.releases.map((release) => {
      exactKeys(release, ["name", "type"], "changesets-status-selection");
      assert(
        RELEASE_TYPES.has(release.type),
        "changesets-status-selection-type",
      );
      return {
        name: stringValue(
          release.name,
          PACKAGE_NAME_PATTERN,
          "changesets-status-selection-name",
        ),
        type: release.type,
      };
    });
    releases.sort((left, right) => compareUtf8(left.name, right.name));
    assertSortedUnique(
      releases,
      "name",
      "changesets-status-selection-duplicate",
    );
    return { id, releases };
  });
  changesets.sort((left, right) => compareUtf8(left.id, right.id));
  assertSortedUnique(changesets, "id", "changesets-status-id-duplicate");
  const releases = value.releases.map((release) => {
    exactKeys(
      release,
      ["name", "type", "oldVersion", "changesets", "newVersion"],
      "changesets-status-release",
    );
    assert(
      RELEASE_TYPES.has(release.type) || release.type === "none",
      "changesets-status-release-type",
    );
    assert(
      Array.isArray(release.changesets),
      "changesets-status-release-changesets",
    );
    const ids = release.changesets.map((id) =>
      stringValue(id, CHANGESET_ID_PATTERN, "changesets-status-release-id"),
    );
    const sortedIds = [...ids].sort(compareUtf8);
    assert(
      JSON.stringify(ids) === JSON.stringify(sortedIds),
      "changesets-status-release-id-order",
    );
    assert(
      new Set(ids).size === ids.length,
      "changesets-status-release-id-duplicate",
    );
    const normalized = {
      name: stringValue(
        release.name,
        PACKAGE_NAME_PATTERN,
        "changesets-status-release-name",
      ),
      type: release.type,
      oldVersion: stringValue(
        release.oldVersion,
        SEMVER_PATTERN,
        "changesets-status-old-version",
      ),
      newVersion: stringValue(
        release.newVersion,
        SEMVER_PATTERN,
        "changesets-status-new-version",
      ),
      changesets: ids,
    };
    if (normalized.type === "none") {
      assert(
        normalized.changesets.length === 0,
        "changesets-status-none-changesets",
      );
      assert(
        normalized.oldVersion === normalized.newVersion,
        "changesets-status-none-version",
      );
    } else {
      assert(
        normalized.changesets.length > 0,
        "changesets-status-dependent-release",
      );
    }
    return normalized;
  });
  releases.sort((left, right) => compareUtf8(left.name, right.name));
  assertSortedUnique(releases, "name", "changesets-status-release-duplicate");
  return { changesets, releases };
}

function readChangesetDigests(root, status) {
  const changesetDirectory = join(root, ".changeset");
  const sourceFiles = readdirSync(changesetDirectory, {
    withFileTypes: true,
  }).filter((entry) => entry.name.endsWith(".md"));
  assert(
    sourceFiles.every((entry) => entry.isFile() && !entry.isSymbolicLink()),
    "changeset-non-regular",
  );
  const sourceIds = sourceFiles
    .map((entry) => entry.name.slice(0, -3))
    .sort(compareUtf8);
  const statusIds = status.changesets
    .map((entry) => entry.id)
    .sort(compareUtf8);
  assert(
    JSON.stringify(sourceIds) === JSON.stringify(statusIds),
    "changeset-source-set",
  );
  const digestById = new Map();
  for (const id of sourceIds) {
    stringValue(id, CHANGESET_ID_PATTERN, "changeset-source-id");
    const bytes = readRegularFile(
      join(changesetDirectory, `${id}.md`),
      CHANGESET_MAX_BYTES,
      "changeset-source",
    );
    digestById.set(id, sha256(bytes));
  }
  return digestById;
}

function buildPlannedReleases(
  root,
  policyState,
  status,
  sourceManifests,
  digestById,
) {
  assert(
    status.changesets.length > 0 && status.releases.length > 0,
    "version-empty",
  );
  const policyByName = new Map(
    policyState.policy.packages.map((entry) => [entry.name, entry]),
  );
  const manifestByName = new Map(
    sourceManifests.map((entry) => [entry.name, entry]),
  );
  const statusChangesetIds = new Set(
    status.changesets.map((entry) => entry.id),
  );
  const selectedByChangeset = new Map();
  for (const changeset of status.changesets) {
    for (const selection of changeset.releases) {
      const names = selectedByChangeset.get(changeset.id) ?? new Set();
      names.add(selection.name);
      selectedByChangeset.set(changeset.id, names);
    }
  }
  const planned = [];
  for (const release of status.releases) {
    const policyEntry = policyByName.get(release.name);
    assert(policyEntry !== undefined, "version-release-unknown");
    const sourceManifest = manifestByName.get(release.name);
    assert(sourceManifest !== undefined, "version-release-missing");
    assert(
      sourceManifest.version === release.oldVersion,
      "version-release-old-version",
    );
    if (release.type === "none") {
      assert(policyEntry.eligibility === "blocked", "version-neutral-eligible");
      assert(
        policyEntry.expectedManifest.private === true,
        "version-neutral-public",
      );
      continue;
    }
    assert(
      policyEntry.eligibility === "eligible",
      "version-release-ineligible",
    );
    for (const id of release.changesets) {
      assert(statusChangesetIds.has(id), "version-release-unknown-changeset");
      assert(
        selectedByChangeset.get(id)?.has(release.name),
        "version-release-unselected-dependent",
      );
    }
    planned.push({
      name: release.name,
      path: sourceManifest.path,
      type: release.type,
      fromVersion: release.oldVersion,
      toVersion: release.newVersion,
      sourceManifestSha256: sourceManifest.sha256,
      manifestSha256: null,
      changesets: release.changesets.map((id) => ({
        id,
        sha256: digestById.get(id) ?? fail("version-release-changeset-missing"),
      })),
    });
  }
  assert(planned.length > 0, "version-empty");
  return planned;
}

function writeFileAtomically(filePath, bytes) {
  const parent = dirname(filePath);
  const existing = lstatSync(filePath);
  assert(
    existing.isFile() && !existing.isSymbolicLink(),
    "plan-target-non-regular",
  );
  const temporaryPath = join(
    parent,
    `.release-plan.${process.pid}.${Date.now()}.tmp`,
  );
  let descriptor;
  try {
    descriptor = openSync(
      temporaryPath,
      fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL,
      0o600,
    );
    let offset = 0;
    while (offset < bytes.length) {
      offset += writeSync(
        descriptor,
        bytes,
        offset,
        bytes.length - offset,
        offset,
      );
    }
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporaryPath, filePath);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    rmSync(temporaryPath, { force: true });
  }
}

export function runVersion(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const startingState = loadReleaseState(root);
  assert(startingState.plan.status === "empty", "version-existing-plan");
  const policyState = startingState;
  const sourceManifests = policyState.manifests;
  const temporaryRoot = mkdtempSync(join(tmpdir(), "hua-safe-release-status-"));
  const statusPath = join(temporaryRoot, "status.json");
  try {
    execFile("pnpm", ["exec", "changeset", "status", "--output", statusPath], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const { value: statusValue } = readStrictJsonFile(
      statusPath,
      STATUS_MAX_BYTES,
      "changesets-status",
    );
    const status = normalizeChangesetsStatus(statusValue);
    const digestById = readChangesetDigests(root, status);
    const plannedReleases = buildPlannedReleases(
      root,
      policyState,
      status,
      sourceManifests,
      digestById,
    );
    execFile("pnpm", ["exec", "changeset", "version"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const finalPolicyState = loadPolicy(root);
    const sourceByName = new Map(
      sourceManifests.map((entry) => [entry.name, entry]),
    );
    const releaseByName = new Map(
      plannedReleases.map((entry) => [entry.name, entry]),
    );
    for (const manifest of finalPolicyState.manifests) {
      const source = sourceByName.get(manifest.name);
      const release = releaseByName.get(manifest.name);
      assert(source !== undefined, "version-workspace-extra");
      if (release === undefined) {
        assert(
          source.sha256 === manifest.sha256,
          "version-unexpected-manifest-change",
        );
      } else {
        assert(
          manifest.version === release.toVersion,
          "version-manifest-version",
        );
        release.manifestSha256 = manifest.sha256;
      }
    }
    const plan = finalizeReleasePlan({
      policy: {
        platformCommit: finalPolicyState.policy.platformAuthority.commit,
        registryBlob: finalPolicyState.policy.platformAuthority.registryBlob,
        policySha256: finalPolicyState.policySha256,
      },
      status: "planned",
      workspaceManifests: workspaceSnapshots(finalPolicyState.manifests),
      releases: plannedReleases,
    });
    validateReleasePlan(plan, finalPolicyState, { requireNonempty: true });
    writeFileAtomically(
      join(root, PLAN_RELATIVE_PATH),
      Buffer.from(canonicalJson(plan)),
    );
    return plan;
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

export function validatePublishedPackages(value, releaseState) {
  exactKeys(value, ["schemaVersion", "publishedPackages"], "published-shape");
  assert(value.schemaVersion === 1, "published-schema-version");
  assert(Array.isArray(value.publishedPackages), "published-packages");
  const publishedPackages = value.publishedPackages.map((entry) => {
    exactKeys(entry, ["name", "version"], "published-package-shape");
    return {
      name: stringValue(
        entry.name,
        PACKAGE_NAME_PATTERN,
        "published-package-name",
      ),
      version: stringValue(
        entry.version,
        SEMVER_PATTERN,
        "published-package-version",
      ),
    };
  });
  assertSortedUnique(publishedPackages, "name", "published-package-order");
  const expected = releaseState.plan.releases.map(({ name, toVersion }) => ({
    name,
    version: toVersion,
  }));
  assert(
    JSON.stringify(publishedPackages) === JSON.stringify(expected),
    "published-package-set",
  );
  return { schemaVersion: 1, publishedPackages };
}

export function runPublish(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const releaseState = loadReleaseState(root, { requireNonempty: true });
  const publishedPackages = [];
  for (const release of releaseState.plan.releases) {
    const packageDirectory = safeRelativePath(root, release.path);
    execFile(
      "pnpm",
      ["publish", "--no-git-checks", "--access", "public", "--provenance"],
      {
        cwd: packageDirectory,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    publishedPackages.push({ name: release.name, version: release.toVersion });
  }
  return validatePublishedPackages(
    { schemaVersion: 1, publishedPackages },
    releaseState,
  );
}

export function checkPolicyCommand(root = DEFAULT_ROOT) {
  const state = loadPolicy(root);
  return {
    schemaVersion: 1,
    packageCount: state.policy.packages.length,
    eligibleCount: state.policy.packages.filter(
      (entry) => entry.eligibility === "eligible",
    ).length,
    policySha256: state.policySha256,
  };
}

function parseCliArguments(argv) {
  assert(argv.length >= 1, "cli-mode-missing");
  const [mode, ...argumentsList] = argv;
  assert(["version", "check", "publish"].includes(mode), "cli-mode");
  let format = "json";
  let allowEmpty = false;
  for (const argument of argumentsList) {
    if (argument === "--format=github" && mode === "check") {
      format = "github";
    } else if (argument === "--allow-empty" && mode === "check") {
      allowEmpty = true;
    } else {
      fail("cli-argument");
    }
  }
  assert(!allowEmpty || format === "github", "cli-allow-empty-format");
  return { mode, format, allowEmpty };
}

export function main(argv = process.argv.slice(2), options = {}) {
  const { mode, format, allowEmpty } = parseCliArguments(argv);
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  if (mode === "version") {
    const plan = runVersion({ root, execFile });
    process.stdout.write(
      JSON.stringify({
        status: "planned",
        releaseCount: plan.releases.length,
        planDigest: plan.planDigest,
      }) + "\n",
    );
    return;
  }
  if (mode === "check") {
    const state = loadReleaseState(root);
    const publish = state.plan.releases.length > 0;
    assert(publish || allowEmpty, "plan-empty");
    if (format === "github") {
      process.stdout.write(
        `publish=${publish}\nrelease_count=${state.plan.releases.length}\nplan_digest=${state.plan.planDigest}\n`,
      );
    } else {
      process.stdout.write(
        JSON.stringify({
          status: publish ? "planned" : "no-release",
          releaseCount: state.plan.releases.length,
          planDigest: state.plan.planDigest,
        }) + "\n",
      );
    }
    return;
  }
  const published = runPublish({ root, execFile });
  process.stdout.write(`${JSON.stringify(published)}\n`);
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  try {
    main();
  } catch (error) {
    const code =
      typeof error?.code === "string" ? error.code : "safe-release-failed";
    process.stderr.write(`safe-release: ${code}\n`);
    process.exitCode = 1;
  }
}
