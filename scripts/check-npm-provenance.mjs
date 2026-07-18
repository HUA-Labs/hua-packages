#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  DEFAULT_ROOT,
  loadReleaseState,
  parseStrictJsonBytes,
  readRegularFile,
  validatePublishedPackages,
} from "./safe-release.mjs";

const PUBLISHED_MAX_BYTES = 128 * 1024;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function boundedInteger(value, fallback, minimum, maximum, code) {
  if (value === undefined) return fallback;
  if (!/^(?:0|[1-9]\d*)$/.test(value)) fail(code);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    fail(code);
  }
  return parsed;
}

function parseArguments(argv) {
  if (argv.length !== 2 || argv[0] !== "--published") {
    fail("provenance-arguments");
  }
  return resolve(argv[1]);
}

function npmViewAttestations(spec, execFile, root) {
  const output = execFile(
    "npm",
    ["view", spec, "dist.attestations", "--json"],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 128 * 1024,
    },
  ).trim();
  if (!output || output === "undefined") return undefined;
  return parseStrictJsonBytes(Buffer.from(output), {
    maxBytes: 128 * 1024,
    label: "provenance-response",
  });
}

function sleep(milliseconds) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));
}

export async function checkPublishedProvenance(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const attempts =
    options.attempts ??
    boundedInteger(
      process.env.HUA_NPM_PROVENANCE_ATTEMPTS,
      12,
      1,
      24,
      "provenance-attempts",
    );
  const delayMs =
    options.delayMs ??
    boundedInteger(
      process.env.HUA_NPM_PROVENANCE_DELAY_MS,
      10000,
      0,
      60000,
      "provenance-delay",
    );
  const publishedPath =
    options.publishedPath ?? parseArguments(process.argv.slice(2));
  const releaseState = loadReleaseState(root, { requireNonempty: true });
  const publishedBytes = readRegularFile(
    publishedPath,
    PUBLISHED_MAX_BYTES,
    "published-output",
  );
  const published = validatePublishedPackages(
    parseStrictJsonBytes(publishedBytes, {
      maxBytes: PUBLISHED_MAX_BYTES,
      label: "published-output",
    }),
    releaseState,
  );

  const failures = [];
  for (const entry of published.publishedPackages) {
    const spec = `${entry.name}@${entry.version}`;
    let passed = false;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const attestations = npmViewAttestations(spec, execFile, root);
        const predicate =
          attestations?.provenance?.predicateType ??
          attestations?.provenance?.predicate_type;
        if (predicate === "https://slsa.dev/provenance/v1") {
          passed = true;
          break;
        }
      } catch {
        // Bounded retries deliberately discard registry error bodies.
      }
      if (attempt < attempts) await sleep(delayMs);
    }
    if (passed) {
      console.log(`PASS ${spec} provenance`);
    } else {
      failures.push(spec);
      console.error(`FAIL ${spec}: provenance-unavailable`);
    }
  }
  if (failures.length > 0) fail("provenance-incomplete");
  return published;
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  checkPublishedProvenance().catch((error) => {
    const code =
      typeof error?.code === "string" ? error.code : "provenance-failed";
    console.error(`npm provenance check failed: ${code}`);
    process.exitCode = 1;
  });
}
