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

const dotMcpAuthorityChecker = path.join(
  __dirname,
  "check-dot-mcp-source-authority.mjs",
);
const dotMcpAuthorityResult = spawnSync(
  process.execPath,
  [dotMcpAuthorityChecker],
  {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
  },
);

if (dotMcpAuthorityResult.status !== 0) {
  process.stdout.write(dotMcpAuthorityResult.stdout || "");
  process.stderr.write(dotMcpAuthorityResult.stderr || "");
  console.error("Pack artifact check blocked by Dot MCP source authority.");
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
const UI_PROFILE_KEYS = new Set([
  "schema",
  "package",
  "installedEngineRange",
  "futureMajorEngineStop",
  "releaseSelection",
  "entries",
]);
const UI_PROFILE_ENTRY_KEYS = new Set([
  "subpath",
  "disposition",
  "kind",
  "manifestTarget",
  "tsup",
]);
const UI_PROFILE_TSUP_KEYS = new Set(["entry", "source", "output"]);

function assertExactObjectKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${label} has an unexpected key roster`);
  }
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function readBoundedJson(filePath, label) {
  let stats;
  try {
    stats = fs.lstatSync(filePath);
  } catch {
    throw new Error(`${label} must exist`);
  }
  if (!stats.isFile() || stats.isSymbolicLink() || stats.size > 256 * 1024) {
    throw new Error(`${label} must be a bounded regular file`);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    throw new Error(`${label} must contain valid JSON`);
  }
}

function collectTargetStrings(value, targets = new Set()) {
  if (typeof value === "string") {
    const normalized = normalizePackagePath(value);
    if (!normalized)
      throw new Error("UI profile target must be a package path");
    targets.add(normalized);
    return targets;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("UI profile target must contain only strings and objects");
  }
  for (const child of Object.values(value))
    collectTargetStrings(child, targets);
  return targets;
}

function loadUiPublicProfile(profilePath, workspaceManifest) {
  const profile = readBoundedJson(profilePath, "UI public-core profile");
  assertExactObjectKeys(profile, UI_PROFILE_KEYS, "UI public-core profile");
  if (
    profile.schema !== "hua-ui-public-core-profile.v1" ||
    profile.package !== "@hua-labs/ui" ||
    profile.installedEngineRange !== ">=20.16.0" ||
    profile.futureMajorEngineStop !== ">=22.3.0" ||
    profile.releaseSelection !== null ||
    !Array.isArray(profile.entries)
  ) {
    throw new Error("UI public-core profile header is invalid");
  }
  if (
    workspaceManifest.name !== profile.package ||
    workspaceManifest.engines?.node !== profile.installedEngineRange ||
    workspaceManifest.dependencies?.["@hua-labs/dot"] !== "workspace:*" ||
    workspaceManifest.dependencies?.["@floating-ui/react"] !== "^0.27.19" ||
    workspaceManifest.dependencies?.["sugar-high"] !== "^1.0.0" ||
    workspaceManifest.dependencies?.["tailwind-merge"] !== "^3.6.0" ||
    workspaceManifest.peerDependencies?.["@hua-labs/motion-core"] !==
      ">=2.4.0" ||
    workspaceManifest.peerDependenciesMeta?.["@hua-labs/motion-core"]
      ?.optional !== true
  ) {
    throw new Error(
      "UI workspace manifest does not match public-core authority",
    );
  }
  if (
    !Array.isArray(workspaceManifest.files) ||
    !workspaceManifest.files.includes("DETAILED_GUIDE.md") ||
    workspaceManifest.files.includes("public-core-profile.json")
  ) {
    throw new Error("UI package files do not match public-core distribution");
  }

  const retainedTargets = new Set();
  const deferredTargets = new Set();
  const seen = new Set();
  const seenTsupEntries = new Set();
  const profileRoot = fs.realpathSync(path.dirname(profilePath));
  let retainedCount = 0;
  let deferredCount = 0;
  let javascriptCount = 0;
  let assetCount = 0;
  for (const entry of profile.entries) {
    assertExactObjectKeys(entry, UI_PROFILE_ENTRY_KEYS, "UI public-core entry");
    if (
      typeof entry.subpath !== "string" ||
      (entry.subpath !== "." &&
        (!/^\.\/[A-Za-z0-9._/-]+$/u.test(entry.subpath) ||
          entry.subpath.includes("..") ||
          entry.subpath.includes("//"))) ||
      seen.has(entry.subpath)
    ) {
      throw new Error("UI public-core entry subpath is invalid");
    }
    seen.add(entry.subpath);
    if (entry.disposition === "retained") retainedCount += 1;
    else if (entry.disposition === "deferred") deferredCount += 1;
    else throw new Error("UI public-core entry disposition is invalid");
    if (entry.kind === "javascript") {
      javascriptCount += 1;
      assertExactObjectKeys(
        entry.tsup,
        UI_PROFILE_TSUP_KEYS,
        "UI profile tsup",
      );
      if (
        !/^[A-Za-z0-9][A-Za-z0-9-]*$/u.test(entry.tsup.entry) ||
        seenTsupEntries.has(entry.tsup.entry) ||
        !/^src\/[A-Za-z0-9._/-]+\.[cm]?[jt]sx?$/u.test(entry.tsup.source) ||
        entry.tsup.source.includes("..") ||
        entry.tsup.source.includes("//") ||
        entry.tsup.output !== `dist/${entry.tsup.entry}.mjs` ||
        !collectTargetStrings(entry.manifestTarget).has(
          `package/${entry.tsup.output}`,
        )
      ) {
        throw new Error("UI public-core tsup authority is stale");
      }
      seenTsupEntries.add(entry.tsup.entry);
      if (entry.disposition === "retained") {
        const sourcePath = path.join(
          path.dirname(profilePath),
          entry.tsup.source,
        );
        let sourceStats;
        let realSource;
        try {
          sourceStats = fs.lstatSync(sourcePath);
          realSource = fs.realpathSync(sourcePath);
        } catch {
          throw new Error(
            "UI public-core tsup source is not a regular package file",
          );
        }
        if (
          !sourceStats.isFile() ||
          sourceStats.isSymbolicLink() ||
          !realSource.startsWith(`${profileRoot}${path.sep}`)
        ) {
          throw new Error(
            "UI public-core tsup source is not a regular package file",
          );
        }
      }
    } else if (entry.kind === "asset") {
      assetCount += 1;
      if (entry.tsup !== null || typeof entry.manifestTarget !== "string") {
        throw new Error("UI public-core asset entry is invalid");
      }
    } else {
      throw new Error("UI public-core entry kind is invalid");
    }

    const manifestTarget = workspaceManifest.exports?.[entry.subpath];
    if (entry.disposition === "retained") {
      if (
        canonicalJson(manifestTarget) !== canonicalJson(entry.manifestTarget)
      ) {
        throw new Error(`UI retained export drift: ${entry.subpath}`);
      }
      collectTargetStrings(entry.manifestTarget, retainedTargets);
    } else {
      if (manifestTarget !== undefined) {
        throw new Error(`UI deferred export is public: ${entry.subpath}`);
      }
      collectTargetStrings(entry.manifestTarget, deferredTargets);
    }
  }
  if (
    profile.entries.length !== 37 ||
    retainedCount !== 27 ||
    deferredCount !== 10 ||
    javascriptCount !== 30 ||
    assetCount !== 7 ||
    Object.keys(workspaceManifest.exports ?? {}).length !== retainedCount
  ) {
    throw new Error(
      "UI public-core profile must remain exact 37=27/10 and 30/7",
    );
  }
  for (const target of retainedTargets) {
    if (deferredTargets.has(target)) {
      throw new Error("UI retained and deferred targets must be disjoint");
    }
  }
  return { ...profile, retainedTargets, deferredTargets };
}

function verifyUiPublicProfileTarball(pkg, fileSet) {
  if (
    pkg.version !== uiWorkspaceManifest.version ||
    pkg.engines?.node !== uiPublicProfile.installedEngineRange ||
    canonicalJson(pkg.exports) !== canonicalJson(uiWorkspaceManifest.exports)
  ) {
    return ["package manifest does not match UI public-core authority"];
  }
  const expectedDependencies = {
    ...uiWorkspaceManifest.dependencies,
    "@hua-labs/dot": dotWorkspaceManifest.version,
  };
  if (
    canonicalJson(pkg.dependencies) !== canonicalJson(expectedDependencies) ||
    canonicalJson(pkg.peerDependencies) !==
      canonicalJson(uiWorkspaceManifest.peerDependencies) ||
    canonicalJson(pkg.peerDependenciesMeta) !==
      canonicalJson(uiWorkspaceManifest.peerDependenciesMeta) ||
    canonicalJson(pkg.sideEffects) !==
      canonicalJson(uiWorkspaceManifest.sideEffects)
  ) {
    return ["package dependency or side-effect authority drift"];
  }

  const issues = [];
  for (const target of uiPublicProfile.retainedTargets) {
    if (!fileSet.has(target)) issues.push(`missing retained target: ${target}`);
  }
  for (const target of uiPublicProfile.deferredTargets) {
    if (fileSet.has(target)) issues.push(`deferred target present: ${target}`);
  }
  for (const required of ["package/DETAILED_GUIDE.md"]) {
    if (!fileSet.has(required))
      issues.push(`missing public-core document: ${required}`);
  }
  if (fileSet.has("package/public-core-profile.json")) {
    issues.push("non-shipped public-core profile is present");
  }
  for (const file of fileSet) {
    if (file.endsWith("/")) continue;
    if (file.includes("/__tests__/") || /\.test\.[cm]?[jt]sx?$/u.test(file)) {
      issues.push(`test payload present: ${file}`);
    }
  }
  return issues.sort();
}

const uiPackageRoot = path.join(__dirname, "..", "packages", "hua-ui");
const uiWorkspaceManifest = readBoundedJson(
  path.join(uiPackageRoot, "package.json"),
  "UI workspace manifest",
);
const uiPublicProfile = loadUiPublicProfile(
  path.join(uiPackageRoot, "public-core-profile.json"),
  uiWorkspaceManifest,
);
const dotWorkspaceManifest = readBoundedJson(
  path.join(__dirname, "..", "packages", "hua-dot", "package.json"),
  "Dot workspace manifest",
);

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
  const uiProfileIssues =
    pkg.name === "@hua-labs/ui"
      ? verifyUiPublicProfileTarball(pkg, fileSet)
      : [];
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
  if (pkg.name === "@hua-labs/dot-mcp") {
    const artifactAuthority = spawnSync(
      process.execPath,
      [dotMcpAuthorityChecker, "--tarball", path.resolve(tarball)],
      {
        cwd: path.join(__dirname, ".."),
        encoding: "utf8",
      },
    );
    if (artifactAuthority.status !== 0) {
      process.stdout.write(artifactAuthority.stdout || "");
      process.stderr.write(artifactAuthority.stderr || "");
      console.error("Pack artifact check blocked by Dot MCP tar authority.");
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
    uiProfileIssues.length +
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
    uiProfileIssues,
    missingTypeRefs,
    missingRuntimeRefs,
    unsupportedRuntimeRefs,
    workspaceSpecs,
    payloadIssues,
  });
}

for (const result of results) {
  const status =
    result.uiProfileIssues.length === 0 &&
    result.missingTypeRefs.length === 0 &&
    result.missingRuntimeRefs.length === 0 &&
    result.unsupportedRuntimeRefs.length === 0 &&
    result.workspaceSpecs.length === 0 &&
    result.payloadIssues.length === 0
      ? "PASS"
      : "FAIL";

  console.log(`${status} ${result.name}@${result.version} (${result.file})`);

  if (result.uiProfileIssues.length > 0) {
    console.log("  UI public-core profile issues:");
    for (const issue of result.uiProfileIssues) {
      console.log(`    - ${issue}`);
    }
  }

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
