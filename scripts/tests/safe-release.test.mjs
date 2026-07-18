import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkPublishedProvenance } from "../check-npm-provenance.mjs";
import {
  PLATFORM_AUTHORITY,
  canonicalJson,
  createEmptyReleasePlan,
  finalizeReleasePlan,
  loadPolicy,
  loadReleaseState,
  parseStrictJsonBytes,
  runPublish,
  runRefresh,
  runVersion,
  sha256,
  validatePolicy,
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
    eligibility: "blocked",
    reason: "release-mode-no-publish",
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
  return {
    root,
    definitions,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
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

function assertCode(callback, code) {
  assert.throws(callback, (error) => error?.code === code);
}

test("current policy blocks HUA, Security, Dot, and Dot AOT while the empty plan is exact", () => {
  const state = loadReleaseState(CURRENT_ROOT);
  assert.equal(state.policy.packages.length, 17);
  assert.equal(
    state.policy.packages.filter((entry) => entry.eligibility === "eligible")
      .length,
    13,
  );
  assert.equal(state.plan.status, "empty");
  assert.deepEqual(state.plan.releases, []);
  for (const name of [
    "@hua-labs/hua",
    "@hua-labs/security",
    "@hua-labs/dot",
    "@hua-labs/dot-aot",
  ]) {
    assert.equal(
      state.policy.packages.find((entry) => entry.name === name).eligibility,
      "blocked",
    );
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
    "private-workspace-release-intent",
  );
  assert.match(
    sourceBytes,
    /authorityKind: "private-workspace-release-intent"/,
  );
});

test("workflow keeps versioning token-free and gates exact publish/provenance after plan", () => {
  const workflow = readFileSync(
    join(CURRENT_ROOT, ".github/workflows/release.yml"),
    "utf8",
  );
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm safe-release:refresh/);
  assert.match(workflow, /version: pnpm safe-release:version/);
  assert.match(
    workflow,
    /safe-release\.mjs check --format=github --allow-empty/,
  );
  assert.match(workflow, /if: steps\.release-plan\.outputs\.publish == 'true'/);
  assert.match(workflow, /pnpm safe-release:publish > "\$published"/);
  assert.match(workflow, /check:npm-provenance -- --published/);
  assert.match(
    workflow,
    /check:npm-provenance -- --published[^\n]+--close-plan/,
  );
  assert.doesNotMatch(workflow, /--no-frozen-lockfile/);
  assert.doesNotMatch(workflow, /changeset publish/);
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
    "Validate provenance-closed empty plan",
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
          index === 0 ? { ...entry, eligibility: "eligible" } : entry,
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

test("UI-only publish uses one exact directory and fixed execFile argv", (t) => {
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  const calls = [];
  const published = runPublish({
    root: fixture.root,
    execFile(file, args, options) {
      calls.push({ file, args, cwd: options.cwd });
      return "";
    },
  });
  assert.deepEqual(published, {
    schemaVersion: 1,
    publishedPackages: [{ name: "@hua-labs/ui", version: "2.3.1" }],
  });
  assert.deepEqual(calls, [
    {
      file: "pnpm",
      args: [
        "publish",
        "--no-git-checks",
        "--access",
        "public",
        "--provenance",
      ],
      cwd: join(realpathSync(fixture.root), "packages/hua-ui"),
    },
  ]);
});

test("explicit UI and Motion publish is exact while Dot is never inferred", (t) => {
  const fixture = createPlannedFixture([
    "@hua-labs/motion-core",
    "@hua-labs/ui",
  ]);
  t.after(() => fixture.cleanup());
  const directories = [];
  const result = runPublish({
    root: fixture.root,
    execFile(_file, _args, options) {
      directories.push(options.cwd);
      return "";
    },
  });
  assert.deepEqual(
    result.publishedPackages.map((entry) => entry.name),
    ["@hua-labs/motion-core", "@hua-labs/ui"],
  );
  assert.equal(
    directories.some((path) => path.endsWith("hua-dot")),
    false,
  );
});

test("held, never-publish, and no-publish packages fail before publish", async (t) => {
  for (const name of ["@hua-labs/hua", "@hua-labs/security", "@hua-labs/dot"]) {
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

function runVersionFixture(fixture, status) {
  const calls = [];
  const result = runVersion({
    root: fixture.root,
    execFile(file, args) {
      calls.push({ file, args });
      if (args.includes("status")) {
        writeFileSync(args.at(-1), canonicalJson(status));
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
  assert.deepEqual(
    firstRun.calls.map((entry) => entry.args.slice(0, 3)),
    [
      ["exec", "changeset", "status"],
      ["exec", "changeset", "version"],
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

test("two release cycles close and refresh empty authority without weakening planned exactness", async (t) => {
  const fixture = makeFixture();
  t.after(() => fixture.cleanup());
  const publishedPath = join(fixture.root, "published.json");

  mutateJson(join(fixture.root, "packages/hua-ui/package.json"), (manifest) => {
    manifest.exports = { ".": "./dist/index.mjs" };
  });
  assertCode(() => loadReleaseState(fixture.root), "plan-workspace-drift");
  const refreshed = runRefresh({ root: fixture.root });
  assert.equal(refreshed.status, "empty");

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

    const published = runPublish({
      root: fixture.root,
      execFile() {
        return "";
      },
    });
    writeFileSync(publishedPath, canonicalJson(published));
    await checkPublishedProvenance({
      root: fixture.root,
      publishedPath,
      attempts: 1,
      delayMs: 0,
      closePlan: true,
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
          manifest.exports["./theme"] = "./dist/theme.mjs";
        },
      );
      assertCode(() => loadReleaseState(fixture.root), "plan-workspace-drift");
      runRefresh({ root: fixture.root });
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
  await t.test("ineligible published set", async () => {
    const fixture = createPlannedFixture();
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
          execFile() {
            throw new Error("must-not-query");
          },
        }),
        (error) => error?.code === "published-package-set",
      );
      assert.equal(loadReleaseState(fixture.root).plan.status, "planned");
    } finally {
      fixture.cleanup();
    }
  });
  await t.test("failed provenance retains planned authority", async () => {
    const fixture = createPlannedFixture();
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
          execFile() {
            return "{}";
          },
        }),
        (error) => error?.code === "provenance-incomplete",
      );
      assert.equal(loadReleaseState(fixture.root).plan.status, "planned");
    } finally {
      fixture.cleanup();
    }
  });
});

test("version mode rejects empty, implicit, held, never, Dot, unknown, and source-set drift before version", async (t) => {
  const cases = [
    ["empty", { changesets: [], releases: [] }, "version-empty", []],
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
      "no-publish",
      versionStatus("@hua-labs/dot", { id: "dot-release" }),
      "version-release-ineligible",
      ["dot-release"],
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
  const fixture = createPlannedFixture();
  t.after(() => fixture.cleanup());
  const target = join(fixture.root, "packages/hua-ui-real");
  const packagePath = join(fixture.root, "packages/hua-ui");
  mkdirSync(target);
  rmSync(packagePath, { recursive: true });
  symlinkSync(target, packagePath, "dir");
  let calls = 0;
  assertCode(
    () =>
      runPublish({
        root: fixture.root,
        execFile() {
          calls += 1;
        },
      }),
    "workspace-entry-non-directory",
  );
  assert.equal(calls, 0);
});
