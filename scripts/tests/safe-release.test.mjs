import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { parseDocument, stringify } from "yaml";
import { checkPublishedProvenance } from "../check-npm-provenance.mjs";
import {
  PLATFORM_AUTHORITY,
  canonicalJson,
  compareUtf8,
  createEmptyReleasePlan,
  finalizeReleasePlan,
  loadPolicy,
  loadReleaseState,
  parseStrictJsonBytes,
  runAuthority,
  runCheck,
  runClaim,
  runPack,
  runPreflight,
  runPublish,
  runRefresh,
  runVersion,
  sha256,
  validatePolicy,
  validateGitHubReleaseAuthority,
  validatePublishedPackages,
} from "../safe-release.mjs";

const CURRENT_ROOT = new URL("../..", import.meta.url).pathname;

const packageDefinitions = [
  {
    name: "@hua-labs/dot",
    path: "packages/hua-dot",
    version: "0.2.2",
    release: {
      mode: "no-publish",
      intent: "active-public",
      authority: "hua-packages",
      channel: "npm-public",
    },
    eligibility: "eligible",
    reason: "active-public",
    private: false,
    publishConfig: { access: "public", provenance: true },
  },
  {
    name: "@hua-labs/hua",
    path: "packages/hua",
    version: "1.2.2",
    release: {
      mode: "public-npm",
      intent: "held",
      authority: "hua-packages",
      channel: "npm-public",
    },
    eligibility: "blocked",
    reason: "held",
    private: true,
    publishConfig: null,
  },
  {
    name: "@hua-labs/motion-core",
    path: "packages/hua-motion-core",
    version: "2.4.2",
    release: {
      mode: "public-npm",
      intent: "active-public",
      authority: "hua-packages",
      channel: "npm-public",
    },
    eligibility: "eligible",
    reason: "active-public",
    private: false,
    publishConfig: { access: "public", provenance: true },
  },
  {
    name: "@hua-labs/security",
    path: "packages/hua-security",
    version: "1.0.0-alpha.1",
    release: {
      mode: "private-workspace",
      intent: "never-publish",
      authority: "none",
      channel: "none",
    },
    eligibility: "blocked",
    reason: "never-publish",
    private: true,
    publishConfig: null,
  },
  {
    name: "@hua-labs/ui",
    path: "packages/hua-ui",
    version: "2.3.0",
    dependencies: { "@hua-labs/dot": "workspace:*" },
    peerDependencies: { "@hua-labs/motion-core": ">=2.4.0" },
    release: {
      mode: "public-npm",
      intent: "active-public",
      authority: "hua-packages",
      channel: "npm-public",
    },
    eligibility: "eligible",
    reason: "active-public",
    private: false,
    publishConfig: { access: "public", provenance: true },
  },
];

function manifestFor(definition, version = definition.version) {
  const manifest = {
    name: definition.name,
    version,
  };
  if (definition.private) manifest.private = true;
  if (definition.publishConfig !== null) {
    manifest.publishConfig = definition.publishConfig;
  }
  if (definition.dependencies !== undefined) {
    manifest.dependencies = definition.dependencies;
  }
  if (definition.optionalDependencies !== undefined) {
    manifest.optionalDependencies = definition.optionalDependencies;
  }
  if (definition.peerDependencies !== undefined) {
    manifest.peerDependencies = definition.peerDependencies;
  }
  if (definition.scripts !== undefined) {
    manifest.scripts = definition.scripts;
  }
  return manifest;
}

function policyFor(definitions = packageDefinitions) {
  return {
    schemaVersion: 1,
    platformAuthority: { ...PLATFORM_AUTHORITY },
    packages: definitions.map((definition) => ({
      name: definition.name,
      path: definition.path,
      release: definition.release,
      eligibility: definition.eligibility,
      reason: definition.reason,
      expectedManifest: {
        private: definition.private,
        publishConfig: definition.publishConfig,
      },
    })),
  };
}

function fixtureLockfile(definitions) {
  const definitionsByName = new Map(
    definitions.map((definition) => [definition.name, definition]),
  );
  const importers = {};
  for (const definition of definitions) {
    const importer = {};
    for (const [manifestField, lockField] of [
      ["dependencies", "dependencies"],
      ["optionalDependencies", "optionalDependencies"],
      ["peerDependencies", "dependencies"],
    ]) {
      for (const [name, specifier] of Object.entries(
        definition[manifestField] ?? {},
      )) {
        const dependency = definitionsByName.get(name);
        if (dependency === undefined) continue;
        if (importer[lockField] === undefined) importer[lockField] = {};
        importer[lockField][name] = {
          specifier,
          version: `link:${relative(definition.path, dependency.path)}`,
        };
      }
    }
    importers[definition.path] = importer;
  }
  return {
    lockfileVersion: "9.0",
    settings: {
      autoInstallPeers: true,
      excludeLinksFromLockfile: false,
    },
    importers,
    packages: {},
    snapshots: {},
  };
}

function rewriteFixtureLockfile(root, definitions) {
  const lockPath = join(root, "pnpm-lock.yaml");
  const lock = parseDocument(readFileSync(lockPath, "utf8")).toJS();
  for (const definition of definitions) {
    const manifest = JSON.parse(
      readFileSync(join(root, definition.path, "package.json"), "utf8"),
    );
    const specifiers = {
      ...(manifest.peerDependencies ?? {}),
      ...(manifest.optionalDependencies ?? {}),
      ...(manifest.dependencies ?? {}),
      ...(manifest.devDependencies ?? {}),
    };
    for (const dependencies of Object.values(
      lock.importers[definition.path] ?? {},
    )) {
      for (const [name, entry] of Object.entries(dependencies)) {
        if (specifiers[name] !== undefined) entry.specifier = specifiers[name];
      }
    }
  }
  writeFileSync(lockPath, stringify(lock));
}

function mutateFixtureLockfile(root, mutate) {
  const lockPath = join(root, "pnpm-lock.yaml");
  const lock = parseDocument(readFileSync(lockPath, "utf8")).toJS();
  mutate(lock);
  writeFileSync(lockPath, stringify(lock));
}

function makeFixture(options = {}) {
  const definitions = structuredClone(
    options.definitions ?? packageDefinitions,
  );
  const root = mkdtempSync(join(tmpdir(), "hua-safe-release-test-"));
  mkdirSync(join(root, "config"), { recursive: true });
  mkdirSync(join(root, ".changeset"), { recursive: true });
  for (const definition of definitions) {
    mkdirSync(join(root, definition.path), { recursive: true });
    writeFileSync(
      join(root, definition.path, "package.json"),
      canonicalJson(
        manifestFor(definition, options.versions?.[definition.name]),
      ),
    );
  }
  const policy = policyFor(definitions);
  writeFileSync(
    join(root, "config/publish-allowlist.json"),
    canonicalJson(policy),
  );
  const policyState = loadPolicy(root);
  const plan = createEmptyReleasePlan(policyState);
  writeFileSync(join(root, "config/release-plan.json"), canonicalJson(plan));
  writeFileSync(
    join(root, "pnpm-lock.yaml"),
    stringify(fixtureLockfile(definitions)),
  );
  return {
    root,
    definitions,
    artifactRoots: [],
    cleanup() {
      rmSync(root, { recursive: true, force: true });
      for (const artifactRoot of this.artifactRoots) {
        rmSync(artifactRoot, { recursive: true, force: true });
      }
    },
  };
}

function mutateJson(path, mutate) {
  const value = JSON.parse(readFileSync(path, "utf8"));
  mutate(value);
  writeFileSync(path, canonicalJson(value));
}

function createPlannedFixture(
  names = ["@hua-labs/ui"],
  definitions = packageDefinitions,
) {
  const versions = Object.fromEntries(
    names.map((name) => {
      const definition = definitions.find((entry) => entry.name === name);
      const match = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(definition.version);
      const [major, minor, patch] = match.slice(1, 4).map(Number);
      return [
        name,
        definition.version.includes("-")
          ? `${major}.${minor}.${patch}`
          : `${major}.${minor}.${patch + 1}`,
      ];
    }),
  );
  const fixture = makeFixture({ versions, definitions });
  const policyState = loadPolicy(fixture.root);
  const manifests = policyState.manifests.map(
    ({ name, path, version, sha256: digest }) => ({
      name,
      path,
      version,
      sha256: digest,
    }),
  );
  const releases = names
    .map((name) => {
      const definition = definitions.find((entry) => entry.name === name);
      const manifest = policyState.manifests.find(
        (entry) => entry.name === name,
      );
      return {
        name,
        path: definition.path,
        type: "patch",
        fromVersion: definition.version,
        toVersion: versions[name],
        sourceManifestSha256: "1".repeat(64),
        manifestSha256: manifest.sha256,
        changesets: [
          { id: `release-${definition.path.slice(9)}`, sha256: "2".repeat(64) },
        ],
      };
    })
    .sort((left, right) =>
      Buffer.compare(Buffer.from(left.name), Buffer.from(right.name)),
    );
  const plan = finalizeReleasePlan({
    policy: {
      platformCommit: PLATFORM_AUTHORITY.commit,
      registryBlob: PLATFORM_AUTHORITY.registryBlob,
      policySha256: policyState.policySha256,
    },
    status: "planned",
    workspaceManifests: manifests,
    releases,
  });
  writeFileSync(
    join(fixture.root, "config/release-plan.json"),
    canonicalJson(plan),
  );
  return fixture;
}

const TEST_CLAIM = Object.freeze({
  artifactManifestSha256: "f".repeat(64),
  branch: "main",
  runId: "123456",
  sourceHead: "a".repeat(40),
});

const TEST_RELEASE_REPOSITORY = "HUA-Labs/hua-packages";

function githubTransition(kind = "claim") {
  const baseHead = kind === "claim" ? "a".repeat(40) : "c".repeat(40);
  return {
    kind,
    baseHead,
    currentHead: kind === "claim" ? "c".repeat(40) : "d".repeat(40),
    currentTree: "9".repeat(40),
    expectedBranch: `release/${kind}-${baseHead.slice(0, 12)}`,
  };
}

function githubAuthorityFixture(transition = githubTransition()) {
  const pullRequestHead = kindHead(transition.kind);
  return {
    protection: {
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_last_push_approval: true,
        required_approving_review_count: 1,
        bypass_pull_request_allowances: { users: [], teams: [], apps: [] },
      },
      enforce_admins: { enabled: true },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
    },
    rules: [],
    rulesets: [],
    actions: {
      default_workflow_permissions: "write",
      can_approve_pull_request_reviews: false,
    },
    associations: [{ number: 17 }],
    pullRequest: {
      number: 17,
      state: "closed",
      merged: true,
      merged_at: "2026-07-19T00:00:00Z",
      merge_commit_sha: transition.currentHead,
      user: { login: "release-author" },
      base: {
        ref: "main",
        sha: transition.baseHead,
        repo: { full_name: TEST_RELEASE_REPOSITORY },
      },
      head: {
        ref: transition.expectedBranch,
        sha: pullRequestHead,
        repo: { full_name: TEST_RELEASE_REPOSITORY },
      },
    },
    reviews: [
      {
        id: 1,
        state: "APPROVED",
        commit_id: pullRequestHead,
        user: { login: "independent-reviewer" },
      },
    ],
    headCommit: { tree: { sha: transition.currentTree } },
  };
}

function kindHead(kind) {
  return kind === "claim" ? "b".repeat(40) : "e".repeat(40);
}

function createTestArtifactBundle(
  fixture,
  claim = TEST_CLAIM,
  artifactOptions = {},
) {
  const state = loadReleaseState(fixture.root, { requireNonempty: true });
  const releaseByName = new Map(
    state.plan.releases.map((release) => [release.name, release]),
  );
  const manifestByName = new Map(
    state.manifests.map((manifest) => [manifest.name, manifest]),
  );
  const artifactRoot = realpathSync(
    mkdtempSync(join(tmpdir(), "hua-safe-artifacts-")),
  );
  const stagingRoot = mkdtempSync(join(tmpdir(), "hua-safe-artifact-stage-"));
  fixture.artifactRoots.push(artifactRoot);
  try {
    const artifacts = state.plan.releases.map((release) => {
      const file = `${release.name.replaceAll("@", "").replaceAll("/", "-")}-${release.toVersion}.tgz`;
      const packageRoot = join(stagingRoot, file, "package");
      mkdirSync(packageRoot, { recursive: true });
      const definition = fixture.definitions.find(
        (candidate) => candidate.name === release.name,
      );
      assert.notEqual(definition, undefined);
      const dependencyFields = {};
      for (const field of ["dependencies", "optionalDependencies"]) {
        const dependencies = Object.fromEntries(
          Object.entries(definition[field] ?? {})
            .filter(([dependencyName]) => manifestByName.has(dependencyName))
            .map(([dependencyName, specifier]) => {
              const dependencyManifest = manifestByName.get(dependencyName);
              assert.notEqual(dependencyManifest, undefined);
              const exactVersion =
                releaseByName.get(dependencyName)?.toVersion ??
                dependencyManifest.version;
              return [
                dependencyName,
                artifactOptions.dependencySpec ??
                  (specifier.startsWith("workspace:")
                    ? exactVersion
                    : specifier),
              ];
            }),
        );
        if (Object.keys(dependencies).length > 0) {
          dependencyFields[field] = dependencies;
        }
      }
      writeFileSync(
        join(packageRoot, "package.json"),
        canonicalJson({
          name: release.name,
          version: release.toVersion,
          ...dependencyFields,
        }),
      );
      const artifactPath = join(artifactRoot, file);
      execFileSync(
        "tar",
        [
          "-czf",
          artifactPath,
          "-C",
          join(stagingRoot, file),
          "package/package.json",
        ],
        { stdio: "ignore" },
      );
      const bytes = readFileSync(artifactPath);
      return {
        bytes: bytes.byteLength,
        file,
        name: release.name,
        sha256: sha256(bytes),
        version: release.toVersion,
      };
    });
    const manifest = {
      schemaVersion: 1,
      branch: claim.branch,
      runId: claim.runId,
      sourceHead: claim.sourceHead,
      planDigest:
        state.plan.status === "planned"
          ? state.plan.planDigest
          : finalizeReleasePlan({
              ...state.plan,
              status: "planned",
              claim: null,
            }).planDigest,
      artifacts,
    };
    const artifactManifestPath = join(artifactRoot, "release-artifacts.json");
    const manifestBytes = Buffer.from(canonicalJson(manifest));
    writeFileSync(artifactManifestPath, manifestBytes);
    fixture.artifactManifestPath = artifactManifestPath;
    fixture.claim = {
      artifactManifestSha256: sha256(manifestBytes),
      branch: claim.branch,
      runId: claim.runId,
      sourceHead: claim.sourceHead,
    };
    return fixture.claim;
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }
}

function claimFixturePlan(fixture, claim = TEST_CLAIM, artifactOptions = {}) {
  const state = loadReleaseState(fixture.root, { requireNonempty: true });
  assert.equal(state.plan.status, "planned");
  const artifactClaim = createTestArtifactBundle(
    fixture,
    claim,
    artifactOptions,
  );
  const plan = finalizeReleasePlan({
    ...state.plan,
    status: "publishing",
    claim: artifactClaim,
  });
  writeFileSync(
    join(fixture.root, "config/release-plan.json"),
    canonicalJson(plan),
  );
  if (fixture.claimHead === undefined) {
    fixture.claimHead = "c".repeat(40);
  }
  return plan;
}

function createPublishingFixture(
  names = ["@hua-labs/ui"],
  definitions = packageDefinitions,
  artifactOptions = {},
) {
  const fixture = createPlannedFixture(names, definitions);
  claimFixturePlan(fixture, TEST_CLAIM, artifactOptions);
  fixture.claimHead = "c".repeat(40);
  return fixture;
}

function publishingOptions(fixture, execFile) {
  const transition = {
    kind: "claim",
    baseHead: fixture.claim.sourceHead,
    currentHead: fixture.claimHead,
    currentTree: "9".repeat(40),
    expectedBranch: `release/claim-${fixture.claim.sourceHead.slice(0, 12)}`,
  };
  return {
    root: fixture.root,
    execFile(file, args, options) {
      if (file === "tar") return execFileSync(file, args, options);
      return execFile(file, args, options);
    },
    gitExecFile(_file, args) {
      if (args[0] === "rev-parse" && args[1] === "HEAD^{tree}") {
        return `${transition.currentTree}\n`;
      }
      if (args[0] === "rev-parse") return `${fixture.claimHead}\n`;
      if (args[0] === "ls-remote") {
        return `${fixture.claimHead}\trefs/heads/main\n`;
      }
      if (args[0] === "rev-list") {
        return `${fixture.claimHead} ${fixture.claim.sourceHead}\n`;
      }
      if (args[0] === "diff") {
        return "config/release-plan.json\n";
      }
      throw new Error("unexpected-git-command");
    },
    githubAuthority: githubAuthorityFixture(transition),
    artifactManifestPath: fixture.artifactManifestPath,
    claimHead: fixture.claimHead,
    registryAttempts: 2,
    registryObserver({ phase }) {
      return { status: phase === "before" ? "absent" : "verified" };
    },
    installedConsumerVerifier() {},
    sleep() {},
    ...fixture.claim,
  };
}

function createExternalArtifactDirectory(fixture) {
  const artifactDirectory = realpathSync(
    mkdtempSync(join(tmpdir(), "hua-safe-pack-output-")),
  );
  fixture.artifactRoots.push(artifactDirectory);
  return artifactDirectory;
}

function writePackedFixture(artifactDirectory, packageManifest) {
  const stagingRoot = mkdtempSync(join(tmpdir(), "hua-safe-pack-stage-"));
  try {
    const packageRoot = join(stagingRoot, "package");
    mkdirSync(packageRoot, { recursive: true });
    writeFileSync(
      join(packageRoot, "package.json"),
      canonicalJson(packageManifest),
    );
    const file = `${packageManifest.name.replaceAll("@", "").replaceAll("/", "-")}-${packageManifest.version}.tgz`;
    const artifactPath = join(artifactDirectory, file);
    execFileSync(
      "tar",
      ["-czf", artifactPath, "-C", stagingRoot, "package/package.json"],
      { stdio: "ignore" },
    );
    return artifactPath;
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }
}

function packExecFixture(calls, options = {}) {
  return (file, args, commandOptions) => {
    if (file === "tar") return execFileSync(file, args, commandOptions);
    calls.push({ file, args, cwd: commandOptions.cwd });
    if (file === "pnpm" && args[0] === "pack") {
      const packageManifest = JSON.parse(
        readFileSync(join(commandOptions.cwd, "package.json"), "utf8"),
      );
      let workspaceRoot = commandOptions.cwd;
      while (!existsSync(join(workspaceRoot, "config/release-plan.json"))) {
        const parent = dirname(workspaceRoot);
        assert.notEqual(parent, workspaceRoot);
        workspaceRoot = parent;
      }
      const workspaceVersions = new Map(
        loadReleaseState(workspaceRoot, {
          requireNonempty: true,
        }).manifests.map((manifest) => [manifest.name, manifest.version]),
      );
      for (const field of ["dependencies", "optionalDependencies"]) {
        for (const [dependencyName, specifier] of Object.entries(
          packageManifest[field] ?? {},
        )) {
          if (!specifier.startsWith("workspace:")) continue;
          assert.equal(workspaceVersions.has(dependencyName), true);
          packageManifest[field][dependencyName] =
            workspaceVersions.get(dependencyName);
        }
      }
      writePackedFixture(args[2], packageManifest);
      return "";
    }
    if (file === "node" && args[0].endsWith("check-pack-artifacts.js")) {
      if (options.failChecker) {
        const error = new Error("pack-check-failed");
        error.code = "pack-check-failed";
        throw error;
      }
      return "";
    }
    return "";
  };
}

