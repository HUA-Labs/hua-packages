import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../..", import.meta.url));
const checker = join(root, "scripts", "check-dot-lsp-source-authority.mjs");
const configPath = join(root, "config", "dot-lsp-source-authority.json");

function read(relativePath) {
  return readFileSync(join(root, ...relativePath.split("/")));
}

function text(relativePath) {
  return read(relativePath).toString("utf8");
}

function sha256(relativePath) {
  return createHash("sha256").update(read(relativePath)).digest("hex");
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
  return `${JSON.stringify(canonicalValue(value), null, 2).replace(
    /\[\n\s+("(?:[^"\\]|\\.)*")\n\s*\]/gu,
    "[$1]",
  )}\n`;
}

function digestCanonical(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function runChecker(args = [], cwd = root) {
  return spawnSync(
    process.execPath,
    [join(cwd, "scripts", checker.split("/").at(-1)), ...args],
    {
      cwd,
      encoding: "utf8",
    },
  );
}

function cloneFixture() {
  const parent = mkdtempSync(join(tmpdir(), "dot-lsp-authority-"));
  const clone = join(parent, "repo");
  execFileSync("git", ["clone", "--quiet", "--shared", root, clone], {
    stdio: "ignore",
  });
  return { clone, parent };
}

function configFixture(mutator) {
  const parent = mkdtempSync(join(tmpdir(), "dot-lsp-config-"));
  const path = join(parent, "authority.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  mutator(config);
  writeFileSync(path, canonicalJson(config));
  return { parent, path };
}

test("derived public manifest preserves release authority and projects exact product fields", () => {
  const manifest = JSON.parse(text("packages/hua-dot-lsp/package.json"));
  const publicBase = JSON.parse(
    execFileSync(
      "git",
      [
        "show",
        "4b0aa16ce0870a56bbab8e525eac9e40dd4273d4:packages/hua-dot-lsp/package.json",
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );

  assert.equal(manifest.version, "0.1.3");
  assert.equal(manifest.engines.node, ">=20.0.0");
  assert.equal(manifest.dependencies["@hua-labs/dot"], "workspace:0.2.2");
  assert.equal(
    manifest.scripts.build,
    "tsup src/index.ts --format esm --shims && node -e \"require('node:fs').rmSync('dist/index.d.ts',{force:true})\"",
  );
  assert.deepEqual(manifest.repository, publicBase.repository);
  assert.deepEqual(manifest.publishConfig, publicBase.publishConfig);
  assert.deepEqual(manifest.files, publicBase.files);

  const normalized = structuredClone(manifest);
  normalized.scripts.build = publicBase.scripts.build;
  assert.deepEqual(normalized, publicBase);

  assert.equal(
    sha256("pnpm-lock.yaml"),
    "b007cddf769b5e15a1715a108956aee83eb01039a782da58f6ccade0b21cb831",
  );
});

test("the 15 platform-exact package rows retain byte-exact product authority", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rows = config.rows.filter(
    (row) => row.disposition === "platform-exact",
  );
  assert.equal(rows.length, 15);
  assert.deepEqual(
    rows.map((row) => row.path),
    [
      "packages/hua-dot-lsp/DETAILED_GUIDE.md",
      "packages/hua-dot-lsp/LICENSE",
      "packages/hua-dot-lsp/doc.yaml",
      "packages/hua-dot-lsp/src/__tests__/completions.test.ts",
      "packages/hua-dot-lsp/src/__tests__/diagnostics.test.ts",
      "packages/hua-dot-lsp/src/__tests__/server-info.test.ts",
      "packages/hua-dot-lsp/src/__tests__/settings.test.ts",
      "packages/hua-dot-lsp/src/completions.ts",
      "packages/hua-dot-lsp/src/diagnostics.ts",
      "packages/hua-dot-lsp/src/dot-regions.ts",
      "packages/hua-dot-lsp/src/index.ts",
      "packages/hua-dot-lsp/src/server-info.ts",
      "packages/hua-dot-lsp/src/settings.ts",
      "packages/hua-dot-lsp/tsconfig.json",
      "packages/hua-dot-lsp/vitest.config.ts",
    ],
  );
  for (const row of rows) {
    assert.equal(row.outputSha256, row.sourceSha256, row.path);
    assert.equal(sha256(row.path), row.sourceSha256, row.path);
  }
});

test("platform docs and derived projections preserve bounded LSP release truth", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const doc = text("packages/hua-dot-lsp/doc.yaml");
  const readme = text("packages/hua-dot-lsp/README.md");
  const ai = text("ai-docs/dot-lsp.ai.yaml");

  for (const marker of [
    "package-local bounded hand-maintained completion catalog",
    "direct runtime dependency",
    "manifest-derived initialize server identity",
    "channel-pending",
  ]) {
    assert.ok(doc.includes(marker), marker);
    assert.ok(readme.includes(marker), marker);
    assert.ok(ai.includes(marker), marker);
  }
  assert.match(doc, /does not publish a stable JavaScript import API/u);
  assert.match(readme, /does not publish a stable JavaScript import API/u);
  assert.match(ai, /does not create a JavaScript import API/u);
  assert.doesNotMatch(doc, /peer dependency|generated at build time/u);
  assert.doesNotMatch(readme, /peer dependency|generated at build time/u);
  assert.doesNotMatch(ai, /peer dependency|generated at build time/u);

  const row = config.rows.find(
    (candidate) => candidate.path === "packages/hua-dot-lsp/doc.yaml",
  );
  assert.equal(row.disposition, "platform-exact");
  assert.equal(row.outputSha256, sha256(row.path));
  assert.equal(row.outputSha256, row.sourceSha256);
  assert.notEqual(row.outputSha256, row.publicBaseSha256);

  assert.match(readme, /dot-lsp --stdio/u);
  assert.match(ai, /node: ">=20\.0\.0"/u);
});

test("the generated public README and AI projection bind the exact doc semantics", () => {
  const readme = text("packages/hua-dot-lsp/README.md");
  const ai = text("ai-docs/dot-lsp.ai.yaml");
  for (const marker of [
    "package-local bounded hand-maintained completion catalog",
    "direct runtime dependency",
    "manifest-derived initialize server identity",
    "does not claim Marketplace availability",
  ]) {
    assert.ok(readme.includes(marker), marker);
    assert.ok(ai.includes(marker), marker);
  }
  assert.match(ai, /# Version: 0\.1\.3/u);
  assert.match(ai, /node: ">=20\.0\.0"/u);
});

test("server identity is manifest-derived and ambient inputs are non-authority", () => {
  const serverInfo = text("packages/hua-dot-lsp/src/server-info.ts");
  const index = text("packages/hua-dot-lsp/src/index.ts");

  assert.match(
    serverInfo,
    /import packageManifest from "\.\.\/package\.json" with \{ type: "json" \};/u,
  );
  assert.match(
    serverInfo,
    /DOT_LSP_SERVER_INFO = createDotLspServerInfo\(\s*packageManifest\.version/u,
  );
  assert.doesNotMatch(
    serverInfo,
    /process\.env|node:fs|readFile|Date\.|new Date|npm(?:js)?/u,
  );
  assert.match(index, /serverInfo: DOT_LSP_SERVER_INFO/u);
  assert.doesNotMatch(index, /serverInfo:\s*\{[\s\S]*?version:/u);
});

test("stale public-first provenance is not source or base authority", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  assert.equal(
    config.publicBase.commit,
    "4b0aa16ce0870a56bbab8e525eac9e40dd4273d4",
  );
  assert.equal(
    config.sourceAuthority.commit,
    "6be90ccac2f83f8c0fb7befb7310bbcbc590cce6",
  );
  assert.notEqual(
    config.publicBase.commit,
    "742da1e7dd5d53d06b0614ee53cea70c514e29ff",
  );
  assert.notEqual(
    config.sourceAuthority.commit,
    "31fdb629236dc58fdf7d415cab356fa8602399e1",
  );
});

test("the pack boundary invokes the dedicated Dot LSP source authority", () => {
  assert.equal(
    existsSync(join(root, "config", "dot-lsp-source-authority.json")),
    true,
  );
  assert.equal(
    existsSync(join(root, "scripts", "check-dot-lsp-source-authority.mjs")),
    true,
  );
  assert.match(
    text("scripts/check-pack-artifacts.js"),
    /check-dot-lsp-source-authority\.mjs/u,
  );
});

test("the complete package union and artifact authority are canonical", () => {
  const raw = readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  assert.equal(raw, canonicalJson(config));
  assert.equal(config.schema, "hua-dot-lsp-source-authority.v1");
  assert.equal(config.authorityKind, "platform-dot-lsp-package-projection");
  assert.equal(config.packagePath, "packages/hua-dot-lsp");
  assert.equal(config.rows.length, 18);
  assert.equal(config.mapDigest, digestCanonical(config.rows));
  assert.deepEqual(
    Object.fromEntries(
      [
        "platform-exact",
        "public-preserved",
        "derived-reviewed",
        "platform-only-excluded",
      ].map((value) => [
        value,
        config.rows.filter((row) => row.disposition === value).length,
      ]),
    ),
    {
      "platform-exact": 15,
      "public-preserved": 1,
      "derived-reviewed": 2,
      "platform-only-excluded": 0,
    },
  );
  assert.equal(
    config.artifact.rosterDigest,
    digestCanonical(config.artifact.files),
  );
  assert.equal(config.artifact.files.length, 6);
  assert.equal(config.artifact.packageName, "@hua-labs/dot-lsp");
  assert.equal(config.artifact.packageVersion, "0.1.3");
  assert.equal(Object.hasOwn(config.sourceAuthority, "repository"), false);
  assert.equal(Object.hasOwn(config.sourceAuthority, "url"), false);
});

test("every projected package path agrees with its reviewed output digest", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  for (const row of config.rows) {
    const absolute = join(root, ...row.path.split("/"));
    if (row.disposition === "platform-only-excluded") {
      assert.equal(existsSync(absolute), false, row.path);
      continue;
    }
    assert.equal(existsSync(absolute), true, row.path);
    assert.equal(
      createHash("sha256").update(readFileSync(absolute)).digest("hex"),
      row.outputSha256,
      row.path,
    );
  }
});

test("a self-consistent unselected-row reclassification rejects", () => {
  const { parent, path } = configFixture((config) => {
    const row = config.rows.find(
      (candidate) => candidate.path === "packages/hua-dot-lsp/LICENSE",
    );
    row.disposition = "public-preserved";
    config.mapDigest = digestCanonical(config.rows);
  });
  try {
    const result = runChecker(["--config", path]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /reviewed-map-digest-mismatch/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a self-consistent platform semantic digest drift rejects", () => {
  const { parent, path } = configFixture((config) => {
    const row = config.rows.find(
      (candidate) => candidate.path === "packages/hua-dot-lsp/doc.yaml",
    );
    row.sourceSha256 = createHash("sha256")
      .update("foreign platform semantic authority")
      .digest("hex");
    row.outputSha256 = row.sourceSha256;
    config.mapDigest = digestCanonical(config.rows);
  });
  try {
    const result = runChecker(["--config", path]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /reviewed-map-digest-mismatch/u);
    assert.doesNotMatch(result.stderr, /foreign platform semantic authority/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("missing, extra, duplicate, shuffled, oversize, and escaped rows reject", () => {
  const cases = [
    {
      mutate: (config) => config.rows.splice(1, 0, { ...config.rows[0] }),
      expected: /duplicate-row/u,
    },
    {
      mutate: (config) => {
        config.rows[0].path = "packages/hua-dot-lsp/../outside.ts";
      },
      expected: /invalid-row-path/u,
    },
    {
      mutate: (config) => config.rows.pop(),
      expected: /map-digest-mismatch/u,
    },
    {
      mutate: (config) => {
        const template = config.rows.find(
          (row) => row.path === "packages/hua-dot-lsp/src/index.ts",
        );
        config.rows.push({
          ...template,
          path: "packages/hua-dot-lsp/zz-unexpected.ts",
        });
      },
      expected: /map-digest-mismatch/u,
    },
    {
      mutate: (config) => config.rows.reverse(),
      expected: /unsorted-rows/u,
    },
    {
      mutate: (config) => {
        config.rows = [];
      },
      expected: /invalid-row-count/u,
    },
    {
      mutate: (config) => {
        config.rows = Array.from({ length: 513 }, () => ({
          ...config.rows[0],
        }));
      },
      expected: /invalid-row-count/u,
    },
  ];
  for (const { mutate, expected } of cases) {
    const { parent, path } = configFixture(mutate);
    try {
      const result = runChecker(["--config", path]);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, expected);
    } finally {
      rmSync(parent, { force: true, recursive: true });
    }
  }
});

test("an ordinary clean tracked package is admitted", () => {
  const result = runChecker();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /18 rows/u);
});

test("a one-byte generated or product-doc tamper rejects without leaking bytes", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-lsp/doc.yaml";
    writeFileSync(
      join(clone, relative),
      `${text(relative)}\nprivate-product-doc-sentinel\n`,
    );
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /current-output-mismatch/u);
    assert.doesNotMatch(result.stderr, /private-product-doc-sentinel/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a hidden tracked-byte change is rejected as a non-ordinary index", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-lsp/src/index.ts";
    writeFileSync(join(clone, relative), "hidden projection drift\n");
    execFileSync("git", ["update-index", "--assume-unchanged", relative], {
      cwd: clone,
    });
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /index-entry-not-ordinary/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a symlink substituted for a tracked package path is rejected", () => {
  const { clone, parent } = cloneFixture();
  try {
    const relative = "packages/hua-dot-lsp/src/index.ts";
    rmSync(join(clone, relative));
    symlinkSync("native.ts", join(clone, relative));
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /current-file-not-regular/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("an unmapped package file is rejected", () => {
  const { clone, parent } = cloneFixture();
  try {
    writeFileSync(
      join(clone, "packages/hua-dot-lsp/src/unmapped.ts"),
      "export {};\n",
    );
    const result = runChecker([], clone);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /untracked-package-path/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});

test("a substituted tarball is rejected before artifact admission", () => {
  const parent = mkdtempSync(join(tmpdir(), "dot-core-tar-"));
  try {
    const tarball = join(parent, "substituted.tgz");
    writeFileSync(tarball, Buffer.from("not the reviewed artifact"));
    const result = runChecker(["--tarball", tarball]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /tarball-bytes-mismatch/u);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});
