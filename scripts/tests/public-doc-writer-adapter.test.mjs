import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test, { after } from "node:test";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TSX = join(REPO_ROOT, "node_modules", ".bin", "tsx");
const TEMP_ROOTS = new Set();

after(() => {
  for (const root of TEMP_ROOTS) rmSync(root, { recursive: true, force: true });
});

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), "hua-public-doc-writer-"));
  TEMP_ROOTS.add(root);
  mkdirSync(join(root, "scripts", "templates"), { recursive: true });
  mkdirSync(join(root, "packages"), { recursive: true });
  mkdirSync(join(root, "ai-docs"), { recursive: true });
  copyFileSync(
    join(REPO_ROOT, "scripts", "generate-docs.ts"),
    join(root, "scripts", "generate-docs.ts"),
  );
  copyFileSync(
    join(REPO_ROOT, "scripts", "templates", "readme.hbs"),
    join(root, "scripts", "templates", "readme.hbs"),
  );
  copyFileSync(
    join(REPO_ROOT, "scripts", "templates", "ai-yaml.hbs"),
    join(root, "scripts", "templates", "ai-yaml.hbs"),
  );
  const packageAx = join(REPO_ROOT, "scripts", "package-ax.mjs");
  if (existsSync(packageAx)) {
    copyFileSync(packageAx, join(root, "scripts", "package-ax.mjs"));
  }
  symlinkSync(join(REPO_ROOT, "node_modules"), join(root, "node_modules"));
  return root;
}

function writePackage(root, name, options = {}) {
  const packageDir = join(root, "packages", name);
  mkdirSync(join(packageDir, "src"), { recursive: true });
  const guide = options.guide;
  const files = ["dist"];
  if (guide?.distribution === "packed") files.unshift("GUIDE.md");
  writeFileSync(
    join(packageDir, "package.json"),
    `${JSON.stringify(
      {
        name: `@hua-labs/${name.replace(/^hua-/, "")}`,
        version: "1.2.3",
        description: `${name} package`,
        files,
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(packageDir, "src", "index.ts"),
    "export function example() { return true; }\n",
  );
  if (guide && options.writeGuide !== false) {
    writeFileSync(join(packageDir, "GUIDE.md"), `# ${name} Guide\n`);
  }
  const guideYaml = guide
    ? `\ndetailedGuide:\n  path: ${JSON.stringify(guide.path ?? "./GUIDE.md")}\n  distribution: ${JSON.stringify(guide.distribution)}\n  description: ${JSON.stringify(guide.description ?? "Usage details")}\n${options.guideExtra ?? ""}`
    : "";
  writeFileSync(
    join(packageDir, "doc.yaml"),
    `overview: ${JSON.stringify(`${name} overview`)}\nfeatures:\n  - ${JSON.stringify("Feature")}\nquickStart: ${JSON.stringify("example();")}\n${guideYaml}${options.docExtra ?? ""}`,
  );
}

