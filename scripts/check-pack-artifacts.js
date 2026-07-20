#!/usr/bin/env node

const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const tarballs = process.argv.slice(2);

if (tarballs.length === 0) {
  console.error(
    "Usage: node scripts/check-pack-artifacts.js <package.tgz> [...package.tgz]",
  );
  process.exit(2);
}

const authorityChecker = path.join(__dirname, "check-ui-source-authority.mjs");
const authorityResult = spawnSync(process.execPath, [authorityChecker], {
  cwd: path.join(__dirname, ".."),
  encoding: "utf8",
});

if (authorityResult.status !== 0) {
  process.stdout.write(authorityResult.stdout || "");
  process.stderr.write(authorityResult.stderr || "");
  console.error("Pack artifact check blocked by UI source authority.");
  process.exit(1);
}

const dotAuthorityChecker = path.join(
  __dirname,
  "check-dot-core-source-authority.mjs",
);
const dotAuthorityResult = spawnSync(process.execPath, [dotAuthorityChecker], {
  cwd: path.join(__dirname, ".."),
  encoding: "utf8",
});

if (dotAuthorityResult.status !== 0) {
  process.stdout.write(dotAuthorityResult.stdout || "");
  process.stderr.write(dotAuthorityResult.stderr || "");
  console.error("Pack artifact check blocked by Dot source authority.");
  process.exit(1);
}

const dotAotAuthorityChecker = path.join(
  __dirname,
  "check-dot-aot-source-authority.mjs",
);
const dotAotAuthorityResult = spawnSync(
  process.execPath,
  [dotAotAuthorityChecker],
  {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
  },
);

if (dotAotAuthorityResult.status !== 0) {
  process.stdout.write(dotAotAuthorityResult.stdout || "");
  process.stderr.write(dotAotAuthorityResult.stderr || "");
  console.error("Pack artifact check blocked by Dot AOT source authority.");
  process.exit(1);
}

const dotLspAuthorityChecker = path.join(
  __dirname,
  "check-dot-lsp-source-authority.mjs",
);
const dotLspAuthorityResult = spawnSync(
  process.execPath,
  [dotLspAuthorityChecker],
  {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
  },
);

