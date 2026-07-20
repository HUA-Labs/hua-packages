#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants as fsConstants,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  openSync,
  readSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isAlias, parseDocument, visit } from "yaml";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = resolve(moduleDirectory, "..");
export const POLICY_RELATIVE_PATH = "config/publish-allowlist.json";
export const PLAN_RELATIVE_PATH = "config/release-plan.json";
export const ARTIFACT_MANIFEST_FILENAME = "release-artifacts.json";
export const RELEASE_REPOSITORY = "HUA-Labs/hua-packages";

export const PLATFORM_AUTHORITY = Object.freeze({
  authorityKind: "platform-release-registry",
  commit: "049aa34d8b6ea06316f126310ebc89a16b445e86",
  tree: "33bf31608b735a66d8b7ce3571d8bdcc66a78ffc",
  registryPath: "config/workspaceRegistry.yaml",
  registryBlob: "7127872f2f042cdaa2c2497500ae71e31d25ddac",
  registrySha256:
    "81d27860b099f1e9aecd80c909687cfa88c3d4c2769df92a650d5ca19732ba38",
});

const POLICY_MAX_BYTES = 128 * 1024;
const PLAN_MAX_BYTES = 2 * 1024 * 1024;
const LOCKFILE_MAX_BYTES = 8 * 1024 * 1024;
const MANIFEST_MAX_BYTES = 256 * 1024;
const CHANGESET_MAX_BYTES = 256 * 1024;
const STATUS_MAX_BYTES = 2 * 1024 * 1024;
const GIT_OUTPUT_MAX_BYTES = 128 * 1024;
const GITHUB_OUTPUT_MAX_BYTES = 1024 * 1024;
const ARTIFACT_MANIFEST_MAX_BYTES = 2 * 1024 * 1024;
const ARTIFACT_MAX_BYTES = 128 * 1024 * 1024;
const ARTIFACT_TOTAL_MAX_BYTES = 512 * 1024 * 1024;
const REGISTRY_OUTPUT_MAX_BYTES = 64 * 1024;
const CONSUMER_OUTPUT_MAX_BYTES = 2 * 1024 * 1024;
const REGISTRY_OBSERVATION_ATTEMPTS = 12;
const REGISTRY_OBSERVATION_DELAY_MS = 10000;
const PROVENANCE_PREDICATE = "https://slsa.dev/provenance/v1";
const MAX_JSON_DEPTH = 32;
const MAX_JSON_NODES = 50000;
const MAX_STRING_BYTES = 8 * 1024;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const GIT_SHA_PATTERN = /^[a-f0-9]{40}$/;
const RUN_ID_PATTERN = /^[1-9][0-9]{0,19}$/;
const GITHUB_LOGIN_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9-]+\/[a-z0-9-]+|[a-z0-9-]+)$/;
const PACKAGE_PATH_PATTERN = /^packages\/[a-z0-9-]+$/;
const CHANGESET_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
const ARTIFACT_FILENAME_PATTERN = /^[a-z0-9][a-z0-9._+-]{0,199}\.tgz$/;
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const RELEASE_TYPES = new Set(["patch", "minor", "major"]);
const RELEASE_TYPE_RANK = new Map([
  ["patch", 0],
  ["minor", 1],
  ["major", 2],
]);
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
const LOCK_IMPORTER_FIELDS = Object.freeze([
  "dependencies",
  "devDependencies",
  "optionalDependencies",
]);
const MANIFEST_DEPENDENCY_FIELDS = Object.freeze([
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
]);
const GITHUB_CLI = "/usr/bin/gh";

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