function runWriter(root, args = []) {
  return spawnSync(TSX, ["scripts/generate-docs.ts", ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

function output(root, name) {
  return {
    readme: readFileSync(join(root, "packages", name, "README.md"), "utf8"),
    ai: readFileSync(
      join(root, "ai-docs", `${name.replace(/^hua-/, "")}.ai.yaml`),
      "utf8",
    ),
  };
}

test("renders shipped, repository-only, and absent guide authority deterministically", () => {
  const root = makeRoot();
  writePackage(root, "hua-shipped", {
    guide: { distribution: "packed", description: "Packed details" },
  });
  writePackage(root, "hua-repository", {
    guide: { distribution: "repository", description: "Repository details" },
  });
  writePackage(root, "hua-plain");

  const first = runWriter(root);
  assert.equal(first.status, 0, first.stderr || first.stdout);
  const firstOutputs = {
    shipped: output(root, "hua-shipped"),
    repository: output(root, "hua-repository"),
    plain: output(root, "hua-plain"),
  };
  const second = runWriter(root);
  assert.equal(second.status, 0, second.stderr || second.stdout);
  assert.deepEqual(
    {
      shipped: output(root, "hua-shipped"),
      repository: output(root, "hua-repository"),
      plain: output(root, "hua-plain"),
    },
    firstOutputs,
  );

  assert.match(firstOutputs.shipped.readme, /Packed details/);
  assert.match(firstOutputs.shipped.readme, /included in the package tarball/);
  assert.match(firstOutputs.shipped.ai, /state: "shipped"/);
  assert.match(firstOutputs.repository.readme, /Repository details/);
  assert.match(
    firstOutputs.repository.readme,
    /https:\/\/github\.com\/HUA-Labs\/hua-packages\/blob\/main\/packages\/hua-repository\/GUIDE\.md/,
  );
  assert.match(
    firstOutputs.repository.readme,
    /not included in the package tarball/,
  );
  assert.match(firstOutputs.repository.ai, /state: "repository-only"/);
  assert.doesNotMatch(firstOutputs.plain.readme, /Detailed Guide/);
  assert.doesNotMatch(firstOutputs.plain.ai, /detailedGuide:/);

  const validate = runWriter(root, ["--validate"]);
  assert.equal(validate.status, 0, validate.stderr || validate.stdout);
  const templatePath = join(root, "scripts", "templates", "readme.hbs");
  const template = readFileSync(templatePath, "utf8");
  writeFileSync(templatePath, `${template}x`);
  const staleTemplate = runWriter(root, ["--validate"]);
  assert.equal(staleTemplate.status, 1);
  assert.match(staleTemplate.stdout, /README\.md/);
  writeFileSync(templatePath, template);
  writeFileSync(
    join(root, "packages", "hua-shipped", "README.md"),
    `${firstOutputs.shipped.readme}x`,
  );
  const stale = runWriter(root, ["--validate"]);
  assert.equal(stale.status, 1);
  assert.match(stale.stdout, /hua-shipped\/README\.md/);
});

test("fails closed on malformed guide and package-root authority", async (t) => {
  const cases = [
    [
      "unknown top-level field",
      { docExtra: "unknownAuthority: true\n" },
      /unknown doc\.yaml key/,
    ],
    [
      "duplicate yaml key",
      { docExtra: "overview: duplicate\n" },
      /Map keys must be unique/,
    ],
    [
      "duplicate guide authority",
      {
        guide: { distribution: "packed" },
        docExtra: "readme:\n  detailedGuide: ./GUIDE.md\n",
      },
      /cannot be declared twice/,
    ],
    [
      "unknown guide field",
      {
        guide: { distribution: "packed" },
        guideExtra: "  unknownAuthority: true\n",
      },
      /unknown key/,
    ],
    [
      "path escape",
      { guide: { distribution: "packed", path: "../GUIDE.md" } },
      /safe/,
    ],
    [
      "missing guide",
      { guide: { distribution: "packed" }, writeGuide: false },
      /regular file/,
    ],
    [
      "distribution mismatch",
      { guide: { distribution: "repository" }, docExtra: "" },
      null,
    ],
  ];

  for (const [name, options, pattern] of cases) {
    await t.test(name, () => {
      const root = makeRoot();
      writePackage(root, "hua-invalid", options);
      if (name === "distribution mismatch") {
        const packagePath = join(
          root,
          "packages",
          "hua-invalid",
          "package.json",
        );
        const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
        pkg.files.unshift("GUIDE.md");
        writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
      }
      const result = runWriter(root, [
        "--validate",
        "--package",
        "hua-invalid",
      ]);
      assert.notEqual(result.status, 0);
      if (pattern) assert.match(`${result.stdout}\n${result.stderr}`, pattern);
    });
  }

  const escaped = runWriter(makeRoot(), [
    "--validate",
    "--package",
    "../escape",
  ]);
  assert.notEqual(escaped.status, 0);
  assert.match(
    `${escaped.stdout}\n${escaped.stderr}`,
    /package.*safe|invalid package/i,
  );

  const linkedPackageRoot = makeRoot();
  writePackage(linkedPackageRoot, "hua-linked");
  renameSync(
    join(linkedPackageRoot, "packages", "hua-linked"),
    join(linkedPackageRoot, "foreign-package"),
  );
  symlinkSync(
    join(linkedPackageRoot, "foreign-package"),
    join(linkedPackageRoot, "packages", "hua-linked"),
  );
  const linkedPackage = runWriter(linkedPackageRoot, [
    "--validate",
    "--package",
    "hua-linked",
  ]);
  assert.notEqual(linkedPackage.status, 0);
  assert.match(
    `${linkedPackage.stdout}\n${linkedPackage.stderr}`,
    /package root.*regular directory/,
  );

  const linkedOutputRoot = makeRoot();
  writePackage(linkedOutputRoot, "hua-output");
  rmSync(join(linkedOutputRoot, "ai-docs"), { recursive: true });
  mkdirSync(join(linkedOutputRoot, "foreign-ai"));
  symlinkSync(
    join(linkedOutputRoot, "foreign-ai"),
    join(linkedOutputRoot, "ai-docs"),
  );
  const linkedOutput = runWriter(linkedOutputRoot, ["--validate"]);
  assert.notEqual(linkedOutput.status, 0);
  assert.match(
    `${linkedOutput.stdout}\n${linkedOutput.stderr}`,
    /AI output root.*regular directory/,
  );
});

test("current public package outputs remain byte-identical under validate", () => {
  assert.ok(lstatSync(join(REPO_ROOT, "ai-docs")).isDirectory());
  const result = spawnSync(TSX, ["scripts/generate-docs.ts", "--validate"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("writer, AX adapter, and README template bytes are review-locked", () => {
  const expected = {
    "scripts/generate-docs.ts":
      "0403605d7249aa0d064c992547f1c98cbac6f41ec8bba22782af1ef51a115592",
    "scripts/package-ax.mjs":
      "124c508e53c165d283eb729094c7ee7eacd13675c343622eb9ce30f27a8a4f8a",
    "scripts/templates/readme.hbs":
      "bcae04c0249c22f4d7dafa079347876be474dbb48bf95c6f8f33d9953fca3879",
  };
  for (const [path, digest] of Object.entries(expected)) {
    const bytes = readFileSync(join(REPO_ROOT, path));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      digest,
      path,
    );
  }
});