function git(root, argumentsList) {
  return execFileSync("git", argumentsList, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
}

function initializeGitFixture(t, fixture, commitMessage) {
  const remoteRoot = mkdtempSync(join(tmpdir(), "hua-safe-release-remote-"));
  const remote = join(remoteRoot, "origin.git");
  t.after(() => {
    fixture.cleanup();
    rmSync(remoteRoot, { recursive: true, force: true });
  });
  execFileSync("git", ["init", "--bare", remote], { stdio: "ignore" });
  git(fixture.root, ["init", "-b", "main"]);
  git(fixture.root, ["config", "user.name", "safe-release-test"]);
  git(fixture.root, [
    "config",
    "user.email",
    "safe-release-test@example.invalid",
  ]);
  git(fixture.root, ["add", "--all"]);
  git(fixture.root, ["commit", "-m", commitMessage]);
  git(fixture.root, ["remote", "add", "origin", remote]);
  git(fixture.root, ["push", "-u", "origin", "main"]);
  const sourceHead = git(fixture.root, ["rev-parse", "HEAD"]);
  return {
    fixture,
    remote,
    remoteRoot,
    sourceHead,
  };
}

function createGitPlannedFixture(t) {
  return initializeGitFixture(
    t,
    createPlannedFixture(),
    "seed planned release",
  );
}

function mergeReviewedTransition(remote, expectedHead, transitionHead) {
  git(remote, ["update-ref", "refs/heads/main", transitionHead, expectedHead]);
  assert.equal(git(remote, ["rev-parse", "refs/heads/main"]), transitionHead);
}

function assertCode(callback, code) {
  assert.throws(callback, (error) => error?.code === code);
}

test("current policy admits the alternate-authority Dot family while held and never packages stay blocked", () => {
  const state = loadReleaseState(CURRENT_ROOT);
  assert.equal(state.policy.packages.length, 17);
  assert.equal(
    state.policy.packages.filter((entry) => entry.eligibility === "eligible")
      .length,
    15,
  );
  assert.equal(state.plan.status, "empty");
  assert.deepEqual(state.plan.releases, []);
  for (const name of ["@hua-labs/hua", "@hua-labs/security"]) {
    assert.equal(
      state.policy.packages.find((entry) => entry.name === name).eligibility,
      "blocked",
    );
  }
  for (const name of ["@hua-labs/dot", "@hua-labs/dot-aot"]) {
    const entry = state.policy.packages.find(
      (candidate) => candidate.name === name,
    );
    assert.equal(entry.eligibility, "eligible");
    assert.equal(entry.reason, "active-public");
    assert.equal(entry.release.mode, "no-publish");
    assert.equal(entry.release.authority, "hua-packages");
  }
});

test("public policy binds opaque authority facts without repository-name fragments", () => {
  const policyBytes = readFileSync(
    join(CURRENT_ROOT, "config/publish-allowlist.json"),
    "utf8",
  );
  const sourceBytes = readFileSync(
    join(CURRENT_ROOT, "scripts/safe-release.mjs"),
    "utf8",
  );
  const policy = JSON.parse(policyBytes);
  assert.deepEqual(Object.keys(policy.platformAuthority).sort(), [
    "authorityKind",
    "commit",
    "registryBlob",
    "registryPath",
    "registrySha256",
    "tree",
  ]);
  assert.equal(
    policy.platformAuthority.authorityKind,
    "platform-release-registry",
  );
  assert.match(sourceBytes, /authorityKind: "platform-release-registry"/);
});

test("workflow keeps versioning token-free and gates exact publish/provenance after plan", () => {
  const workflow = readFileSync(
    join(CURRENT_ROOT, ".github/workflows/release.yml"),
    "utf8",
  );
  const rootManifest = JSON.parse(
    readFileSync(join(CURRENT_ROOT, "package.json"), "utf8"),
  );
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.equal(
    rootManifest.scripts["safe-release:preflight"],
    "node scripts/safe-release.mjs preflight --format=github",
  );
  assert.match(workflow, /pnpm --silent safe-release:preflight/);
  assert.match(workflow, /pnpm safe-release:refresh/);
  assert.match(workflow, /version: pnpm safe-release:version/);
  assert.match(workflow, /if: needs\.prepare\.outputs\.claimed == 'true'/);
  assert.match(
    workflow,
    /node scripts\/safe-release\.mjs publish > "\$published"/,
  );
  assert.match(workflow, /check-npm-provenance\.mjs --published/);
  assert.match(
    workflow,
    /check-npm-provenance\.mjs --published[^\n]+--close-plan/,
  );
  assert.doesNotMatch(workflow, /--no-frozen-lockfile/);
  assert.doesNotMatch(workflow, /changeset publish/);
  assert.doesNotMatch(workflow, /for npmrc in "\$HOME\/\.npmrc" \.npmrc/);
  const planIndex = workflow.indexOf("Validate durable exact release plan");
  const refreshIndex = workflow.indexOf(
    "Refresh verified empty release snapshot",
  );
  const versionIndex = workflow.indexOf("Create or update version PR");
  const credentialIndex = workflow.indexOf(
    "NPM_TOKEN: ${{ secrets.NPM_TOKEN }}",
  );
  const provenanceIndex = workflow.indexOf(
    "Check exact published-set npm provenance",
  );
  const closedValidationIndex = workflow.indexOf(
    "Validate reviewed empty-plan transition",
  );
  assert.ok(refreshIndex >= 0 && versionIndex > refreshIndex);
  assert.ok(planIndex >= 0 && credentialIndex > planIndex);
  assert.ok(provenanceIndex >= 0 && closedValidationIndex > provenanceIndex);

  const changesetConfig = JSON.parse(
    readFileSync(join(CURRENT_ROOT, ".changeset/config.json"), "utf8"),
  );
  assert.deepEqual(changesetConfig.ignore, [
    "@hua-labs/hua",
    "@hua-labs/security",
  ]);
});

test("workflow withholds OIDC and npm credentials until an immutable artifact claim", () => {
  const workflow = readFileSync(
    join(CURRENT_ROOT, ".github/workflows/release.yml"),
    "utf8",
  );
  const document = parseDocument(workflow, { uniqueKeys: true });
  assert.deepEqual(document.errors, []);
  const workflowAuthority = document.toJS();
  assert.deepEqual(workflowAuthority.permissions, { contents: "read" });
  assert.deepEqual(workflowAuthority.jobs.prepare.permissions, {
    contents: "write",
    "pull-requests": "write",
  });
  assert.deepEqual(workflowAuthority.jobs.publish.permissions, {
    actions: "read",
    contents: "read",
    "id-token": "write",
  });
  assert.deepEqual(workflowAuthority.jobs.close.permissions, {
    contents: "write",
    "pull-requests": "write",
  });
  assert.deepEqual(
    Object.entries(workflowAuthority.jobs)
      .filter(([, job]) => job.permissions?.["id-token"] === "write")
      .map(([name]) => name),
    ["publish"],
  );
  assert.equal(
    workflowAuthority.jobs.publish.steps.find(
      (step) => step.name === "Checkout exact pushed claim",
    ).with.ref,
    "${{ needs.prepare.outputs.claim_head }}",
  );
  assert.equal(
    workflowAuthority.jobs.publish.steps.find(
      (step) => step.name === "Publish immutable verified tarballs",
    ).env.HUA_RELEASE_CLAIM_HEAD,
    "${{ needs.prepare.outputs.claim_head }}",
  );
  assert.equal(
    workflowAuthority.jobs.prepare.steps.some(
      (step) => step.env?.NPM_TOKEN !== undefined,
    ),
    false,
  );
  assert.equal(
    workflowAuthority.jobs.close.steps.some(
      (step) => step.env?.NPM_TOKEN !== undefined,
    ),
    false,
  );
  assert.doesNotMatch(
    workflow.slice(0, workflow.indexOf("jobs:")),
    /id-token:\s*write/,
  );
  assert.match(workflow, /prepare:[\s\S]+?permissions:[\s\S]+?contents: write/);
  assert.doesNotMatch(
    workflow.match(/prepare:[\s\S]+?(?=\n {2}publish:)/)?.[0] ?? "",
    /id-token:\s*write|NPM_TOKEN/,
  );
  assert.match(
    workflow,
    /Prepare and verify exact release artifacts[\s\S]+?Upload exact verified artifacts[\s\S]+?Claim exact artifact-bound release/,
  );
  assert.match(workflow, /publish:[\s\S]+?permissions:[\s\S]+?id-token: write/);
  assert.match(
    workflow,
    /Publish immutable verified tarballs[\s\S]+?--ignore-scripts/,
  );
  assert.doesNotMatch(workflow, /\$HOME\/\.npmrc/);
  assert.match(workflow, /close:[\s\S]+?permissions:[\s\S]+?contents: write/);
  assert.doesNotMatch(
    workflow.match(/close:[\s\S]+$/)?.[0] ?? "",
    /id-token:\s*write|NPM_TOKEN/,
  );
});

test("workflow artifact handoffs remain exact across supported GitHub reruns", () => {
  const workflow = parseDocument(
    readFileSync(join(CURRENT_ROOT, ".github/workflows/release.yml"), "utf8"),
    { uniqueKeys: true },
  ).toJS();

  const releaseUpload = workflow.jobs.prepare.steps.find(
    (step) => step.name === "Upload exact verified artifacts",
  );
  assert.equal(
    workflow.jobs.prepare.outputs.artifact_name,
    "hua-release-${{ steps.release-plan.outputs.artifact_manifest_sha256 }}",
  );
  assert.equal(
    releaseUpload.with.name,
    "hua-release-${{ steps.artifact-pack.outputs.artifact_manifest_sha256 }}",
  );
  assert.equal(releaseUpload.with.overwrite, true);

  const publishStep = workflow.jobs.publish.steps.find(
    (step) => step.name === "Publish immutable verified tarballs",
  );
  const publishedUpload = workflow.jobs.publish.steps.find(
    (step) => step.name === "Upload sanitized exact published set",
  );
  const publishedDownload = workflow.jobs.close.steps.find(
    (step) => step.name === "Download sanitized exact published set",
  );
  assert.match(
    publishStep.run,
    /artifact_name=hua-published-\$\{GITHUB_RUN_ID\}-\$\{GITHUB_RUN_ATTEMPT\}/,
  );
  assert.equal(
    workflow.jobs.publish.outputs.published_artifact_name,
    "${{ steps.safe-publish.outputs.artifact_name }}",
  );
  assert.equal(
    publishedUpload.with.name,
    "${{ steps.safe-publish.outputs.artifact_name }}",
  );
  assert.equal(
    publishedDownload.with.name,
    "${{ needs.publish.outputs.published_artifact_name }}",
  );
});

test("release source binds checked tarballs and never publishes mutable package directories", () => {
  const source = readFileSync(
    join(CURRENT_ROOT, "scripts/safe-release.mjs"),
    "utf8",
  );
  assert.match(source, /check-pack-artifacts\.js/);
  assert.match(source, /artifactManifestSha256/);
  assert.match(source, /"npm",\s*\[\s*"publish",\s*artifactPath/);
  assert.match(source, /"--ignore-scripts"/);
  assert.doesNotMatch(source, /"pnpm",\s*\["publish",\s*"--no-git-checks"/);
});

test("pack builds every exact planned package including create-hua before one artifact check", (t) => {
  const definitions = [
    ...structuredClone(packageDefinitions),
    {
      name: "create-hua",
      path: "packages/create-hua",
      version: "0.3.0",
      release: {
        mode: "public-npm",
        intent: "active-public",
        authority: "hua-packages",
        channel: "npm-public",
      },
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPlannedFixture(
    ["@hua-labs/ui", "create-hua"],
    definitions,
  );
  t.after(() => fixture.cleanup());
  const artifactDirectory = createExternalArtifactDirectory(fixture);
  const calls = [];
  const result = runPack({
    root: fixture.root,
    artifactDirectory,
    branch: "main",
    runId: "777",
    sourceHead: "7".repeat(40),
    execFile: packExecFixture(calls),
  });
  assert.equal(result.artifactCount, 2);
  assert.deepEqual(
    calls
      .filter(({ file, args }) => file === "pnpm" && args[0] === "--filter")
      .map(({ args }) => args[1]),
    ["@hua-labs/dot", "@hua-labs/ui", "create-hua"],
  );
  assert.equal(
    calls.filter(({ file, args }) => file === "pnpm" && args[0] === "pack")
      .length,
    2,
  );
  const checkerCalls = calls.filter(
    ({ file, args }) =>
      file === "node" && args[0].endsWith("check-pack-artifacts.js"),
  );
  assert.equal(checkerCalls.length, 1);
  assert.equal(checkerCalls[0].args.length, 3);
  assert.equal(readFileSync(result.artifactManifestPath).byteLength > 0, true);
});

test("pack builds blocked and unselected workspace prerequisites once in deterministic dependency order", (t) => {
  const activePublic = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const publicManifest = { access: "public", provenance: true };
  const definitions = [
    {
      ...structuredClone(packageDefinitions[0]),
    },
    {
      name: "@hua-labs/dot-lsp",
      path: "packages/hua-dot-lsp",
      version: "0.1.3",
      dependencies: { "@hua-labs/dot": "workspace:0.2.2" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/dot-mcp",
      path: "packages/hua-dot-mcp",
      version: "0.1.3",
      dependencies: { "@hua-labs/dot": "workspace:0.2.2" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/i18n-core",
      path: "packages/hua-i18n-core",
      version: "2.2.1",
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/i18n-core-zustand",
      path: "packages/hua-i18n-core-zustand",
      version: "2.2.1",
      dependencies: {
        "@hua-labs/i18n-core": "workspace:*",
        "@hua-labs/state": "workspace:*",
      },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/i18n-formatters",
      path: "packages/hua-i18n-formatters",
      version: "2.2.1",
      dependencies: { "@hua-labs/i18n-core": "workspace:*" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/i18n-loaders",
      path: "packages/hua-i18n-loaders",
      version: "2.2.1",
      dependencies: { "@hua-labs/i18n-core": "workspace:*" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/state",
      path: "packages/hua-state",
      version: "1.0.4",
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
  ].sort((left, right) =>
    Buffer.compare(Buffer.from(left.name), Buffer.from(right.name)),
  );
  const releases = [
    "@hua-labs/dot-lsp",
    "@hua-labs/dot-mcp",
    "@hua-labs/i18n-core-zustand",
    "@hua-labs/i18n-formatters",
    "@hua-labs/i18n-loaders",
  ];
  const fixture = createPlannedFixture(releases, definitions);
  t.after(() => fixture.cleanup());
  const calls = [];
  const result = runPack({
    root: fixture.root,
    artifactDirectory: createExternalArtifactDirectory(fixture),
    branch: "main",
    runId: "776",
    sourceHead: "6".repeat(40),
    execFile: packExecFixture(calls),
  });
  assert.equal(result.artifactCount, releases.length);
  assert.deepEqual(
    calls
      .filter(({ file, args }) => file === "pnpm" && args[0] === "--filter")
      .map(({ args }) => args[1]),
    [
      "@hua-labs/dot",
      "@hua-labs/dot-lsp",
      "@hua-labs/dot-mcp",
      "@hua-labs/i18n-core",
      "@hua-labs/state",
      "@hua-labs/i18n-core-zustand",
      "@hua-labs/i18n-formatters",
      "@hua-labs/i18n-loaders",
    ],
  );
  assert.deepEqual(
    JSON.parse(readFileSync(result.artifactManifestPath, "utf8")).artifacts.map(
      ({ name }) => name,
    ),
    [...releases].sort((left, right) =>
      Buffer.compare(Buffer.from(left), Buffer.from(right)),
    ),
  );
});

test("pack rejects planned workspace manifest drift caused by a prerequisite build before packing", (t) => {
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  const calls = [];
  const executeFixture = packExecFixture(calls);
  let mutated = false;

  assertCode(
    () =>
      runPack({
        root: fixture.root,
        artifactDirectory: createExternalArtifactDirectory(fixture),
        branch: "main",
        runId: "774",
        sourceHead: "4".repeat(40),
        execFile(file, args, options) {
          const output = executeFixture(file, args, options);
          if (
            !mutated &&
            file === "pnpm" &&
            args[0] === "--filter" &&
            args[1] === "@hua-labs/dot"
          ) {
            mutateJson(
              join(fixture.root, "packages/hua-ui/package.json"),
              (manifest) => {
                manifest.description = "mutated by prerequisite build";
              },
            );
            mutated = true;
          }
          return output;
        },
      }),
    "plan-workspace-drift",
  );

  assert.equal(mutated, true);
  assert.deepEqual(
    calls
      .filter(({ file, args }) => file === "pnpm" && args[0] === "--filter")
      .map(({ args }) => args[1]),
    ["@hua-labs/dot", "@hua-labs/ui"],
  );
  assert.equal(
    calls.some(({ file, args }) => file === "pnpm" && args[0] === "pack"),
    false,
  );
  assert.equal(
    calls.some(
      ({ file, args }) =>
        file === "node" && args[0].endsWith("check-pack-artifacts.js"),
    ),
    false,
  );
});

test("pack rejects release-plan authority drift caused by a prerequisite build", (t) => {
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  const calls = [];
  const executeFixture = packExecFixture(calls);
  let mutated = false;

  assertCode(
    () =>
      runPack({
        root: fixture.root,
        artifactDirectory: createExternalArtifactDirectory(fixture),
        branch: "main",
        runId: "772",
        sourceHead: "2".repeat(40),
        execFile(file, args, options) {
          const output = executeFixture(file, args, options);
          if (
            !mutated &&
            file === "pnpm" &&
            args[0] === "--filter" &&
            args[1] === "@hua-labs/dot"
          ) {
            const state = loadReleaseState(fixture.root, {
              requireNonempty: true,
            });
            const releases = structuredClone(state.plan.releases);
            releases[0].changesets[0].sha256 = "3".repeat(64);
            writeFileSync(
              join(fixture.root, "config/release-plan.json"),
              canonicalJson(
                finalizeReleasePlan({
                  ...state.plan,
                  releases,
                }),
              ),
            );
            mutated = true;
          }
          return output;
        },
      }),
    "pack-plan-drift",
  );

  assert.equal(mutated, true);
  assert.deepEqual(
    calls
      .filter(({ file, args }) => file === "pnpm" && args[0] === "--filter")
      .map(({ args }) => args[1]),
    ["@hua-labs/dot", "@hua-labs/ui"],
  );
  assert.equal(
    calls.some(({ file, args }) => file === "pnpm" && args[0] === "pack"),
    false,
  );
});

test("pack rejects selected manifest drift introduced by pack before artifact admission", (t) => {
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  const artifactDirectory = createExternalArtifactDirectory(fixture);
  const calls = [];
  const executeFixture = packExecFixture(calls);
  let mutated = false;

  assertCode(
    () =>
      runPack({
        root: fixture.root,
        artifactDirectory,
        branch: "main",
        runId: "773",
        sourceHead: "3".repeat(40),
        execFile(file, args, options) {
          if (!mutated && file === "pnpm" && args[0] === "pack") {
            mutateJson(
              join(fixture.root, "packages/hua-ui/package.json"),
              (manifest) => {
                manifest.description = "mutated while packing";
              },
            );
            mutated = true;
          }
          return executeFixture(file, args, options);
        },
      }),
    "plan-workspace-drift",
  );

  assert.equal(mutated, true);
  assert.deepEqual(
    calls
      .filter(({ file, args }) => file === "pnpm" && args[0] === "--filter")
      .map(({ args }) => args[1]),
    ["@hua-labs/dot", "@hua-labs/ui"],
  );
  assert.equal(
    calls.filter(({ file, args }) => file === "pnpm" && args[0] === "pack")
      .length,
    1,
  );
  assert.equal(
    calls.some(
      ({ file, args }) =>
        file === "node" && args[0].endsWith("check-pack-artifacts.js"),
    ),
    false,
  );
  assert.equal(
    existsSync(join(artifactDirectory, "release-artifacts.json")),
    false,
  );
});

test("pack disables package lifecycle before artifact bytes are created", (t) => {
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  const artifactDirectory = createExternalArtifactDirectory(fixture);
  const calls = [];
  const executeFixture = packExecFixture(calls);
  const packageManifestPath = join(
    fixture.root,
    "packages/hua-ui/package.json",
  );
  const originalManifestBytes = readFileSync(packageManifestPath);
  let prepackCalls = 0;
  let postpackCalls = 0;

  const result = runPack({
    root: fixture.root,
    artifactDirectory,
    branch: "main",
    runId: "771",
    sourceHead: "1".repeat(40),
    execFile(file, args, options) {
      if (file !== "pnpm" || args[0] !== "pack") {
        return executeFixture(file, args, options);
      }

      const lifecycleDisabled =
        options.env?.npm_config_ignore_scripts === "true";
      if (!lifecycleDisabled) {
        prepackCalls += 1;
        mutateJson(packageManifestPath, (manifest) => {
          manifest.description = "tarball-only lifecycle drift";
        });
      }
      const output = executeFixture(file, args, options);
      if (!lifecycleDisabled) {
        postpackCalls += 1;
        writeFileSync(packageManifestPath, originalManifestBytes);
      }
      return output;
    },
  });

  assert.equal(result.artifactCount, 1);
  assert.equal(prepackCalls, 0);
  assert.equal(postpackCalls, 0);
  const artifact = readdirSync(artifactDirectory).find((entry) =>
    entry.endsWith(".tgz"),
  );
  const packedManifest = JSON.parse(
    execFileSync(
      "tar",
      ["-xOf", join(artifactDirectory, artifact), "package/package.json"],
      { encoding: "utf8" },
    ),
  );
  assert.equal(packedManifest.description, undefined);
});

test("pack normalizes conflicting lifecycle settings before a real pnpm child", (t) => {
  const activePublic = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const definitions = [
    {
      name: "@fixture/dependency",
      path: "packages/dependency",
      version: "1.2.3",
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@fixture/selected",
      path: "packages/selected",
      version: "1.0.0",
      dependencies: { "@fixture/dependency": "workspace:*" },
      scripts: {
        prepack: "node lifecycle.mjs prepack",
        postpack: "node lifecycle.mjs postpack",
      },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPlannedFixture(["@fixture/selected"], definitions);
  t.after(() => fixture.cleanup());
  const root = fixture.root;
  const artifactDirectory = createExternalArtifactDirectory(fixture);
  const dependencyDirectory = join(root, "packages/dependency");
  const selectedDirectory = join(root, "packages/selected");
  const lifecycleLog = join(selectedDirectory, "lifecycle.log");
  writeFileSync(
    join(root, "pnpm-workspace.yaml"),
    'packages:\n  - "packages/*"\n',
  );
  writeFileSync(
    join(selectedDirectory, "lifecycle.mjs"),
    'import { appendFileSync } from "node:fs";\n' +
      'appendFileSync(new URL("./lifecycle.log", import.meta.url), `${process.argv[2]}\\n`);\n',
  );
  const installedScopeDirectory = join(
    selectedDirectory,
    "node_modules/@fixture",
  );
  mkdirSync(installedScopeDirectory, { recursive: true });
  symlinkSync(
    dependencyDirectory,
    join(installedScopeDirectory, "dependency"),
    "dir",
  );
  const sourceManifestPath = join(selectedDirectory, "package.json");
  const sourceManifestBytes = readFileSync(sourceManifestPath);
  const conflictingSettings = {
    npm_config_ignore_scripts: "false",
    NPM_CONFIG_IGNORE_SCRIPTS: "false",
    NpM_CoNfIg_Ignore_Scripts: "false",
    pnpm_config_ignore_scripts: "false",
    PNPM_CONFIG_IGNORE_SCRIPTS: "false",
    PnPm_CoNfIg_Ignore_Scripts: "false",
  };
  const originalSettings = new Map(
    Object.keys(conflictingSettings).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, conflictingSettings);
  t.after(() => {
    for (const [key, value] of originalSettings) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const calls = [];
  const executeFixture = packExecFixture(calls);
  let packEnvironment;
  const result = runPack({
    root,
    artifactDirectory,
    branch: "main",
    runId: "770",
    sourceHead: "0".repeat(40),
    execFile(file, args, options) {
      if (file === "pnpm" && args[0] === "pack") {
        packEnvironment = options.env;
        return execFileSync(file, args, options);
      }
      return executeFixture(file, args, options);
    },
  });

  assert.equal(result.artifactCount, 1);
  const lifecycleEvents = existsSync(lifecycleLog)
    ? readFileSync(lifecycleLog, "utf8").trim().split("\n")
    : [];
  assert.deepEqual(lifecycleEvents, []);
  assert.deepEqual(
    Object.entries(packEnvironment)
      .filter(([key]) =>
        ["npm_config_ignore_scripts", "pnpm_config_ignore_scripts"].includes(
          key.toLowerCase(),
        ),
      )
      .sort(([left], [right]) =>
        Buffer.compare(Buffer.from(left), Buffer.from(right)),
      ),
    [
      ["npm_config_ignore_scripts", "true"],
      ["pnpm_config_ignore_scripts", "true"],
    ],
  );
  assert.deepEqual(readFileSync(sourceManifestPath), sourceManifestBytes);
  const artifacts = readdirSync(artifactDirectory);
  assert.equal(artifacts.filter((entry) => entry.endsWith(".tgz")).length, 1);
  const packedManifest = JSON.parse(
    execFileSync(
      "tar",
      [
        "-xOf",
        join(
          artifactDirectory,
          artifacts.find((entry) => entry.endsWith(".tgz")),
        ),
        "package/package.json",
      ],
      { encoding: "utf8" },
    ),
  );
  const expectedPackedManifest = JSON.parse(sourceManifestBytes);
  expectedPackedManifest.dependencies["@fixture/dependency"] = "1.2.3";
  expectedPackedManifest.scripts = {};
  assert.deepEqual(packedManifest, expectedPackedManifest);
  assert.equal(packedManifest.dependencies["@fixture/dependency"], "1.2.3");
});

test("pack rejects a workspace build-dependency cycle before build, pack, or artifact checks", (t) => {
  const release = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const definitions = [
    {
      name: "@hua-labs/alpha",
      path: "packages/alpha",
      version: "1.0.0",
      dependencies: { "@hua-labs/beta": "workspace:*" },
      release,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@hua-labs/beta",
      path: "packages/beta",
      version: "1.0.0",
      dependencies: { "@hua-labs/alpha": "workspace:*" },
      release,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPlannedFixture(["@hua-labs/alpha"], definitions);
  t.after(() => fixture.cleanup());
  const calls = [];
  assertCode(
    () =>
      runPack({
        root: fixture.root,
        artifactDirectory: createExternalArtifactDirectory(fixture),
        branch: "main",
        runId: "775",
        sourceHead: "5".repeat(40),
        execFile: packExecFixture(calls),
      }),
    "pack-workspace-dependency-cycle",
  );
  assert.deepEqual(calls, []);
});

test("pack rejects an unknown workspace build dependency before any execution", (t) => {
  const release = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const definitions = [
    {
      name: "@hua-labs/alpha",
      path: "packages/alpha",
      version: "1.0.0",
      dependencies: { "@hua-labs/absent": "workspace:*" },
      release,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPlannedFixture(["@hua-labs/alpha"], definitions);
  t.after(() => fixture.cleanup());
  const calls = [];

  assertCode(
    () =>
      runPack({
        root: fixture.root,
        artifactDirectory: createExternalArtifactDirectory(fixture),
        branch: "main",
        runId: "771",
        sourceHead: "1".repeat(40),
        execFile: packExecFixture(calls),
      }),
    "pack-workspace-dependency-unknown",
  );
  assert.deepEqual(calls, []);
});

test("pack-check failure creates no claim authority and executes zero publish", () => {
  const fixture = createPlannedFixture();
  try {
    const artifactDirectory = createExternalArtifactDirectory(fixture);
    const calls = [];
    assertCode(
      () =>
        runPack({
          root: fixture.root,
          artifactDirectory,
          branch: "main",
          runId: "778",
          sourceHead: "8".repeat(40),
          execFile: packExecFixture(calls, { failChecker: true }),
        }),
      "pack-check-failed",
    );
    const manifestPath = join(artifactDirectory, "release-artifacts.json");
    assert.equal(
      calls.some(({ file }) => file === "npm"),
      false,
    );
    let gitCalls = 0;
    assertCode(
      () =>
        runClaim({
          root: fixture.root,
          artifactManifestPath: manifestPath,
          branch: "main",
          runId: "778",
          sourceHead: "8".repeat(40),
          execFile() {
            gitCalls += 1;
          },
        }),
      "artifact-manifest-missing",
    );
    assert.equal(gitCalls, 0);
    assert.equal(loadReleaseState(fixture.root).plan.status, "planned");
  } finally {
    fixture.cleanup();
  }
});

test("UI missing type references fail the exact pack checker before claim authority", () => {
  const fixture = createPlannedFixture();
  try {
    const artifactDirectory = createExternalArtifactDirectory(fixture);
    const artifactPath = writePackedFixture(artifactDirectory, {
      name: "@hua-labs/ui",
      version: "2.3.1",
      exports: {
        "./landing": { types: "./dist/landing.d.ts" },
        "./native": { types: "./dist/native.d.ts" },
        "./sdui": { types: "./dist/sdui.d.ts" },
      },
    });
    assert.throws(
      () =>
        execFileSync(
          "node",
          [join(CURRENT_ROOT, "scripts/check-pack-artifacts.js"), artifactPath],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        ),
      (error) =>
        error?.status === 1 &&
        error.stdout.includes("package/dist/landing.d.ts") &&
        error.stdout.includes("package/dist/native.d.ts") &&
        error.stdout.includes("package/dist/sdui.d.ts") &&
        error.stdout.includes("3 issue(s)"),
    );
    assert.equal(loadReleaseState(fixture.root).plan.status, "planned");
  } finally {
    fixture.cleanup();
  }
});

test("workflow admits a planned merge without running empty-plan refresh", () => {
  const workflow = readFileSync(
    join(CURRENT_ROOT, ".github/workflows/release.yml"),
    "utf8",
  );
  const preflightIndex = workflow.indexOf("Read durable release plan state");
  const refreshIndex = workflow.indexOf(
    "Refresh verified empty release snapshot",
  );
  const validationIndex = workflow.indexOf(
    "Validate durable exact release plan",
  );
  assert.ok(preflightIndex >= 0 && refreshIndex > preflightIndex);
  assert.match(
    workflow,
    /Refresh verified empty release snapshot[\s\S]+?if: steps\.plan-preflight\.outputs\.status == 'empty'/,
  );
  assert.match(
    workflow,
    /Create or update version PR without npm credentials[\s\S]+?if: steps\.plan-preflight\.outputs\.status == 'empty'/,
  );
  assert.ok(validationIndex > refreshIndex);
});

test("credential-free preflight admits only bounded empty manifest drift before refresh", () => {
  const fixture = makeFixture();
  try {
    mutateJson(
      join(fixture.root, "packages/hua-ui/package.json"),
      (manifest) => {
        manifest.exports = { ".": "./dist/index.mjs" };
      },
    );
    assertCode(() => loadReleaseState(fixture.root), "plan-workspace-drift");
    const preflight = runPreflight({ root: fixture.root });
    assert.equal(preflight.plan.status, "empty");
    assert.equal(preflight.refreshRequired, true);
    assert.equal(preflight.authorityRequired, false);
    const refreshed = runRefresh({ root: fixture.root });
    assert.equal(refreshed.status, "empty");
    assert.equal(runPreflight({ root: fixture.root }).refreshRequired, false);
    assert.equal(loadReleaseState(fixture.root).plan.status, "empty");
  } finally {
    fixture.cleanup();
  }
});

test("empty-plan refresh admits exact public no-publish manifest drift without creating release authority", () => {
  const fixture = makeFixture();
  try {
    mutateJson(
      join(fixture.root, "packages/hua-dot/package.json"),
      (manifest) => {
        manifest.description = "Reviewed public projection drift";
      },
    );

    assertCode(() => loadReleaseState(fixture.root), "plan-workspace-drift");
    const preflight = runPreflight({ root: fixture.root });
    assert.equal(preflight.plan.status, "empty");
    assert.deepEqual(preflight.plan.releases, []);
    assert.equal(preflight.authorityRequired, false);
    assert.equal(preflight.refreshRequired, true);
    assert.equal(
      preflight.policy.packages.find((entry) => entry.name === "@hua-labs/dot")
        .eligibility,
      "eligible",
    );

    const refreshed = runRefresh({ root: fixture.root });
    assert.equal(refreshed.status, "empty");
    assert.deepEqual(refreshed.releases, []);
    assert.equal(runPreflight({ root: fixture.root }).refreshRequired, false);
    assert.equal(loadReleaseState(fixture.root).plan.status, "empty");
  } finally {
    fixture.cleanup();
  }
});

test("empty-plan refresh admits an explicit false private field as public manifest truth", () => {
  const fixture = makeFixture();
  try {
    mutateJson(
      join(fixture.root, "packages/hua-dot/package.json"),
      (manifest) => {
        manifest.private = false;
        manifest.description = "Reviewed explicit-public projection drift";
      },
    );

    const preflight = runPreflight({ root: fixture.root });
    assert.equal(preflight.plan.status, "empty");
    assert.deepEqual(preflight.plan.releases, []);
    assert.equal(preflight.authorityRequired, false);
    assert.equal(preflight.refreshRequired, true);

    const refreshed = runRefresh({ root: fixture.root });
    assert.equal(refreshed.status, "empty");
    assert.deepEqual(refreshed.releases, []);
    assert.equal(runPreflight({ root: fixture.root }).refreshRequired, false);
  } finally {
    fixture.cleanup();
  }
});

test("empty-plan refresh rejects malformed present private values before normalization", async (t) => {
  for (const privateValue of ["true", "false", null, 0, {}, []]) {
    await t.test(JSON.stringify(privateValue), () => {
      const fixture = makeFixture();
      try {
        mutateJson(
          join(fixture.root, "packages/hua-dot/package.json"),
          (manifest) => {
            manifest.private = privateValue;
            manifest.description = "Malformed private projection drift";
          },
        );
        assertCode(
          () => runPreflight({ root: fixture.root }),
          "workspace-manifest-private",
        );
        assertCode(
          () => runRefresh({ root: fixture.root }),
          "workspace-manifest-private",
        );
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("no-publish manifest refresh rejects every non-public authority variant", async (t) => {
  const variants = [
    {
      name: "held intent",
      mutate(definition) {
        definition.release.intent = "held";
        definition.reason = "held";
      },
    },
    {
      name: "wrong release mode",
      mutate(definition) {
        definition.release.mode = "private-workspace";
        definition.reason = "wrong-release-mode";
      },
    },
    {
      name: "pending authority and channel",
      mutate(definition) {
        definition.release.intent = "channel-pending";
        definition.release.authority = "unresolved";
        definition.release.channel = "pending";
        definition.reason = "channel-pending";
      },
    },
    {
      name: "missing authority and channel",
      mutate(definition) {
        definition.release.authority = "none";
        definition.release.channel = "none";
        definition.reason = "release-authority-none";
      },
    },
    {
      name: "wrong authority",
      mutate(definition) {
        definition.release.authority = "none";
        definition.reason = "wrong-authority";
      },
    },
    {
      name: "wrong channel",
      mutate(definition) {
        definition.release.channel = "none";
        definition.reason = "wrong-channel";
      },
    },
  ];

  for (const variant of variants) {
    await t.test(variant.name, () => {
      const definitions = structuredClone(packageDefinitions);
      const definition = definitions.find(
        (entry) => entry.name === "@hua-labs/dot",
      );
      variant.mutate(definition);
      definition.eligibility = "blocked";
      const fixture = makeFixture({ definitions });
      try {
        mutateJson(
          join(fixture.root, "packages/hua-dot/package.json"),
          (manifest) => {
            manifest.description = "Rejected projection drift";
          },
        );
        assertCode(
          () => runPreflight({ root: fixture.root }),
          "refresh-ineligible-workspace",
        );
        assertCode(
          () => runRefresh({ root: fixture.root }),
          "refresh-ineligible-workspace",
        );
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("preflight requires external policy only for release-bearing and closure states", (t) => {
  const emptyFixture = makeFixture();
  t.after(() => emptyFixture.cleanup());
  assert.equal(
    runPreflight({ root: emptyFixture.root }).authorityRequired,
    false,
  );

  const plannedFixture = createPlannedFixture();
  t.after(() => plannedFixture.cleanup());
  assert.equal(
    runPreflight({ root: plannedFixture.root }).authorityRequired,
    true,
  );

  const publishingFixture = createPublishingFixture();
  t.after(() => publishingFixture.cleanup());
  assert.equal(
    runPreflight({ root: publishingFixture.root }).authorityRequired,
    true,
  );

  const initialized = initializeGitFixture(
    t,
    createPublishingFixture(),
    "seed publishing release",
  );
  const empty = createEmptyReleasePlan(loadPolicy(initialized.fixture.root));
  writeFileSync(
    join(initialized.fixture.root, "config/release-plan.json"),
    canonicalJson(empty),
  );
  git(initialized.fixture.root, ["add", "config/release-plan.json"]);
  git(initialized.fixture.root, ["commit", "-m", "close exact release plan"]);
  git(initialized.fixture.root, ["push", "origin", "main"]);
  assert.equal(
    runPreflight({
      root: initialized.fixture.root,
      execFile: execFileSync,
    }).authorityRequired,
    true,
  );
});

test("workflow durably claims and closes a published plan without a second publish", () => {
  const workflow = readFileSync(
    join(CURRENT_ROOT, ".github/workflows/release.yml"),
    "utf8",
  );
  const claimIndex = workflow.indexOf("Claim exact artifact-bound release");
  const credentialIndex = workflow.indexOf(
    "NPM_TOKEN: ${{ secrets.NPM_TOKEN }}",
  );
  const provenanceIndex = workflow.indexOf(
    "Check exact published-set npm provenance",
  );
  assert.ok(claimIndex >= 0 && credentialIndex > claimIndex);
  assert.match(workflow, /if: needs\.prepare\.outputs\.claimed == 'true'/);
  assert.match(
    workflow,
    /check-npm-provenance\.mjs[^\n]+--persist-head[^\n]+--source-head[^\n]+--run-id/,
  );
  assert.ok(provenanceIndex > credentialIndex);
});

test("workflow routes claim and closure through reviewed protected-main transitions", () => {
  const workflow = readFileSync(
    join(CURRENT_ROOT, ".github/workflows/release.yml"),
    "utf8",
  );
  const document = parseDocument(workflow, { uniqueKeys: true });
  assert.equal(document.errors.length, 0);
  const authority = document.toJS();
  const prepareSteps = authority.jobs.prepare.steps;
  const publishSteps = authority.jobs.publish.steps;
  const closeSteps = authority.jobs.close.steps;
  const prepareAuthority = prepareSteps.find(
    (step) => step.name === "Check current GitHub release authority",
  );
  const publishAuthority = publishSteps.find(
    (step) => step.name === "Recheck exact reviewed claim authority",
  );
  const closureAuthority = closeSteps.find(
    (step) =>
      step.name === "Recheck exact reviewed claim authority for closure",
  );
  assert.equal(
    prepareAuthority.run,
    "node scripts/safe-release.mjs authority --format=github",
  );
  assert.equal(
    publishAuthority.run,
    "node scripts/safe-release.mjs authority --format=github",
  );
  assert.equal(
    closureAuthority.run,
    "node scripts/safe-release.mjs authority --format=github",
  );
  assert.equal(
    prepareAuthority.env.HUA_GITHUB_POLICY_TOKEN,
    "${{ secrets.HUA_GITHUB_POLICY_TOKEN }}",
  );
  assert.equal(
    publishAuthority.env.HUA_GITHUB_POLICY_TOKEN,
    "${{ secrets.HUA_GITHUB_POLICY_TOKEN }}",
  );
  assert.equal(
    closureAuthority.env.HUA_GITHUB_POLICY_TOKEN,
    "${{ secrets.HUA_GITHUB_POLICY_TOKEN }}",
  );
  assert.equal(
    prepareAuthority.if,
    "steps.plan-preflight.outputs.authority_required == 'true'",
  );
  assert.ok(
    prepareSteps.indexOf(prepareAuthority) >
      prepareSteps.findIndex(
        (step) => step.name === "Read durable release plan state",
      ),
  );
  assert.ok(
    prepareSteps.indexOf(prepareAuthority) <
      prepareSteps.findIndex(
        (step) => step.name === "Prepare and verify exact release artifacts",
      ),
  );
  assert.ok(
    publishSteps.indexOf(publishAuthority) <
      publishSteps.findIndex(
        (step) => step.name === "Download exact claimed artifacts",
      ),
  );
  assert.ok(
    closeSteps.indexOf(closureAuthority) <
      closeSteps.findIndex(
        (step) =>
          step.name ===
          "Check exact published-set npm provenance and close exact published plan",
      ),
  );
  assert.equal(
    prepareSteps.some(
      (step) => step.name === "Open reviewed claim transition PR",
    ),
    true,
  );
  assert.equal(
    closeSteps.some(
      (step) => step.name === "Open reviewed closure transition PR",
    ),
    true,
  );
  const download = publishSteps.find(
    (step) => step.name === "Download exact claimed artifacts",
  );
  assert.equal(
    download.with["run-id"],
    "${{ needs.prepare.outputs.artifact_run_id }}",
  );
  assert.equal(
    authority.jobs.publish.if,
    "needs.prepare.outputs.claimed == 'true'",
  );
  assert.match(
    workflow,
    /gh pr create --base main --head "\$TRANSITION_BRANCH" --title "chore\(release\): claim exact publish plan"/,
  );
  assert.match(
    workflow,
    /gh pr create --base main --head "\$TRANSITION_BRANCH" --title "chore\(release\): close exact published plan"/,
  );
  assert.doesNotMatch(workflow, /gh pr merge|--auto/);
  assert.doesNotMatch(
    [prepareAuthority, publishAuthority, closureAuthority]
      .map((step) => JSON.stringify(step.env))
      .join("\n"),
    /GITHUB_TOKEN/,
  );
  const source = readFileSync(
    join(CURRENT_ROOT, "scripts/safe-release.mjs"),
    "utf8",
  );
  assert.doesNotMatch(source, /committedHead}:refs\/heads\/\$\{branch\}/);
  assert.match(source, /const GITHUB_CLI = "\/usr\/bin\/gh"/);
  assert.match(source, /process\.env\.HUA_GITHUB_POLICY_TOKEN/);
  assert.doesNotMatch(source, /process\.env\.GITHUB_TOKEN/);
  assert.doesNotMatch(source, /rulesets\/\$\{summary\.id\}/);
  const documentation = readFileSync(
    join(CURRENT_ROOT, "scripts/README.md"),
    "utf8",
  );
  assert.match(
    documentation,
    /separately provisioned[\s\S]+?HUA_GITHUB_POLICY_TOKEN/,
  );
  assert.match(
    documentation,
    /tap review artifacts are not GitHub approval authority/,
  );
  assert.match(
    documentation,
    /ordinary workflow\s+`GITHUB_TOKEN` is never accepted/,
  );
  assert.match(documentation, /Administration\(read\)/);
  assert.match(
    documentation,
    /effective branch rules[\s\S]+?ruleset summaries[\s\S]+?exactly empty/,
  );
  assert.match(documentation, /avoids granting Administration\(write\)/);
});

test("GitHub release authority fails closed before OIDC or publish on every unreviewed boundary", async (t) => {
  const transition = githubTransition("claim");
  const cases = [
    ["absent protection", (value) => (value.protection = null)],
    [
      "effective ruleset rule present",
      (value) =>
        value.rules.push({
          type: "pull_request",
          parameters: {
            dismiss_stale_reviews_on_push: true,
            require_last_push_approval: true,
            required_approving_review_count: 1,
          },
        }),
    ],
    [
      "classic bypass actor",
      (value) =>
        value.protection.required_pull_request_reviews.bypass_pull_request_allowances.users.push(
          { login: "bypass-user" },
        ),
    ],
    [
      "malformed classic bypass allowance",
      (value) =>
        (value.protection.required_pull_request_reviews.bypass_pull_request_allowances =
          null),
    ],
    [
      "partial classic bypass allowance",
      (value) =>
        delete value.protection.required_pull_request_reviews
          .bypass_pull_request_allowances.apps,
    ],
    [
      "unknown classic bypass category",
      (value) =>
        (value.protection.required_pull_request_reviews.bypass_pull_request_allowances.deploy_keys =
          [{ login: "private-bypass" }]),
    ],
    [
      "administrator bypass",
      (value) => (value.protection.enforce_admins.enabled = false),
    ],
    [
      "repository ruleset summary present",
      (value) =>
        value.rulesets.push({
          id: 9,
          enforcement: "active",
          bypass_actors: [],
        }),
    ],
    [
      "parent ruleset summary present",
      (value) =>
        value.rulesets.push({
          id: 10,
          enforcement: "active",
          source_type: "Organization",
        }),
    ],
    [
      "malformed ruleset summary present",
      (value) =>
        value.rulesets.push({
          id: 11,
          enforcement: null,
        }),
    ],
    [
      "partial workflow policy",
      (value) => delete value.actions.can_approve_pull_request_reviews,
    ],
    [
      "Actions review approval",
      (value) => (value.actions.can_approve_pull_request_reviews = true),
    ],
    ["zero approval", (value) => (value.reviews = [])],
    [
      "self-only approval",
      (value) => (value.reviews[0].user.login = "release-author"),
    ],
    [
      "stale approval",
      (value) => (value.reviews[0].commit_id = "7".repeat(40)),
    ],
    ["wrong PR base", (value) => (value.pullRequest.base.sha = "7".repeat(40))],
    ["wrong associated PR", (value) => (value.pullRequest.number = 18)],
    [
      "wrong transition branch",
      (value) => (value.pullRequest.head.ref = "release/claim-wrong"),
    ],
    [
      "wrong PR head tree",
      (value) => (value.headCommit.tree.sha = "7".repeat(40)),
    ],
    [
      "wrong merge commit",
      (value) => (value.pullRequest.merge_commit_sha = "7".repeat(40)),
    ],
    [
      "duplicate association",
      (value) => value.associations.push({ number: 18 }),
    ],
  ];
  for (const [name, mutate] of cases) {
    await t.test(name, () => {
      const authority = githubAuthorityFixture(transition);
      mutate(authority);
      let oidcStarts = 0;
      let publishCalls = 0;
      assertCode(() => {
        validateGitHubReleaseAuthority(authority, transition);
        oidcStarts += 1;
        publishCalls += 1;
      }, "external-policy-blocked");
      assert.equal(oidcStarts, 0);
      assert.equal(publishCalls, 0);
    });
  }
});

test("missing dedicated policy credential cannot fall back to the workflow token", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const transition = githubTransition("claim");
  const previousWorkflowToken = process.env.GITHUB_TOKEN;
  const previousPolicyToken = process.env.HUA_GITHUB_POLICY_TOKEN;
  process.env.GITHUB_TOKEN = "ambient-workflow-token-must-not-authorize-policy";
  delete process.env.HUA_GITHUB_POLICY_TOKEN;
  t.after(() => {
    if (previousWorkflowToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previousWorkflowToken;
    if (previousPolicyToken === undefined) {
      delete process.env.HUA_GITHUB_POLICY_TOKEN;
    } else {
      process.env.HUA_GITHUB_POLICY_TOKEN = previousPolicyToken;
    }
  });

  let githubCalls = 0;
  const privileged = {
    artifactDownloads: 0,
    claims: 0,
    closures: 0,
    npmAuth: 0,
    oidc: 0,
    publishes: 0,
  };
  assertCode(() => {
    runAuthority({
      root: fixture.root,
      githubExecFile() {
        githubCalls += 1;
        return "{}";
      },
      execFile(_file, args) {
        if (args[0] === "rev-parse" && args[1] === "HEAD") {
          return `${transition.currentHead}\n`;
        }
        if (args[0] === "rev-parse" && args[1] === "HEAD^{tree}") {
          return `${transition.currentTree}\n`;
        }
        if (args[0] === "ls-remote") {
          return `${transition.currentHead}\trefs/heads/main\n`;
        }
        if (args[0] === "rev-list") {
          return `${transition.currentHead} ${transition.baseHead}\n`;
        }
        if (args[0] === "diff") return "config/release-plan.json\n";
        throw new Error("unexpected-git-command");
      },
    });
    privileged.oidc += 1;
    privileged.artifactDownloads += 1;
    privileged.npmAuth += 1;
    privileged.publishes += 1;
    privileged.claims += 1;
    privileged.closures += 1;
  }, "policy-credential-unavailable");
  assert.equal(githubCalls, 0);
  assert.deepEqual(privileged, {
    artifactDownloads: 0,
    claims: 0,
    closures: 0,
    npmAuth: 0,
    oidc: 0,
    publishes: 0,
  });
});

test("insufficient dedicated policy credential fails as a bounded external block", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const transition = githubTransition("claim");
  let githubCalls = 0;
  let privilegedCalls = 0;
  assertCode(() => {
    runAuthority({
      root: fixture.root,
      policyToken: "separate-policy-token",
      githubExecFile() {
        githubCalls += 1;
        throw new Error("raw 403 administration scope body must not escape");
      },
      execFile(_file, args) {
        if (args[0] === "rev-parse" && args[1] === "HEAD") {
          return `${transition.currentHead}\n`;
        }
        if (args[0] === "rev-parse" && args[1] === "HEAD^{tree}") {
          return `${transition.currentTree}\n`;
        }
        if (args[0] === "ls-remote") {
          return `${transition.currentHead}\trefs/heads/main\n`;
        }
        if (args[0] === "rev-list") {
          return `${transition.currentHead} ${transition.baseHead}\n`;
        }
        if (args[0] === "diff") return "config/release-plan.json\n";
        throw new Error("unexpected-git-command");
      },
    });
    privilegedCalls += 1;
  }, "external-policy-blocked");
  assert.equal(githubCalls, 1);
  assert.equal(privilegedCalls, 0);
});

test("synthetic protected claim and closure authorities prove contract shape only", () => {
  for (const kind of ["claim", "close"]) {
    const transition = githubTransition(kind);
    const result = validateGitHubReleaseAuthority(
      githubAuthorityFixture(transition),
      transition,
    );
    assert.equal(result.repository, TEST_RELEASE_REPOSITORY);
    assert.equal(result.transition, kind);
    assert.equal(result.status, "protected");
  }
});

test("GitHub REST omission of an empty classic bypass allowance is accepted", () => {
  const transition = githubTransition("claim");
  const authority = githubAuthorityFixture(transition);
  delete authority.protection.required_pull_request_reviews
    .bypass_pull_request_allowances;

  const result = validateGitHubReleaseAuthority(authority, transition);
  assert.equal(result.repository, TEST_RELEASE_REPOSITORY);
  assert.equal(result.transition, "claim");
  assert.equal(result.status, "protected");
});

test("credential-free resume authority binds the exact claim merge and remote head", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  let remoteReads = 0;
  const transition = githubTransition("claim");
  const result = runAuthority({
    root: fixture.root,
    githubAuthority: githubAuthorityFixture(transition),
    execFile(_file, args) {
      if (args[0] === "rev-parse" && args[1] === "HEAD") {
        return `${transition.currentHead}\n`;
      }
      if (args[0] === "rev-parse" && args[1] === "HEAD^{tree}") {
        return `${transition.currentTree}\n`;
      }
      if (args[0] === "ls-remote") {
        remoteReads += 1;
        return `${transition.currentHead}\trefs/heads/main\n`;
      }
      if (args[0] === "rev-list") {
        return `${transition.currentHead} ${transition.baseHead}\n`;
      }
      if (args[0] === "diff") return "config/release-plan.json\n";
      throw new Error("unexpected-git-command");
    },
  });
  assert.equal(result.status, "protected");
  assert.equal(result.transition, "claim");
  assert.equal(remoteReads, 2);
});

test("external authority head drift fails before OIDC or publish admission", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const transition = githubTransition("claim");
  let remoteReads = 0;
  let oidcStarts = 0;
  let publishCalls = 0;
  assertCode(() => {
    runAuthority({
      root: fixture.root,
      githubAuthority: githubAuthorityFixture(transition),
      execFile(_file, args) {
        if (args[0] === "rev-parse" && args[1] === "HEAD") {
          return `${transition.currentHead}\n`;
        }
        if (args[0] === "rev-parse" && args[1] === "HEAD^{tree}") {
          return `${transition.currentTree}\n`;
        }
        if (args[0] === "ls-remote") {
          remoteReads += 1;
          const head =
            remoteReads === 1 ? transition.currentHead : "7".repeat(40);
          return `${head}\trefs/heads/main\n`;
        }
        if (args[0] === "rev-list") {
          return `${transition.currentHead} ${transition.baseHead}\n`;
        }
        if (args[0] === "diff") return "config/release-plan.json\n";
        throw new Error("unexpected-git-command");
      },
    });
    oidcStarts += 1;
    publishCalls += 1;
  }, "external-policy-blocked");
  assert.equal(remoteReads, 2);
  assert.equal(oidcStarts, 0);
  assert.equal(publishCalls, 0);
});

test("direct publish rejects the current unprotected authority before npm", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const options = publishingOptions(fixture, () => {
    assert.fail("npm must not execute");
  });
  options.githubAuthority.protection = null;
  options.githubAuthority.rules = [];
  options.githubAuthority.actions.can_approve_pull_request_reviews = true;
  assertCode(() => runPublish(options), "external-policy-blocked");
});

test("direct publish with no dedicated policy credential reaches no artifact or npm boundary", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  let artifactOrNpmCalls = 0;
  let githubCalls = 0;
  const options = publishingOptions(fixture, () => {
    artifactOrNpmCalls += 1;
    return "";
  });
  delete options.githubAuthority;
  options.policyToken = "";
  options.githubExecFile = () => {
    githubCalls += 1;
    return "{}";
  };
  assertCode(() => runPublish(options), "policy-credential-unavailable");
  assert.equal(githubCalls, 0);
  assert.equal(artifactOrNpmCalls, 0);
});

test("fixed GitHub reader binds the exact policy and transition endpoints", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const transition = githubTransition("claim");
  const authority = githubAuthorityFixture(transition);
  const responses = new Map([
    [
      "repos/HUA-Labs/hua-packages/branches/main/protection",
      authority.protection,
    ],
    ["repos/HUA-Labs/hua-packages/rules/branches/main", authority.rules],
    [
      "repos/HUA-Labs/hua-packages/rulesets?includes_parents=true&per_page=100",
      [],
    ],
    [
      "repos/HUA-Labs/hua-packages/actions/permissions/workflow",
      authority.actions,
    ],
    [
      `repos/HUA-Labs/hua-packages/commits/${transition.currentHead}/pulls?per_page=100`,
      authority.associations,
    ],
    ["repos/HUA-Labs/hua-packages/pulls/17", authority.pullRequest],
    [
      "repos/HUA-Labs/hua-packages/pulls/17/reviews?per_page=100",
      authority.reviews,
    ],
    [
      `repos/HUA-Labs/hua-packages/git/commits/${authority.pullRequest.head.sha}`,
      authority.headCommit,
    ],
  ]);
  const endpoints = [];
  const result = runAuthority({
    root: fixture.root,
    policyToken: "bounded-test-token",
    githubExecFile(file, args, options) {
      assert.equal(file, "/usr/bin/gh");
      assert.equal(options.env.GH_HOST, "github.com");
      assert.equal(options.env.GH_TOKEN, "bounded-test-token");
      const endpoint = args.at(-1);
      endpoints.push(endpoint);
      assert.equal(responses.has(endpoint), true);
      return JSON.stringify(responses.get(endpoint));
    },
    execFile(_file, args) {
      if (args[0] === "rev-parse" && args[1] === "HEAD") {
        return `${transition.currentHead}\n`;
      }
      if (args[0] === "rev-parse" && args[1] === "HEAD^{tree}") {
        return `${transition.currentTree}\n`;
      }
      if (args[0] === "ls-remote") {
        return `${transition.currentHead}\trefs/heads/main\n`;
      }
      if (args[0] === "rev-list") {
        return `${transition.currentHead} ${transition.baseHead}\n`;
      }
      if (args[0] === "diff") return "config/release-plan.json\n";
      throw new Error("unexpected-git-command");
    },
  });
  assert.equal(result.status, "protected");
  assert.deepEqual(endpoints, [...responses.keys()]);
});

test("GitHub protection 404 collapses to one bounded blocked result", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const transition = githubTransition("claim");
  let githubCalls = 0;
  assertCode(
    () =>
      runAuthority({
        root: fixture.root,
        policyToken: "bounded-test-token",
        githubExecFile() {
          githubCalls += 1;
          throw new Error("raw 404 body must not escape");
        },
        execFile(_file, args) {
          if (args[0] === "rev-parse" && args[1] === "HEAD") {
            return `${transition.currentHead}\n`;
          }
          if (args[0] === "rev-parse" && args[1] === "HEAD^{tree}") {
            return `${transition.currentTree}\n`;
          }
          if (args[0] === "ls-remote") {
            return `${transition.currentHead}\trefs/heads/main\n`;
          }
          if (args[0] === "rev-list") {
            return `${transition.currentHead} ${transition.baseHead}\n`;
          }
          if (args[0] === "diff") return "config/release-plan.json\n";
          throw new Error("unexpected-git-command");
        },
      }),
    "external-policy-blocked",
  );
  assert.equal(githubCalls, 1);
});

test("credential-free authority detects and binds an exact closure merge", (t) => {
  const initialized = initializeGitFixture(
    t,
    createPublishingFixture(),
    "seed publishing release",
  );
  const { fixture, sourceHead } = initialized;
  const empty = createEmptyReleasePlan(loadPolicy(fixture.root));
  writeFileSync(
    join(fixture.root, "config/release-plan.json"),
    canonicalJson(empty),
  );
  git(fixture.root, ["add", "config/release-plan.json"]);
  git(fixture.root, ["commit", "-m", "close exact release plan"]);
  git(fixture.root, ["push", "origin", "main"]);
  const currentHead = git(fixture.root, ["rev-parse", "HEAD"]);
  const currentTree = git(fixture.root, ["rev-parse", "HEAD^{tree}"]);
  const transition = {
    kind: "close",
    baseHead: sourceHead,
    currentHead,
    currentTree,
    expectedBranch: `release/close-${sourceHead.slice(0, 12)}`,
  };
  const result = runAuthority({
    root: fixture.root,
    githubAuthority: githubAuthorityFixture(transition),
  });
  assert.equal(result.status, "protected");
  assert.equal(result.transition, "close");
});

test("planned claim creates a reviewed transition branch without moving protected main", (t) => {
  const { fixture, remote, sourceHead } = createGitPlannedFixture(t);
  const claim = { branch: "main", runId: "7654320", sourceHead };
  createTestArtifactBundle(fixture, claim);
  const claimed = runClaim({
    root: fixture.root,
    artifactManifestPath: fixture.artifactManifestPath,
    ...claim,
  });
  assert.equal(git(remote, ["rev-parse", "refs/heads/main"]), sourceHead);
  assert.match(claimed.transitionBranch, /^release\/claim-[0-9a-f]{12}$/);
  assert.equal(
    git(remote, ["rev-parse", `refs/heads/${claimed.transitionBranch}`]),
    claimed.claimHead,
  );
});

test("no-OIDC prepare check rejects a later main commit before publish job admission", (t) => {
  const { fixture, remote, sourceHead } = createGitPlannedFixture(t);
  const claim = { branch: "main", runId: "7654324", sourceHead };
  createTestArtifactBundle(fixture, claim);
  const claimed = runClaim({
    root: fixture.root,
    artifactManifestPath: fixture.artifactManifestPath,
    ...claim,
  });
  mergeReviewedTransition(remote, sourceHead, claimed.claimHead);
  writeFileSync(join(fixture.root, "unrelated.md"), "unrelated main drift\n");
  git(fixture.root, ["add", "unrelated.md"]);
  git(fixture.root, ["commit", "-m", "docs: unrelated main drift"]);
  git(fixture.root, ["push", "origin", "HEAD:refs/heads/main"]);
  let oidcPublishJobs = 0;
  assertCode(() => {
    runCheck({ root: fixture.root });
    oidcPublishJobs += 1;
  }, "publish-claim-topology");
  assert.equal(oidcPublishJobs, 0);
});

test("planned merge claim and provenance closure are durable exact Git transitions", async (t) => {
  const { fixture, remote, remoteRoot, sourceHead } =
    createGitPlannedFixture(t);
  const claim = { branch: "main", runId: "7654321", sourceHead };
  createTestArtifactBundle(fixture, claim);
  const workflowSequence = [];
  let refreshCalls = 0;
  let changesetsActionCalls = 0;
  workflowSequence.push("preflight");
  const preflight = loadReleaseState(fixture.root).plan;
  if (preflight.status === "empty") {
    refreshCalls += 1;
    runRefresh({ root: fixture.root });
    changesetsActionCalls += 1;
  }
  workflowSequence.push("validate");
  assert.equal(loadReleaseState(fixture.root).plan.status, "planned");
  workflowSequence.push("claim");
  const claimed = runClaim({
    root: fixture.root,
    artifactManifestPath: fixture.artifactManifestPath,
    ...claim,
  });
  workflowSequence.push("open-claim-pr");
  assert.equal(git(remote, ["rev-parse", "refs/heads/main"]), sourceHead);
  assert.equal(
    git(remote, ["rev-parse", `refs/heads/${claimed.transitionBranch}`]),
    claimed.claimHead,
  );
  mergeReviewedTransition(remote, sourceHead, claimed.claimHead);
  workflowSequence.push("claim-pr-merge");
  fixture.claimHead = claimed.claimHead;
  workflowSequence.push("publishing-run");
  workflowSequence.push("publish");
  assert.deepEqual(workflowSequence, [
    "preflight",
    "validate",
    "claim",
    "open-claim-pr",
    "claim-pr-merge",
    "publishing-run",
    "publish",
  ]);
  assert.equal(refreshCalls, 0);
  assert.equal(changesetsActionCalls, 0);
  assert.equal(loadReleaseState(fixture.root).plan.status, "publishing");
  assert.equal(
    git(remote, ["rev-parse", "refs/heads/main"]),
    claimed.claimHead,
  );

  const published = runPublish(
    publishingOptions(fixture, () => {
      return "";
    }),
  );
  const publishedPath = join(remoteRoot, "published.json");
  writeFileSync(publishedPath, canonicalJson(published));
  const result = await checkPublishedProvenance({
    root: fixture.root,
    publishedPath,
    closePlan: true,
    persistence: { ...claim, claimHead: claimed.claimHead },
    attempts: 1,
    delayMs: 0,
    execFile() {
      return JSON.stringify({
        provenance: { predicateType: "https://slsa.dev/provenance/v1" },
      });
    },
  });
  workflowSequence.push("provenance");
  assert.equal(result.releasePlanClosure.status, "empty");
  assert.equal(loadReleaseState(fixture.root).plan.status, "empty");
  assert.equal(
    git(remote, [
      "rev-parse",
      `refs/heads/${result.releasePlanClosure.transitionBranch}`,
    ]),
    result.releasePlanClosure.head,
  );
  assert.equal(
    git(remote, ["rev-parse", "refs/heads/main"]),
    claimed.claimHead,
  );
  workflowSequence.push("open-close-pr");
  mergeReviewedTransition(
    remote,
    claimed.claimHead,
    result.releasePlanClosure.head,
  );
  workflowSequence.push("close-pr-merge");
  assert.equal(runPreflight({ root: fixture.root }).plan.status, "empty");
  workflowSequence.push("empty-follow-up");
  let publishCalls = 0;
  assertCode(
    () =>
      runPublish({
        root: fixture.root,
        ...claim,
        execFile() {
          publishCalls += 1;
        },
      }),
    "plan-empty",
  );
  assert.equal(publishCalls, 0);
  assert.deepEqual(workflowSequence.slice(-4), [
    "provenance",
    "open-close-pr",
    "close-pr-merge",
    "empty-follow-up",
  ]);
});

test("parsed workflow executes reviewed version, claim, publish, closure, and empty follow-up lifecycle", async (t) => {
  const workflow = parseDocument(
    readFileSync(join(CURRENT_ROOT, ".github/workflows/release.yml"), "utf8"),
    { uniqueKeys: true },
  ).toJS();
  const prepareNames = workflow.jobs.prepare.steps.map((step) => step.name);
  const expectedPrepareOrder = [
    "Read durable release plan state",
    "Refresh verified empty release snapshot",
    "Create or update version PR without npm credentials",
    "Validate durable exact release plan",
    "Prepare and verify exact release artifacts",
    "Upload exact verified artifacts",
    "Claim exact artifact-bound release",
    "Open reviewed claim transition PR",
  ];
  assert.deepEqual(
    prepareNames.filter((name) => expectedPrepareOrder.includes(name)),
    expectedPrepareOrder,
  );

  const fixture = makeFixture();
  const initialized = initializeGitFixture(
    t,
    fixture,
    "seed empty release authority",
  );
  const { remote, remoteRoot } = initialized;
  mutateJson(join(fixture.root, "packages/hua-ui/package.json"), (manifest) => {
    manifest.exports = { ".": "./dist/index.mjs" };
  });
  writeFileSync(
    join(fixture.root, ".changeset/ui-workflow-release.md"),
    '---\n"@hua-labs/ui": patch\n---\n\nWorkflow lifecycle fixture.\n',
  );
  git(fixture.root, ["add", "--all"]);
  git(fixture.root, ["commit", "-m", "feat(ui): reviewed manifest drift"]);
  git(fixture.root, ["push", "origin", "main"]);
  const reviewedHead = git(fixture.root, ["rev-parse", "HEAD"]);

  const emptyPreflight = runPreflight({ root: fixture.root });
  assert.equal(emptyPreflight.plan.status, "empty");
  assert.equal(emptyPreflight.refreshRequired, true);
  runRefresh({ root: fixture.root });
  const status = versionStatus("@hua-labs/ui", {
    id: "ui-workflow-release",
  });
  runVersionFixture(fixture, status);
  assert.equal(loadReleaseState(fixture.root).plan.status, "planned");
  git(fixture.root, ["add", "--all"]);
  git(fixture.root, ["commit", "-m", "chore: version packages"]);
  const versionHead = git(fixture.root, ["rev-parse", "HEAD"]);
  git(fixture.root, [
    "push",
    "origin",
    `${versionHead}:refs/heads/release/version-fixture`,
  ]);
  assert.equal(git(remote, ["rev-parse", "refs/heads/main"]), reviewedHead);
  mergeReviewedTransition(remote, reviewedHead, versionHead);

  const plannedPreflight = runPreflight({ root: fixture.root });
  assert.equal(plannedPreflight.plan.status, "planned");
  assert.equal(plannedPreflight.refreshRequired, false);
  const artifactDirectory = createExternalArtifactDirectory(fixture);
  const artifactCalls = [];
  const packed = runPack({
    root: fixture.root,
    artifactDirectory,
    branch: "main",
    runId: "7654323",
    sourceHead: versionHead,
    execFile: packExecFixture(artifactCalls),
  });
  fixture.artifactManifestPath = packed.artifactManifestPath;
  const claimed = runClaim({
    root: fixture.root,
    artifactManifestPath: packed.artifactManifestPath,
    branch: "main",
    runId: "7654323",
    sourceHead: versionHead,
  });
  assert.equal(git(remote, ["rev-parse", "refs/heads/main"]), versionHead);
  mergeReviewedTransition(remote, versionHead, claimed.claimHead);
  fixture.claimHead = claimed.claimHead;
  fixture.claim = loadReleaseState(fixture.root).plan.claim;
  assert.equal(runCheck({ root: fixture.root }).plan.status, "publishing");

  let publishCalls = 0;
  const publishTransition = {
    kind: "claim",
    baseHead: versionHead,
    currentHead: claimed.claimHead,
    currentTree: git(fixture.root, ["rev-parse", "HEAD^{tree}"]),
    expectedBranch: `release/claim-${versionHead.slice(0, 12)}`,
  };
  const published = runPublish({
    root: fixture.root,
    artifactManifestPath: packed.artifactManifestPath,
    claimHead: claimed.claimHead,
    githubAuthority: githubAuthorityFixture(publishTransition),
    registryAttempts: 2,
    registryObserver({ phase }) {
      return { status: phase === "before" ? "absent" : "verified" };
    },
    installedConsumerVerifier() {},
    sleep() {},
    ...fixture.claim,
    execFile(file, args, options) {
      if (file === "tar") return execFileSync(file, args, options);
      assert.equal(file, "npm");
      publishCalls += 1;
      return "";
    },
  });
  assert.equal(publishCalls, 1);
  const publishedPath = join(remoteRoot, "workflow-published.json");
  writeFileSync(publishedPath, canonicalJson(published));
  const closure = await checkPublishedProvenance({
    root: fixture.root,
    publishedPath,
    closePlan: true,
    persistence: {
      branch: "main",
      runId: "7654323",
      sourceHead: versionHead,
      claimHead: claimed.claimHead,
    },
    attempts: 1,
    delayMs: 0,
    execFile() {
      return JSON.stringify({
        provenance: { predicateType: "https://slsa.dev/provenance/v1" },
      });
    },
  });
  assert.equal(
    git(remote, ["rev-parse", "refs/heads/main"]),
    claimed.claimHead,
  );
  mergeReviewedTransition(
    remote,
    claimed.claimHead,
    closure.releasePlanClosure.head,
  );
  const followUp = runPreflight({ root: fixture.root });
  assert.equal(followUp.plan.status, "empty");
  assert.equal(followUp.refreshRequired, false);
  let repeatedPublishCalls = 0;
  assertCode(
    () =>
      runPublish({
        root: fixture.root,
        execFile() {
          repeatedPublishCalls += 1;
        },
      }),
    "plan-empty",
  );
  assert.equal(repeatedPublishCalls, 0);
});

test("closure remote drift preserves the publishing authority and cannot republish", async (t) => {
  const { fixture, remote, remoteRoot, sourceHead } =
    createGitPlannedFixture(t);
  const claim = { branch: "main", runId: "7654322", sourceHead };
  createTestArtifactBundle(fixture, claim);
  const claimed = runClaim({
    root: fixture.root,
    artifactManifestPath: fixture.artifactManifestPath,
    ...claim,
  });
  fixture.claimHead = claimed.claimHead;
  mergeReviewedTransition(remote, sourceHead, claimed.claimHead);
  const tree = git(fixture.root, ["rev-parse", `${claimed.claimHead}^{tree}`]);
  const driftHead = git(fixture.root, [
    "commit-tree",
    tree,
    "-p",
    claimed.claimHead,
    "-m",
    "concurrent remote drift",
  ]);
  git(fixture.root, ["push", "origin", `${driftHead}:refs/heads/main`]);

  const publishedPath = join(remoteRoot, "published.json");
  writeFileSync(
    publishedPath,
    canonicalJson({
      schemaVersion: 1,
      publishedPackages: [{ name: "@hua-labs/ui", version: "2.3.1" }],
    }),
  );
  await assert.rejects(
    checkPublishedProvenance({
      root: fixture.root,
      publishedPath,
      closePlan: true,
      persistence: { ...claim, claimHead: claimed.claimHead },
      attempts: 1,
      delayMs: 0,
      execFile() {
        return JSON.stringify({
          provenance: { predicateType: "https://slsa.dev/provenance/v1" },
        });
      },
    }),
    (error) => error?.code === "release-remote-head-drift",
  );
  assert.equal(git(remote, ["rev-parse", "refs/heads/main"]), driftHead);

  git(fixture.root, ["reset", "--hard", driftHead]);
  assert.equal(loadReleaseState(fixture.root).plan.status, "publishing");
  let publishCalls = 0;
  assertCode(
    () =>
      runPublish({
        root: fixture.root,
        branch: "main",
        runId: claim.runId,
        sourceHead: driftHead,
        execFile() {
          publishCalls += 1;
        },
      }),
    "publish-claim-owner",
  );
  assert.equal(publishCalls, 0);
});

test("strict JSON rejects malformed authority before schema projection", async (t) => {
  const cases = [
    [
      "duplicate",
      Buffer.from('{"schemaVersion":1,"schemaVersion":1}'),
      "policy-duplicate-key",
      64,
    ],
    ["prototype", Buffer.from('{"__proto__":{}}'), "policy-prototype-key", 64],
    ["control", Buffer.from('{"value":"bad\\nvalue"}'), "policy-control", 64],
    [
      "invalid UTF-8",
      Buffer.from([0x7b, 0x22, 0x78, 0x22, 0x3a, 0xc3, 0x28, 0x7d]),
      "policy-invalid-utf8",
      64,
    ],
    ["oversize", Buffer.alloc(33, 0x20), "policy-oversize", 32],
  ];
  for (const [name, bytes, code, maxBytes] of cases) {
    await t.test(name, () => {
      assertCode(
        () => parseStrictJsonBytes(bytes, { maxBytes, label: "policy" }),
        code,
      );
    });
  }
});

test("policy rejects old, future, unknown, malformed, and normalized-collision authority", async (t) => {
  const base = policyFor();
  const cases = [
    ["null", null, "policy-shape"],
    ["old schema", { ...base, schemaVersion: 0 }, "policy-schema-version"],
    ["future schema", { ...base, schemaVersion: 2 }, "policy-schema-version"],
    ["unknown key", { ...base, unexpected: true }, "policy-shape"],
    [
      "wrong authority",
      {
        ...base,
        platformAuthority: {
          ...base.platformAuthority,
          commit: "a".repeat(40),
        },
      },
      "policy-authority-commit",
    ],
    [
      "bad eligibility",
      {
        ...base,
        packages: base.packages.map((entry, index) =>
          index === 0 ? { ...entry, eligibility: "blocked" } : entry,
        ),
      },
      "policy-package-eligibility",
    ],
    [
      "duplicate identity",
      {
        ...base,
        packages: [...base.packages, structuredClone(base.packages.at(-1))],
      },
      "policy-package-order",
    ],
    [
      "case path collision",
      {
        ...base,
        packages: base.packages.map((entry, index) =>
          index === 1 ? { ...entry, path: "packages/HUA-DOT" } : entry,
        ),
      },
      "policy-package-path",
    ],
  ];
  for (const [name, value, code] of cases) {
    await t.test(name, () => assertCode(() => validatePolicy(value), code));
  }
});

test("canonical serialization is object-order and locale independent", () => {
  const first = { z: ["é", "é", "😀"], a: { y: 2, x: 1 } };
  const second = { a: { x: 1, y: 2 }, z: ["é", "é", "😀"] };
  assert.equal(canonicalJson(first), canonicalJson(second));
  assert.equal(sha256(canonicalJson(first)), sha256(canonicalJson(second)));
});

test("empty and invalid plans execute zero publish commands", async (t) => {
  const empty = makeFixture();
  t.after(() => empty.cleanup());
  let calls = 0;
  assertCode(
    () =>
      runPublish({
        root: empty.root,
        execFile() {
          calls += 1;
        },
      }),
    "plan-empty",
  );
  assert.equal(calls, 0);

  const tampered = createPlannedFixture();
  t.after(() => tampered.cleanup());
  mutateJson(join(tampered.root, "config/release-plan.json"), (plan) => {
    plan.planDigest = "0".repeat(64);
  });
  assertCode(
    () =>
      runPublish({
        root: tampered.root,
        execFile() {
          calls += 1;
        },
      }),
    "plan-digest-mismatch",
  );
  assert.equal(calls, 0);
});

test("UI-only publish uses one exact immutable tarball and fixed execFile argv", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const calls = [];
  const published = runPublish(
    publishingOptions(fixture, (file, args, options) => {
      calls.push({ file, args, cwd: options.cwd });
      return "";
    }),
  );
  assert.deepEqual(published, {
    schemaVersion: 1,
    publishedPackages: [{ name: "@hua-labs/ui", version: "2.3.1" }],
  });
  assert.deepEqual(calls, [
    {
      file: "npm",
      args: [
        "publish",
        join(fixture.artifactManifestPath, "..", "hua-labs-ui-2.3.1.tgz"),
        "--ignore-scripts",
        "--access",
        "public",
        "--provenance",
      ],
      cwd: fixture.root,
    },
  ]);
});

test("default registry and disposable installed-consumer gates bind immutable bytes without leaking raw errors", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const artifactPath = join(
    fixture.artifactManifestPath,
    "..",
    "hua-labs-ui-2.3.1.tgz",
  );
  const integrity = `sha512-${createHash("sha512")
    .update(readFileSync(artifactPath))
    .digest("base64")}`;
  const events = [];
  let viewCalls = 0;
  let consumerRoot;
  const options = publishingOptions(fixture, (file, args, commandOptions) => {
    assert.equal(file, "npm");
    if (args[0] === "view") {
      viewCalls += 1;
      events.push(`view:${viewCalls}`);
      if (viewCalls === 1) {
        const error = new Error("private registry details");
        error.code = "E404";
        error.stderr = "secret-registry-body";
        throw error;
      }
      return JSON.stringify({
        name: "@hua-labs/ui",
        version: "2.3.1",
        "dist.integrity": integrity,
        "dist.attestations.provenance.predicateType":
          "https://slsa.dev/provenance/v1",
      });
    }
    if (args[0] === "publish") {
      events.push("publish");
      return "";
    }
    if (args[0] === "install") {
      consumerRoot = commandOptions.cwd;
      events.push("install");
      const installedRoot = join(consumerRoot, "node_modules/@hua-labs/ui");
      mkdirSync(installedRoot, { recursive: true });
      writeFileSync(
        join(installedRoot, "package.json"),
        canonicalJson({ name: "@hua-labs/ui", version: "2.3.1" }),
      );
      return "";
    }
    if (args[0] === "ls") {
      assert.deepEqual(args, [
        "ls",
        "@hua-labs/dot@0.2.2",
        "--json",
        "--depth=Infinity",
      ]);
      events.push("ls:@hua-labs/dot@0.2.2");
      return "{}";
    }
    throw new Error("unexpected npm command");
  });
  delete options.registryObserver;
  delete options.installedConsumerVerifier;
  const published = runPublish(options);
  assert.deepEqual(published.publishedPackages, [
    { name: "@hua-labs/ui", version: "2.3.1" },
  ]);
  assert.deepEqual(events, [
    "view:1",
    "publish",
    "view:2",
    "install",
    "ls:@hua-labs/dot@0.2.2",
  ]);
  assert.equal(existsSync(consumerRoot), false);

  const conflict = createPublishingFixture();
  try {
    const conflictOptions = publishingOptions(conflict, (file, args) => {
      assert.equal(file, "npm");
      assert.equal(args[0], "view");
      return JSON.stringify({
        name: "@hua-labs/ui",
        version: "2.3.1",
        "dist.integrity": "sha512-conflicting-immutable-bytes",
        "dist.attestations.provenance.predicateType":
          "https://slsa.dev/provenance/v1",
      });
    });
    delete conflictOptions.registryObserver;
    delete conflictOptions.installedConsumerVerifier;
    assertCode(
      () => runPublish(conflictOptions),
      "publish-registry-immutable-conflict",
    );
  } finally {
    conflict.cleanup();
  }

  const unavailable = createPublishingFixture();
  try {
    const unavailableOptions = publishingOptions(unavailable, (file, args) => {
      assert.equal(file, "npm");
      assert.equal(args[0], "view");
      const error = new Error("private registry hostname and response body");
      error.stderr = "ETIMEDOUT https://private.example.invalid/token=secret";
      throw error;
    });
    delete unavailableOptions.registryObserver;
    delete unavailableOptions.installedConsumerVerifier;
    unavailableOptions.registryAttempts = 1;
    assert.throws(
      () => runPublish(unavailableOptions),
      (error) => {
        assert.equal(error?.code, "publish-registry-unverified");
        assert.equal(error?.message, "publish-registry-unverified");
        assert.doesNotMatch(error?.message ?? "", /private|secret|token/u);
        return true;
      },
    );
  } finally {
    unavailable.cleanup();
  }
});

test("explicit UI and Motion publish is exact while Dot is never inferred", (t) => {
  const fixture = createPublishingFixture([
    "@hua-labs/motion-core",
    "@hua-labs/ui",
  ]);
  t.after(() => fixture.cleanup());
  const directories = [];
  const result = runPublish(
    publishingOptions(fixture, (_file, _args, options) => {
      directories.push(options.cwd);
      return "";
    }),
  );
  assert.deepEqual(
    result.publishedPackages.map((entry) => entry.name),
    ["@hua-labs/motion-core", "@hua-labs/ui"],
  );
  assert.equal(
    directories.some((path) => path.endsWith("hua-dot")),
    false,
  );
});

test("packed artifacts reject mutable internal dependency specifiers before npm", async (t) => {
  const activePublic = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const definitions = [
    {
      name: "@hua-labs/base",
      path: "packages/base",
      version: "1.0.0",
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@hua-labs/dependent",
      path: "packages/dependent",
      version: "1.0.0",
      dependencies: { "@hua-labs/base": "workspace:1.0.0" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  for (const dependencySpec of ["latest", "^1.0.1"]) {
    await t.test(dependencySpec, () => {
      const fixture = createPublishingFixture(
        ["@hua-labs/base", "@hua-labs/dependent"],
        definitions,
        { dependencySpec },
      );
      try {
        let npmCalls = 0;
        assertCode(
          () =>
            runPublish(
              publishingOptions(fixture, () => {
                npmCalls += 1;
                return "";
              }),
            ),
          "artifact-package-dependency-version",
        );
        assert.equal(npmCalls, 0);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("an internal package name cannot evade exactness with a non-workspace source specifier", (t) => {
  const activePublic = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const definitions = [
    {
      name: "@hua-labs/base",
      path: "packages/base",
      version: "1.0.0",
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@hua-labs/dependent",
      path: "packages/dependent",
      version: "1.0.0",
      dependencies: { "@hua-labs/base": "latest" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPublishingFixture(
    ["@hua-labs/base", "@hua-labs/dependent"],
    definitions,
  );
  t.after(() => fixture.cleanup());
  let npmCalls = 0;

  assertCode(
    () =>
      runPublish(
        publishingOptions(fixture, () => {
          npmCalls += 1;
          return "";
        }),
      ),
    "artifact-package-dependency-version",
  );
  assert.equal(npmCalls, 0);
});

test("unselected workspace dependencies stay exact at their current version", (t) => {
  const activePublic = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const definitions = [
    {
      name: "@hua-labs/base",
      path: "packages/base",
      version: "1.0.0",
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@hua-labs/dependent",
      path: "packages/dependent",
      version: "1.0.0",
      dependencies: { "@hua-labs/base": "workspace:1.0.0" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPublishingFixture(["@hua-labs/dependent"], definitions);
  t.after(() => fixture.cleanup());
  const dependencies = [];
  const options = publishingOptions(fixture, () => "");
  options.installedConsumerVerifier = (input) => {
    dependencies.push(input.dependencies);
  };

  runPublish(options);

  assert.deepEqual(dependencies, [
    [{ name: "@hua-labs/base", version: "1.0.0" }],
  ]);
});

test("tarball byte or manifest SHA substitution fails before npm and lifecycle execution", async (t) => {
  await t.test("tarball bytes", () => {
    const fixture = createPublishingFixture();
    try {
      const manifest = JSON.parse(
        readFileSync(fixture.artifactManifestPath, "utf8"),
      );
      const artifactPath = join(
        fixture.artifactManifestPath,
        "..",
        manifest.artifacts[0].file,
      );
      writeFileSync(
        artifactPath,
        Buffer.concat([readFileSync(artifactPath), Buffer.from("x")]),
      );
      let executionCalls = 0;
      assertCode(
        () =>
          runPublish(
            publishingOptions(fixture, () => {
              executionCalls += 1;
            }),
          ),
        "artifact-byte-count",
      );
      assert.equal(executionCalls, 0);
    } finally {
      fixture.cleanup();
    }
  });

  await t.test("manifest digest", () => {
    const fixture = createPublishingFixture();
    try {
      mutateJson(fixture.artifactManifestPath, (manifest) => {
        manifest.artifacts[0].sha256 = "0".repeat(64);
      });
      let executionCalls = 0;
      assertCode(
        () =>
          runPublish(
            publishingOptions(fixture, () => {
              executionCalls += 1;
            }),
          ),
        "artifact-manifest-sha256",
      );
      assert.equal(executionCalls, 0);
    } finally {
      fixture.cleanup();
    }
  });
});

test("publish verifies the exact local and remote pushed claim head before npm", async (t) => {
  for (const [name, localHead, remoteHead, code] of [
    [
      "local drift",
      "d".repeat(40),
      "c".repeat(40),
      "publish-local-claim-head-drift",
    ],
    [
      "remote drift",
      "c".repeat(40),
      "d".repeat(40),
      "release-remote-head-drift",
    ],
  ]) {
    await t.test(name, () => {
      const fixture = createPublishingFixture();
      try {
        let npmCalls = 0;
        const options = publishingOptions(fixture, () => {
          npmCalls += 1;
        });
        options.gitExecFile = (_file, args) => {
          if (args[0] === "rev-parse") return `${localHead}\n`;
          if (args[0] === "ls-remote") {
            return `${remoteHead}\trefs/heads/main\n`;
          }
          throw new Error("unexpected-git-command");
        };
        assertCode(() => runPublish(options), code);
        assert.equal(npmCalls, 0);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("publish rejects non-reviewed claim topology or non-plan scope before npm", async (t) => {
  for (const [name, topology, scope, code] of [
    [
      "wrong parent",
      `${"c".repeat(40)} ${"e".repeat(40)}\n`,
      "config/release-plan.json\n",
      "publish-claim-topology",
    ],
    [
      "extra scope",
      `${"c".repeat(40)} ${TEST_CLAIM.sourceHead}\n`,
      "config/release-plan.json\npackages/hua-ui/package.json\n",
      "publish-claim-scope",
    ],
  ]) {
    await t.test(name, () => {
      const fixture = createPublishingFixture();
      try {
        let npmCalls = 0;
        const options = publishingOptions(fixture, () => {
          npmCalls += 1;
        });
        options.gitExecFile = (_file, args) => {
          if (args[0] === "rev-parse") return `${fixture.claimHead}\n`;
          if (args[0] === "ls-remote") {
            return `${fixture.claimHead}\trefs/heads/main\n`;
          }
          if (args[0] === "rev-list") return topology;
          if (args[0] === "diff") return scope;
          throw new Error("unexpected-git-command");
        };
        assertCode(() => runPublish(options), code);
        assert.equal(npmCalls, 0);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("held and never-publish packages fail before publish", async (t) => {
  for (const name of ["@hua-labs/hua", "@hua-labs/security"]) {
    await t.test(name, () => {
      const fixture = createPlannedFixture([name]);
      try {
        let calls = 0;
        assertCode(
          () =>
            runPublish({
              root: fixture.root,
              execFile() {
                calls += 1;
              },
            }),
          "plan-release-ineligible",
        );
        assert.equal(calls, 0);
      } finally {
        fixture.cleanup();
      }
    });
  }
  for (const [label, release, reason] of [
    [
      "pending",
      {
        mode: "no-publish",
        intent: "channel-pending",
        authority: "unresolved",
        channel: "pending",
      },
      "channel-pending",
    ],
    [
      "wrong authority",
      {
        mode: "private-workspace",
        intent: "active-public",
        authority: "none",
        channel: "none",
      },
      "wrong-authority",
    ],
  ]) {
    await t.test(label, () => {
      const definitions = structuredClone(packageDefinitions);
      const ui = definitions.find((entry) => entry.name === "@hua-labs/ui");
      ui.release = release;
      ui.eligibility = "blocked";
      ui.reason = reason;
      const fixture = createPlannedFixture(["@hua-labs/ui"], definitions);
      try {
        let calls = 0;
        assertCode(
          () =>
            runPublish({
              root: fixture.root,
              execFile() {
                calls += 1;
              },
            }),
          "plan-release-ineligible",
        );
        assert.equal(calls, 0);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("alternate-authority no-publish package is selected and published only from hua-packages", (t) => {
  const fixture = createPublishingFixture(["@hua-labs/dot"]);
  t.after(() => fixture.cleanup());
  const calls = [];
  const published = runPublish(
    publishingOptions(fixture, (file, args) => {
      calls.push({ file, args });
      return "";
    }),
  );
  assert.deepEqual(published.publishedPackages, [
    { name: "@hua-labs/dot", version: "0.2.3" },
  ]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].file, "npm");
  assert.equal(calls[0].args[0], "publish");
});

test("publish resumes exact registry bytes and releases selected dependencies before dependents", (t) => {
  const definitions = [
    {
      name: "@hua-labs/aaa-dependent",
      path: "packages/aaa-dependent",
      version: "1.0.0",
      dependencies: { "@hua-labs/z-base": "workspace:1.0.0" },
      release: {
        mode: "public-npm",
        intent: "active-public",
        authority: "hua-packages",
        channel: "npm-public",
      },
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@hua-labs/z-base",
      path: "packages/z-base",
      version: "1.0.0",
      release: {
        mode: "no-publish",
        intent: "active-public",
        authority: "hua-packages",
        channel: "npm-public",
      },
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPublishingFixture(
    ["@hua-labs/aaa-dependent", "@hua-labs/z-base"],
    definitions,
  );
  t.after(() => fixture.cleanup());
  const events = [];
  let dependentAfterChecks = 0;
  const options = publishingOptions(fixture, (_file, args) => {
    events.push(
      `publish:${args[1].includes("aaa-dependent") ? "dependent" : "base"}`,
    );
    return "";
  });
  options.registryAttempts = 3;
  options.registryObserver = ({ artifact, phase }) => {
    const role = artifact.name.endsWith("z-base") ? "base" : "dependent";
    events.push(`registry:${role}:${phase}`);
    if (role === "base") return { status: "verified" };
    if (phase === "before") return { status: "absent" };
    dependentAfterChecks += 1;
    return { status: dependentAfterChecks === 1 ? "pending" : "verified" };
  };
  options.installedConsumerVerifier = ({ artifact, dependencies }) => {
    const role = artifact.name.endsWith("z-base") ? "base" : "dependent";
    events.push(
      `install:${role}:${dependencies.map((entry) => entry.name).join(",")}`,
    );
  };
  const published = runPublish(options);
  assert.deepEqual(published.publishedPackages, [
    { name: "@hua-labs/aaa-dependent", version: "1.0.1" },
    { name: "@hua-labs/z-base", version: "1.0.1" },
  ]);
  assert.deepEqual(events, [
    "registry:base:before",
    "install:base:",
    "registry:dependent:before",
    "publish:dependent",
    "registry:dependent:after",
    "registry:dependent:after",
    "install:dependent:@hua-labs/z-base",
  ]);
});

test("current Dot family and UI cohort publishes in the operator-approved dependency sequence", (t) => {
  const activePublic = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const publicManifest = { access: "public", provenance: true };
  const definitions = [
    {
      name: "@hua-labs/dot",
      path: "packages/hua-dot",
      version: "0.2.2",
      release: { ...activePublic, mode: "no-publish" },
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/dot-aot",
      path: "packages/hua-dot-aot",
      version: "0.1.3",
      dependencies: { "@hua-labs/dot": "workspace:0.2.2" },
      release: { ...activePublic, mode: "no-publish" },
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/dot-lsp",
      path: "packages/hua-dot-lsp",
      version: "0.1.3",
      dependencies: { "@hua-labs/dot": "workspace:0.2.2" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/dot-mcp",
      path: "packages/hua-dot-mcp",
      version: "0.1.3",
      dependencies: { "@hua-labs/dot": "workspace:0.2.2" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
    {
      name: "@hua-labs/ui",
      path: "packages/hua-ui",
      version: "2.3.0",
      dependencies: { "@hua-labs/dot": "workspace:*" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: publicManifest,
    },
  ];
  const cohort = definitions.map(({ name }) => name);
  const fixture = createPublishingFixture(cohort, definitions);
  t.after(() => fixture.cleanup());
  const sequence = [];
  const options = publishingOptions(fixture, (_file, args) => {
    const artifact = args[1];
    const definition = [...definitions]
      .sort((left, right) => right.name.length - left.name.length)
      .find(({ name }) => artifact.includes(name.slice(1).replace("/", "-")));
    assert.notEqual(definition, undefined);
    sequence.push(`publish:${definition.name}`);
    return "";
  });
  options.registryObserver = ({ phase }) => {
    if (phase === "before") return { status: "absent" };
    return { status: "verified" };
  };
  options.installedConsumerVerifier = ({ artifact, dependencies }) => {
    sequence.push(`install:${artifact.name}`);
    const expectedDependencies =
      artifact.name === "@hua-labs/dot" ? [] : ["@hua-labs/dot"];
    assert.deepEqual(
      dependencies.map(({ name }) => name),
      expectedDependencies,
    );
  };

  runPublish(options);

  assert.deepEqual(sequence, [
    "publish:@hua-labs/dot",
    "install:@hua-labs/dot",
    "publish:@hua-labs/dot-aot",
    "install:@hua-labs/dot-aot",
    "publish:@hua-labs/dot-lsp",
    "install:@hua-labs/dot-lsp",
    "publish:@hua-labs/dot-mcp",
    "install:@hua-labs/dot-mcp",
    "publish:@hua-labs/ui",
    "install:@hua-labs/ui",
  ]);
});

test("default fresh consumer checks each workspace dependency at its exact version", (t) => {
  const activePublic = {
    mode: "public-npm",
    intent: "active-public",
    authority: "hua-packages",
    channel: "npm-public",
  };
  const definitions = [
    {
      name: "@hua-labs/base",
      path: "packages/base",
      version: "1.0.0",
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@hua-labs/dependent",
      path: "packages/dependent",
      version: "1.0.0",
      dependencies: { "@hua-labs/base": "workspace:1.0.0" },
      release: activePublic,
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  const fixture = createPublishingFixture(
    ["@hua-labs/base", "@hua-labs/dependent"],
    definitions,
  );
  t.after(() => fixture.cleanup());
  const events = [];
  const consumerRoots = [];
  const options = publishingOptions(fixture, (file, args, commandOptions) => {
    assert.equal(file, "npm");
    if (args[0] === "publish") {
      events.push(
        `publish:${args[1].includes("dependent") ? "dependent" : "base"}`,
      );
      return "";
    }
    if (args[0] === "install") {
      const name = args[1].startsWith("@hua-labs/dependent@")
        ? "@hua-labs/dependent"
        : "@hua-labs/base";
      events.push(`install:${name}`);
      consumerRoots.push(commandOptions.cwd);
      assert.equal(args.includes("--package-lock=false"), true);
      const installedRoot = join(
        commandOptions.cwd,
        "node_modules",
        ...name.split("/"),
      );
      mkdirSync(installedRoot, { recursive: true });
      writeFileSync(
        join(installedRoot, "package.json"),
        canonicalJson({ name, version: "1.0.1" }),
      );
      return "";
    }
    assert.deepEqual(args, [
      "ls",
      "@hua-labs/base@1.0.1",
      "--json",
      "--depth=Infinity",
    ]);
    events.push("ls:@hua-labs/base@1.0.1");
    return "{}";
  });
  options.registryObserver = ({ phase }) => ({
    status: phase === "before" ? "absent" : "verified",
  });
  delete options.installedConsumerVerifier;

  runPublish(options);

  assert.deepEqual(events, [
    "publish:base",
    "install:@hua-labs/base",
    "publish:dependent",
    "install:@hua-labs/dependent",
    "ls:@hua-labs/base@1.0.1",
  ]);
  assert.equal(consumerRoots.length, 2);
  for (const consumerRoot of consumerRoots) {
    assert.equal(existsSync(consumerRoot), false);
  }
});

test("publish stops before a dependent when registry or fresh-install verification fails", async (t) => {
  const definitions = [
    {
      name: "@hua-labs/base",
      path: "packages/base",
      version: "1.0.0",
      release: {
        mode: "public-npm",
        intent: "active-public",
        authority: "hua-packages",
        channel: "npm-public",
      },
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
    {
      name: "@hua-labs/dependent",
      path: "packages/dependent",
      version: "1.0.0",
      dependencies: { "@hua-labs/base": "workspace:1.0.0" },
      release: {
        mode: "public-npm",
        intent: "active-public",
        authority: "hua-packages",
        channel: "npm-public",
      },
      eligibility: "eligible",
      reason: "active-public",
      private: false,
      publishConfig: { access: "public", provenance: true },
    },
  ];
  for (const [label, failureCode, configure] of [
    [
      "registry",
      "publish-registry-unverified",
      (options) => {
        options.registryObserver = ({ phase }) => ({
          status: phase === "before" ? "absent" : "pending",
        });
      },
    ],
    [
      "install",
      "publish-consumer-install",
      (options) => {
        options.installedConsumerVerifier = () => {
          const error = new Error("private raw install output");
          error.code = "publish-consumer-install";
          throw error;
        };
      },
    ],
  ]) {
    await t.test(label, () => {
      const fixture = createPublishingFixture(
        ["@hua-labs/base", "@hua-labs/dependent"],
        definitions,
      );
      try {
        const published = [];
        const options = publishingOptions(fixture, (_file, args) => {
          published.push(args[1]);
          return "";
        });
        configure(options);
        assertCode(() => runPublish(options), failureCode);
        assert.equal(published.length, 1);
        assert.match(published[0], /base-1\.0\.1\.tgz$/);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("manifest and release-plan drift fail closed", async (t) => {
  const cases = [
    [
      "version",
      (path) =>
        mutateJson(path, (manifest) => {
          manifest.version = "2.3.2";
        }),
      "plan-workspace-drift",
    ],
    [
      "private",
      (path) =>
        mutateJson(path, (manifest) => {
          manifest.private = true;
        }),
      "policy-workspace-private",
    ],
    [
      "publish config",
      (path) =>
        mutateJson(path, (manifest) => {
          delete manifest.publishConfig;
        }),
      "policy-workspace-publish-config",
    ],
  ];
  for (const [name, mutate, code] of cases) {
    await t.test(name, () => {
      const fixture = createPlannedFixture();
      try {
        mutate(join(fixture.root, "packages/hua-ui/package.json"));
        assertCode(() => loadReleaseState(fixture.root), code);
        assertCode(() => runPreflight({ root: fixture.root }), code);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("plan rejects stale policy, inversion, duplicate, unknown, extra, and malformed fields", async (t) => {
  const cases = [
    [
      "policy",
      (plan) => {
        plan.policy.policySha256 = "0".repeat(64);
      },
      "plan-policy-sha256",
    ],
    [
      "inversion",
      (plan) => {
        plan.releases[0].toVersion = plan.releases[0].fromVersion;
      },
      "plan-release-order",
    ],
    [
      "duplicate",
      (plan) => {
        plan.releases.push(structuredClone(plan.releases[0]));
      },
      "plan-release-name-order",
    ],
    [
      "unknown",
      (plan) => {
        plan.releases[0].name = "@hua-labs/unknown";
      },
      "plan-release-unknown",
    ],
    [
      "extra field",
      (plan) => {
        plan.unexpected = true;
      },
      "plan-shape",
    ],
  ];
  for (const [name, mutate, code] of cases) {
    await t.test(name, () => {
      const fixture = createPlannedFixture();
      try {
        mutateJson(join(fixture.root, "config/release-plan.json"), mutate);
        assertCode(() => loadReleaseState(fixture.root), code);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("published provenance input must equal the complete exact release set", async (t) => {
  const fixture = createPlannedFixture([
    "@hua-labs/motion-core",
    "@hua-labs/ui",
  ]);
  t.after(() => fixture.cleanup());
  const state = loadReleaseState(fixture.root, { requireNonempty: true });
  const valid = {
    schemaVersion: 1,
    publishedPackages: [
      { name: "@hua-labs/motion-core", version: "2.4.3" },
      { name: "@hua-labs/ui", version: "2.3.1" },
    ],
  };
  assert.deepEqual(validatePublishedPackages(valid, state), valid);
  for (const [name, value] of [
    [
      "missing",
      { ...valid, publishedPackages: valid.publishedPackages.slice(1) },
    ],
    [
      "extra",
      {
        ...valid,
        publishedPackages: [
          ...valid.publishedPackages,
          { name: "@hua-labs/utils", version: "1.1.5" },
        ],
      },
    ],
    [
      "substituted",
      {
        ...valid,
        publishedPackages: [
          { name: "@hua-labs/motion-core", version: "2.4.4" },
          valid.publishedPackages[1],
        ],
      },
    ],
  ]) {
    await t.test(name, () =>
      assertCode(
        () => validatePublishedPackages(value, state),
        "published-package-set",
      ),
    );
  }
});

test("provenance queries only the exact published set and queries zero on mismatch", async (t) => {
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  const publishedPath = join(fixture.root, "published.json");
  writeFileSync(
    publishedPath,
    canonicalJson({
      schemaVersion: 1,
      publishedPackages: [{ name: "@hua-labs/ui", version: "2.3.1" }],
    }),
  );
  const calls = [];
  const result = await checkPublishedProvenance({
    root: fixture.root,
    publishedPath,
    attempts: 1,
    delayMs: 0,
    execFile(file, args, options) {
      calls.push({ file, args, cwd: options.cwd });
      return JSON.stringify({
        provenance: { predicateType: "https://slsa.dev/provenance/v1" },
      });
    },
  });
  assert.deepEqual(result.publishedPackages, [
    { name: "@hua-labs/ui", version: "2.3.1" },
  ]);
  assert.deepEqual(calls, [
    {
      file: "npm",
      args: ["view", "@hua-labs/ui@2.3.1", "dist.attestations", "--json"],
      cwd: fixture.root,
    },
  ]);

  writeFileSync(
    publishedPath,
    canonicalJson({ schemaVersion: 1, publishedPackages: [] }),
  );
  await assert.rejects(
    checkPublishedProvenance({
      root: fixture.root,
      publishedPath,
      attempts: 1,
      delayMs: 0,
      execFile() {
        calls.push("unexpected");
      },
    }),
    (error) => error?.code === "published-package-set",
  );
  assert.equal(calls.includes("unexpected"), false);
});

function versionStatus(name = "@hua-labs/ui", overrides = {}) {
  const definition = packageDefinitions.find((entry) => entry.name === name);
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(definition.version);
  const [major, minor, patch] = match.slice(1, 4).map(Number);
  const id = overrides.id ?? "ui-safe-release";
  return {
    changesets: overrides.changesets ?? [
      {
        id,
        summary: "Safe release fixture",
        releases: [{ name, type: "patch" }],
      },
    ],
    releases: overrides.releases ?? [
      {
        name,
        type: "patch",
        oldVersion: definition.version,
        changesets: [id],
        newVersion: definition.version.includes("-")
          ? `${major}.${minor}.${patch}`
          : `${major}.${minor}.${patch + 1}`,
      },
    ],
  };
}

function fivePackageVersionDefinitions() {
  const byName = new Map(
    packageDefinitions.map((definition) => [
      definition.name,
      structuredClone(definition),
    ]),
  );
  const publicPackage = (name, path, version) => ({
    name,
    path,
    version,
    dependencies: { "@hua-labs/dot": "workspace:0.2.2" },
    release: {
      mode: "public-npm",
      intent: "active-public",
      authority: "hua-packages",
      channel: "npm-public",
    },
    eligibility: "eligible",
    reason: "active-public",
    private: false,
    publishConfig: { access: "public", provenance: true },
  });
  return [
    byName.get("@hua-labs/dot"),
    {
      ...publicPackage("@hua-labs/dot-aot", "packages/hua-dot-aot", "0.1.3"),
      release: {
        mode: "no-publish",
        intent: "active-public",
        authority: "hua-packages",
        channel: "npm-public",
      },
    },
    publicPackage("@hua-labs/dot-lsp", "packages/hua-dot-lsp", "0.1.3"),
    publicPackage("@hua-labs/dot-mcp", "packages/hua-dot-mcp", "0.1.3"),
    byName.get("@hua-labs/hua"),
    byName.get("@hua-labs/security"),
    byName.get("@hua-labs/ui"),
  ];
}

function fivePackageVersionStatus() {
  const id = "five-package-release-cohort";
  const rows = [
    ["@hua-labs/dot", "minor", "0.2.2", "0.3.0"],
    ["@hua-labs/dot-aot", "minor", "0.1.3", "0.2.0"],
    ["@hua-labs/dot-lsp", "patch", "0.1.3", "0.1.4"],
    ["@hua-labs/dot-mcp", "minor", "0.1.3", "0.2.0"],
    ["@hua-labs/ui", "minor", "2.3.0", "2.4.0"],
  ];
  return {
    changesets: [
      {
        id,
        summary: "Dependency-ordered release cohort",
        releases: rows.map(([name, type]) => ({ name, type })),
      },
    ],
    releases: [
      ...rows.map(([name, type, oldVersion, newVersion]) => ({
        name,
        type,
        oldVersion,
        changesets: [id],
        newVersion,
      })),
      {
        name: "@hua-labs/hua",
        type: "none",
        oldVersion: "1.2.2",
        changesets: [],
        newVersion: "1.2.2",
      },
    ],
  };
}

function createFivePackageVersionFixture(options = {}) {
  const definitions = fivePackageVersionDefinitions();
  if (options.dotSpecifier !== undefined) {
    for (const definition of definitions) {
      if (definition.dependencies?.["@hua-labs/dot"] !== undefined) {
        definition.dependencies["@hua-labs/dot"] = options.dotSpecifier;
      }
    }
  }
  const fixture = makeFixture({ definitions });
  writeFileSync(
    join(fixture.root, ".changeset/five-package-release-cohort.md"),
    '---\n"@hua-labs/dot": minor\n"@hua-labs/dot-aot": minor\n"@hua-labs/dot-lsp": patch\n"@hua-labs/dot-mcp": minor\n"@hua-labs/ui": minor\n---\n\nDependency-ordered release cohort.\n',
  );
  return fixture;
}

function setFivePackageDotDependency(root, specifier) {
  for (const path of [
    "packages/hua-dot-aot/package.json",
    "packages/hua-dot-lsp/package.json",
    "packages/hua-dot-mcp/package.json",
  ]) {
    mutateJson(join(root, path), (manifest) => {
      manifest.dependencies["@hua-labs/dot"] = specifier;
    });
  }
}

function applyFivePackageDependencyVersions(root) {
  setFivePackageDotDependency(root, "workspace:0.3.0");
}

function runVersionFixture(fixture, status, options = {}) {
  const calls = [];
  const result = runVersion({
    root: fixture.root,
    environment: options.environment,
    execFile(file, args, commandOptions) {
      calls.push({ file, args, options: commandOptions });
      if (args.includes("status")) {
        writeFileSync(args.at(-1), canonicalJson(status));
        return "";
      }
      if (args[0] === "install") {
        options.onLockCall?.(commandOptions);
        if (options.lockError !== undefined) throw options.lockError;
        if (!options.skipLockWrite) {
          rewriteFixtureLockfile(fixture.root, fixture.definitions);
        }
        options.afterLock?.(fixture.root, commandOptions);
        return "";
      }
      for (const release of status.releases) {
        const definition = fixture.definitions.find(
          (entry) => entry.name === release.name,
        );
        if (!definition) continue;
        mutateJson(
          join(fixture.root, definition.path, "package.json"),
          (manifest) => {
            manifest.version = release.newVersion;
          },
        );
      }
      for (const changeset of status.changesets) {
        unlinkSync(join(fixture.root, ".changeset", `${changeset.id}.md`));
      }
      options.afterVersion?.(fixture.root);
      return "";
    },
  });
  return { result, calls };
}

test("version mode captures source bytes then writes a deterministic UI-only durable plan", (t) => {
  const first = makeFixture();
  const second = makeFixture();
  t.after(() => first.cleanup());
  t.after(() => second.cleanup());
  const status = versionStatus();
  status.releases.push({
    name: "@hua-labs/hua",
    type: "none",
    oldVersion: "1.2.2",
    changesets: [],
    newVersion: "1.2.2",
  });
  for (const fixture of [first, second]) {
    writeFileSync(
      join(fixture.root, ".changeset/ui-safe-release.md"),
      '---\n"@hua-labs/ui": patch\n---\n\nSafe release fixture.\n',
    );
  }
  const firstRun = runVersionFixture(first, status);
  const secondRun = runVersionFixture(second, status);
  assert.deepEqual(firstRun.calls[0].args.slice(0, 4), [
    "exec",
    "changeset",
    "status",
    "--output",
  ]);
  assert.match(firstRun.calls[0].args[4], /\/status\.json$/);
  assert.deepEqual(
    firstRun.calls.slice(1).map((entry) => entry.args),
    [
      ["exec", "changeset", "version"],
      [
        "install",
        "--lockfile-only",
        "--no-frozen-lockfile",
        "--ignore-scripts",
        "--registry=https://registry.npmjs.org/",
      ],
    ],
  );
  assert.deepEqual(
    firstRun.result.releases.map((entry) => entry.name),
    ["@hua-labs/ui"],
  );
  assert.equal(firstRun.result.planDigest, secondRun.result.planDigest);
  assert.equal(
    firstRun.result.releases[0].changesets[0].sha256,
    sha256(
      Buffer.from('---\n"@hua-labs/ui": patch\n---\n\nSafe release fixture.\n'),
    ),
  );
  assert.equal(
    readFileSync(join(first.root, "config/release-plan.json"), "utf8"),
    readFileSync(join(second.root, "config/release-plan.json"), "utf8"),
  );
});

test("version mode closes only selected workspace importer relations before planning", (t) => {
  const first = createFivePackageVersionFixture();
  const second = createFivePackageVersionFixture();
  t.after(() => first.cleanup());
  t.after(() => second.cleanup());
  const status = fivePackageVersionStatus();
  const sourceLock = readFileSync(join(first.root, "pnpm-lock.yaml"), "utf8");
  const parsedSourceLock = parseDocument(sourceLock).toJS();
  let observedLockEnvironment;
  const firstRun = runVersionFixture(first, status, {
    afterVersion: applyFivePackageDependencyVersions,
    environment: {
      PATH: process.env.PATH,
      CI: "true",
      LANG: "C.UTF-8",
      HOME: "/foreign/home",
      NPM_CONFIG_USERCONFIG: "/foreign/user.npmrc",
      NPM_CONFIG_GLOBALCONFIG: "/foreign/global.npmrc",
      NPM_TOKEN: "private-token",
      NODE_AUTH_TOKEN: "private-node-token",
      GITHUB_TOKEN: "private-github-token",
      npm_config_registry: "https://foreign.invalid/",
      npm_config_ignore_scripts: "false",
      PNPM_CONFIG_IGNORE_SCRIPTS: "false",
    },
    afterLock(_root, commandOptions) {
      observedLockEnvironment = commandOptions.env;
      assert.match(
        commandOptions.env.HOME,
        /hua-safe-release-status-[^/]+\/lock-home$/,
      );
      assert.equal(commandOptions.env.USERPROFILE, commandOptions.env.HOME);
      assert.equal(
        commandOptions.env.NPM_CONFIG_USERCONFIG,
        join(commandOptions.env.HOME, "user.npmrc"),
      );
      assert.equal(
        commandOptions.env.NPM_CONFIG_GLOBALCONFIG,
        join(commandOptions.env.HOME, "global.npmrc"),
      );
      assert.equal(
        readFileSync(commandOptions.env.NPM_CONFIG_USERCONFIG, "utf8"),
        "",
      );
      assert.equal(
        readFileSync(commandOptions.env.NPM_CONFIG_GLOBALCONFIG, "utf8"),
        "",
      );
    },
  });
  const secondRun = runVersionFixture(second, status, {
    afterVersion: applyFivePackageDependencyVersions,
  });

  assert.deepEqual(
    firstRun.result.releases.map(({ name, fromVersion, toVersion, type }) => ({
      name,
      fromVersion,
      toVersion,
      type,
    })),
    [
      {
        name: "@hua-labs/dot",
        fromVersion: "0.2.2",
        toVersion: "0.3.0",
        type: "minor",
      },
      {
        name: "@hua-labs/dot-aot",
        fromVersion: "0.1.3",
        toVersion: "0.2.0",
        type: "minor",
      },
      {
        name: "@hua-labs/dot-lsp",
        fromVersion: "0.1.3",
        toVersion: "0.1.4",
        type: "patch",
      },
      {
        name: "@hua-labs/dot-mcp",
        fromVersion: "0.1.3",
        toVersion: "0.2.0",
        type: "minor",
      },
      {
        name: "@hua-labs/ui",
        fromVersion: "2.3.0",
        toVersion: "2.4.0",
        type: "minor",
      },
    ],
  );
  assert.equal(firstRun.result.planDigest, secondRun.result.planDigest);
  assert.equal(
    readFileSync(join(first.root, "pnpm-lock.yaml"), "utf8"),
    readFileSync(join(second.root, "pnpm-lock.yaml"), "utf8"),
  );
  assert.notEqual(
    readFileSync(join(first.root, "pnpm-lock.yaml"), "utf8"),
    sourceLock,
  );
  const lock = parseDocument(
    readFileSync(join(first.root, "pnpm-lock.yaml"), "utf8"),
  ).toJS();
  for (const path of [
    "packages/hua-dot-aot",
    "packages/hua-dot-lsp",
    "packages/hua-dot-mcp",
  ]) {
    assert.equal(
      parsedSourceLock.importers[path].dependencies["@hua-labs/dot"].specifier,
      "workspace:0.2.2",
    );
    assert.equal(
      lock.importers[path].dependencies["@hua-labs/dot"].specifier,
      "workspace:0.3.0",
    );
    assert.equal(
      lock.importers[path].dependencies["@hua-labs/dot"].version,
      "link:../hua-dot",
    );
  }
  assert.equal(
    lock.importers["packages/hua-ui"].dependencies["@hua-labs/dot"].specifier,
    "workspace:*",
  );
  const lockCall = firstRun.calls.find(
    ({ file, args }) => file === "pnpm" && args[0] === "install",
  );
  assert.deepEqual(lockCall.args, [
    "install",
    "--lockfile-only",
    "--no-frozen-lockfile",
    "--ignore-scripts",
    "--registry=https://registry.npmjs.org/",
  ]);
  assert.equal(lockCall.options.env.CI, "true");
  assert.equal(
    lockCall.options.env.npm_config_registry,
    "https://registry.npmjs.org/",
  );
  assert.equal(lockCall.options.env.PATH, process.env.PATH);
  assert.equal(lockCall.options.env.LANG, "C.UTF-8");
  assert.equal(observedLockEnvironment, lockCall.options.env);
  assert.deepEqual(Object.keys(lockCall.options.env).sort(compareUtf8), [
    "CI",
    "HOME",
    "LANG",
    "NPM_CONFIG_GLOBALCONFIG",
    "NPM_CONFIG_USERCONFIG",
    "PATH",
    "USERPROFILE",
    "XDG_CACHE_HOME",
    "npm_config_ignore_scripts",
    "npm_config_registry",
    "pnpm_config_ignore_scripts",
  ]);
  assert.equal(existsSync(observedLockEnvironment.HOME), false);
  for (const key of [
    "NPM_TOKEN",
    "NODE_AUTH_TOKEN",
    "GITHUB_TOKEN",
    "npm_config_auth",
    "npm_config__authToken",
  ]) {
    assert.equal(Object.hasOwn(lockCall.options.env, key), false);
  }
  assert.equal(
    Object.values(lockCall.options.env).some((value) =>
      String(value).includes("private-"),
    ),
    false,
  );
  assert.deepEqual(
    Object.entries(lockCall.options.env)
      .filter(([key]) => key.toLowerCase().endsWith("_ignore_scripts"))
      .sort(([left], [right]) => compareUtf8(left, right)),
    [
      ["npm_config_ignore_scripts", "true"],
      ["pnpm_config_ignore_scripts", "true"],
    ],
  );
  assert.equal(
    firstRun.calls.some(
      ({ file, args }) => file === "npm" || args.includes("publish"),
    ),
    false,
  );
});

test("version mode writes no planned authority for stale, failed, or churned lock closure", async (t) => {
  const cases = [
    ["stale", { skipLockWrite: true }, "version-lock-importer-relation"],
    [
      "command failure",
      {
        lockError: Object.assign(new Error("fixture-lock-failed"), {
          code: "fixture-lock-failed",
        }),
      },
      "fixture-lock-failed",
    ],
    [
      "unrelated graph churn",
      {
        afterLock(root) {
          const path = join(root, "pnpm-lock.yaml");
          const lock = parseDocument(readFileSync(path, "utf8")).toJS();
          lock.settings.autoInstallPeers = false;
          writeFileSync(path, stringify(lock));
        },
      },
      "version-lock-churn",
    ],
  ];
  for (const [name, options, code] of cases) {
    await t.test(name, () => {
      const fixture = createFivePackageVersionFixture();
      try {
        let capturedLockHome;
        const planBytes = readFileSync(
          join(fixture.root, "config/release-plan.json"),
        );
        assertCode(
          () =>
            runVersionFixture(fixture, fivePackageVersionStatus(), {
              ...options,
              afterVersion: applyFivePackageDependencyVersions,
              onLockCall(commandOptions) {
                capturedLockHome = commandOptions.env.HOME;
              },
            }),
          code,
        );
        assert.equal(existsSync(capturedLockHome), false);
        assert.deepEqual(
          readFileSync(join(fixture.root, "config/release-plan.json")),
          planBytes,
        );
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("version mode rejects mutable workspace operators before planning", async (t) => {
  for (const [name, operator] of [
    ["caret", "^"],
    ["tilde", "~"],
  ]) {
    await t.test(name, () => {
      const sourceSpecifier = `workspace:${operator}0.2.2`;
      const finalSpecifier = `workspace:${operator}0.3.0`;
      const fixture = createFivePackageVersionFixture({
        dotSpecifier: sourceSpecifier,
      });
      try {
        const planPath = join(fixture.root, "config/release-plan.json");
        const planBytes = readFileSync(planPath);

        assertCode(
          () =>
            runVersionFixture(fixture, fivePackageVersionStatus(), {
              afterVersion(root) {
                setFivePackageDotDependency(root, finalSpecifier);
              },
            }),
          "version-lock-workspace-protocol",
        );
        assert.deepEqual(readFileSync(planPath), planBytes);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("version mode rejects every non-derived lock mutation and unsafe lock input", async (t) => {
  const graphCases = [
    [
      "missing importer edge",
      (lock) => {
        delete lock.importers["packages/hua-dot-aot"].dependencies[
          "@hua-labs/dot"
        ];
      },
      "version-lock-importer-relation",
    ],
    [
      "extra importer edge",
      (lock) => {
        lock.importers["packages/hua-dot-aot"].devDependencies = {
          "@hua-labs/dot": {
            specifier: "workspace:0.3.0",
            version: "link:../hua-dot",
          },
        };
      },
      "version-lock-churn",
    ],
    [
      "changed workspace link",
      (lock) => {
        lock.importers["packages/hua-dot-aot"].dependencies[
          "@hua-labs/dot"
        ].version = "link:../foreign-dot";
      },
      "version-lock-churn",
    ],
    [
      "settings churn",
      (lock) => {
        lock.settings.autoInstallPeers = false;
      },
      "version-lock-churn",
    ],
    [
      "patched dependency churn",
      (lock) => {
        lock.patchedDependencies = {
          "foreign@1.0.0": { path: "patches/x.patch" },
        };
      },
      "version-lock-churn",
    ],
    [
      "package resolution churn",
      (lock) => {
        lock.packages["foreign@1.0.0"] = {
          resolution: { integrity: "sha512-foreign" },
          peerDependencies: { react: ">=18" },
        };
      },
      "version-lock-churn",
    ],
    [
      "snapshot churn",
      (lock) => {
        lock.snapshots["foreign@1.0.0"] = {
          dependencies: { react: "19.0.0" },
        };
      },
      "version-lock-churn",
    ],
  ];
  for (const [name, mutate, code] of graphCases) {
    await t.test(name, () => {
      const fixture = createFivePackageVersionFixture();
      try {
        const planBytes = readFileSync(
          join(fixture.root, "config/release-plan.json"),
        );
        assertCode(
          () =>
            runVersionFixture(fixture, fivePackageVersionStatus(), {
              afterVersion: applyFivePackageDependencyVersions,
              afterLock(root) {
                mutateFixtureLockfile(root, mutate);
              },
            }),
          code,
        );
        assert.deepEqual(
          readFileSync(join(fixture.root, "config/release-plan.json")),
          planBytes,
        );
      } finally {
        fixture.cleanup();
      }
    });
  }

  await t.test("non-workspace manifest output", () => {
    const fixture = createFivePackageVersionFixture();
    try {
      const planBytes = readFileSync(
        join(fixture.root, "config/release-plan.json"),
      );
      assertCode(
        () =>
          runVersionFixture(fixture, fivePackageVersionStatus(), {
            afterVersion(root) {
              applyFivePackageDependencyVersions(root);
              mutateJson(
                join(root, "packages/hua-dot-aot/package.json"),
                (manifest) => {
                  manifest.dependencies["@hua-labs/dot"] = "0.3.0";
                },
              );
            },
          }),
        "version-lock-workspace-protocol",
      );
      assert.deepEqual(
        readFileSync(join(fixture.root, "config/release-plan.json")),
        planBytes,
      );
    } finally {
      fixture.cleanup();
    }
  });

  const unsafeCases = [
    [
      "alias",
      (root) => {
        writeFileSync(
          join(root, "pnpm-lock.yaml"),
          "lockfileVersion: '9.0'\nimporters: &importers {}\ncopy: *importers\n",
        );
      },
      "version-final-lock-alias",
    ],
    [
      "malformed",
      (root) => {
        writeFileSync(join(root, "pnpm-lock.yaml"), "importers: [\n");
      },
      "version-final-lock-invalid",
    ],
    [
      "oversize",
      (root) => {
        writeFileSync(
          join(root, "pnpm-lock.yaml"),
          Buffer.alloc(8 * 1024 * 1024 + 1),
        );
      },
      "version-final-lock-oversize",
    ],
    [
      "symlink",
      (root) => {
        const lockPath = join(root, "pnpm-lock.yaml");
        const targetPath = join(root, "lock-target.yaml");
        writeFileSync(targetPath, readFileSync(lockPath));
        unlinkSync(lockPath);
        symlinkSync(targetPath, lockPath);
      },
      "version-final-lock-non-regular",
    ],
    [
      "directory",
      (root) => {
        const lockPath = join(root, "pnpm-lock.yaml");
        unlinkSync(lockPath);
        mkdirSync(lockPath);
      },
      "version-final-lock-non-regular",
    ],
  ];
  for (const [name, mutate, code] of unsafeCases) {
    await t.test(name, () => {
      const fixture = createFivePackageVersionFixture();
      try {
        const planBytes = readFileSync(
          join(fixture.root, "config/release-plan.json"),
        );
        assertCode(
          () =>
            runVersionFixture(fixture, fivePackageVersionStatus(), {
              afterVersion: applyFivePackageDependencyVersions,
              afterLock: mutate,
            }),
          code,
        );
        assert.deepEqual(
          readFileSync(join(fixture.root, "config/release-plan.json")),
          planBytes,
        );
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("version mode rejects unsafe source locks before executing Changesets", async (t) => {
  const cases = [
    [
      "alias",
      (root) => {
        writeFileSync(
          join(root, "pnpm-lock.yaml"),
          "lockfileVersion: '9.0'\nimporters: &importers {}\ncopy: *importers\n",
        );
      },
      "version-source-lock-alias",
    ],
    [
      "oversize",
      (root) => {
        writeFileSync(
          join(root, "pnpm-lock.yaml"),
          Buffer.alloc(8 * 1024 * 1024 + 1),
        );
      },
      "version-source-lock-oversize",
    ],
    [
      "symlink",
      (root) => {
        const lockPath = join(root, "pnpm-lock.yaml");
        const targetPath = join(root, "lock-target.yaml");
        writeFileSync(targetPath, readFileSync(lockPath));
        unlinkSync(lockPath);
        symlinkSync(targetPath, lockPath);
      },
      "version-source-lock-non-regular",
    ],
  ];
  for (const [name, mutate, code] of cases) {
    await t.test(name, () => {
      const fixture = createFivePackageVersionFixture();
      try {
        const planBytes = readFileSync(
          join(fixture.root, "config/release-plan.json"),
        );
        let calls = 0;
        mutate(fixture.root);
        assertCode(
          () =>
            runVersion({
              root: fixture.root,
              execFile() {
                calls += 1;
                return "";
              },
            }),
          code,
        );
        assert.equal(calls, 0);
        assert.deepEqual(
          readFileSync(join(fixture.root, "config/release-plan.json")),
          planBytes,
        );
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("version mode admits the exact aggregate Changeset type and complete ID relation", (t) => {
  const fixture = makeFixture();
  t.after(() => fixture.cleanup());
  const status = {
    changesets: [
      {
        id: "ui-minor-release",
        summary: "UI minor selection",
        releases: [{ name: "@hua-labs/ui", type: "minor" }],
      },
      {
        id: "ui-patch-release",
        summary: "UI patch selection",
        releases: [{ name: "@hua-labs/ui", type: "patch" }],
      },
    ],
    releases: [
      {
        name: "@hua-labs/ui",
        type: "minor",
        oldVersion: "2.3.0",
        changesets: ["ui-minor-release", "ui-patch-release"],
        newVersion: "2.4.0",
      },
    ],
  };
  for (const changeset of status.changesets) {
    writeFileSync(
      join(fixture.root, `.changeset/${changeset.id}.md`),
      `---\n"@hua-labs/ui": ${changeset.releases[0].type}\n---\n`,
    );
  }
  const { result } = runVersionFixture(fixture, status);
  assert.equal(result.releases.length, 1);
  assert.equal(result.releases[0].name, "@hua-labs/ui");
  assert.equal(result.releases[0].type, "minor");
  assert.equal(result.releases[0].fromVersion, "2.3.0");
  assert.equal(result.releases[0].toVersion, "2.4.0");
  assert.deepEqual(
    result.releases[0].changesets.map(({ id }) => id),
    ["ui-minor-release", "ui-patch-release"],
  );
});

test("version mode writes no planned authority when Changeset sources survive versioning", async (t) => {
  const cases = [
    ["consumed source remains", false],
    ["unexpected source remains", true],
  ];
  for (const [name, replaceSource] of cases) {
    await t.test(name, () => {
      const fixture = makeFixture();
      try {
        const status = versionStatus();
        const sourcePath = join(fixture.root, ".changeset/ui-safe-release.md");
        writeFileSync(
          sourcePath,
          '---\n"@hua-labs/ui": patch\n---\n\nSafe release fixture.\n',
        );
        assertCode(
          () =>
            runVersion({
              root: fixture.root,
              execFile(_file, args) {
                if (args.includes("status")) {
                  writeFileSync(args.at(-1), canonicalJson(status));
                  return "";
                }
                mutateJson(
                  join(fixture.root, "packages/hua-ui/package.json"),
                  (manifest) => {
                    manifest.version = "2.3.1";
                  },
                );
                if (replaceSource) {
                  unlinkSync(sourcePath);
                  writeFileSync(
                    join(fixture.root, ".changeset/unexpected-release.md"),
                    '---\n"@hua-labs/ui": patch\n---\n',
                  );
                }
                return "";
              },
            }),
          "version-changeset-source-set",
        );
        assert.equal(
          JSON.parse(
            readFileSync(
              join(fixture.root, "config/release-plan.json"),
              "utf8",
            ),
          ).status,
          "empty",
        );
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("two release cycles close and refresh empty authority without weakening planned exactness", async (t) => {
  const fixture = makeFixture();
  t.after(() => fixture.cleanup());
  const publishedPath = join(fixture.root, "published.json");

  for (const [cycle, expectedVersion] of [
    ["first", "2.3.1"],
    ["second", "2.3.2"],
  ]) {
    const id = `${cycle}-ui-release`;
    writeFileSync(
      join(fixture.root, `.changeset/${id}.md`),
      `---\n"@hua-labs/ui": patch\n---\n\n${cycle} cycle.\n`,
    );
    const currentVersion = JSON.parse(
      readFileSync(join(fixture.root, "packages/hua-ui/package.json"), "utf8"),
    ).version;
    const status = versionStatus("@hua-labs/ui", {
      id,
      releases: [
        {
          name: "@hua-labs/ui",
          type: "patch",
          oldVersion: currentVersion,
          changesets: [id],
          newVersion: expectedVersion,
        },
      ],
    });
    const { result } = runVersionFixture(fixture, status);
    assert.deepEqual(
      result.releases.map((entry) => entry.name),
      ["@hua-labs/ui"],
    );
    claimFixturePlan(fixture);

    const published = runPublish(
      publishingOptions(fixture, () => {
        return "";
      }),
    );
    writeFileSync(publishedPath, canonicalJson(published));
    await checkPublishedProvenance({
      root: fixture.root,
      publishedPath,
      attempts: 1,
      delayMs: 0,
      closePlan: true,
      persistence: { ...TEST_CLAIM, claimHead: "b".repeat(40) },
      persistClosure() {
        return {
          head: "c".repeat(40),
          branch: `release/close-${"b".repeat(12)}`,
        };
      },
      execFile() {
        return JSON.stringify({
          provenance: { predicateType: "https://slsa.dev/provenance/v1" },
        });
      },
    });
    const closed = loadReleaseState(fixture.root).plan;
    assert.equal(closed.status, "empty");
    assert.deepEqual(closed.releases, []);

    if (cycle === "first") {
      mutateJson(
        join(fixture.root, "packages/hua-ui/package.json"),
        (manifest) => {
          manifest.exports = {
            ".": "./dist/index.mjs",
            "./theme": "./dist/theme.mjs",
          };
        },
      );
      assertCode(() => loadReleaseState(fixture.root), "plan-workspace-drift");
      const preflight = runPreflight({ root: fixture.root });
      assert.equal(preflight.plan.status, "empty");
      assert.equal(preflight.refreshRequired, true);
      const refreshed = runRefresh({ root: fixture.root });
      assert.equal(refreshed.status, "empty");
      assert.equal(runPreflight({ root: fixture.root }).refreshRequired, false);
    }
  }
});

test("refresh and close reject planned, tampered, unknown, and ineligible authority", async (t) => {
  await t.test("planned", () => {
    const fixture = createPlannedFixture();
    try {
      assertCode(
        () => runRefresh({ root: fixture.root }),
        "refresh-nonempty-plan",
      );
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("tampered empty digest", () => {
    const fixture = makeFixture();
    try {
      mutateJson(join(fixture.root, "config/release-plan.json"), (plan) => {
        plan.planDigest = "0".repeat(64);
      });
      assertCode(
        () => runRefresh({ root: fixture.root }),
        "plan-digest-mismatch",
      );
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("unknown workspace", () => {
    const fixture = makeFixture();
    try {
      mkdirSync(join(fixture.root, "packages/unknown"), { recursive: true });
      writeFileSync(
        join(fixture.root, "packages/unknown/package.json"),
        canonicalJson({ name: "@hua-labs/unknown", version: "1.0.0" }),
      );
      assertCode(
        () => runRefresh({ root: fixture.root }),
        "policy-workspace-count",
      );
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("version drift", () => {
    const fixture = makeFixture();
    try {
      mutateJson(
        join(fixture.root, "packages/hua-ui/package.json"),
        (manifest) => {
          manifest.version = "2.3.1";
        },
      );
      assertCode(
        () => runRefresh({ root: fixture.root }),
        "refresh-version-drift",
      );
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("ineligible workspace drift", () => {
    const fixture = makeFixture();
    try {
      mutateJson(
        join(fixture.root, "packages/hua/package.json"),
        (manifest) => {
          manifest.description = "Reviewed but held authority drift";
        },
      );
      assertCode(
        () => runRefresh({ root: fixture.root }),
        "refresh-ineligible-workspace",
      );
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("never-publish workspace drift", () => {
    const fixture = makeFixture();
    try {
      mutateJson(
        join(fixture.root, "packages/hua-security/package.json"),
        (manifest) => {
          manifest.description = "Reviewed but never-publish authority drift";
        },
      );
      assertCode(
        () => runPreflight({ root: fixture.root }),
        "refresh-ineligible-workspace",
      );
      assertCode(
        () => runRefresh({ root: fixture.root }),
        "refresh-ineligible-workspace",
      );
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("ineligible published set", async () => {
    const fixture = createPublishingFixture();
    try {
      const publishedPath = join(fixture.root, "published.json");
      writeFileSync(
        publishedPath,
        canonicalJson({
          schemaVersion: 1,
          publishedPackages: [{ name: "@hua-labs/hua", version: "1.2.3" }],
        }),
      );
      await assert.rejects(
        checkPublishedProvenance({
          root: fixture.root,
          publishedPath,
          attempts: 1,
          delayMs: 0,
          closePlan: true,
          persistence: { ...TEST_CLAIM, claimHead: "b".repeat(40) },
          persistClosure() {
            throw new Error("must-not-persist");
          },
          execFile() {
            throw new Error("must-not-query");
          },
        }),
        (error) => error?.code === "published-package-set",
      );
      assert.equal(loadReleaseState(fixture.root).plan.status, "publishing");
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("failed provenance retains planned authority", async () => {
    const fixture = createPublishingFixture();
    try {
      const publishedPath = join(fixture.root, "published.json");
      writeFileSync(
        publishedPath,
        canonicalJson({
          schemaVersion: 1,
          publishedPackages: [{ name: "@hua-labs/ui", version: "2.3.1" }],
        }),
      );
      await assert.rejects(
        checkPublishedProvenance({
          root: fixture.root,
          publishedPath,
          attempts: 1,
          delayMs: 0,
          closePlan: true,
          persistence: { ...TEST_CLAIM, claimHead: "b".repeat(40) },
          persistClosure() {
            throw new Error("must-not-persist");
          },
          execFile() {
            return "{}";
          },
        }),
        (error) => error?.code === "provenance-incomplete",
      );
      assert.equal(loadReleaseState(fixture.root).plan.status, "publishing");
    } finally {
      fixture.cleanup();
    }
  });
});

test("version mode rejects empty, implicit, held, never, unknown, and source-set drift before version", async (t) => {
  const cases = [
    ["empty", { changesets: [], releases: [] }, "version-empty", []],
    [
      "partial selected cohort",
      {
        changesets: [
          {
            id: "ui-motion-release",
            summary: "UI and Motion",
            releases: [
              { name: "@hua-labs/ui", type: "patch" },
              { name: "@hua-labs/motion-core", type: "patch" },
            ],
          },
        ],
        releases: [
          {
            name: "@hua-labs/ui",
            type: "patch",
            oldVersion: "2.3.0",
            changesets: ["ui-motion-release"],
            newVersion: "2.3.1",
          },
        ],
      },
      "version-changeset-release-missing",
      ["ui-motion-release"],
    ],
    [
      "release row missing selected id",
      {
        changesets: [
          {
            id: "ui-first-release",
            summary: "First UI selection",
            releases: [{ name: "@hua-labs/ui", type: "patch" }],
          },
          {
            id: "ui-second-release",
            summary: "Second UI selection",
            releases: [{ name: "@hua-labs/ui", type: "patch" }],
          },
        ],
        releases: [
          {
            name: "@hua-labs/ui",
            type: "patch",
            oldVersion: "2.3.0",
            changesets: ["ui-first-release"],
            newVersion: "2.3.1",
          },
        ],
      },
      "version-changeset-release-ids",
      ["ui-first-release", "ui-second-release"],
    ],
    [
      "release row type differs from Changeset semantics",
      {
        changesets: [
          {
            id: "ui-minor-release",
            summary: "UI minor selection",
            releases: [{ name: "@hua-labs/ui", type: "minor" }],
          },
        ],
        releases: [
          {
            name: "@hua-labs/ui",
            type: "patch",
            oldVersion: "2.3.0",
            changesets: ["ui-minor-release"],
            newVersion: "2.3.1",
          },
        ],
      },
      "version-changeset-release-type",
      ["ui-minor-release"],
    ],
    [
      "selected release cannot become neutral",
      {
        changesets: [
          {
            id: "ui-neutral-release",
            summary: "UI patch selection",
            releases: [{ name: "@hua-labs/ui", type: "patch" }],
          },
        ],
        releases: [
          {
            name: "@hua-labs/ui",
            type: "none",
            oldVersion: "2.3.0",
            changesets: [],
            newVersion: "2.3.0",
          },
        ],
      },
      "version-changeset-release-type",
      ["ui-neutral-release"],
    ],
    [
      "implicit dependent",
      versionStatus("@hua-labs/ui", {
        releases: [
          {
            name: "@hua-labs/ui",
            type: "patch",
            oldVersion: "2.3.0",
            changesets: [],
            newVersion: "2.3.1",
          },
        ],
      }),
      "changesets-status-dependent-release",
      ["ui-safe-release"],
    ],
    [
      "held",
      versionStatus("@hua-labs/hua", { id: "held-release" }),
      "version-release-ineligible",
      ["held-release"],
    ],
    [
      "never",
      versionStatus("@hua-labs/security", { id: "security-release" }),
      "version-release-ineligible",
      ["security-release"],
    ],
    [
      "unknown",
      {
        changesets: [
          {
            id: "unknown-release",
            summary: "Unknown",
            releases: [{ name: "@hua-labs/unknown", type: "patch" }],
          },
        ],
        releases: [
          {
            name: "@hua-labs/unknown",
            type: "patch",
            oldVersion: "1.0.0",
            changesets: ["unknown-release"],
            newVersion: "1.0.1",
          },
        ],
      },
      "version-release-unknown",
      ["unknown-release"],
    ],
    ["missing source", versionStatus(), "changeset-source-set", []],
    [
      "extra source",
      versionStatus(),
      "changeset-source-set",
      ["ui-safe-release", "unexpected"],
    ],
  ];
  for (const [name, status, code, sourceIds] of cases) {
    await t.test(name, () => {
      const fixture = makeFixture();
      try {
        for (const id of sourceIds) {
          writeFileSync(
            join(fixture.root, `.changeset/${id}.md`),
            `---\n"@hua-labs/ui": patch\n---\n`,
          );
        }
        let versionCalls = 0;
        assertCode(
          () =>
            runVersion({
              root: fixture.root,
              execFile(_file, args) {
                if (args.includes("status")) {
                  writeFileSync(args.at(-1), canonicalJson(status));
                } else {
                  versionCalls += 1;
                }
                return "";
              },
            }),
          code,
        );
        assert.equal(versionCalls, 0);
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("version mode cannot overwrite an existing planned release", (t) => {
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  let calls = 0;
  assertCode(
    () =>
      runVersion({
        root: fixture.root,
        execFile() {
          calls += 1;
        },
      }),
    "version-existing-plan",
  );
  assert.equal(calls, 0);
});

test("noncanonical numeric prerelease versions fail closed", (t) => {
  const fixture = makeFixture();
  t.after(() => fixture.cleanup());
  mutateJson(join(fixture.root, "packages/hua-ui/package.json"), (manifest) => {
    manifest.version = "2.3.1-01";
  });
  assertCode(() => loadReleaseState(fixture.root), "plan-semver");
});

test("one-byte policy, plan, and manifest tamper are rejected", async (t) => {
  const cases = [
    ["policy", "config/publish-allowlist.json"],
    ["plan", "config/release-plan.json"],
    ["manifest", "packages/hua-ui/package.json"],
  ];
  for (const [name, relativePath] of cases) {
    await t.test(name, () => {
      const fixture = makeFixture();
      try {
        const path = join(fixture.root, relativePath);
        const bytes = readFileSync(path);
        bytes[bytes.length - 2] =
          bytes[bytes.length - 2] === 0x7d ? 0x20 : 0x7d;
        writeFileSync(path, bytes);
        assert.throws(() => loadReleaseState(fixture.root));
      } finally {
        fixture.cleanup();
      }
    });
  }
});

test("symlinked package directories fail closed before any publish command", (t) => {
  const fixture = createPublishingFixture();
  t.after(() => fixture.cleanup());
  const target = join(fixture.root, "packages/hua-ui-real");
  const packagePath = join(fixture.root, "packages/hua-ui");
  mkdirSync(target);
  rmSync(packagePath, { recursive: true });
  symlinkSync(target, packagePath, "dir");
  let calls = 0;
  assertCode(
    () =>
      runPublish(
        publishingOptions(fixture, () => {
          calls += 1;
        }),
      ),
    "workspace-entry-non-directory",
  );
  assert.equal(calls, 0);
});
