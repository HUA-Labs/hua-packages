import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { parse as parseYaml } from "yaml";

const root = fileURLToPath(new URL("../..", import.meta.url));
const packageDirectories = ["hua-hooks", "hua-state", "hua-utils"];

function loadWorkspacePackages() {
  const packages = new Map();

  for (const directory of readdirSync(join(root, "packages"))) {
    const manifestPath = join(root, "packages", directory, "package.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    packages.set(manifest.name, { directory, manifest });
  }

  return packages;
}

const workspacePackages = loadWorkspacePackages();

function packageRecord(directory) {
  const packageRoot = join(root, "packages", directory);
  const manifest = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8"),
  );

  return {
    directory,
    packageRoot,
    manifest,
    doc: parseYaml(readFileSync(join(packageRoot, "doc.yaml"), "utf8")),
    readme: readFileSync(join(packageRoot, "README.md"), "utf8"),
    guide: readFileSync(join(packageRoot, "DETAILED_GUIDE.md"), "utf8"),
    ai: parseYaml(
      readFileSync(
        join(
          root,
          "ai-docs",
          `${manifest.name.replace("@hua-labs/", "")}.ai.yaml`,
        ),
        "utf8",
      ),
    ),
  };
}

const packageRecords = packageDirectories.map(packageRecord);
const selectedPackageNames = new Set(
  packageRecords.map((record) => record.manifest.name),
);

function directTypesTarget(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;
  if (typeof value.types === "string") return value.types;
  if (typeof value.import === "string") return value.import;
  if (typeof value.default === "string") return value.default;
  return directTypesTarget(value.default);
}

function publicSpecifier(packageName, exportKey) {
  return exportKey === "."
    ? packageName
    : `${packageName}${exportKey.slice(1)}`;
}