function sha512Integrity(bytes) {
  return `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
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
  return (release.mode === "public-npm" || release.mode === "no-publish") &&
    release.intent === "active-public" &&
    release.authority === "hua-packages" &&
    release.channel === "npm-public"
    ? "eligible"
    : "blocked";
}

function allowsEmptyManifestRefresh(policyEntry) {
  return policyEntry.eligibility === "eligible";
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
      "authorityKind",
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

function readLockfile(root, label) {
  const bytes = readRegularFile(
    join(root, "pnpm-lock.yaml"),
    LOCKFILE_MAX_BYTES,
    label,
  );
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(`${label}-invalid-utf8`);
  }
  let document;
  try {
    document = parseDocument(text, {
      strict: true,
      uniqueKeys: true,
      maxAliasCount: 0,
      prettyErrors: false,
    });
  } catch {
    fail(`${label}-invalid`);
  }
  assert(
    document.errors.length === 0 && document.warnings.length === 0,
    `${label}-invalid`,
  );
  let aliasFound = false;
  visit(document, {
    Node(_key, node) {
      if (isAlias(node)) aliasFound = true;
    },
  });
  assert(!aliasFound, `${label}-alias`);
  let value;
  try {
    value = document.toJS({ maxAliasCount: 0, mapAsMap: false });
  } catch {
    fail(`${label}-invalid`);
  }
  assert(isRecord(value), `${label}-shape`);
  assert(isRecord(value.importers), `${label}-importers`);
  return { bytes, value };
}

function readWorkspaceManifestValues(root, manifests, label) {
  return new Map(
    manifests.map((manifest) => {
      const { value } = readStrictJsonFile(
        join(root, manifest.path, "package.json"),
        MANIFEST_MAX_BYTES,
        label,
      );
      assert(value.name === manifest.name, `${label}-identity`);
      return [manifest.path, value];
    }),
  );
}

function workspaceManifestSpecifiers(manifest, workspaceNames, label) {
  const specifiers = new Map();
  for (const field of MANIFEST_DEPENDENCY_FIELDS) {
    const dependencies = manifest[field];
    if (dependencies === undefined) continue;
    assert(isRecord(dependencies), `${label}-shape`);
    for (const name of Object.keys(dependencies).sort(compareUtf8)) {
      if (!workspaceNames.has(name)) continue;
      const specifier = stringValue(
        dependencies[name],
        /^.{1,512}$/u,
        `${label}-specifier`,
      );
      assert(
        !specifiers.has(name) || specifiers.get(name) === specifier,
        `${label}-duplicate`,
      );
      specifiers.set(name, specifier);
    }
  }
  return specifiers;
}

function parseWorkspaceVersionSpecifier(specifier) {
  assert(specifier.startsWith("workspace:"), "version-lock-workspace-protocol");
  const version = specifier.slice("workspace:".length);
  assert(
    version !== "*" && !version.startsWith("^") && !version.startsWith("~"),
    "version-lock-workspace-protocol",
  );
  parseSemver(version);
  return version;
}

function validateVersionLockClosure({
  sourceLock,
  finalLock,
  sourceManifestValues,
  finalManifestValues,
  plannedReleases,
  workspaceNames,
}) {
  const normalizedFinalLock = structuredClone(finalLock);
  const plannedNames = new Set(plannedReleases.map((release) => release.name));
  const releaseByName = new Map(
    plannedReleases.map((release) => [release.name, release]),
  );
  for (const release of plannedReleases) {
    const sourceManifest = sourceManifestValues.get(release.path);
    const finalManifest = finalManifestValues.get(release.path);
    assert(
      sourceManifest !== undefined && finalManifest !== undefined,
      "version-lock-manifest-missing",
    );
    const sourceSpecifiers = workspaceManifestSpecifiers(
      sourceManifest,
      workspaceNames,
      "version-lock-source-manifest",
    );
    const finalSpecifiers = workspaceManifestSpecifiers(
      finalManifest,
      workspaceNames,
      "version-lock-final-manifest",
    );
    const names = [
      ...new Set([...sourceSpecifiers.keys(), ...finalSpecifiers.keys()]),
    ].sort(compareUtf8);
    for (const name of names) {
      const sourceSpecifier = sourceSpecifiers.get(name);
      const finalSpecifier = finalSpecifiers.get(name);
      if (sourceSpecifier === finalSpecifier) continue;
      assert(
        sourceSpecifier !== undefined && finalSpecifier !== undefined,
        "version-lock-manifest-relation",
      );
      assert(plannedNames.has(name), "version-lock-unselected-relation");
      const dependencyRelease = releaseByName.get(name);
      assert(
        dependencyRelease !== undefined,
        "version-lock-unselected-relation",
      );
      const sourceWorkspaceVersion =
        parseWorkspaceVersionSpecifier(sourceSpecifier);
      const finalWorkspaceVersion =
        parseWorkspaceVersionSpecifier(finalSpecifier);
      assert(
        sourceWorkspaceVersion === dependencyRelease.fromVersion &&
          finalWorkspaceVersion === dependencyRelease.toVersion,
        "version-lock-workspace-version",
      );
      const sourceImporter = sourceLock.importers[release.path];
      const finalImporter = finalLock.importers[release.path];
      const normalizedFinalImporter =
        normalizedFinalLock.importers[release.path];
      assert(
        isRecord(sourceImporter) &&
          isRecord(finalImporter) &&
          isRecord(normalizedFinalImporter),
        "version-lock-importer-missing",
      );
      const matchingFields = LOCK_IMPORTER_FIELDS.filter((field) => {
        const dependencies = sourceImporter[field];
        return (
          isRecord(dependencies) &&
          isRecord(dependencies[name]) &&
          dependencies[name].specifier === sourceSpecifier
        );
      });
      assert(matchingFields.length === 1, "version-lock-importer-relation");
      const field = matchingFields[0];
      assert(
        isRecord(finalImporter[field]) &&
          isRecord(finalImporter[field][name]) &&
          finalImporter[field][name].specifier === finalSpecifier,
        "version-lock-importer-relation",
      );
      assert(
        isRecord(normalizedFinalImporter[field]) &&
          isRecord(normalizedFinalImporter[field][name]),
        "version-lock-importer-relation",
      );
      normalizedFinalImporter[field][name].specifier = sourceSpecifier;
    }
  }
  assert(
    canonicalJson(normalizedFinalLock) === canonicalJson(sourceLock),
    "version-lock-churn",
  );
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
  assert(
    value.private === undefined || typeof value.private === "boolean",
    `${label}-private`,
  );
  const isPrivate = value.private === true;
  const publishConfig =
    value.publishConfig === undefined
      ? null
      : validatePublishConfig(value.publishConfig, `${label}-publish-config`);
  const dependencyRecords = [];
  for (const field of ["dependencies", "optionalDependencies"]) {
    const dependencies = value[field];
    if (dependencies === undefined) continue;
    assert(isRecord(dependencies), `${label}-${field}-shape`);
    for (const dependencyName of Object.keys(dependencies).sort(compareUtf8)) {
      stringValue(
        dependencyName,
        PACKAGE_NAME_PATTERN,
        `${label}-${field}-name`,
      );
      const dependencySpec = stringValue(
        dependencies[dependencyName],
        /^.{1,512}$/u,
        `${label}-${field}-spec`,
      );
      dependencyRecords.push({
        name: dependencyName,
        workspaceSpecifier: dependencySpec.startsWith("workspace:"),
      });
    }
  }
  return {
    name,
    version,
    private: isPrivate,
    publishConfig,
    dependencyRecords,
  };
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
      dependencyRecords: manifest.dependencyRecords,
      sha256: sha256(bytes),
    });
  }
  records.sort((left, right) => compareUtf8(left.name, right.name));
  assertSortedUnique(records, "name", "workspace-name-order");
  assertNoNormalizedCollisions(records, "name", "workspace-name-collision");
  assertNoNormalizedCollisions(records, "path", "workspace-path-collision");
  const workspaceNames = new Set(records.map((record) => record.name));
  for (const record of records) {
    record.workspaceDependencies = [
      ...new Set(
        record.dependencyRecords
          .filter(
            (dependency) =>
              dependency.workspaceSpecifier ||
              workspaceNames.has(dependency.name),
          )
          .map((dependency) => dependency.name),
      ),
    ].sort(compareUtf8);
    delete record.dependencyRecords;
  }
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
    claim: plan.claim,
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
    claim: value.claim ?? null,
    workspaceManifests: value.workspaceManifests,
    releases: value.releases,
  };
  return { ...plan, planDigest: computePlanDigest(plan) };
}

export function validateReleasePlan(value, policyState, options = {}) {
  const { requireNonempty = false, allowEmptyWorkspaceDrift = false } = options;
  exactKeys(
    value,
    [
      "schemaVersion",
      "policy",
      "status",
      "claim",
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
  assert(
    value.status === "empty" ||
      value.status === "planned" ||
      value.status === "publishing",
    "plan-status",
  );
  let claim = null;
  if (value.claim !== null) {
    exactKeys(
      value.claim,
      ["artifactManifestSha256", "branch", "runId", "sourceHead"],
      "plan-claim-shape",
    );
    claim = {
      artifactManifestSha256: stringValue(
        value.claim.artifactManifestSha256,
        SHA256_PATTERN,
        "plan-claim-artifact-manifest-sha256",
      ),
      branch: stringValue(value.claim.branch, /^main$/, "plan-claim-branch"),
      runId: stringValue(
        value.claim.runId,
        RUN_ID_PATTERN,
        "plan-claim-run-id",
      ),
      sourceHead: stringValue(
        value.claim.sourceHead,
        GIT_SHA_PATTERN,
        "plan-claim-source-head",
      ),
    };
  }
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
  if (releases.length === 0) {
    assert(value.status === "empty", "plan-status-releases");
    assert(claim === null, "plan-empty-claim");
  } else if (value.status === "planned") {
    assert(claim === null, "plan-planned-claim");
  } else {
    assert(value.status === "publishing", "plan-status-releases");
    assert(claim !== null, "plan-publishing-claim");
  }
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
      snapshot.name === current.name && snapshot.path === current.path,
      "plan-workspace-identity",
    );
    if (allowEmptyWorkspaceDrift && releases.length === 0) {
      assert(snapshot.version === current.version, "refresh-version-drift");
      if (snapshot.sha256 !== current.sha256) {
        assert(
          allowsEmptyManifestRefresh(policyState.policy.packages[index]),
          "refresh-ineligible-workspace",
        );
      }
    } else {
      assert(
        snapshot.version === current.version &&
          snapshot.sha256 === current.sha256,
        "plan-workspace-drift",
      );
    }
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
    claim,
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
    claim: null,
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

export function runPreflight(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const releaseState = loadReleaseState(root, {
    allowEmptyWorkspaceDrift: true,
  });
  const refreshRequired = releaseState.plan.workspaceManifests.some(
    (snapshot, index) =>
      snapshot.sha256 !== releaseState.manifests[index].sha256,
  );
  let authorityRequired = releaseState.plan.status !== "empty";
  if (!authorityRequired && options.execFile !== undefined) {
    const currentHead = gitOutput(options.execFile, root, [
      "rev-parse",
      "HEAD",
    ]);
    externalPolicyAssert(GIT_SHA_PATTERN.test(currentHead));
    authorityRequired =
      detectReviewedTransition(
        options.execFile,
        root,
        releaseState,
        currentHead,
      )?.kind === "close";
  }
  return { ...releaseState, authorityRequired, refreshRequired };
}

export function runCheck(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const releaseState = loadReleaseState(root);
  if (releaseState.plan.status === "publishing") {
    const claimHead = gitOutput(execFile, root, ["rev-parse", "HEAD"]);
    assertRemoteHead(execFile, root, releaseState.plan.claim.branch, claimHead);
    assertExactClaimTransition(
      execFile,
      root,
      claimHead,
      releaseState.plan.claim.sourceHead,
    );
  }
  return releaseState;
}

export function runRefresh(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const releaseState = loadReleaseState(root, {
    allowEmptyWorkspaceDrift: true,
  });
  assert(releaseState.plan.status === "empty", "refresh-nonempty-plan");
  const refreshed = createEmptyReleasePlan(releaseState);
  writeFileAtomically(
    join(root, PLAN_RELATIVE_PATH),
    Buffer.from(canonicalJson(refreshed)),
  );
  return refreshed;
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

function readChangesetSourceIds(root) {
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
  for (const id of sourceIds) {
    stringValue(id, CHANGESET_ID_PATTERN, "changeset-source-id");
  }
  return sourceIds;
}

function readChangesetDigests(root, status) {
  const changesetDirectory = join(root, ".changeset");
  const sourceIds = readChangesetSourceIds(root);
  const statusIds = status.changesets
    .map((entry) => entry.id)
    .sort(compareUtf8);
  assert(
    JSON.stringify(sourceIds) === JSON.stringify(statusIds),
    "changeset-source-set",
  );
  const digestById = new Map();
  for (const id of sourceIds) {
    const bytes = readRegularFile(
      join(changesetDirectory, `${id}.md`),
      CHANGESET_MAX_BYTES,
      "changeset-source",
    );
    digestById.set(id, sha256(bytes));
  }
  return digestById;
}

function validateChangesetReleaseRelations(status) {
  const releaseByName = new Map(
    status.releases.map((release) => [release.name, release]),
  );
  const selectionsByName = new Map();
  for (const changeset of status.changesets) {
    for (const selection of changeset.releases) {
      assert(
        releaseByName.has(selection.name),
        "version-changeset-release-missing",
      );
      const selections = selectionsByName.get(selection.name) ?? [];
      selections.push({ id: changeset.id, type: selection.type });
      selectionsByName.set(selection.name, selections);
    }
  }
  for (const release of status.releases) {
    const selections = selectionsByName.get(release.name) ?? [];
    if (release.type === "none") {
      assert(selections.length === 0, "version-changeset-release-type");
      continue;
    }
    const expectedIds = selections.map((selection) => selection.id);
    assert(
      JSON.stringify(release.changesets) === JSON.stringify(expectedIds),
      "version-changeset-release-ids",
    );
    const expectedType = selections.reduce((selectedType, selection) => {
      if (selectedType === null) return selection.type;
      return RELEASE_TYPE_RANK.get(selection.type) >
        RELEASE_TYPE_RANK.get(selectedType)
        ? selection.type
        : selectedType;
    }, null);
    assert(release.type === expectedType, "version-changeset-release-type");
  }
}

function validateConsumedChangesetSources(root, status) {
  const remainingIds = readChangesetSourceIds(root);
  const remainingSet = new Set(remainingIds);
  for (const changeset of status.changesets) {
    assert(!remainingSet.has(changeset.id), "version-changeset-source-set");
  }
  assert(remainingIds.length === 0, "version-changeset-source-set");
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
  validateChangesetReleaseRelations(status);
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

function pathIsAbsent(filePath) {
  try {
    lstatSync(filePath);
    return false;
  } catch (error) {
    if (error?.code === "ENOENT") return true;
    fail("artifact-path-state");
  }
}

function writeNewFileAtomically(filePath, bytes) {
  assert(pathIsAbsent(filePath), "artifact-manifest-exists");
  const parent = dirname(filePath);
  const temporaryPath = join(
    parent,
    `.release-artifacts.${process.pid}.${Date.now()}.tmp`,
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
    linkSync(temporaryPath, filePath);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    rmSync(temporaryPath, { force: true });
  }
}

function validateArtifactDirectory(root, directoryPath, requireEmpty = false) {
  assert(typeof directoryPath === "string", "artifact-directory");
  validateScalarString(directoryPath, "artifact-directory");
  assert(isAbsolute(directoryPath), "artifact-directory-absolute");
  const stats = lstatSync(directoryPath);
  assert(
    stats.isDirectory() && !stats.isSymbolicLink(),
    "artifact-directory-non-directory",
  );
  const absoluteDirectory = realpathSync(directoryPath);
  assert(
    absoluteDirectory === resolve(directoryPath),
    "artifact-directory-link",
  );
  const absoluteRoot = realpathSync(root);
  const rootRelative = relative(absoluteRoot, absoluteDirectory);
  assert(
    rootRelative === ".." || rootRelative.startsWith(`..${sep}`),
    "artifact-directory-repository",
  );
  if (requireEmpty) {
    assert(
      readdirSync(absoluteDirectory).length === 0,
      "artifact-directory-not-empty",
    );
  }
  return absoluteDirectory;
}

function artifactPlannedDigest(plan) {
  if (plan.status === "planned") return plan.planDigest;
  assert(plan.status === "publishing", "artifact-plan-status");
  return finalizeReleasePlan({
    ...plan,
    status: "planned",
    claim: null,
  }).planDigest;
}

function normalizeArtifactRecord(value) {
  exactKeys(
    value,
    ["bytes", "file", "name", "sha256", "version"],
    "artifact-record-shape",
  );
  assert(
    Number.isSafeInteger(value.bytes) &&
      value.bytes > 0 &&
      value.bytes <= ARTIFACT_MAX_BYTES,
    "artifact-record-bytes",
  );
  return {
    bytes: value.bytes,
    file: stringValue(
      value.file,
      ARTIFACT_FILENAME_PATTERN,
      "artifact-record-file",
      256,
    ),
    name: stringValue(value.name, PACKAGE_NAME_PATTERN, "artifact-record-name"),
    sha256: stringValue(value.sha256, SHA256_PATTERN, "artifact-record-sha256"),
    version: stringValue(
      value.version,
      SEMVER_PATTERN,
      "artifact-record-version",
    ),
  };
}

export function validateArtifactManifest(value, releaseState, binding) {
  exactKeys(
    value,
    [
      "artifacts",
      "branch",
      "planDigest",
      "runId",
      "schemaVersion",
      "sourceHead",
    ],
    "artifact-manifest-shape",
  );
  assert(value.schemaVersion === 1, "artifact-manifest-schema-version");
  const normalizedBinding = normalizeClaimInput(binding);
  assert(value.branch === normalizedBinding.branch, "artifact-manifest-branch");
  assert(value.runId === normalizedBinding.runId, "artifact-manifest-run-id");
  assert(
    value.sourceHead === normalizedBinding.sourceHead,
    "artifact-manifest-source-head",
  );
  assert(
    value.planDigest === artifactPlannedDigest(releaseState.plan),
    "artifact-manifest-plan-digest",
  );
  assert(Array.isArray(value.artifacts), "artifact-manifest-artifacts");
  const artifacts = value.artifacts.map(normalizeArtifactRecord);
  assertSortedUnique(artifacts, "name", "artifact-manifest-name-order");
  const byFile = [...artifacts].sort((left, right) =>
    compareUtf8(left.file, right.file),
  );
  assertSortedUnique(byFile, "file", "artifact-manifest-file-order");
  const expected = releaseState.plan.releases.map((release) => ({
    name: release.name,
    version: release.toVersion,
  }));
  assert(
    JSON.stringify(
      artifacts.map(({ name, version }) => ({ name, version })),
    ) === JSON.stringify(expected),
    "artifact-manifest-release-set",
  );
  return {
    schemaVersion: 1,
    branch: normalizedBinding.branch,
    runId: normalizedBinding.runId,
    sourceHead: normalizedBinding.sourceHead,
    planDigest: value.planDigest,
    artifacts,
  };
}

function readPackedPackageManifest(execFile, root, artifactPath) {
  const output = execFile(
    "tar",
    ["-xOf", artifactPath, "package/package.json"],
    {
      cwd: root,
      encoding: null,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: MANIFEST_MAX_BYTES,
    },
  );
  const bytes = Buffer.isBuffer(output) ? output : Buffer.from(output ?? "");
  const value = parseStrictJsonBytes(bytes, {
    maxBytes: MANIFEST_MAX_BYTES,
    label: "artifact-package-manifest",
  });
  assert(isRecord(value), "artifact-package-manifest-shape");
  const dependencyFields = {};
  for (const field of ["dependencies", "optionalDependencies"]) {
    const dependencies = value[field];
    if (dependencies === undefined) {
      dependencyFields[field] = {};
      continue;
    }
    assert(isRecord(dependencies), `artifact-package-${field}-shape`);
    const normalized = {};
    for (const dependencyName of Object.keys(dependencies).sort(compareUtf8)) {
      stringValue(
        dependencyName,
        PACKAGE_NAME_PATTERN,
        `artifact-package-${field}-name`,
      );
      normalized[dependencyName] = stringValue(
        dependencies[dependencyName],
        /^.{1,512}$/u,
        `artifact-package-${field}-spec`,
      );
    }
    dependencyFields[field] = normalized;
  }
  return {
    name: stringValue(
      value.name,
      PACKAGE_NAME_PATTERN,
      "artifact-package-name",
    ),
    version: stringValue(
      value.version,
      SEMVER_PATTERN,
      "artifact-package-version",
    ),
    ...dependencyFields,
  };
}

function assertPackedWorkspaceDependencies(
  packageManifest,
  dependencies,
  workspaceNames,
) {
  const declarations = new Map();
  for (const field of ["dependencies", "optionalDependencies"]) {
    for (const [name, specifier] of Object.entries(packageManifest[field])) {
      if (!workspaceNames.has(name)) continue;
      assert(
        !declarations.has(name),
        "artifact-package-dependency-declaration",
      );
      declarations.set(name, specifier);
    }
  }
  assert(
    declarations.size === dependencies.length &&
      dependencies.every((dependency) => declarations.has(dependency.name)),
    "artifact-package-dependency-set",
  );
  for (const dependency of dependencies) {
    assert(
      declarations.get(dependency.name) === dependency.version,
      "artifact-package-dependency-version",
    );
  }
}

export function readArtifactBundle(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  assert(
    typeof options.artifactManifestPath === "string",
    "artifact-manifest-path",
  );
  validateScalarString(options.artifactManifestPath, "artifact-manifest-path");
  assert(
    isAbsolute(options.artifactManifestPath),
    "artifact-manifest-absolute",
  );
  assert(
    options.artifactManifestPath === resolve(options.artifactManifestPath),
    "artifact-manifest-normalized",
  );
  assert(
    options.artifactManifestPath.endsWith(
      `${sep}${ARTIFACT_MANIFEST_FILENAME}`,
    ),
    "artifact-manifest-filename",
  );
  const directory = validateArtifactDirectory(
    root,
    dirname(options.artifactManifestPath),
  );
  assert(
    !pathIsAbsent(options.artifactManifestPath),
    "artifact-manifest-missing",
  );
  const manifestBytes = readRegularFile(
    options.artifactManifestPath,
    ARTIFACT_MANIFEST_MAX_BYTES,
    "artifact-manifest",
  );
  const manifest = validateArtifactManifest(
    parseStrictJsonBytes(manifestBytes, {
      maxBytes: ARTIFACT_MANIFEST_MAX_BYTES,
      label: "artifact-manifest",
    }),
    options.releaseState,
    options,
  );
  assert(
    Buffer.from(canonicalJson(manifest)).equals(manifestBytes),
    "artifact-manifest-noncanonical",
  );
  const artifactManifestSha256 = sha256(manifestBytes);
  if (options.artifactManifestSha256 !== undefined) {
    assert(
      stringValue(
        options.artifactManifestSha256,
        SHA256_PATTERN,
        "artifact-manifest-expected-sha256",
      ) === artifactManifestSha256,
      "artifact-manifest-sha256",
    );
  }
  const expectedEntries = [
    ARTIFACT_MANIFEST_FILENAME,
    ...manifest.artifacts.map((artifact) => artifact.file),
  ].sort(compareUtf8);
  const actualEntries = readdirSync(directory).sort(compareUtf8);
  assert(
    JSON.stringify(actualEntries) === JSON.stringify(expectedEntries),
    "artifact-directory-entries",
  );
  let totalBytes = 0;
  const artifacts = manifest.artifacts.map((artifact) => {
    const artifactPath = join(directory, artifact.file);
    const before = readRegularFile(
      artifactPath,
      ARTIFACT_MAX_BYTES,
      "artifact-tarball",
    );
    totalBytes += before.byteLength;
    assert(totalBytes <= ARTIFACT_TOTAL_MAX_BYTES, "artifact-total-oversize");
    assert(before.byteLength === artifact.bytes, "artifact-byte-count");
    assert(sha256(before) === artifact.sha256, "artifact-sha256");
    const packageManifest = readPackedPackageManifest(
      execFile,
      root,
      artifactPath,
    );
    assert(
      packageManifest.name === artifact.name,
      "artifact-package-name-drift",
    );
    assert(
      packageManifest.version === artifact.version,
      "artifact-package-version-drift",
    );
    assertPackedWorkspaceDependencies(
      packageManifest,
      artifactWorkspaceDependencies(options.releaseState, artifact),
      new Set(options.releaseState.manifests.map((entry) => entry.name)),
    );
    const after = readRegularFile(
      artifactPath,
      ARTIFACT_MAX_BYTES,
      "artifact-tarball-postcheck",
    );
    assert(before.equals(after), "artifact-tarball-drift");
    return {
      ...artifact,
      artifactPath,
      integrity: sha512Integrity(before),
    };
  });
  return { manifest, manifestBytes, artifactManifestSha256, artifacts };
}

function gitOutput(execFile, root, argumentsList) {
  const output = execFile("git", argumentsList, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: GIT_OUTPUT_MAX_BYTES,
  });
  assert(typeof output === "string", "git-output");
  return output.trimEnd();
}

function assertRemoteHead(execFile, root, branch, expectedHead) {
  const reference = `refs/heads/${branch}`;
  assert(
    gitOutput(execFile, root, [
      "ls-remote",
      "--exit-code",
      "origin",
      reference,
    ]) === `${expectedHead}\t${reference}`,
    "release-remote-head-drift",
  );
}

function assertRemoteReferenceAbsent(execFile, root, reference) {
  assert(
    gitOutput(execFile, root, ["ls-remote", "origin", reference]) === "",
    "release-transition-exists",
  );
}

function assertExactClaimTransition(execFile, root, claimHead, sourceHead) {
  assert(claimHead !== sourceHead, "publish-unclaimed-head");
  assert(
    gitOutput(execFile, root, [
      "rev-list",
      "--parents",
      "-n",
      "1",
      claimHead,
    ]) === `${claimHead} ${sourceHead}`,
    "publish-claim-topology",
  );
  assert(
    gitOutput(execFile, root, [
      "diff",
      "--name-only",
      sourceHead,
      claimHead,
    ]) === PLAN_RELATIVE_PATH,
    "publish-claim-scope",
  );
}

function externalPolicyAssert(condition) {
  if (!condition) fail("external-policy-blocked");
}

function externalRecord(value) {
  externalPolicyAssert(isRecord(value));
  return value;
}

function externalString(value, pattern, maxBytes = 512) {
  externalPolicyAssert(typeof value === "string");
  externalPolicyAssert(Buffer.byteLength(value, "utf8") <= maxBytes);
  externalPolicyAssert(pattern.test(value));
  return value;
}

function externalArray(value, maximum = 99) {
  externalPolicyAssert(Array.isArray(value));
  externalPolicyAssert(value.length <= maximum);
  return value;
}

function externalBooleanField(record, key, expected) {
  const value = externalRecord(record)[key];
  externalPolicyAssert(isRecord(value));
  externalPolicyAssert(value.enabled === expected);
}

function validateExternalPolicy(authority) {
  const protection = externalRecord(authority.protection);
  const reviews = externalRecord(protection.required_pull_request_reviews);
  externalPolicyAssert(reviews.dismiss_stale_reviews === true);
  externalPolicyAssert(reviews.require_last_push_approval === true);
  externalPolicyAssert(
    Number.isSafeInteger(reviews.required_approving_review_count) &&
      reviews.required_approving_review_count >= 1,
  );
  const classicBypass = externalRecord(reviews.bypass_pull_request_allowances);
  for (const key of ["users", "teams", "apps"]) {
    externalPolicyAssert(externalArray(classicBypass[key]).length === 0);
  }
  externalBooleanField(protection, "enforce_admins", true);
  externalBooleanField(protection, "allow_force_pushes", false);
  externalBooleanField(protection, "allow_deletions", false);

  externalPolicyAssert(externalArray(authority.rules).length === 0);
  externalPolicyAssert(externalArray(authority.rulesets).length === 0);

  const actions = externalRecord(authority.actions);
  externalPolicyAssert(
    actions.default_workflow_permissions === "read" ||
      actions.default_workflow_permissions === "write",
  );
  externalPolicyAssert(actions.can_approve_pull_request_reviews === false);
}

function validateTransitionAuthority(authority, transition) {
  externalPolicyAssert(isRecord(transition));
  externalPolicyAssert(
    transition.kind === "claim" || transition.kind === "close",
  );
  const baseHead = externalString(transition.baseHead, GIT_SHA_PATTERN);
  const currentHead = externalString(transition.currentHead, GIT_SHA_PATTERN);
  const currentTree = externalString(transition.currentTree, GIT_SHA_PATTERN);
  const expectedBranch = `release/${transition.kind}-${baseHead.slice(0, 12)}`;
  externalPolicyAssert(transition.expectedBranch === expectedBranch);

  const associations = externalArray(authority.associations);
  externalPolicyAssert(associations.length === 1);
  const association = externalRecord(associations[0]);
  externalPolicyAssert(
    Number.isSafeInteger(association.number) && association.number > 0,
  );

  const pullRequest = externalRecord(authority.pullRequest);
  externalPolicyAssert(pullRequest.number === association.number);
  externalPolicyAssert(pullRequest.state === "closed");
  externalPolicyAssert(pullRequest.merged === true);
  externalString(
    pullRequest.merged_at,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
  );
  externalPolicyAssert(pullRequest.merge_commit_sha === currentHead);
  const pullRequestAuthor = externalString(
    externalRecord(pullRequest.user).login,
    GITHUB_LOGIN_PATTERN,
  );
  const base = externalRecord(pullRequest.base);
  externalPolicyAssert(base.ref === "main");
  externalPolicyAssert(base.sha === baseHead);
  externalPolicyAssert(
    externalRecord(base.repo).full_name === RELEASE_REPOSITORY,
  );
  const head = externalRecord(pullRequest.head);
  externalPolicyAssert(head.ref === expectedBranch);
  const pullRequestHead = externalString(head.sha, GIT_SHA_PATTERN);
  externalPolicyAssert(
    externalRecord(head.repo).full_name === RELEASE_REPOSITORY,
  );
  externalPolicyAssert(
    externalRecord(externalRecord(authority.headCommit).tree).sha ===
      currentTree,
  );

  const latestReviewByActor = new Map();
  for (const reviewValue of externalArray(authority.reviews)) {
    const review = externalRecord(reviewValue);
    externalPolicyAssert(Number.isSafeInteger(review.id) && review.id > 0);
    const actor = externalString(
      externalRecord(review.user).login,
      GITHUB_LOGIN_PATTERN,
    );
    externalPolicyAssert(
      review.state === "APPROVED" ||
        review.state === "CHANGES_REQUESTED" ||
        review.state === "COMMENTED" ||
        review.state === "DISMISSED" ||
        review.state === "PENDING",
    );
    if (review.state === "APPROVED") {
      externalPolicyAssert(review.commit_id === pullRequestHead);
    }
    const previous = latestReviewByActor.get(actor.toLowerCase());
    if (previous === undefined || review.id > previous.id) {
      latestReviewByActor.set(actor.toLowerCase(), {
        id: review.id,
        actor,
        state: review.state,
        commitId: review.commit_id,
      });
    }
  }
  externalPolicyAssert(
    [...latestReviewByActor.values()].some(
      (review) =>
        review.state === "APPROVED" &&
        review.commitId === pullRequestHead &&
        review.actor.toLowerCase() !== pullRequestAuthor.toLowerCase(),
    ),
  );
}

export function validateGitHubReleaseAuthority(authority, transition = null) {
  try {
    externalPolicyAssert(isRecord(authority));
    validateExternalPolicy(authority);
    if (transition !== null) {
      validateTransitionAuthority(authority, transition);
    }
    return {
      repository: RELEASE_REPOSITORY,
      status: "protected",
      transition: transition?.kind ?? "none",
    };
  } catch {
    fail("external-policy-blocked");
  }
}

function githubApiJson(execFile, token, endpoint) {
  externalString(token, /^\S+$/u, 8192);
  let output;
  try {
    output = execFile(
      GITHUB_CLI,
      [
        "api",
        "--method",
        "GET",
        "-H",
        "Accept: application/vnd.github+json",
        "-H",
        "X-GitHub-Api-Version: 2022-11-28",
        endpoint,
      ],
      {
        encoding: "utf8",
        env: { GH_HOST: "github.com", GH_TOKEN: token, NO_COLOR: "1" },
        maxBuffer: GITHUB_OUTPUT_MAX_BYTES,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch {
    fail("external-policy-blocked");
  }
  externalPolicyAssert(typeof output === "string");
  const bytes = Buffer.from(output, "utf8");
  externalPolicyAssert(bytes.byteLength <= GITHUB_OUTPUT_MAX_BYTES);
  try {
    return parseStrictJsonBytes(bytes, {
      maxBytes: GITHUB_OUTPUT_MAX_BYTES,
      label: "github-authority",
    });
  } catch {
    fail("external-policy-blocked");
  }
}

function readGitHubReleaseAuthority(options, transition) {
  const execFile = options.githubExecFile ?? execFileSync;
  const token = options.policyToken ?? process.env.HUA_GITHUB_POLICY_TOKEN;
  if (typeof token !== "string" || token.length === 0) {
    fail("policy-credential-unavailable");
  }
  const repository = RELEASE_REPOSITORY;
  const protection = githubApiJson(
    execFile,
    token,
    `repos/${repository}/branches/main/protection`,
  );
  const rules = githubApiJson(
    execFile,
    token,
    `repos/${repository}/rules/branches/main`,
  );
  const rulesets = githubApiJson(
    execFile,
    token,
    `repos/${repository}/rulesets?includes_parents=true&per_page=100`,
  );
  externalPolicyAssert(Array.isArray(rulesets));
  externalPolicyAssert(rulesets.length < 100);
  const actions = githubApiJson(
    execFile,
    token,
    `repos/${repository}/actions/permissions/workflow`,
  );
  const authority = { protection, rules, rulesets, actions };
  if (transition === null) return authority;

  const associations = githubApiJson(
    execFile,
    token,
    `repos/${repository}/commits/${transition.currentHead}/pulls?per_page=100`,
  );
  externalPolicyAssert(Array.isArray(associations));
  externalPolicyAssert(associations.length < 100);
  if (associations.length !== 1) return { ...authority, associations };
  const association = externalRecord(associations[0]);
  externalPolicyAssert(
    Number.isSafeInteger(association.number) && association.number > 0,
  );
  const pullRequest = githubApiJson(
    execFile,
    token,
    `repos/${repository}/pulls/${association.number}`,
  );
  const reviews = githubApiJson(
    execFile,
    token,
    `repos/${repository}/pulls/${association.number}/reviews?per_page=100`,
  );
  externalPolicyAssert(Array.isArray(reviews));
  externalPolicyAssert(reviews.length < 100);
  const pullRequestHead = externalString(
    externalRecord(externalRecord(pullRequest).head).sha,
    GIT_SHA_PATTERN,
  );
  const headCommit = githubApiJson(
    execFile,
    token,
    `repos/${repository}/git/commits/${pullRequestHead}`,
  );
  return {
    ...authority,
    associations,
    pullRequest,
    reviews,
    headCommit,
  };
}

function readPlanFromGit(execFile, root, revision, policyState) {
  const output = gitOutput(execFile, root, [
    "show",
    `${revision}:${PLAN_RELATIVE_PATH}`,
  ]);
  const bytes = Buffer.from(`${output}\n`, "utf8");
  const value = parseStrictJsonBytes(bytes, {
    maxBytes: PLAN_MAX_BYTES,
    label: "transition-plan",
  });
  const plan = validateReleasePlan(value, policyState);
  externalPolicyAssert(Buffer.from(canonicalJson(plan)).equals(bytes));
  return plan;
}

function detectReviewedTransition(execFile, root, releaseState, currentHead) {
  const currentTree = gitOutput(execFile, root, ["rev-parse", "HEAD^{tree}"]);
  externalPolicyAssert(GIT_SHA_PATTERN.test(currentTree));
  if (releaseState.plan.status === "publishing") {
    const baseHead = releaseState.plan.claim.sourceHead;
    assertExactClaimTransition(execFile, root, currentHead, baseHead);
    return {
      kind: "claim",
      baseHead,
      currentHead,
      currentTree,
      expectedBranch: `release/claim-${baseHead.slice(0, 12)}`,
    };
  }
  if (releaseState.plan.status !== "empty") return null;
  const parents = gitOutput(execFile, root, [
    "rev-list",
    "--parents",
    "-n",
    "1",
    currentHead,
  ]).split(" ");
  externalPolicyAssert(parents.length === 2);
  const parentHead = parents[1];
  const changedPaths = gitOutput(execFile, root, [
    "diff",
    "--name-only",
    parentHead,
    currentHead,
  ]);
  if (changedPaths !== PLAN_RELATIVE_PATH) return null;
  const parentPlan = readPlanFromGit(execFile, root, parentHead, releaseState);
  externalPolicyAssert(parentPlan.status === "publishing");
  assertExactClaimTransition(execFile, root, currentHead, parentHead);
  return {
    kind: "close",
    baseHead: parentHead,
    currentHead,
    currentTree,
    expectedBranch: `release/close-${parentHead.slice(0, 12)}`,
  };
}

export function runAuthority(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const releaseState = loadReleaseState(root, {
    allowEmptyWorkspaceDrift: true,
  });
  try {
    const currentHead = gitOutput(execFile, root, ["rev-parse", "HEAD"]);
    externalPolicyAssert(GIT_SHA_PATTERN.test(currentHead));
    assertRemoteHead(execFile, root, "main", currentHead);
    const transition = detectReviewedTransition(
      execFile,
      root,
      releaseState,
      currentHead,
    );
    const authority =
      options.githubAuthority ??
      readGitHubReleaseAuthority(options, transition);
    const result = validateGitHubReleaseAuthority(authority, transition);
    assertRemoteHead(execFile, root, "main", currentHead);
    return result;
  } catch (error) {
    if (error?.code === "policy-credential-unavailable") throw error;
    fail("external-policy-blocked");
  }
}

function persistExactPlanMutation(options) {
  const {
    root,
    execFile,
    branch,
    expectedHead,
    commitMessage,
    runId,
    transitionKind,
  } = options;
  assert(branch === "main", "release-branch");
  assert(GIT_SHA_PATTERN.test(expectedHead), "release-expected-head");
  assert(RUN_ID_PATTERN.test(runId), "release-transition-run-id");
  assert(
    transitionKind === "claim" || transitionKind === "close",
    "release-transition-kind",
  );
  const transitionBranch = `release/${transitionKind}-${expectedHead.slice(0, 12)}`;
  const transitionReference = `refs/heads/${transitionBranch}`;
  assert(
    gitOutput(execFile, root, ["rev-parse", "HEAD"]) === expectedHead,
    "release-local-head-drift",
  );
  assertRemoteHead(execFile, root, branch, expectedHead);
  assertRemoteReferenceAbsent(execFile, root, transitionReference);
  assert(
    gitOutput(execFile, root, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
    ]) === ` M ${PLAN_RELATIVE_PATH}`,
    "release-plan-only-drift",
  );
  gitOutput(execFile, root, ["add", "--", PLAN_RELATIVE_PATH]);
  assert(
    gitOutput(execFile, root, [
      "diff",
      "--cached",
      "--name-only",
      "--diff-filter=ACMRTUXB",
    ]) === PLAN_RELATIVE_PATH,
    "release-staged-scope",
  );
  gitOutput(execFile, root, [
    "-c",
    "user.name=hua-release-guard",
    "-c",
    "user.email=release-guard@users.noreply.github.com",
    "commit",
    "-m",
    commitMessage,
  ]);
  const committedHead = gitOutput(execFile, root, ["rev-parse", "HEAD"]);
  assert(GIT_SHA_PATTERN.test(committedHead), "release-commit-head");
  assert(committedHead !== expectedHead, "release-commit-unchanged");
  assertRemoteHead(execFile, root, branch, expectedHead);
  gitOutput(execFile, root, [
    "push",
    "origin",
    `${committedHead}:${transitionReference}`,
  ]);
  assertRemoteHead(execFile, root, branch, expectedHead);
  assertRemoteHead(execFile, root, transitionBranch, committedHead);
  assert(
    gitOutput(execFile, root, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
    ]) === "",
    "release-post-commit-drift",
  );
  return { head: committedHead, branch: transitionBranch };
}

function normalizeClaimInput(options) {
  return {
    branch: stringValue(options.branch, /^main$/, "release-claim-branch"),
    runId: stringValue(options.runId, RUN_ID_PATTERN, "release-claim-run-id"),
    sourceHead: stringValue(
      options.sourceHead,
      GIT_SHA_PATTERN,
      "release-claim-source-head",
    ),
  };
}

function normalizeArtifactClaim(options) {
  return {
    artifactManifestSha256: stringValue(
      options.artifactManifestSha256,
      SHA256_PATTERN,
      "release-claim-artifact-manifest-sha256",
    ),
    ...normalizeClaimInput(options),
  };
}

function lifecycleFreeEnvironment(environment) {
  const ignoreScriptKeys = new Set([
    "npm_config_ignore_scripts",
    "pnpm_config_ignore_scripts",
  ]);
  return {
    ...Object.fromEntries(
      Object.entries(environment).filter(
        ([key]) => !ignoreScriptKeys.has(key.toLowerCase()),
      ),
    ),
    npm_config_ignore_scripts: "true",
    pnpm_config_ignore_scripts: "true",
  };
}

function versionLockEnvironment(
  environment,
  lockHome,
  userConfigPath,
  globalConfigPath,
) {
  const inheritedKeys = [
    "PATH",
    "LANG",
    "LC_ALL",
    "SSL_CERT_FILE",
    "SSL_CERT_DIR",
    "NODE_EXTRA_CA_CERTS",
    "TMPDIR",
    "TMP",
    "TEMP",
  ];
  return {
    ...Object.fromEntries(
      inheritedKeys.flatMap((key) =>
        typeof environment[key] === "string" ? [[key, environment[key]]] : [],
      ),
    ),
    CI: "true",
    HOME: lockHome,
    USERPROFILE: lockHome,
    XDG_CACHE_HOME: join(lockHome, "cache"),
    NPM_CONFIG_USERCONFIG: userConfigPath,
    NPM_CONFIG_GLOBALCONFIG: globalConfigPath,
    npm_config_registry: "https://registry.npmjs.org/",
    npm_config_ignore_scripts: "true",
    pnpm_config_ignore_scripts: "true",
  };
}

export function runPack(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const binding = normalizeClaimInput(options);
  const releaseState = loadReleaseState(root, { requireNonempty: true });
  assert(releaseState.plan.status === "planned", "pack-plan-status");
  const artifactDirectory = validateArtifactDirectory(
    root,
    options.artifactDirectory,
    true,
  );
  const manifestsByName = new Map(
    releaseState.manifests.map((manifest) => [manifest.name, manifest]),
  );
  const visited = new Set();
  const visiting = new Set();
  const buildOrder = [];
  const visitBuild = (name) => {
    const manifest = manifestsByName.get(name);
    assert(manifest !== undefined, "pack-workspace-dependency-unknown");
    if (visited.has(name)) return;
    assert(!visiting.has(name), "pack-workspace-dependency-cycle");
    visiting.add(name);
    for (const dependencyName of manifest.workspaceDependencies) {
      visitBuild(dependencyName);
    }
    visiting.delete(name);
    visited.add(name);
    buildOrder.push(manifest);
  };
  for (const release of releaseState.plan.releases) {
    visitBuild(release.name);
  }
  for (const manifest of buildOrder) {
    execFile("pnpm", ["--filter", manifest.name, "run", "build"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  }
  assertPackReleaseStateUnchanged(root, releaseState);
  const artifactRecords = [];
  for (const release of releaseState.plan.releases) {
    const packageDirectory = safeRelativePath(root, release.path);
    const beforeEntries = new Set(readdirSync(artifactDirectory));
    execFile("pnpm", ["pack", "--pack-destination", artifactDirectory], {
      cwd: packageDirectory,
      encoding: "utf8",
      env: lifecycleFreeEnvironment(process.env),
      stdio: ["ignore", "pipe", "pipe"],
    });
    assertPackReleaseStateUnchanged(root, releaseState);
    const addedEntries = readdirSync(artifactDirectory).filter(
      (entry) => !beforeEntries.has(entry),
    );
    assert(addedEntries.length === 1, "pack-artifact-count");
    const file = stringValue(
      addedEntries[0],
      ARTIFACT_FILENAME_PATTERN,
      "pack-artifact-file",
      256,
    );
    const artifactPath = join(artifactDirectory, file);
    const bytes = readRegularFile(
      artifactPath,
      ARTIFACT_MAX_BYTES,
      "pack-artifact",
    );
    const packageManifest = readPackedPackageManifest(
      execFile,
      root,
      artifactPath,
    );
    assert(packageManifest.name === release.name, "pack-artifact-name");
    assert(
      packageManifest.version === release.toVersion,
      "pack-artifact-version",
    );
    artifactRecords.push({
      bytes: bytes.byteLength,
      file,
      name: release.name,
      sha256: sha256(bytes),
      version: release.toVersion,
    });
  }
  artifactRecords.sort((left, right) => compareUtf8(left.name, right.name));
  const artifactPaths = artifactRecords.map((artifact) =>
    join(artifactDirectory, artifact.file),
  );
  execFile(
    "node",
    [join(root, "scripts/check-pack-artifacts.js"), ...artifactPaths],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  assertPackReleaseStateUnchanged(root, releaseState);
  for (const artifact of artifactRecords) {
    const bytes = readRegularFile(
      join(artifactDirectory, artifact.file),
      ARTIFACT_MAX_BYTES,
      "pack-artifact-postcheck",
    );
    assert(
      bytes.byteLength === artifact.bytes,
      "pack-artifact-byte-count-drift",
    );
    assert(sha256(bytes) === artifact.sha256, "pack-artifact-sha256-drift");
  }
  const manifest = validateArtifactManifest(
    {
      schemaVersion: 1,
      branch: binding.branch,
      runId: binding.runId,
      sourceHead: binding.sourceHead,
      planDigest: releaseState.plan.planDigest,
      artifacts: artifactRecords,
    },
    releaseState,
    binding,
  );
  const artifactManifestPath = join(
    artifactDirectory,
    ARTIFACT_MANIFEST_FILENAME,
  );
  const manifestBytes = Buffer.from(canonicalJson(manifest));
  writeNewFileAtomically(artifactManifestPath, manifestBytes);
  const artifactManifestSha256 = sha256(manifestBytes);
  readArtifactBundle({
    root,
    execFile,
    releaseState,
    artifactManifestPath,
    artifactManifestSha256,
    ...binding,
  });
  return {
    artifactManifestPath,
    artifactManifestSha256,
    artifactCount: artifactRecords.length,
    planDigest: releaseState.plan.planDigest,
  };
}

function assertPackReleaseStateUnchanged(root, expected) {
  const current = loadReleaseState(root, { requireNonempty: true });
  assert(current.plan.status === "planned", "pack-plan-status");
  assert(current.policyBytes.equals(expected.policyBytes), "pack-policy-drift");
  assert(current.planBytes.equals(expected.planBytes), "pack-plan-drift");
}

export function runClaim(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const binding = normalizeClaimInput(options);
  const releaseState = loadReleaseState(root, { requireNonempty: true });
  assert(releaseState.plan.status === "planned", "claim-plan-status");
  const bundle = readArtifactBundle({
    root,
    execFile,
    releaseState,
    artifactManifestPath: options.artifactManifestPath,
    ...binding,
  });
  const claim = normalizeArtifactClaim({
    ...binding,
    artifactManifestSha256: bundle.artifactManifestSha256,
  });
  assert(
    gitOutput(execFile, root, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
    ]) === "",
    "claim-worktree-drift",
  );
  const publishingPlan = finalizeReleasePlan({
    ...releaseState.plan,
    status: "publishing",
    claim,
  });
  writeFileAtomically(
    join(root, PLAN_RELATIVE_PATH),
    Buffer.from(canonicalJson(publishingPlan)),
  );
  const transition = persistExactPlanMutation({
    root,
    execFile,
    branch: claim.branch,
    expectedHead: claim.sourceHead,
    commitMessage: "chore(release): claim exact publish plan",
    runId: claim.runId,
    transitionKind: "claim",
  });
  return {
    plan: publishingPlan,
    claimHead: transition.head,
    transitionBranch: transition.branch,
  };
}

export function persistProvenanceClosure(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const claim = normalizeClaimInput(options);
  const releaseState = loadReleaseState(root);
  assert(releaseState.plan.status === "empty", "closure-plan-status");
  const claimHead = gitOutput(execFile, root, ["rev-parse", "HEAD"]);
  assert(
    stringValue(options.claimHead, GIT_SHA_PATTERN, "closure-claim-head") ===
      claimHead,
    "closure-claim-head-drift",
  );
  assert(claimHead !== claim.sourceHead, "closure-unclaimed-head");
  return persistExactPlanMutation({
    root,
    execFile,
    branch: claim.branch,
    expectedHead: claimHead,
    commitMessage: "chore(release): close exact published plan",
    runId: claim.runId,
    transitionKind: "close",
  });
}

export function runVersion(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const environment = options.environment ?? process.env;
  const startingState = loadReleaseState(root);
  assert(startingState.plan.status === "empty", "version-existing-plan");
  const policyState = startingState;
  const sourceManifests = policyState.manifests;
  const sourceManifestValues = readWorkspaceManifestValues(
    root,
    sourceManifests,
    "version-source-manifest",
  );
  const { value: sourceLock } = readLockfile(root, "version-source-lock");
  const temporaryRoot = mkdtempSync(join(tmpdir(), "hua-safe-release-status-"));
  const statusPath = join(temporaryRoot, "status.json");
  const lockHome = join(temporaryRoot, "lock-home");
  const userConfigPath = join(lockHome, "user.npmrc");
  const globalConfigPath = join(lockHome, "global.npmrc");
  try {
    mkdirSync(lockHome, { recursive: true, mode: 0o700 });
    writeFileSync(userConfigPath, "", { mode: 0o600 });
    writeFileSync(globalConfigPath, "", { mode: 0o600 });
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
    validateConsumedChangesetSources(root, status);
    const versionedPolicyState = loadPolicy(root);
    const sourceByName = new Map(
      sourceManifests.map((entry) => [entry.name, entry]),
    );
    const releaseByName = new Map(
      plannedReleases.map((entry) => [entry.name, entry]),
    );
    for (const manifest of versionedPolicyState.manifests) {
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
    execFile(
      "pnpm",
      [
        "install",
        "--lockfile-only",
        "--no-frozen-lockfile",
        "--ignore-scripts",
        "--registry=https://registry.npmjs.org/",
      ],
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: versionLockEnvironment(
          environment,
          lockHome,
          userConfigPath,
          globalConfigPath,
        ),
      },
    );
    const finalPolicyState = loadPolicy(root);
    assert(
      finalPolicyState.manifests.length ===
        versionedPolicyState.manifests.length &&
        finalPolicyState.manifests.every(
          (manifest, index) =>
            manifest.name === versionedPolicyState.manifests[index].name &&
            manifest.path === versionedPolicyState.manifests[index].path &&
            manifest.sha256 === versionedPolicyState.manifests[index].sha256,
        ),
      "version-lock-manifest-drift",
    );
    const finalManifestValues = readWorkspaceManifestValues(
      root,
      finalPolicyState.manifests,
      "version-lock-final-manifest",
    );
    const { value: finalLock } = readLockfile(root, "version-final-lock");
    validateVersionLockClosure({
      sourceLock,
      finalLock,
      sourceManifestValues,
      finalManifestValues,
      plannedReleases,
      workspaceNames: new Set(sourceManifests.map((manifest) => manifest.name)),
    });
    assert(
      readRegularFile(
        join(root, PLAN_RELATIVE_PATH),
        PLAN_MAX_BYTES,
        "version-plan-before-write",
      ).equals(startingState.planBytes),
      "version-plan-drift",
    );
    for (const release of plannedReleases) {
      release.manifestSha256 = finalPolicyState.manifests.find(
        (manifest) => manifest.name === release.name,
      ).sha256;
    }
    const plan = finalizeReleasePlan({
      policy: {
        platformCommit: finalPolicyState.policy.platformAuthority.commit,
        registryBlob: finalPolicyState.policy.platformAuthority.registryBlob,
        policySha256: finalPolicyState.policySha256,
      },
      status: "planned",
      claim: null,
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

function normalizeRegistryObservation(value) {
  exactKeys(value, ["status"], "publish-registry-observation-shape");
  assert(
    value.status === "absent" ||
      value.status === "pending" ||
      value.status === "verified" ||
      value.status === "conflict",
    "publish-registry-observation-status",
  );
  return { status: value.status };
}

function registryViewObservation({ artifact, execFile, root }) {
  const specifier = `${artifact.name}@${artifact.version}`;
  let output;
  try {
    output = execFile(
      "npm",
      [
        "view",
        specifier,
        "name",
        "version",
        "dist.integrity",
        "dist.attestations.provenance.predicateType",
        "--json",
        "--registry",
        "https://registry.npmjs.org/",
      ],
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: REGISTRY_OUTPUT_MAX_BYTES,
        timeout: 10000,
      },
    );
  } catch (error) {
    const code = typeof error?.code === "string" ? error.code : "";
    const stderr =
      typeof error?.stderr === "string"
        ? error.stderr.slice(0, REGISTRY_OUTPUT_MAX_BYTES)
        : Buffer.isBuffer(error?.stderr)
          ? error.stderr.subarray(0, REGISTRY_OUTPUT_MAX_BYTES).toString("utf8")
          : "";
    return {
      status:
        code === "E404" || /(?:^|\s)E404(?:\s|$)/u.test(stderr)
          ? "absent"
          : "pending",
    };
  }
  if (typeof output !== "string") return { status: "pending" };
  let value;
  try {
    value = parseStrictJsonBytes(Buffer.from(output), {
      maxBytes: REGISTRY_OUTPUT_MAX_BYTES,
      label: "publish-registry",
    });
  } catch {
    return { status: "pending" };
  }
  if (!isRecord(value)) return { status: "pending" };
  const allowedKeys = new Set([
    "name",
    "version",
    "dist.integrity",
    "dist.attestations.provenance.predicateType",
  ]);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) {
    return { status: "pending" };
  }
  if (value.name !== artifact.name || value.version !== artifact.version) {
    return { status: "conflict" };
  }
  const integrity = value["dist.integrity"];
  if (integrity === undefined) return { status: "pending" };
  if (integrity !== artifact.integrity) return { status: "conflict" };
  const predicate = value["dist.attestations.provenance.predicateType"];
  if (predicate === undefined) return { status: "pending" };
  return {
    status: predicate === PROVENANCE_PREDICATE ? "verified" : "conflict",
  };
}

function sleepSync(milliseconds) {
  assert(
    Number.isSafeInteger(milliseconds) &&
      milliseconds >= 0 &&
      milliseconds <= 30000,
    "publish-registry-delay",
  );
  if (milliseconds === 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function observeArtifact(options) {
  const { artifact, phase, registryObserver, registryAttempts, sleep } =
    options;
  assert(
    Number.isSafeInteger(registryAttempts) &&
      registryAttempts >= 1 &&
      registryAttempts <= 20,
    "publish-registry-attempts",
  );
  for (let attempt = 1; attempt <= registryAttempts; attempt += 1) {
    const observation = normalizeRegistryObservation(
      registryObserver({ artifact, phase, attempt }),
    );
    if (observation.status === "verified") return "verified";
    if (observation.status === "conflict") {
      fail("publish-registry-immutable-conflict");
    }
    if (phase === "before" && observation.status === "absent") {
      return "absent";
    }
    if (attempt < registryAttempts) sleep(REGISTRY_OBSERVATION_DELAY_MS);
  }
  fail("publish-registry-unverified");
}

function selectedPublishOrder(releaseState, artifacts) {
  const artifactByName = new Map(
    artifacts.map((artifact) => [artifact.name, artifact]),
  );
  const manifestByName = new Map(
    releaseState.manifests.map((manifest) => [manifest.name, manifest]),
  );
  const selected = new Set(artifactByName.keys());
  const visited = new Set();
  const visiting = new Set();
  const ordered = [];
  const visit = (name) => {
    if (visited.has(name)) return;
    assert(!visiting.has(name), "publish-dependency-cycle");
    const manifest = manifestByName.get(name);
    assert(manifest !== undefined, "publish-dependency-manifest");
    visiting.add(name);
    for (const dependencyName of manifest.workspaceDependencies) {
      if (selected.has(dependencyName)) visit(dependencyName);
    }
    visiting.delete(name);
    visited.add(name);
    const artifact = artifactByName.get(name);
    assert(artifact !== undefined, "publish-artifact-missing");
    ordered.push(artifact);
  };
  for (const name of [...selected].sort(compareUtf8)) visit(name);
  return ordered;
}

function artifactWorkspaceDependencies(releaseState, artifact) {
  const releaseByName = new Map(
    releaseState.plan.releases.map((release) => [release.name, release]),
  );
  const manifestByName = new Map(
    releaseState.manifests.map((manifest) => [manifest.name, manifest]),
  );
  const manifest = releaseState.manifests.find(
    (candidate) => candidate.name === artifact.name,
  );
  assert(manifest !== undefined, "publish-dependency-manifest");
  return manifest.workspaceDependencies
    .map((name) => {
      const dependencyManifest = manifestByName.get(name);
      assert(dependencyManifest !== undefined, "publish-dependency-manifest");
      return {
        name,
        version:
          releaseByName.get(name)?.toVersion ?? dependencyManifest.version,
      };
    })
    .sort((left, right) => compareUtf8(left.name, right.name));
}

function installedPackageManifestPath(root, packageName) {
  const segments = packageName.startsWith("@")
    ? packageName.split("/")
    : [packageName];
  return join(root, "node_modules", ...segments, "package.json");
}

function verifyInstalledConsumer({ artifact, dependencies, execFile }) {
  const consumerRoot = realpathSync(
    mkdtempSync(join(tmpdir(), "hua-release-consumer-")),
  );
  try {
    writeFileSync(
      join(consumerRoot, "package.json"),
      canonicalJson({
        name: "hua-release-consumer",
        private: true,
        version: "0.0.0",
      }),
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
    try {
      execFile(
        "npm",
        [
          "install",
          `${artifact.name}@${artifact.version}`,
          "--ignore-scripts",
          "--no-save",
          "--package-lock=false",
          "--prefer-online",
          "--no-audit",
          "--no-fund",
          "--registry",
          "https://registry.npmjs.org/",
        ],
        {
          cwd: consumerRoot,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          maxBuffer: CONSUMER_OUTPUT_MAX_BYTES,
          timeout: 120000,
        },
      );
      const installed = parseStrictJsonBytes(
        readRegularFile(
          installedPackageManifestPath(consumerRoot, artifact.name),
          MANIFEST_MAX_BYTES,
          "publish-consumer-manifest",
        ),
        { maxBytes: MANIFEST_MAX_BYTES, label: "publish-consumer-manifest" },
      );
      assert(isRecord(installed), "publish-consumer-manifest-shape");
      assert(
        installed.name === artifact.name &&
          installed.version === artifact.version,
        "publish-consumer-package-drift",
      );
      for (const dependency of dependencies) {
        execFile(
          "npm",
          [
            "ls",
            `${dependency.name}@${dependency.version}`,
            "--json",
            "--depth=Infinity",
          ],
          {
            cwd: consumerRoot,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
            maxBuffer: CONSUMER_OUTPUT_MAX_BYTES,
            timeout: 30000,
          },
        );
      }
    } catch (error) {
      if (
        typeof error?.code === "string" &&
        error.code.startsWith("publish-consumer-")
      ) {
        throw error;
      }
      fail("publish-consumer-install");
    }
  } finally {
    rmSync(consumerRoot, { recursive: true, force: true });
  }
}

export function runPublish(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const gitExecFile = options.gitExecFile ?? execFileSync;
  const releaseState = loadReleaseState(root, { requireNonempty: true });
  assert(releaseState.plan.status === "publishing", "publish-plan-unclaimed");
  const claimIdentity = normalizeClaimInput({
    branch: options.branch,
    runId: options.runId,
    sourceHead: options.sourceHead,
  });
  const claim = normalizeArtifactClaim(releaseState.plan.claim);
  assert(
    claim.branch === claimIdentity.branch &&
      claim.runId === claimIdentity.runId &&
      claim.sourceHead === claimIdentity.sourceHead,
    "publish-claim-owner",
  );
  const claimHead = stringValue(
    options.claimHead,
    GIT_SHA_PATTERN,
    "publish-claim-head",
  );
  assert(
    gitOutput(gitExecFile, root, ["rev-parse", "HEAD"]) === claimHead,
    "publish-local-claim-head-drift",
  );
  assertRemoteHead(gitExecFile, root, claim.branch, claimHead);
  assertExactClaimTransition(gitExecFile, root, claimHead, claim.sourceHead);
  runAuthority({
    root,
    execFile: gitExecFile,
    githubAuthority: options.githubAuthority,
    githubExecFile: options.githubExecFile,
    policyToken: options.policyToken,
  });
  const bundle = readArtifactBundle({
    root,
    execFile,
    releaseState,
    artifactManifestPath: options.artifactManifestPath,
    ...claim,
  });
  const registryAttempts =
    options.registryAttempts ?? REGISTRY_OBSERVATION_ATTEMPTS;
  const registryObserver =
    options.registryObserver ??
    ((input) => registryViewObservation({ ...input, execFile, root }));
  const installedConsumerVerifier =
    options.installedConsumerVerifier ??
    ((input) => verifyInstalledConsumer({ ...input, execFile }));
  const sleep = options.sleep ?? sleepSync;
  const publishedPackages = [];
  for (const artifact of selectedPublishOrder(releaseState, bundle.artifacts)) {
    const artifactPath = artifact.artifactPath;
    const initial = observeArtifact({
      artifact,
      phase: "before",
      registryObserver,
      registryAttempts,
      sleep,
    });
    if (initial === "absent") {
      execFile(
        "npm",
        [
          "publish",
          artifactPath,
          "--ignore-scripts",
          "--access",
          "public",
          "--provenance",
        ],
        {
          cwd: root,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      observeArtifact({
        artifact,
        phase: "after",
        registryObserver,
        registryAttempts,
        sleep,
      });
    }
    installedConsumerVerifier({
      artifact,
      dependencies: artifactWorkspaceDependencies(releaseState, artifact),
    });
    publishedPackages.push({ name: artifact.name, version: artifact.version });
  }
  publishedPackages.sort((left, right) => compareUtf8(left.name, right.name));
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
  assert(
    [
      "version",
      "refresh",
      "preflight",
      "authority",
      "check",
      "pack",
      "claim",
      "publish",
    ].includes(mode),
    "cli-mode",
  );
  let format = "json";
  let allowEmpty = false;
  if (mode === "claim") {
    assert(
      argumentsList.length === 8 &&
        argumentsList[0] === "--artifact-manifest" &&
        argumentsList[2] === "--source-head" &&
        argumentsList[4] === "--branch" &&
        argumentsList[6] === "--run-id",
      "cli-claim-arguments",
    );
    return {
      mode,
      format,
      allowEmpty,
      artifactManifestPath: argumentsList[1],
      sourceHead: argumentsList[3],
      branch: argumentsList[5],
      runId: argumentsList[7],
    };
  }
  if (mode === "pack") {
    assert(
      argumentsList.length === 8 &&
        argumentsList[0] === "--artifact-dir" &&
        argumentsList[2] === "--source-head" &&
        argumentsList[4] === "--branch" &&
        argumentsList[6] === "--run-id",
      "cli-pack-arguments",
    );
    return {
      mode,
      format,
      allowEmpty,
      artifactDirectory: argumentsList[1],
      sourceHead: argumentsList[3],
      branch: argumentsList[5],
      runId: argumentsList[7],
    };
  }
  for (const argument of argumentsList) {
    if (
      argument === "--format=github" &&
      (mode === "authority" || mode === "check" || mode === "preflight")
    ) {
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
  const {
    mode,
    format,
    allowEmpty,
    artifactDirectory,
    artifactManifestPath,
    sourceHead,
    branch,
    runId,
  } = parseCliArguments(argv);
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
  if (mode === "refresh") {
    const plan = runRefresh({ root });
    process.stdout.write(
      JSON.stringify({
        status: "empty-refreshed",
        planDigest: plan.planDigest,
      }) + "\n",
    );
    return;
  }
  if (mode === "preflight") {
    const state = runPreflight({ root, execFile });
    if (format === "github") {
      process.stdout.write(
        `status=${state.plan.status}\nauthority_required=${state.authorityRequired}\nrefresh_required=${state.refreshRequired}\nrelease_count=${state.plan.releases.length}\nplan_digest=${state.plan.planDigest}\n`,
      );
    } else {
      process.stdout.write(
        JSON.stringify({
          status: state.plan.status,
          authorityRequired: state.authorityRequired,
          refreshRequired: state.refreshRequired,
          releaseCount: state.plan.releases.length,
          planDigest: state.plan.planDigest,
        }) + "\n",
      );
    }
    return;
  }
  if (mode === "authority") {
    const result = runAuthority({
      root,
      execFile,
      githubAuthority: options.githubAuthority,
      githubExecFile: options.githubExecFile,
      policyToken: options.policyToken,
    });
    if (format === "github") {
      process.stdout.write(
        `external_policy=${result.status}\ntransition=${result.transition}\nrepository=${result.repository}\n`,
      );
    } else {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    }
    return;
  }
  if (mode === "claim") {
    const result = runClaim({
      root,
      execFile,
      sourceHead,
      branch,
      runId,
      artifactManifestPath,
    });
    process.stdout.write(
      `claimed=false\ntransition_head=${result.claimHead}\ntransition_branch=${result.transitionBranch}\nplan_digest=${result.plan.planDigest}\n`,
    );
    return;
  }
  if (mode === "pack") {
    const result = runPack({
      root,
      execFile,
      sourceHead,
      branch,
      runId,
      artifactDirectory,
    });
    process.stdout.write(
      `artifact_manifest=${result.artifactManifestPath}\nartifact_manifest_sha256=${result.artifactManifestSha256}\nartifact_count=${result.artifactCount}\nplan_digest=${result.planDigest}\n`,
    );
    return;
  }
  if (mode === "check") {
    const state = runCheck({ root, execFile });
    const publish = state.plan.status === "planned";
    assert(publish || allowEmpty, "plan-empty");
    if (format === "github") {
      const resume = state.plan.status === "publishing";
      const claimOutput = resume
        ? `claim_run_id=${state.plan.claim.runId}\nclaim_source_head=${state.plan.claim.sourceHead}\nartifact_manifest_sha256=${state.plan.claim.artifactManifestSha256}\n`
        : "";
      process.stdout.write(
        `status=${state.plan.status}\npublish=${publish}\nresume=${resume}\nrelease_count=${state.plan.releases.length}\nplan_digest=${state.plan.planDigest}\n${claimOutput}`,
      );
    } else {
      process.stdout.write(
        JSON.stringify({
          status: state.plan.status,
          releaseCount: state.plan.releases.length,
          planDigest: state.plan.planDigest,
        }) + "\n",
      );
    }
    return;
  }
  const published = runPublish({
    root,
    execFile,
    branch: process.env.HUA_RELEASE_BRANCH,
    runId: process.env.HUA_RELEASE_RUN_ID,
    sourceHead: process.env.HUA_RELEASE_SOURCE_HEAD,
    claimHead: process.env.HUA_RELEASE_CLAIM_HEAD,
    artifactManifestPath: process.env.HUA_RELEASE_ARTIFACT_MANIFEST,
  });
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
