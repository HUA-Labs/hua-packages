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
const packageRoot = join(root, "packages", "hua-motion-core");
const manifest = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
);
const doc = parseYaml(readFileSync(join(packageRoot, "doc.yaml"), "utf8"));
const readme = readFileSync(join(packageRoot, "README.md"), "utf8");
const guide = readFileSync(join(packageRoot, "DETAILED_GUIDE.md"), "utf8");
const ai = parseYaml(
  readFileSync(join(root, "ai-docs", "motion-core.ai.yaml"), "utf8"),
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
  return [...markdown.matchAll(expression)].map((match, index) => ({
    index: index + 1,
    language: match[1].trim().split(/\s+/)[0].toLowerCase(),
    code: match[2],
  }));
}

const typedFences = fencedCodeBlocks(guide).filter((fence) =>
  /^(?:js|jsx|ts|tsx|javascript|typescript)$/.test(fence.language),
);
const readmeTypedFences = fencedCodeBlocks(readme).filter((fence) =>
  /^(?:js|jsx|ts|tsx|javascript|typescript)$/.test(fence.language),
);

test("Motion README and manifest distribute the generated Detailed Guide authority", () => {
  assert.equal(doc.readme?.detailedGuide, "./DETAILED_GUIDE.md");
  assert.equal(
    readme.match(/\[Detailed Guide\]\(\.\/DETAILED_GUIDE\.md\)/g)?.length,
    1,
  );
  assert.equal(
    manifest.files.filter((entry) => entry === "DETAILED_GUIDE.md").length,
    1,
  );
  assert.ok(manifest.files.includes("!dist/.tsbuildinfo"));
  assert.equal(ai.package.name, manifest.name);
  assert.match(readme, /Required peer: `react >=19\.0\.0`/);
  assert.match(readme, /Optional, target-specific peers:/);
  assert.doesNotMatch(
    readme,
    /> Peer dependencies: react >=19\.0\.0, react-dom >=19\.0\.0, react-native >=0\.73\.0/,
  );
});

test("Motion guide imports resolve through exact root and native exports", () => {
  const moduleExports = moduleExportsBySpecifier();
  const issues = [];

  for (const fence of typedFences) {
    const sourceFile = ts.createSourceFile(
      `motion-guide-${fence.index}.tsx`,
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
      if (!specifier.startsWith("@hua-labs/motion-core")) continue;
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

  for (const exportNote of Object.keys(doc.apiNotes ?? {})) {
    const nativeMatch = /^(.*) \(native\)$/.exec(exportNote);
    const specifier = nativeMatch ? `${manifest.name}/native` : manifest.name;
    const exportName = nativeMatch?.[1] ?? exportNote;
    if (!moduleExports.get(specifier)?.has(exportName)) {
      issues.push(`doc api note ${exportNote} has no ${specifier} export`);
    }
  }

  for (const subpath of doc.subpathExports ?? []) {
    const specifier = `${manifest.name}/${subpath.path}`;
    if (!moduleExports.has(specifier)) {
      issues.push(`doc subpath ${specifier} has no manifest export`);
    }
  }

  assert.deepEqual(
    ai.exports.main.provides.map((entry) => entry.name).sort(),
    Object.keys(doc.apiNotes ?? {}).sort(),
  );

  assert.deepEqual(issues, []);
});

test("Motion web examples type-check against current source authority", () => {
  const directory = mkdtempSync(join(tmpdir(), "hua-motion-guide-"));

  try {
    const rootNames = [];
    const webExamples = [
      ...typedFences.map((fence) => ({ ...fence, source: "guide" })),
      ...readmeTypedFences.map((fence) => ({ ...fence, source: "readme" })),
    ];
    for (const fence of webExamples) {
      if (fence.code.includes('"@hua-labs/motion-core/native"')) continue;
      if (fence.code.includes("'@hua-labs/motion-core/native'")) continue;
      const file = join(
        directory,
        `${fence.source}-${String(fence.index).padStart(3, "0")}.tsx`,
      );
      writeFileSync(file, fence.code);
      rootNames.push(file);
    }

    const options = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      baseUrl: root,
      paths: {
        "@hua-labs/motion-core": ["packages/hua-motion-core/src/index.ts"],
        "react/jsx-runtime": ["node_modules/@types/react/jsx-runtime.d.ts"],
      },
    };
    const program = ts.createProgram(rootNames, options);
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

test("Motion docs use current options and bounded evidence language", () => {
  const combinedGenerated = `${readme}\n${JSON.stringify(ai)}`;
  const typedExampleSource = typedFences.map((fence) => fence.code).join("\n");

  assert.match(guide, /autoStart/);
  assert.match(guide, /initialOpacity/);
  assert.match(guide, /targetOpacity/);
  assert.match(guide, /initialScale/);
  assert.match(guide, /targetScale/);
  assert.match(guide, /@hua-labs\/motion-core\/native/);
  assert.doesNotMatch(typedExampleSource, /\bautoPlay\s*:/);
  assert.doesNotMatch(guide, /consistent 60fps/i);
  assert.doesNotMatch(guide, /All hooks return a consistent interface/i);
  assert.doesNotMatch(combinedGenerated, /SSR-compatible/i);
  assert.ok(!doc.related?.includes("hua"));
  assert.doesNotMatch(readme, /npmjs\.com\/package\/@hua-labs\/hua/);
});