if (dotLspAuthorityResult.status !== 0) {
  process.stdout.write(dotLspAuthorityResult.stdout || "");
  process.stderr.write(dotLspAuthorityResult.stderr || "");
  console.error("Pack artifact check blocked by Dot LSP source authority.");
  process.exit(1);
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
const runtimeConditions = new Set([
  "import",
  "default",
  "require",
  "react-native",
]);

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

function collectExportRuntimeRefs(
  exportsValue,
  refs = [],
  activeCondition = null,
  implicitDefault = true,
) {
  if (!exportsValue) return refs;

  if (typeof exportsValue === "string") {
    if (activeCondition || implicitDefault) {
      refs.push({
        condition: activeCondition || "default",
        target: exportsValue,
      });
    }
    return refs;
  }

  if (Array.isArray(exportsValue)) {
    for (const item of exportsValue) {
      collectExportRuntimeRefs(item, refs, activeCondition, implicitDefault);
    }
    return refs;
  }

  if (typeof exportsValue === "object") {
    for (const [key, value] of Object.entries(exportsValue)) {
      if (key === "types") continue;

      const isRuntimeCondition = runtimeConditions.has(key);
      const isSubpath = key === "." || key.startsWith("./");
      const nextCondition = isRuntimeCondition
        ? activeCondition === "react-native"
          ? activeCondition
          : key
        : activeCondition;

      collectExportRuntimeRefs(
        value,
        refs,
        nextCondition,
        isRuntimeCondition || isSubpath,
      );
    }
  }

  return refs;
}

function collectRuntimeRefs(pkg) {
  const unique = new Map();

  for (const ref of collectExportRuntimeRefs(pkg.exports)) {
    const normalizedTarget = normalizePackagePath(ref.target);
    if (!normalizedTarget) continue;
    const key = `${ref.condition}\0${normalizedTarget}`;
    unique.set(key, {
      condition: ref.condition,
      target: normalizedTarget,
    });
  }

  return [...unique.values()].sort((a, b) => {
    const aKey = `${a.condition}\0${a.target}`;
    const bKey = `${b.condition}\0${b.target}`;
    return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
  });
}

function isUnsupportedRuntimeTarget(ref) {
  return /\.(?:[cm]?ts|tsx)$/i.test(ref.target);
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
  if (pkg.name === "@hua-labs/dot") {
    const artifactAuthority = spawnSync(
      process.execPath,
      [dotAuthorityChecker, "--tarball", path.resolve(tarball)],
      {
        cwd: path.join(__dirname, ".."),
        encoding: "utf8",
      },
    );
    if (artifactAuthority.status !== 0) {
      process.stdout.write(artifactAuthority.stdout || "");
      process.stderr.write(artifactAuthority.stderr || "");
      console.error("Pack artifact check blocked by Dot tar authority.");
      process.exit(1);
    }
  }
  if (pkg.name === "@hua-labs/dot-aot") {
    const artifactAuthority = spawnSync(
      process.execPath,
      [dotAotAuthorityChecker, "--tarball", path.resolve(tarball)],
      {
        cwd: path.join(__dirname, ".."),
        encoding: "utf8",
      },
    );
    if (artifactAuthority.status !== 0) {
      process.stdout.write(artifactAuthority.stdout || "");
      process.stderr.write(artifactAuthority.stderr || "");
      console.error("Pack artifact check blocked by Dot AOT tar authority.");
      process.exit(1);
    }
  }
  if (pkg.name === "@hua-labs/dot-lsp") {
    const artifactAuthority = spawnSync(
      process.execPath,
      [dotLspAuthorityChecker, "--tarball", path.resolve(tarball)],
      {
        cwd: path.join(__dirname, ".."),
        encoding: "utf8",
      },
    );
    if (artifactAuthority.status !== 0) {
      process.stdout.write(artifactAuthority.stdout || "");
      process.stderr.write(artifactAuthority.stderr || "");
      console.error("Pack artifact check blocked by Dot LSP tar authority.");
      process.exit(1);
    }
  }
  const typeRefs = collectTypeRefs(pkg);
  const missingTypeRefs = typeRefs.filter((ref) => !fileSet.has(ref));
  const runtimeRefs = collectRuntimeRefs(pkg);
  const missingRuntimeRefs = runtimeRefs.filter(
    (ref) => !fileSet.has(ref.target),
  );
  const unsupportedRuntimeRefs = runtimeRefs.filter(isUnsupportedRuntimeTarget);
  const workspaceSpecs = collectWorkspaceSpecs(pkg);
  const payloadIssues = collectPayloadIssues(pkg, files);
  const issues =
    missingTypeRefs.length +
    missingRuntimeRefs.length +
    unsupportedRuntimeRefs.length +
    workspaceSpecs.length +
    payloadIssues.length;

  issueCount += issues;
  results.push({
    file: path.basename(tarball),
    name: pkg.name,
    version: pkg.version,
    missingTypeRefs,
    missingRuntimeRefs,
    unsupportedRuntimeRefs,
    workspaceSpecs,
    payloadIssues,
  });
}

for (const result of results) {
  const status =
    result.missingTypeRefs.length === 0 &&
    result.missingRuntimeRefs.length === 0 &&
    result.unsupportedRuntimeRefs.length === 0 &&
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

  if (result.missingRuntimeRefs.length > 0) {
    console.log("  missing runtime refs:");
    for (const ref of result.missingRuntimeRefs) {
      console.log(`    - ${ref.condition}: ${ref.target}`);
    }
  }

  if (result.unsupportedRuntimeRefs.length > 0) {
    console.log("  unsupported runtime refs:");
    for (const ref of result.unsupportedRuntimeRefs) {
      console.log(`    - ${ref.condition}: ${ref.target}`);
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
