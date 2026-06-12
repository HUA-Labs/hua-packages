#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const forbiddenPatterns = [
  ["internal repository name", "hua-" + "platform"],
  ["internal repository URL", "HUA-Labs/" + "hua-platform"],
  ["internal architecture docs path", "docs/" + "areas/"],
  ["internal mission docs path", "docs/" + "missions/"],
  ["internal devlog docs path", "docs/" + "devlogs/"],
  ["internal comms repository", "hua-" + "comms"],
  ["internal tap comms package", "tap-" + "comms"],
  ["internal host nickname", "sum-" + "back"],
  ["developer home path", "/home/" + "devin"],
  ["developer Windows workspace path", "C:/" + "hua"],
  ["internal docs inventory artifact", "public-docs-surface-" + "inventory"],
  ["internal publish hygiene artifact", "publish-artifact-" + "hygiene"],
];

const ignoredPaths = new Set([
  "scripts/check-public-exposure.js",
  "pnpm-lock.yaml",
]);

const ignoredPrefixes = [
  "node_modules/",
  "dist/",
  ".git/",
  ".turbo/",
  "coverage/",
  ".changeset/",
];

function isIgnored(filePath) {
  if (ignoredPaths.has(filePath)) return true;
  return ignoredPrefixes.some((prefix) => filePath.startsWith(prefix));
}

function isBinary(buffer) {
  return buffer.includes(0);
}

const files = execFileSync("git", ["ls-files", "-z"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean)
  .filter((filePath) => !isIgnored(filePath));

const findings = [];

for (const filePath of files) {
  const absolutePath = path.join(root, filePath);
  const buffer = fs.readFileSync(absolutePath);
  if (isBinary(buffer)) continue;

  const text = buffer.toString("utf8");
  const lines = text.split(/\r?\n/);

  for (const [label, pattern] of forbiddenPatterns) {
    let lineNumber = 0;
    for (const line of lines) {
      lineNumber += 1;
      if (!line.includes(pattern)) continue;
      findings.push({
        filePath,
        label,
        lineNumber,
        pattern,
        snippet: line.trim(),
      });
    }
  }
}

if (findings.length === 0) {
  console.log(
    `Public exposure check passed: ${files.length} tracked text file(s) scanned.`,
  );
  process.exit(0);
}

console.error("Public exposure check failed:");
for (const finding of findings) {
  console.error(
    `  - ${finding.filePath}:${finding.lineNumber} ${finding.label} (${finding.pattern})`,
  );
  console.error(`    ${finding.snippet}`);
}

process.exit(1);
