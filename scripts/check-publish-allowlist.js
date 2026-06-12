#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const packagesDir = path.join(root, "packages");
const allowlistPath = path.join(root, "config", "publish-allowlist.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getWorkspacePackages() {
  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const packageJsonPath = path.join(
        packagesDir,
        entry.name,
        "package.json",
      );
      if (!fs.existsSync(packageJsonPath)) return null;
      const packageJson = readJson(packageJsonPath);
      return {
        dir: entry.name,
        name: packageJson.name,
        private: packageJson.private === true,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const allowlist = readJson(allowlistPath).packages;
const allowlistSet = new Set(allowlist);
const workspacePackages = getWorkspacePackages();
const publishablePackages = workspacePackages.filter((pkg) => !pkg.private);
const publishableNames = publishablePackages.map((pkg) => pkg.name);
const publishableSet = new Set(publishableNames);

const duplicateAllowlistEntries = allowlist.filter(
  (name, index) => allowlist.indexOf(name) !== index,
);
const missingFromAllowlist = publishableNames.filter(
  (name) => !allowlistSet.has(name),
);
const staleAllowlistEntries = allowlist.filter(
  (name) => !publishableSet.has(name),
);
const unsortedAllowlist =
  JSON.stringify([...allowlist].sort((a, b) => a.localeCompare(b))) !==
  JSON.stringify(allowlist);

if (
  duplicateAllowlistEntries.length === 0 &&
  missingFromAllowlist.length === 0 &&
  staleAllowlistEntries.length === 0 &&
  !unsortedAllowlist
) {
  console.log(
    `Publish allowlist check passed: ${publishableNames.length} publishable package(s).`,
  );
  process.exit(0);
}

if (duplicateAllowlistEntries.length > 0) {
  console.error("Duplicate publish allowlist entries:");
  for (const name of duplicateAllowlistEntries) {
    console.error(`  - ${name}`);
  }
}

if (missingFromAllowlist.length > 0) {
  console.error("Publishable workspace packages missing from allowlist:");
  for (const name of missingFromAllowlist) {
    const pkg = publishablePackages.find((item) => item.name === name);
    console.error(`  - ${name} (${pkg.dir})`);
  }
}

if (staleAllowlistEntries.length > 0) {
  console.error("Stale publish allowlist entries not found in workspace:");
  for (const name of staleAllowlistEntries) {
    console.error(`  - ${name}`);
  }
}

if (unsortedAllowlist) {
  console.error("Publish allowlist must be sorted by package name.");
}

process.exit(1);
