import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

const root = fileURLToPath(new URL("../..", import.meta.url));
const checker = join(root, "scripts", "check-ui-source-authority.mjs");
const packChecker = join(root, "scripts", "check-pack-artifacts.js");
const realConfig = join(root, "config", "ui-source-authority.json");
const m810PlatformExactPaths = [
  "packages/hua-ui/src/components/Action.tsx",
  "packages/hua-ui/src/components/Box.tsx",
  "packages/hua-ui/src/components/Button.tsx",
  "packages/hua-ui/src/components/Pressable.tsx",
  "packages/hua-ui/src/components/Text.tsx",
  "packages/hua-ui/src/components/__tests__/Action.test.tsx",
  "packages/hua-ui/src/components/__tests__/Box.test.tsx",
  "packages/hua-ui/src/components/__tests__/Button.test.tsx",
  "packages/hua-ui/src/components/__tests__/Pressable.test.tsx",
  "packages/hua-ui/src/components/__tests__/Text.test.tsx",
  "packages/hua-ui/src/lib/Slot.tsx",
  "packages/hua-ui/src/lib/__tests__/Slot.test.tsx",
  "packages/hua-ui/src/lib/__tests__/web-classname.test.ts",
  "packages/hua-ui/src/lib/web-classname.ts",
];
const m814InteractionPaths = [
  "packages/hua-ui/src/components/BottomSheet.tsx",
  "packages/hua-ui/src/components/Drawer.tsx",
  "packages/hua-ui/src/components/Textarea.tsx",
  "packages/hua-ui/src/components/Toast.tsx",
  "packages/hua-ui/src/components/Tooltip.tsx",
  "packages/hua-ui/src/components/__tests__/BottomSheet.test.tsx",
  "packages/hua-ui/src/components/__tests__/Drawer.test.tsx",
  "packages/hua-ui/src/components/__tests__/Textarea.test.tsx",
  "packages/hua-ui/src/components/__tests__/Toast.test.tsx",
  "packages/hua-ui/src/components/__tests__/Tooltip.test.tsx",
];
const m821DomClassNamePaths = [
  "packages/hua-ui/src/components/FormControl.tsx",
  "packages/hua-ui/src/components/Link.tsx",
  "packages/hua-ui/src/components/LoadingSpinner.tsx",
  "packages/hua-ui/src/components/PageTransition.tsx",
  "packages/hua-ui/src/components/Section.tsx",
  "packages/hua-ui/src/components/__tests__/FormControl.test.tsx",
  "packages/hua-ui/src/components/__tests__/Link.test.tsx",
  "packages/hua-ui/src/components/__tests__/LoadingSpinner.test.tsx",
  "packages/hua-ui/src/components/__tests__/PageTransition.test.tsx",
  "packages/hua-ui/src/components/__tests__/Section.test.tsx",
];
const m828PlatformExactPaths = [
  ...m810PlatformExactPaths,
  ...m814InteractionPaths,
  ...m821DomClassNamePaths,
].sort();
const m835IconCorePaths = [
  "packages/hua-ui/src/components/ActionToolbar.tsx",
  "packages/hua-ui/src/components/Bookmark.tsx",
  "packages/hua-ui/src/components/Card.tsx",
  "packages/hua-ui/src/components/Divider.tsx",
  "packages/hua-ui/src/components/Icon/Icon.tsx",
  "packages/hua-ui/src/components/ScrollProgress.tsx",
  "packages/hua-ui/src/components/__tests__/Bookmark.test.tsx",
  "packages/hua-ui/src/components/__tests__/Icon.test.tsx",
  "packages/hua-ui/src/lib/__tests__/icon-aliases.test.ts",
  "packages/hua-ui/src/lib/__tests__/icon-providers.test.ts",
  "packages/hua-ui/src/lib/__tests__/normalize-icon-name.test.ts",
  "packages/hua-ui/src/lib/icon-aliases.ts",
  "packages/hua-ui/src/lib/icon-catalog.ts",
  "packages/hua-ui/src/lib/icon-names.ts",
  "packages/hua-ui/src/lib/icon-providers.ts",
  "packages/hua-ui/src/lib/icons.ts",
  "packages/hua-ui/src/lib/normalize-icon-name.ts",
].sort();
const m835PlatformExactPaths = [
  ...m828PlatformExactPaths,
  ...m835IconCorePaths,
].sort();
const m840KanbanPaths = [
  "packages/hua-ui/src/components/__tests__/KanbanBoard.test.tsx",
  "packages/hua-ui/src/components/dashboard/kanban/KanbanBoard.tsx",
  "packages/hua-ui/src/components/dashboard/kanban/KanbanCard.tsx",
  "packages/hua-ui/src/components/dashboard/kanban/README.md",
].sort();
const m840PlatformExactPaths = [
  ...m835PlatformExactPaths,
  ...m840KanbanPaths,
].sort();
const m840KanbanPathSet = new Set(m840KanbanPaths);
const m840MapDigest =
  "30ba90316b04ee2c8e898caaa5de1c700090dedc716ac7b597129ae070566f31";
