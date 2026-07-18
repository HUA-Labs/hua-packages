#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  closeSync,
  constants as fsConstants,
  fsyncSync,
  lstatSync,
  openSync,
  renameSync,
  rmSync,
  writeSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  DEFAULT_ROOT,
  PLAN_RELATIVE_PATH,
  canonicalJson,
  createEmptyReleasePlan,
  loadReleaseState,
  parseStrictJsonBytes,
  persistProvenanceClosure,
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
  if (argv.length === 2 && argv[0] === "--published") {
    return { publishedPath: resolve(argv[1]), closePlan: false };
  }
  if (
    argv.length !== 11 ||
    argv[0] !== "--published" ||
    argv[2] !== "--close-plan" ||
    argv[3] !== "--persist-head" ||
    argv[5] !== "--source-head" ||
    argv[7] !== "--branch" ||
    argv[9] !== "--run-id"
  ) {
    fail("provenance-arguments");
  }
  return {
    publishedPath: resolve(argv[1]),
    closePlan: true,
    persistence: {
      claimHead: argv[4],
      sourceHead: argv[6],
      branch: argv[8],
      runId: argv[10],
    },
  };
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

function closeProvenanceVerifiedPlan(root, releaseState) {
  const filePath = join(root, PLAN_RELATIVE_PATH);
  const parent = dirname(filePath);
  const existing = lstatSync(filePath);
  if (!existing.isFile() || existing.isSymbolicLink()) {
    fail("plan-target-non-regular");
  }
  const temporaryPath = join(
    parent,
    `.release-plan.${process.pid}.${Date.now()}.tmp`,
  );
  const bytes = Buffer.from(
    canonicalJson(createEmptyReleasePlan(releaseState)),
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
  return loadReleaseState(root).plan;
}

export async function checkPublishedProvenance(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const execFile = options.execFile ?? execFileSync;
  const gitExecFile = options.gitExecFile ?? execFileSync;
  const persistClosure = options.persistClosure ?? persistProvenanceClosure;
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
  const cliArguments =
    options.publishedPath === undefined
      ? parseArguments(process.argv.slice(2))
      : undefined;
  const publishedPath = options.publishedPath ?? cliArguments.publishedPath;
  const closePlan = options.closePlan ?? cliArguments?.closePlan ?? false;
  const persistence = options.persistence ?? cliArguments?.persistence;
  if (closePlan && persistence === undefined) {
    fail("provenance-persistence-required");
  }
  const releaseState = loadReleaseState(root, { requireNonempty: true });
  if (closePlan) {
    if (releaseState.plan.status !== "publishing") {
      fail("provenance-plan-unclaimed");
    }
    if (
      JSON.stringify(releaseState.plan.claim) !==
      JSON.stringify({
        branch: persistence.branch,
        runId: persistence.runId,
        sourceHead: persistence.sourceHead,
      })
    ) {
      fail("provenance-claim-owner");
    }
  }
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
  if (closePlan) {
    const closedPlan = closeProvenanceVerifiedPlan(root, releaseState);
    const closureHead = persistClosure({
      root,
      execFile: gitExecFile,
      ...persistence,
    });
    return {
      ...published,
      releasePlanClosure: {
        status: closedPlan.status,
        planDigest: closedPlan.planDigest,
        head: closureHead,
      },
    };
  }
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
