import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { parse as parseYaml } from "yaml";

const root = fileURLToPath(new URL("../..", import.meta.url));
const packageRoot = join(root, "packages", "hua-ui");
const manifest = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
);
const doc = parseYaml(readFileSync(join(packageRoot, "doc.yaml"), "utf8"));
const readme = readFileSync(join(packageRoot, "README.md"), "utf8");
const guide = readFileSync(join(packageRoot, "DETAILED_GUIDE.md"), "utf8");
const tsupSource = readFileSync(join(packageRoot, "tsup.config.ts"), "utf8");

function propertyName(node) {
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node)
  ) {
    return node.text;
  }
  return null;
}

function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function objectStringEntries(node) {
  const value = unwrap(node);
  if (!value || !ts.isObjectLiteralExpression(value)) return [];

  return value.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property)) return [];
    const key = propertyName(property.name);
    const initializer = unwrap(property.initializer);
    if (!key || !initializer || !ts.isStringLiteral(initializer)) return [];
    return [[key, initializer.text]];
  });
}

function collectTsupEntries() {
  const sourceFile = ts.createSourceFile(
    "tsup.config.ts",
    tsupSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const objectVariables = new Map();
  const entries = new Map();

  function firstPass(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      const value = unwrap(node.initializer);
      if (value && ts.isObjectLiteralExpression(value)) {
        objectVariables.set(node.name.text, value);
      }
    }
    ts.forEachChild(node, firstPass);
  }

  function secondPass(node) {
    if (ts.isPropertyAssignment(node) && propertyName(node.name) === "entry") {
      const value = unwrap(node.initializer);
      const object =
        value && ts.isIdentifier(value)
          ? objectVariables.get(value.text)
          : value;
      for (const [name, source] of objectStringEntries(object)) {
        assert.equal(
          entries.has(name),
          false,
          `duplicate tsup entry name: ${name}`,
        );
        entries.set(name, source);
      }
    }
    ts.forEachChild(node, secondPass);
  }

  firstPass(sourceFile);
  secondPass(sourceFile);
  return entries;
}

function directRuntimeTarget(value) {
  if (typeof value === "string") return value;
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  if (typeof value.import === "string") return value.import;
  if (typeof value.default === "string") return value.default;
  return null;
}

function publicSpecifier(exportKey) {
  return exportKey === "."
    ? manifest.name
    : `${manifest.name}${exportKey.slice(1)}`;
}

function sourceByPublicSpecifier() {
  const entries = collectTsupEntries();
  const result = new Map();

  for (const [exportKey, value] of Object.entries(manifest.exports)) {
    const target = directRuntimeTarget(value);
    if (!target || target.endsWith(".css")) continue;
    const entryName = basename(target).replace(/\.(?:mjs|cjs|js)$/, "");
    const source = entries.get(entryName);
    assert.ok(
      source,
      `runtime target ${target} has no matching tsup entry named ${entryName}`,
    );
    result.set(publicSpecifier(exportKey), join(packageRoot, source));
  }

  return result;
}

function moduleExportsBySpecifier() {
  const sourceMap = sourceByPublicSpecifier();
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
    `${marker}[^\\n]*\\n([\\s\\S]*?)${marker}`,
    "g",
  );
  return [...markdown.matchAll(expression)].map((match) => match[1]);
}

test("README exposes the distributed Detailed Guide through doc.yaml SSOT", () => {
  assert.equal(doc.readme?.detailedGuide, "./DETAILED_GUIDE.md");
  assert.equal(
    readme.match(/\[Detailed Guide\]\(\.\/DETAILED_GUIDE\.md\)/g)?.length,
    1,
  );
  assert.ok(manifest.files.includes("DETAILED_GUIDE.md"));
  assert.doesNotMatch(readme, /WCAG\s*2\.1\s*AA/i);
  assert.match(readme, /with explicit evidence limits/);
});

test("doc.yaml enumerates every public JavaScript subpath and no nonexistent route", () => {
  const expected = Object.keys(manifest.exports)
    .filter((key) => key.startsWith("./") && !key.startsWith("./styles/"))
    .map((key) => key.slice(2))
    .sort();
  const documented = (doc.subpathExports ?? []).map((item) => item.path).sort();

  assert.deepEqual(documented, expected);
});

test("every HUA UI import in the Detailed Guide resolves to an exported binding", () => {
  const moduleExports = moduleExportsBySpecifier();
  const issues = [];

  fencedCodeBlocks(guide).forEach((code, fenceIndex) => {
    const sourceFile = ts.createSourceFile(
      `guide-fence-${fenceIndex + 1}.tsx`,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        continue;
      }

      const specifier = statement.moduleSpecifier.text;
      if (!specifier.startsWith(manifest.name)) continue;
      const exportKey =
        specifier === manifest.name
          ? "."
          : `.${specifier.slice(manifest.name.length)}`;

      if (!Object.hasOwn(manifest.exports, exportKey)) {
        issues.push(`fence ${fenceIndex + 1}: missing route ${specifier}`);
        continue;
      }

      const available = moduleExports.get(specifier);
      if (!available) continue;
      const clause = statement.importClause;

      if (clause?.name && !available.has("default")) {
        issues.push(
          `fence ${fenceIndex + 1}: ${specifier} has no default export`,
        );
      }

      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          const imported = (element.propertyName ?? element.name).text;
          if (!available.has(imported)) {
            issues.push(
              `fence ${fenceIndex + 1}: ${specifier} has no ${imported} export`,
            );
          }
        }
      }
    }
  });

  assert.deepEqual(issues, []);
});

test("Detailed Guide avoids stale certification, setup, modal, and Iconsax claims", () => {
  const forbidden = [
    /Full ARIA support/,
    /완전한 ARIA 지원/,
    /WCAG 2\.1 AA compliant/,
    /WCAG 2\.1 AA 준수/,
    /HUA UI requires Tailwind CSS v4/,
    /HUA UI는 Tailwind CSS v4가 필요합니다/,
    /Traps focus within modal/,
    /Restores focus on close/,
    /모달 내에서 포커스 트랩/,
    /닫을 때 포커스 복원/,
    /Iconsax[^\n]*(?:4 variants|4가지 변형|1000\+ icons|1000개 이상 아이콘)/,
    /Variants: `line`, `bold`, `bulk`, `broken`/,
    /변형: `line`, `bold`, `bulk`, `broken`/,
    /<Modal\s+open=/,
    /`showCloseButton` -/,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(guide, pattern);
  }

  assert.match(guide, /Iconsax supports exactly `line` and `bold` variants\./);
  assert.match(guide, /Iconsax는 정확히 `line`과 `bold` 변형을 지원합니다\./);
  assert.match(guide, /The component runtime does not require Tailwind CSS\./);
  assert.match(guide, /컴포넌트 런타임에는 Tailwind CSS가 필수가 아닙니다\./);
});