const m835SelectedDigest =
  "7c8cb9b467ff56b323e7a9d286803c36409d724b14f7a38c3a11f02d234f7963";
const m840SelectedDigest =
  "1434d5eaed260c93fa20d0460e60d493fb9415512655742a93249b47d716cf64";
const m821SelectedDigest =
  "1b62279f3148d21bedee2311eb9ef58c256e1f01c56d67246f7e6b43f00a291f";
const m840RemainingDigest =
  "dcdbf954655a040b3730d004b64c4213ca0bb1be05855feeabf1451232ad466a";
const ownedRoots = [];

afterEach(() => {
  for (const ownedRoot of ownedRoots.splice(0)) {
    rmSync(ownedRoot, { recursive: true, force: true });
  }
});

function runGit(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function initRepo(root, files) {
  mkdirSync(root, { recursive: true });
  runGit(root, ["init", "--quiet"]);
  runGit(root, ["config", "user.email", "fixture@example.invalid"]);
  runGit(root, ["config", "user.name", "fixture"]);
  for (const [path, contents] of Object.entries(files)) {
    const absolute = join(root, ...path.split("/"));
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, contents);
  }
  runGit(root, ["add", "."]);
  runGit(root, ["commit", "--quiet", "-m", "fixture"]);
  return runGit(root, ["rev-parse", "HEAD"]);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalValue(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

function authorityRowDigest(rows) {
  const lines = rows
    .map((row) =>
      [
        row.disposition,
        row.kind,
        row.path,
        row.sourceSha256,
        row.publicBaseSha256 ?? "null",
        row.outputSha256 ?? "null",
      ].join("\t"),
    )
    .sort((left, right) =>
      Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8")),
    );
  return sha256(`${lines.join("\n")}\n`);
}

function remainingAuthorityRows(rows) {
  return rows.filter((row) => !m840KanbanPathSet.has(row.path));
}

function remainingAuthorityDigest(rows) {
  return authorityRowDigest(remainingAuthorityRows(rows));
}

function assertM840AuthorityLock(
  config,
  {
    expectedMapDigest = m840MapDigest,
    expectedRemainingDigest = m840RemainingDigest,
  } = {},
) {
  assert.equal(config.mapDigest, sha256(canonicalJson(config.rows)));
  assert.equal(config.mapDigest, expectedMapDigest);

  const remainingRows = remainingAuthorityRows(config.rows);
  assert.equal(remainingRows.length, 146);
  assert.equal(remainingAuthorityDigest(config.rows), expectedRemainingDigest);
}

function authority(root, commit) {
  return {
    commit,
    packageTree: runGit(root, ["rev-parse", `${commit}:packages/hua-ui`]),
    sourceTree: runGit(root, ["rev-parse", `${commit}:packages/hua-ui/src`]),
    tree: runGit(root, ["rev-parse", `${commit}^{tree}`]),
  };
}

function fileSha(root, path) {
  return sha256(readFileSync(join(root, ...path.split("/"))));
}

function createFixture() {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "hua-ui-authority-test-"));
  ownedRoots.push(fixtureRoot);
  const publicRoot = join(fixtureRoot, "public");
  const sourceRoot = join(fixtureRoot, "source");
  const sourceFiles = {
    "packages/hua-ui/src/components/A.ts": "export const a = 'source';\n",
    "packages/hua-ui/src/components/Keep.ts": "export const keep = 'source';\n",
    "packages/hua-ui/src/components/PlatformOnly.ts":
      "export const platformOnly = true;\n",
    "packages/hua-ui/src/shared.ts": "export const shared = true;\n",
  };
  const publicFiles = {
    "packages/hua-ui/src/components/A.ts": "export const a = 'public';\n",
    "packages/hua-ui/src/components/Keep.ts": "export const keep = 'public';\n",
    "packages/hua-ui/src/components/PublicOnly.ts":
      "export const publicOnly = true;\n",
    "packages/hua-ui/src/shared.ts": "export const shared = true;\n",
  };
  const sourceCommit = initRepo(sourceRoot, sourceFiles);
  const publicCommit = initRepo(publicRoot, publicFiles);
  const rows = [
    {
      disposition: "deferred",
      kind: "production",
      outputSha256: null,
      path: "packages/hua-ui/src/components/A.ts",
      publicBaseSha256: fileSha(
        publicRoot,
        "packages/hua-ui/src/components/A.ts",
      ),
      sourceSha256: fileSha(sourceRoot, "packages/hua-ui/src/components/A.ts"),
    },
    {
      disposition: "public-preserved",
      kind: "production",
      outputSha256: fileSha(
        publicRoot,
        "packages/hua-ui/src/components/Keep.ts",
      ),
      path: "packages/hua-ui/src/components/Keep.ts",
      publicBaseSha256: fileSha(
        publicRoot,
        "packages/hua-ui/src/components/Keep.ts",
      ),
      sourceSha256: fileSha(
        sourceRoot,
        "packages/hua-ui/src/components/Keep.ts",
      ),
    },
    {
      disposition: "deferred",
      kind: "production",
      outputSha256: null,
      path: "packages/hua-ui/src/components/PlatformOnly.ts",
      publicBaseSha256: null,
      sourceSha256: fileSha(
        sourceRoot,
        "packages/hua-ui/src/components/PlatformOnly.ts",
      ),
    },
    {
      disposition: "public-preserved",
      kind: "production",
      outputSha256: fileSha(
        publicRoot,
        "packages/hua-ui/src/components/PublicOnly.ts",
      ),
      path: "packages/hua-ui/src/components/PublicOnly.ts",
      publicBaseSha256: fileSha(
        publicRoot,
        "packages/hua-ui/src/components/PublicOnly.ts",
      ),
      sourceSha256: null,
    },
  ];
  const config = {
    mapDigest: sha256(canonicalJson(rows)),
    publicBase: authority(publicRoot, publicCommit),
    rows,
    schema: "hua-ui-source-authority.v1",
    sourceAuthority: authority(sourceRoot, sourceCommit),
  };
  const configPath = join(publicRoot, "config", "ui-source-authority.json");
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, canonicalJson(config));
  return { config, configPath, publicRoot, sourceRoot };
}

