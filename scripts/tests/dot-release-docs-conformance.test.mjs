import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { parse as parseYaml } from "yaml";

const root = fileURLToPath(new URL("../..", import.meta.url));
const packageRoot = join(root, "packages", "hua-dot");
const manifest = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
);
const doc = parseYaml(readFileSync(join(packageRoot, "doc.yaml"), "utf8"));
const readme = readFileSync(join(packageRoot, "README.md"), "utf8");
const guide = readFileSync(join(packageRoot, "DETAILED_GUIDE.md"), "utf8");
const ai = parseYaml(
  readFileSync(join(root, "ai-docs", "dot.ai.yaml"), "utf8"),
);

function directTypesTarget(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;
  if (typeof value.types === "string") return value.types;
  if (typeof value.import === "string") return value.import;
  if (typeof value.default === "string") return value.default;
  return directTypesTarget(value.default);
}

function sourceForExport(exportKey) {
  const target = directTypesTarget(manifest.exports[exportKey]);
  assert.ok(target, `${manifest.name}${exportKey} has no target`);
  const relative = target
    .replace(/^\.\/dist\//, "")
    .replace(/\.d\.(?:mts|cts|ts)$/, "")
    .replace(/\.(?:mjs|cjs|js)$/, "");
  const base = join(packageRoot, "src", relative);
  const source = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(
    existsSync,
  );
  assert.ok(source, `${manifest.name}${exportKey} has no source for ${target}`);
  return source;
}

function publicSpecifier(exportKey) {
  return exportKey === "."
    ? manifest.name
    : `${manifest.name}${exportKey.slice(1)}`;
}

function moduleExportsBySpecifier() {
  const sourceMap = new Map(
    Object.keys(manifest.exports).map((exportKey) => [
      publicSpecifier(exportKey),
      sourceForExport(exportKey),
    ]),
  );
  const program = ts.createProgram([...new Set(sourceMap.values())], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
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
  return [...markdown.matchAll(expression)].map((match, index) => ({
    index: index + 1,
    language: match[1].trim().split(/\s+/)[0].toLowerCase(),
    code: match[2],
  }));
}

const typedFencePattern = /^(?:js|jsx|ts|tsx|javascript|typescript)$/;
const typedGuideFences = fencedCodeBlocks(guide).filter((fence) =>
  typedFencePattern.test(fence.language),
);
const typedReadmeFences = fencedCodeBlocks(readme).filter((fence) =>
  typedFencePattern.test(fence.language),
);

test("Dot README and manifest distribute one generated Detailed Guide authority", () => {
  assert.equal(manifest.name, "@hua-labs/dot");
  assert.equal(doc.readme?.detailedGuide, "./DETAILED_GUIDE.md");
  assert.equal(
    readme.match(/\[Detailed Guide\]\(\.\/DETAILED_GUIDE\.md\)/g)?.length,
    1,
  );
  assert.equal(
    manifest.files.filter((entry) => entry === "DETAILED_GUIDE.md").length,
    1,
  );
  assert.equal(ai.package.name, manifest.name);
  assert.match(readme, /pnpm add @hua-labs\/dot/);
  assert.deepEqual(manifest.dependencies ?? {}, {});
  assert.deepEqual(manifest.peerDependencies ?? {}, {});
});

test("Dot guide imports and documented API names resolve through exact public routes", () => {
  const moduleExports = moduleExportsBySpecifier();
  const issues = [];

  for (const fence of [...typedGuideFences, ...typedReadmeFences]) {
    const sourceFile = ts.createSourceFile(
      `dot-doc-${fence.index}.tsx`,
      fence.code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    for (const diagnostic of sourceFile.parseDiagnostics) {
      issues.push(
        `fence ${fence.index} syntax ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
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
      if (!specifier.startsWith(`${manifest.name}`)) continue;
      const available = moduleExports.get(specifier);
      if (!available) {
        issues.push(`fence ${fence.index} missing route ${specifier}`);
        continue;
      }
      const clause = statement.importClause;
      if (clause?.name && !available.has("default")) {
        issues.push(`fence ${fence.index} ${specifier} has no default`);
      }
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          const imported = (element.propertyName ?? element.name).text;
          if (!available.has(imported)) {
            issues.push(`fence ${fence.index} ${specifier} has no ${imported}`);
          }
        }
      }
    }
  }

  const rootExports = moduleExports.get(manifest.name);
  for (const exportNote of Object.keys(doc.apiNotes ?? {})) {
    if (exportNote === `${manifest.name}/native`) {
      if (!moduleExports.has(exportNote)) {
        issues.push(`doc api route ${exportNote} has no manifest export`);
      }
      continue;
    }
    if (!rootExports?.has(exportNote)) {
      issues.push(`doc api note ${exportNote} has no root export`);
    }
  }

  for (const subpath of doc.subpathExports ?? []) {
    const specifier = `${manifest.name}/${subpath.path}`;
    if (!moduleExports.has(specifier)) {
      issues.push(`doc subpath ${specifier} has no manifest export`);
    }
  }

  for (const entry of ai.exports.main.provides) {
    if (!rootExports?.has(entry.name)) {
      issues.push(`AI projection contains missing root export ${entry.name}`);
    }
  }

  assert.deepEqual(issues, []);
});

test("Dot README quick start type-checks against current source authority", () => {
  assert.equal(typedReadmeFences.length, 1);
  const directory = mkdtempSync(join(tmpdir(), "hua-dot-readme-"));

  try {
    const sourcePath = join(directory, "readme.ts");
    writeFileSync(sourcePath, typedReadmeFences[0].code);
    const program = ts.createProgram([sourcePath], {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      baseUrl: root,
      paths: {
        "@hua-labs/dot": ["packages/hua-dot/src/index.ts"],
      },
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.file?.fileName.startsWith(directory))
      .map((diagnostic) => ({
        file: basename(diagnostic.file.fileName),
        line:
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
            .line + 1,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
      }));

    assert.deepEqual(diagnostics, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Dot docs use bounded source-backed target and state claims", () => {
  const generated = `${readme}\n${JSON.stringify(ai)}`;
  const allDocs = `${generated}\n${guide}`;

  assert.ok(!doc.related?.includes("hua"));
  assert.doesNotMatch(readme, /npmjs\.com\/package\/@hua-labs\/hua/);
  assert.doesNotMatch(generated, /\b\d[\d,]*\+? tests\b/i);
  assert.doesNotMatch(allDocs, /\b\d+\+ unsupported props\b/i);
  assert.doesNotMatch(guide, /entire pipeline is synchronous and pure/i);
  assert.doesNotMatch(guide, /all properties are natively supported/i);
  assert.doesNotMatch(generated, /clearDotCache\(\).*after config changes/i);
  assert.match(guide, /module-level\s+configuration/i);
  assert.match(guide, /dotExplain\(\)/);
  assert.match(guide, /warnDropped/);
  assert.match(guide, /does not prove browser support/i);
});
