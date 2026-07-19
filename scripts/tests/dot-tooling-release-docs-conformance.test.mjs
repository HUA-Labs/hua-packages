import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { parse as parseYaml } from "yaml";

const root = fileURLToPath(new URL("../..", import.meta.url));

function loadPackage(slug, aiName) {
  const packageRoot = join(root, "packages", slug);
  return {
    slug,
    packageRoot,
    manifest: JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ),
    doc: parseYaml(readFileSync(join(packageRoot, "doc.yaml"), "utf8")),
    readme: readFileSync(join(packageRoot, "README.md"), "utf8"),
    guide: readFileSync(join(packageRoot, "DETAILED_GUIDE.md"), "utf8"),
    ai: parseYaml(
      readFileSync(join(root, "ai-docs", `${aiName}.ai.yaml`), "utf8"),
    ),
  };
}

const aot = loadPackage("hua-dot-aot", "dot-aot");
const lsp = loadPackage("hua-dot-lsp", "dot-lsp");
const mcp = loadPackage("hua-dot-mcp", "dot-mcp");
const packages = [aot, lsp, mcp];

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

test("all three package payloads expose one generated README guide link", () => {
  for (const item of packages) {
    assert.equal(item.doc.readme?.detailedGuide, "./DETAILED_GUIDE.md");
    assert.equal(
      item.readme.match(/\[Detailed Guide\]\(\.\/DETAILED_GUIDE\.md\)/g)
        ?.length,
      1,
      `${item.manifest.name} README guide link`,
    );
    assert.equal(
      item.manifest.files.filter((entry) => entry === "DETAILED_GUIDE.md")
        .length,
      1,
      `${item.manifest.name} packed guide`,
    );
    assert.equal(item.ai.package.name, item.manifest.name);
    assert.match(
      item.readme,
      new RegExp(item.manifest.name.replace("/", "\\/")),
    );
  }
});

test("typed README and guide fences are syntactically valid", () => {
  const issues = [];
  const typed = /^(?:js|jsx|ts|tsx|javascript|typescript)$/;

  for (const item of packages) {
    for (const [surface, markdown] of [
      ["README", item.readme],
      ["guide", item.guide],
    ]) {
      for (const fence of fencedCodeBlocks(markdown).filter((entry) =>
        typed.test(entry.language),
      )) {
        const source = ts.createSourceFile(
          `${item.slug}-${surface}-${fence.index}.tsx`,
          fence.code,
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TSX,
        );
        for (const diagnostic of source.parseDiagnostics) {
          issues.push(
            `${item.slug} ${surface} fence ${fence.index}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
          );
        }
      }
    }
  }

  assert.deepEqual(issues, []);
});

test("AOT docs distinguish regex, Babel, and Next compiler boundaries", () => {
  const source = readFileSync(
    join(aot.packageRoot, "src", "extract.ts"),
    "utf8",
  );
  const babel = readFileSync(join(aot.packageRoot, "src", "babel.ts"), "utf8");
  const vite = readFileSync(join(aot.packageRoot, "src", "vite.ts"), "utf8");
  const docs = `${aot.readme}\n${aot.guide}\n${JSON.stringify(aot.doc)}`;

  assert.match(source, /Simple heuristic that works for typical source code/);
  assert.match(babel, /CallExpression/);
  assert.match(vite, /exclude = options\?\.exclude \?\? \['node_modules'\]/);
  assert.doesNotMatch(docs, /output is always correct/i);
  assert.doesNotMatch(docs, /Next\.js uses Babel by default/i);
  assert.doesNotMatch(docs, /Use the Babel plugin for both setups/i);
  assert.doesNotMatch(docs, /Server Components are fully supported/i);
  assert.doesNotMatch(
    docs,
    /Both the Vite plugin and the Babel plugin[^.]+through this pipeline/i,
  );
  assert.match(docs, /does not run inside (?:the )?Next(?:\.js)? SWC/i);
  assert.match(docs, /extractions[^\n]+number/i);
  assert.match(docs, /default[^\n]+node_modules/i);
  assert.doesNotMatch(
    aot.guide,
    /styleToObjectLiteral\([^)]*\},\s*["'](?:web|native|flutter)["']/s,
  );
});

test("LSP docs expose manual token and client-owned integration truth", () => {
  const completions = readFileSync(
    join(lsp.packageRoot, "src", "completions.ts"),
    "utf8",
  );
  const diagnostics = readFileSync(
    join(lsp.packageRoot, "src", "diagnostics.ts"),
    "utf8",
  );
  const settings = readFileSync(
    join(lsp.packageRoot, "src", "settings.ts"),
    "utf8",
  );
  const docs = `${lsp.readme}\n${lsp.guide}\n${JSON.stringify(lsp.doc)}`;

  assert.match(completions, /Inlined from dot's token maps/);
  assert.match(diagnostics, /variants require dotClass\(\) or classDot prop/);
  assert.deepEqual(
    [...settings.matchAll(/^\s{2}(\w+)\?:/gm)].map((match) => match[1]),
    ["target"],
  );
  assert.doesNotMatch(
    docs,
    /generated at build time from the @hua-labs\/dot engine/i,
  );
  assert.match(docs, /hand-maintained/i);
  assert.match(docs, /CSS-only variant[^.]+Warning/is);
  assert.doesNotMatch(docs, /hua-labs\.dot-vscode/i);
  assert.doesNotMatch(docs, /project(?:-level|'s) dot config/i);
  assert.match(docs, /file types?[^.]+client/i);
  assert.match(docs, /npx @hua-labs\/dot-lsp --stdio/);
});

test("MCP docs separate successful JSON payloads from errors and local completion data", () => {
  const source = readFileSync(join(mcp.packageRoot, "src", "index.ts"), "utf8");
  const docs = `${mcp.readme}\n${mcp.guide}\n${JSON.stringify(mcp.doc)}`;
  const toolNames = [
    ...source.matchAll(/server\.tool\(\s*\n?\s*["']([^"']+)["']/g),
  ].map((match) => match[1]);

  assert.deepEqual(toolNames, [
    "dot_resolve",
    "dot_explain",
    "dot_complete",
    "dot_capabilities",
    "dot_validate",
  ]);
  assert.match(source, /const COMPLETION_TOKENS/);
  assert.match(docs, /package-local[^.]+completion catalog/is);
  assert.doesNotMatch(docs, /field of every response is a JSON string/i);
  assert.doesNotMatch(docs, /wrapper is always/i);
  assert.doesNotMatch(docs, /always use the latest version/i);
  assert.match(docs, /successful[^.]+JSON/is);
  assert.match(docs, /schema validation[^.]+client\/SDK/is);
  const toolExamples = mcp.doc.sections.find(
    (section) => section.title === "Tool Examples",
  )?.content;
  assert.match(
    toolExamples,
    /Unrecognized or unsupported utility:\s*\\?"bg-bogus\\?"/,
  );
  assert.match(
    mcp.guide,
    /"input": "p-4 fake-utility"[\s\S]{0,400}"resolved_count": 1/,
  );
});