function writeConfig(fixture, mutate) {
  const config = structuredClone(fixture.config);
  mutate(config);
  config.mapDigest = sha256(canonicalJson(config.rows));
  writeFileSync(fixture.configPath, canonicalJson(config));
  return config;
}

function runChecker(fixture, ...extra) {
  return spawnSync(
    process.execPath,
    [
      checker,
      "--config",
      fixture.configPath,
      "--public-root",
      fixture.publicRoot,
      "--source-repo",
      fixture.sourceRoot,
      ...extra,
    ],
    { encoding: "utf8" },
  );
}

test("locks the M840 Kanban projection and remaining rows to platform authority", () => {
  const config = JSON.parse(readFileSync(realConfig, "utf8"));
  assert.deepEqual(config.sourceAuthority, {
    commit: "6be90ccac2f83f8c0fb7befb7310bbcbc590cce6",
    packageTree: "e7097d610de019c22ffb2967c08d62b3eeec319f",
    sourceTree: "ac7b098559e9560b74ce24652b34f5c8561a70ea",
    tree: "a9f2436c625d56b4447885b70f6cd48257369199",
  });
  assertM840AuthorityLock(config);

  const platformExactRows = config.rows.filter(
    (row) => row.disposition === "platform-exact",
  );
  assert.equal(platformExactRows.length, 55);
  assert.equal(
    config.rows.filter((row) => row.disposition === "deferred").length,
    47,
  );
  assert.equal(
    config.rows.filter((row) => row.disposition === "public-preserved").length,
    48,
  );
  assert.deepEqual(
    platformExactRows.map((row) => row.path),
    m840PlatformExactPaths,
  );
  for (const row of platformExactRows) {
    assert.equal(row.outputSha256, row.sourceSha256, row.path);
  }

  const m821SelectedRows = config.rows.filter((row) =>
    m821DomClassNamePaths.includes(row.path),
  );
  assert.equal(authorityRowDigest(m821SelectedRows), m821SelectedDigest);

  for (const path of m821DomClassNamePaths) {
    const row = config.rows.find((candidate) => candidate.path === path);
    assert.equal(row?.disposition, "platform-exact", path);
    assert.equal(row?.outputSha256, row?.sourceSha256, path);
  }

  const m835SelectedRows = config.rows.filter((row) =>
    m835IconCorePaths.includes(row.path),
  );
  assert.equal(m835SelectedRows.length, 17);
  assert.equal(authorityRowDigest(m835SelectedRows), m835SelectedDigest);

  for (const path of m835IconCorePaths) {
    const row = config.rows.find((candidate) => candidate.path === path);
    assert.equal(row?.disposition, "platform-exact", path);
    assert.equal(row?.outputSha256, row?.sourceSha256, path);
  }

  const m840SelectedRows = config.rows.filter((row) =>
    m840KanbanPaths.includes(row.path),
  );
  assert.equal(m840SelectedRows.length, 4);
  assert.equal(authorityRowDigest(m840SelectedRows), m840SelectedDigest);

  for (const path of m840KanbanPaths) {
    const row = config.rows.find((candidate) => candidate.path === path);
    assert.equal(row?.disposition, "platform-exact", path);
    assert.equal(row?.outputSha256, row?.sourceSha256, path);
  }

  const catalogEvidence = config.rows.find(
    (row) =>
      row.path === "packages/hua-ui/src/lib/__tests__/icon-catalog.test.ts",
  );
  assert.equal(catalogEvidence?.disposition, "deferred");
  assert.equal(catalogEvidence?.outputSha256, null);

  const productionContents = m835IconCorePaths
    .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
    .filter((path) => !path.includes("/__tests__/"))
    .map((path) => readFileSync(join(root, path), "utf8"))
    .join("\n");
  assert.doesNotMatch(
    productionContents,
    /(?:from\s+|import\s*\(|require\s*\()\s*["']lucide-react["']/,
  );

  const tampered = structuredClone(config);
  const logo = tampered.rows.find(
    (row) => row.path === "packages/hua-ui/src/advanced/Logo.tsx",
  );
  assert.ok(logo);
  assert.equal(logo.kind, "production");
  assert.equal(logo.disposition, "deferred");
  assert.equal(logo.outputSha256, null);
  logo.disposition = "public-preserved";
  logo.outputSha256 = logo.publicBaseSha256;
  tampered.mapDigest = sha256(canonicalJson(tampered.rows));

  assert.equal(
    tampered.mapDigest,
    "3669248f9b61bc37dfd19e608e0de43db3836e713e70f4b1fcbdccd5c8fcda6f",
  );
  const tamperedRemainingDigest = remainingAuthorityDigest(tampered.rows);
  assert.equal(
    tamperedRemainingDigest,
    "f0ea9c9ef857243db58a2975ee322fb21a4c7b1b75554dc329168a4f5449980a",
  );

  let failure;
  try {
    assertM840AuthorityLock(tampered, {
      expectedMapDigest: tampered.mapDigest,
    });
  } catch (error) {
    failure = error;
  }
  assert.equal(failure?.name, "AssertionError");
  assert.equal(failure?.actual, tamperedRemainingDigest);
  assert.equal(failure?.expected, m840RemainingDigest);
});

function createOversizedSourceFixture() {
  const fixtureRoot = mkdtempSync(
    join(tmpdir(), "hua-ui-authority-large-test-"),
  );
  ownedRoots.push(fixtureRoot);
  const publicRoot = join(fixtureRoot, "public");
  const sourceRoot = join(fixtureRoot, "source");
  const shared = "export const shared = true;\n";
  const publicCommit = initRepo(publicRoot, {
    "packages/hua-ui/src/shared.ts": shared,
  });
  const sourceCommit = initRepo(sourceRoot, {
    "packages/hua-ui/src/Huge.ts": Buffer.alloc(4 * 1024 * 1024 + 2, 0x61),
    "packages/hua-ui/src/shared.ts": shared,
  });
  const rows = [
    {
      disposition: "deferred",
      kind: "production",
      outputSha256: null,
      path: "packages/hua-ui/src/Huge.ts",
      publicBaseSha256: null,
      sourceSha256: null,
    },
  ];
  const config = {
    mapDigest: sha256(canonicalJson(rows)),
    publicBase: authority(publicRoot, publicCommit),
    rows,
    schema: "hua-ui-source-authority.v1",
    sourceAuthority: authority(sourceRoot, sourceCommit),
  };
  const configPath = join(publicRoot, "config", "ui-source-authority.json");
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, canonicalJson(config));
  return { config, configPath, publicRoot, sourceRoot };
}

test("accepts an exact complete cross-repository authority map", () => {
  const fixture = createFixture();
  const result = runChecker(fixture, "--json");

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /"rows": 4/);
  assert.match(result.stdout, /"sourceVerified": true/);
});

test("rejects a changed deferred public source byte", () => {
  const fixture = createFixture();
  writeFileSync(
    join(fixture.publicRoot, "packages/hua-ui/src/components/A.ts"),
    "export const a = 'tampered';\n",
  );

  const result = runChecker(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /current-output-mismatch/);
});

test("rejects an unmapped current source change", () => {
  const fixture = createFixture();
  writeFileSync(
    join(fixture.publicRoot, "packages/hua-ui/src/shared.ts"),
    "export const shared = false;\n",
  );

  const result = runChecker(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unmapped-current-source-change/);
});

test("rejects hidden assume-unchanged and skip-worktree source state", () => {
  for (const flag of ["--assume-unchanged", "--skip-worktree"]) {
    const fixture = createFixture();
    const path = "packages/hua-ui/src/shared.ts";
    runGit(fixture.publicRoot, ["update-index", flag, path]);
    writeFileSync(
      join(fixture.publicRoot, ...path.split("/")),
      "export const shared = false;\n",
    );
    assert.equal(
      runGit(fixture.publicRoot, [
        "diff",
        "--name-only",
        fixture.config.publicBase.commit,
        "--",
        "packages/hua-ui/src",
      ]),
      "",
    );

    const result = runChecker(fixture);
    assert.equal(result.status, 1, `${flag}: ${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /index-entry-not-ordinary/);
  }
});

test("ignores caller Git repository and index redirection", () => {
  const fixture = createFixture();
  const result = spawnSync(
    process.execPath,
    [
      checker,
      "--config",
      fixture.configPath,
      "--public-root",
      fixture.publicRoot,
      "--source-repo",
      fixture.sourceRoot,
      "--json",
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_DIR: join(fixture.sourceRoot, ".git"),
        GIT_INDEX_FILE: join(fixture.sourceRoot, ".git", "index"),
        GIT_WORK_TREE: fixture.sourceRoot,
      },
    },
  );

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /"sourceVerified": true/);
});

test("rejects an incomplete map even when its digest is recomputed", () => {
  const fixture = createFixture();
  writeConfig(fixture, (config) => {
    config.rows = config.rows.slice(1);
  });

  const result = runChecker(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /map-path-set-mismatch/);
});

test("rejects shuffled, duplicate, and unknown-disposition rows", () => {
  for (const mutate of [
    (config) => config.rows.reverse(),
    (config) => config.rows.push(structuredClone(config.rows[0])),
    (config) => {
      config.rows[0].disposition = "latest-wins";
    },
  ]) {
    const fixture = createFixture();
    writeConfig(fixture, mutate);
    const result = runChecker(fixture);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /unsorted-rows|duplicate-row|invalid-row-disposition/,
    );
  }
});

test("rejects a source authority byte mismatch", () => {
  const fixture = createFixture();
  writeConfig(fixture, (config) => {
    config.rows[0].sourceSha256 = "0".repeat(64);
  });

  const result = runChecker(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /source-authority-blob-mismatch/);
});

test("rejects a present authority blob larger than the byte ceiling", () => {
  const fixture = createOversizedSourceFixture();
  const result = runChecker(fixture);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /authority-file-too-large/);
  assert.doesNotMatch(result.stdout, /sourceVerified/);
});

test("distinguishes an unreadable authority blob from an absent path", () => {
  const fixture = createFixture();
  const path = "packages/hua-ui/src/components/A.ts";
  const object = runGit(fixture.sourceRoot, [
    "rev-parse",
    `${fixture.config.sourceAuthority.commit}:${path}`,
  ]);
  rmSync(
    join(
      fixture.sourceRoot,
      ".git",
      "objects",
      object.slice(0, 2),
      object.slice(2),
    ),
  );

  const result = runChecker(fixture);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /authority-blob-size-read-failed/);
  assert.doesNotMatch(result.stderr, /source-authority-blob-mismatch/);
});

test("rejects symlink substitution at the current public boundary", () => {
  const fixture = createFixture();
  const target = join(
    fixture.publicRoot,
    "packages/hua-ui/src/components/A.ts",
  );
  rmSync(target);
  symlinkSync("Keep.ts", target);

  const result = runChecker(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /current-file-not-regular/);
});

function createTarball(fixture) {
  const packageRoot = join(fixture.publicRoot, "pack", "package");
  mkdirSync(join(packageRoot, "dist"), { recursive: true });
  writeFileSync(
    join(packageRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "@hua-labs/ui",
        version: "0.0.0-test",
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.mjs",
          },
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(join(packageRoot, "dist/index.d.ts"), "export {};\n");
  writeFileSync(join(packageRoot, "dist/index.mjs"), "export {};\n");
  const tarball = join(fixture.publicRoot, "candidate.tgz");
  execFileSync("tar", [
    "-czf",
    tarball,
    "-C",
    join(fixture.publicRoot, "pack"),
    "package",
  ]);
  return tarball;
}

function installCheckerFixture(fixture) {
  const scripts = join(fixture.publicRoot, "scripts");
  mkdirSync(scripts, { recursive: true });
  copyFileSync(checker, join(scripts, "check-ui-source-authority.mjs"));
  copyFileSync(packChecker, join(scripts, "check-pack-artifacts.js"));
  writeFileSync(
    join(scripts, "check-dot-core-source-authority.mjs"),
    "#!/usr/bin/env node\nprocess.exit(0);\n",
  );
  writeFileSync(
    join(scripts, "check-dot-aot-source-authority.mjs"),
    "#!/usr/bin/env node\nprocess.exit(0);\n",
  );
}

test("pack inspection is blocked when current UI authority drifts", () => {
  const fixture = createFixture();
  installCheckerFixture(fixture);
  const tarball = createTarball(fixture);
  const installedPackChecker = join(
    fixture.publicRoot,
    "scripts",
    "check-pack-artifacts.js",
  );

  const clean = spawnSync(process.execPath, [installedPackChecker, tarball], {
    cwd: fixture.publicRoot,
    encoding: "utf8",
  });
  assert.equal(clean.status, 0, clean.stdout + clean.stderr);

  writeFileSync(
    join(fixture.publicRoot, "packages/hua-ui/src/components/A.ts"),
    "export const a = 'tampered';\n",
  );
  const drifted = spawnSync(process.execPath, [installedPackChecker, tarball], {
    cwd: fixture.publicRoot,
    encoding: "utf8",
  });
  assert.equal(drifted.status, 1);
  assert.match(drifted.stderr, /current-output-mismatch/);
  assert.match(drifted.stderr, /blocked by UI source authority/);
});
