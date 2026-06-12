#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const tarballs = process.argv.slice(2);

if (tarballs.length === 0) {
  console.error(
    "Usage: node scripts/check-pack-artifacts.js <package.tgz> [...package.tgz]",
  );
  process.exit(2);
}

const allowedSourcePayloads = new Map([
  ["create-hua", ["package/templates/"]],
  ["@hua-labs/hua", ["package/.hua-agent-docs/"]],
  [
    "@hua-labs/ui",
    [
      "package/src/styles/",
      "package/src/components/icons/",
      "package/src/components/icons-bold/",
    ],
  ],
]);

const packageJsonCache = new Map();

function listTarball(tarball) {
  const output = execFileSync("tar", ["-tzf", tarball], {
    encoding: "utf8",
  });
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readTarballFile(tarball, filePath) {
  return execFileSync("tar", ["-xOf", tarball, filePath], {
    encoding: "utf8",
  });
}

function getPackageJson(tarball) {
  if (!packageJsonCache.has(tarball)) {
    packageJsonCache.set(
      tarball,
      JSON.parse(readTarballFile(tarball, "package/package.json")),
    );
  }
  return packageJsonCache.get(tarball);
}

function normalizePackagePath(value) {
  if (!value || typeof value !== "string") return null;
  const withoutPrefix = value.replace(/^\.\//, "");
  return `package/${withoutPrefix}`;
}

function collectExportTypeRefs(exportsValue, refs = new Set()) {
  if (!exportsValue) return refs;

  if (typeof exportsValue === "string") {
    return refs;
  }

  if (Array.isArray(exportsValue)) {
    for (const item of exportsValue) {
      collectExportTypeRefs(item, refs);
    }
    return refs;
  }

  if (typeof exportsValue === "object") {
    if (typeof exportsValue.types === "string") {
      refs.add(exportsValue.types);
    }

    for (const value of Object.values(exportsValue)) {
      collectExportTypeRefs(value, refs);
    }
  }

  return refs;
}

function collectTypeRefs(pkg) {
  const refs = new Set();

  if (typeof pkg.types === "string") refs.add(pkg.types);
  if (typeof pkg.typings === "string") refs.add(pkg.typings);

  collectExportTypeRefs(pkg.exports, refs);

  return [...refs].map(normalizePackagePath).filter(Boolean).sort();
}

function collectWorkspaceSpecs(pkg) {
  const fields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];
  const specs = [];

  for (const field of fields) {
    for (const [name, version] of Object.entries(pkg[field] || {})) {
      if (typeof version === "string" && version.startsWith("workspace:")) {
        specs.push(`${field}.${name}=${version}`);
      }
    }
  }

  return specs;
}

function isAllowedPayload(name, file) {
  const allowedPrefixes = allowedSourcePayloads.get(name) || [];
  return allowedPrefixes.some((prefix) => file.startsWith(prefix));
}

function collectPayloadIssues(pkg, files) {
  return files
    .filter((file) => {
      if (file.endsWith("/")) return false;
      if (isAllowedPayload(pkg.name, file)) return false;

      return (
        file.startsWith("package/src/") ||
        file.includes("/__tests__/") ||
        /\.test\.[cm]?[jt]sx?$/.test(file) ||
        file.startsWith("package/.turbo/")
      );
    })
    .sort();
}

const results = [];
let issueCount = 0;

for (const tarball of tarballs) {
  if (!fs.existsSync(tarball)) {
    console.error(`Missing tarball: ${tarball}`);
    process.exit(2);
  }

  const files = listTarball(tarball);
  const fileSet = new Set(files);
  const pkg = getPackageJson(tarball);
  const typeRefs = collectTypeRefs(pkg);
  const missingTypeRefs = typeRefs.filter((ref) => !fileSet.has(ref));
  const workspaceSpecs = collectWorkspaceSpecs(pkg);
  const payloadIssues = collectPayloadIssues(pkg, files);
  const issues =
    missingTypeRefs.length + workspaceSpecs.length + payloadIssues.length;

  issueCount += issues;
  results.push({
    file: path.basename(tarball),
    name: pkg.name,
    version: pkg.version,
    missingTypeRefs,
    workspaceSpecs,
    payloadIssues,
  });
}

for (const result of results) {
  const status =
    result.missingTypeRefs.length === 0 &&
    result.workspaceSpecs.length === 0 &&
    result.payloadIssues.length === 0
      ? "PASS"
      : "FAIL";

  console.log(`${status} ${result.name}@${result.version} (${result.file})`);

  if (result.missingTypeRefs.length > 0) {
    console.log("  missing type refs:");
    for (const ref of result.missingTypeRefs) {
      console.log(`    - ${ref}`);
    }
  }

  if (result.workspaceSpecs.length > 0) {
    console.log("  workspace specs:");
    for (const spec of result.workspaceSpecs) {
      console.log(`    - ${spec}`);
    }
  }

  if (result.payloadIssues.length > 0) {
    console.log("  payload issues:");
    for (const file of result.payloadIssues) {
      console.log(`    - ${file}`);
    }
  }
}

if (issueCount > 0) {
  console.log(`\nPack artifact check failed with ${issueCount} issue(s).`);
  process.exit(1);
}

console.log("\nPack artifact check passed.");
