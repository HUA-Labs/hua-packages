#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const packagesDir = join(root, "packages");
const attempts = Number(process.env.HUA_NPM_PROVENANCE_ATTEMPTS ?? 12);
const delayMs = Number(process.env.HUA_NPM_PROVENANCE_DELAY_MS ?? 10000);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function npmViewAttestations(spec) {
  const output = execFileSync(
    "npm",
    ["view", spec, "dist.attestations", "--json"],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  ).trim();

  if (!output || output === "undefined") return undefined;
  return JSON.parse(output);
}

async function waitForProvenance(spec) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const attestations = npmViewAttestations(spec);
      const predicate =
        attestations?.provenance?.predicateType ??
        attestations?.provenance?.predicate_type;

      if (predicate === "https://slsa.dev/provenance/v1") {
        console.log(`  PASS ${spec} provenance`);
        return true;
      }

      lastError = new Error(`missing provenance attestation for ${spec}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await sleep(delayMs);
    }
  }

  console.error(`  FAIL ${spec}: ${lastError?.message ?? "unknown error"}`);
  return false;
}

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const packageJson = readJson(join(packagesDir, entry.name, "package.json"));
    return { dir: entry.name, packageJson };
  })
  .filter(({ packageJson }) => {
    return (
      packageJson.private !== true &&
      packageJson.publishConfig?.provenance === true
    );
  })
  .sort((a, b) => a.packageJson.name.localeCompare(b.packageJson.name));

if (packages.length === 0) {
  console.log("No provenance-required packages found.");
  process.exit(0);
}

console.log("Checking npm provenance attestations:");

let failed = false;
for (const { packageJson } of packages) {
  const spec = `${packageJson.name}@${packageJson.version}`;
  const ok = await waitForProvenance(spec);
  if (!ok) failed = true;
}

if (failed) {
  process.exit(1);
}