function sourceForExport(workspacePackage, exportKey) {
  const target = directTypesTarget(
    workspacePackage.manifest.exports[exportKey],
  );
  assert.ok(
    target,
    `${workspacePackage.manifest.name}${exportKey} has no target`,
  );

  const relative = target
    .replace(/^\.\/dist\//, "")
    .replace(/\.d\.(?:mts|cts|ts)$/, "")
    .replace(/\.(?:mjs|cjs|js)$/, "");
  const base = join(
    root,
    "packages",
    workspacePackage.directory,
    "src",
    relative,
  );
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  const source = candidates.find(existsSync);

  assert.ok(
    source,
    `${workspacePackage.manifest.name}${exportKey} has no source for ${target}`,
  );
  return source;
}

function moduleExportsBySpecifier() {
  const sourceMap = new Map();

  for (const [packageName, workspacePackage] of workspacePackages) {
    if (!selectedPackageNames.has(packageName)) continue;
    for (const exportKey of Object.keys(
      workspacePackage.manifest.exports ?? {},
    )) {
      const target = directTypesTarget(
        workspacePackage.manifest.exports[exportKey],
      );
      if (!target || target.endsWith(".css")) continue;
      sourceMap.set(
        publicSpecifier(packageName, exportKey),
        sourceForExport(workspacePackage, exportKey),
      );
    }
  }

  const program = ts.createProgram([...new Set(sourceMap.values())], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const result = new Map();

  for (const [specifier, sourcePath] of sourceMap) {
    const sourceFile = program.getSourceFile(sourcePath);
    assert.ok(sourceFile, `TypeScript program omitted ${sourcePath}`);
    const symbol = checker.getSymbolAtLocation(sourceFile);
    assert.ok(symbol, `TypeScript module has no symbol: ${sourcePath}`);
    result.set(
      specifier,
      new Set(checker.getExportsOfModule(symbol).map((item) => item.name)),
    );
  }

  return result;
}

function fencedCodeBlocks(markdown) {
  const marker = "`".repeat(3);
  const expression = new RegExp(
    `${marker}([^\\n]*)\\n([\\s\\S]*?)${marker}`,
    "g",
  );
  return [...markdown.matchAll(expression)].map((match) => ({
    language: match[1].trim().split(/\s+/)[0].toLowerCase(),
    code: match[2],
  }));
}

test("support READMEs expose Detailed Guides owned by doc.yaml and packed manifests", () => {
  for (const record of packageRecords) {
    assert.equal(record.ai.package.name, record.manifest.name);
    assert.equal(
      record.doc.readme?.detailedGuide,
      "./DETAILED_GUIDE.md",
      record.manifest.name,
    );
    assert.equal(
      record.readme.match(/\[Detailed Guide\]\(\.\/DETAILED_GUIDE\.md\)/g)
        ?.length,
      1,
      record.manifest.name,
    );
    assert.equal(
      record.manifest.files.filter((entry) => entry === "DETAILED_GUIDE.md")
        .length,
      1,
      record.manifest.name,
    );
  }
});

test("support Detailed Guide imports resolve through real public routes and exports", () => {
  const moduleExports = moduleExportsBySpecifier();
  const issues = [];

  for (const record of packageRecords) {
    fencedCodeBlocks(record.guide).forEach((fence, fenceIndex) => {
      if (!/^(?:js|jsx|ts|tsx|javascript|typescript)$/.test(fence.language)) {
        return;
      }
      const sourceFile = ts.createSourceFile(
        `${basename(record.packageRoot)}-guide-${fenceIndex + 1}.tsx`,
        fence.code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );

      for (const diagnostic of sourceFile.parseDiagnostics) {
        issues.push(
          `${record.manifest.name}: fence ${fenceIndex + 1} syntax ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
        );
      }

      for (const statement of sourceFile.statements) {
        if (
          !ts.isImportDeclaration(statement) ||
          !ts.isStringLiteral(statement.moduleSpecifier)
        ) {
          continue;
        }

        const specifier = statement.moduleSpecifier.text;
        if (!specifier.startsWith("@hua-labs/")) continue;
        const matchingPackage = [...workspacePackages.keys()]
          .sort((left, right) => right.length - left.length)
          .find(
            (name) => specifier === name || specifier.startsWith(`${name}/`),
          );

        if (!matchingPackage) {
          issues.push(`${record.manifest.name}: unknown package ${specifier}`);
          continue;
        }

        const workspacePackage = workspacePackages.get(matchingPackage);
        const exportKey =
          specifier === matchingPackage
            ? "."
            : `.${specifier.slice(matchingPackage.length)}`;
        if (
          !Object.hasOwn(workspacePackage.manifest.exports ?? {}, exportKey)
        ) {
          issues.push(`${record.manifest.name}: missing route ${specifier}`);
          continue;
        }

        const available = moduleExports.get(specifier);
        assert.ok(available, `no source authority for ${specifier}`);
        const clause = statement.importClause;

        if (clause?.name && !available.has("default")) {
          issues.push(`${record.manifest.name}: ${specifier} has no default`);
        }
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const element of clause.namedBindings.elements) {
            const imported = (element.propertyName ?? element.name).text;
            if (!available.has(imported)) {
              issues.push(
                `${record.manifest.name}: ${specifier} has no ${imported}`,
              );
            }
          }
        }
      }
    });
  }

  assert.deepEqual(issues, []);
});

test("support docs retain exact package identity without held framework promotion", () => {
  for (const record of packageRecords) {
    assert.match(record.guide, new RegExp(record.manifest.name));
    assert.doesNotMatch(record.guide, /@hua-labs\/hua\//);
    assert.ok(!record.doc.related?.includes("hua"), record.manifest.name);
    assert.doesNotMatch(record.readme, /npmjs\.com\/package\/@hua-labs\/hua/);
  }
});

test("support docs preserve bounded runtime and security claims", () => {
  const hooks = packageRecords.find(
    (record) => record.manifest.name === "@hua-labs/hooks",
  );
  const state = packageRecords.find(
    (record) => record.manifest.name === "@hua-labs/state",
  );
  const utils = packageRecords.find(
    (record) => record.manifest.name === "@hua-labs/utils",
  );
  assert.ok(hooks && state && utils);

  const loadingSource = readFileSync(
    join(hooks.packageRoot, "src", "useLoading.ts"),
    "utf8",
  );
  assert.match(hooks.guide, /pending delayed starts are\s+cancelled/);
  assert.match(loadingSource, /clearPendingDelay/);
  assert.match(loadingSource, /useEffect\(\(\) => clearPendingDelay/);

  assert.match(
    state.guide,
    /`ssr` option is accepted for compatibility but currently has no runtime effect/,
  );
  assert.doesNotMatch(state.guide, /ssr:\s*true/);
  assert.doesNotMatch(state.readme, /Automatic hydration handling/i);
  assert.doesNotMatch(
    JSON.stringify(state.doc),
    /Automatic hydration handling/i,
  );

  assert.match(
    utils.guide,
    /not treat client-side sanitization as a full security boundary/i,
  );
  assert.doesNotMatch(utils.readme, /XSS prevention/i);
  assert.doesNotMatch(JSON.stringify(utils.doc), /XSS prevention/i);
});
