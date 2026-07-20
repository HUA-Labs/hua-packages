#!/usr/bin/env tsx
/**
 * Documentation SSOT Generator
 *
 * 패키지의 doc.yaml + package.json + src/index.ts 를 읽어
 * README.md 와 ai.yaml 을 생성합니다.
 *
 * Usage:
 *   pnpm generate:docs                     # 전체 패키지 생성
 *   pnpm generate:docs --package hua-i18n-core  # 특정 패키지만
 *   pnpm generate:docs --validate           # drift 검증 (CI용)
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
  readdirSync,
  mkdirSync,
  realpathSync,
} from "fs";
import { join, resolve, dirname, sep } from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { parse as parseYaml } from "yaml";
import {
  buildDocumentationAxProjection,
  buildPackageAxCatalog,
  summarizeHuaPackageAxCatalog,
} from "./package-ax.mjs";

// ─── Types ───────────────────────────────────────────────────────────

interface DocYaml {
  overview: string;
  features: string[];
  quickStart: string;
  codeBlockLang?: string;
  readme?: {
    features?: string[];
    featureLimit?: number;
    quickStart?: string;
    codeBlockLang?: string;
    hideApi?: boolean;
    hideSections?: boolean;
    detailedGuide?: string;
    aiGuide?: string;
  };
  docsUrl?: string;
  detailedGuide?: {
    path: string;
    distribution: "packed" | "repository";
    description: string;
  };
  apiNotes?: Record<
    string,
    { description: string; kind?: string; importFrom?: string }
  >;
  apiFilter?: "all" | "notes-only"; // 'notes-only' = only show exports in apiNotes
  related?: string[];
  sections?: Array<{ title: string; content: string }>;
  subpathExports?: Array<{ path: string; description: string }>;
  registry?: {
    category?: string;
    useCases?: string[];
    related?: string[];
  };
}

interface ExportInfo {
  name: string;
  kind: string; // 'function' | 'component' | 'hook' | 'class' | 'type' | 'const' | 'interface'
  description: string;
}

interface PackageData {
  dirName: string;
  shortName: string; // npm scope 제거한 이름
  fullName: string; // @hua-labs/xxx
  version: string;
  description: string;
  peerDeps: Record<string, string>;
  peerDepsList: string;
  reactMajor?: string;
  exports: ExportInfo[];
  readmeFeatures: string[];
  showReadmeApi: boolean;
  showReadmeSections: boolean;
  legacyDetailedGuide?: string;
  detailedGuide?: {
    state: "shipped" | "repository-only";
    path: string;
    distribution: "packed" | "repository";
    description: string;
    packed: boolean;
    link: string;
  };
  documentationAx: { state: "absent" | "shipped" | "repository-only" };
  axSummary?: ReturnType<typeof summarizeHuaPackageAxCatalog> | null;
  aiGuide?: string;
  // from doc.yaml
  overview: string;
  features: string[];
  quickStart: string;
  codeBlockLang: string;
  docsUrl?: string;
  related?: string[];
  sections?: Array<{ title: string; content: string }>;
  subpathExports?: Array<{ path: string; description: string }>;
}

// ─── Constants ───────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const PACKAGES_DIR = join(ROOT, "packages");
const AI_DOCS_DIR = join(ROOT, "ai-docs");
const TEMPLATES_DIR = join(ROOT, "scripts", "templates");
const SAFE_PACKAGE_DIR = /^[a-z0-9][a-z0-9-]{0,127}$/;
const DOC_YAML_KEYS = new Set([
  "overview",
  "features",
  "quickStart",
  "codeBlockLang",
  "readme",
  "docsUrl",
  "detailedGuide",
  "apiNotes",
  "apiFilter",
  "related",
  "sections",
  "subpathExports",
  "registry",
]);
const README_KEYS = new Set([
  "features",
  "featureLimit",
  "quickStart",
  "codeBlockLang",
  "hideApi",
  "hideSections",
  "detailedGuide",
  "aiGuide",
]);

function assertExactKeys(
  value: unknown,
  allowed: ReadonlySet<string>,
  label: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const unknown = Object.keys(value)
    .filter((key) => !allowed.has(key))
    .sort();
  if (unknown.length > 0) {
    throw new Error(`${label} has unknown doc.yaml key: ${unknown[0]}`);
  }
}

function assertSafePackageDirName(dirName: string): void {
  if (!SAFE_PACKAGE_DIR.test(dirName)) {
    throw new Error("invalid package directory: expected a safe package name");
  }
}

function assertContainedDirectory(
  parent: string,
  candidate: string,
  label: string,
): void {
  let parentStats;
  let candidateStats;
  try {
    parentStats = lstatSync(parent);
    candidateStats = lstatSync(candidate);
  } catch {
    throw new Error(`${label} must be an existing regular directory`);
  }
  if (
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    !candidateStats.isDirectory() ||
    candidateStats.isSymbolicLink()
  ) {
    throw new Error(`${label} must be a regular directory`);
  }
  let realParent;
  let realCandidate;
  try {
    realParent = realpathSync(parent);
    realCandidate = realpathSync(candidate);
  } catch {
    throw new Error(`${label} could not be resolved safely`);
  }
  if (
    realCandidate !== realParent &&
    !realCandidate.startsWith(`${realParent}${sep}`)
  ) {
    throw new Error(`${label} must stay inside the public repository root`);
  }
}

function assertRegularFile(path: string, label: string): void {
  let stats;
  try {
    stats = lstatSync(path);
  } catch {
    throw new Error(`${label} must be an existing regular file`);
  }
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`${label} must be a regular file`);
  }
}

function assertWriterRoots(): void {
  assertContainedDirectory(ROOT, PACKAGES_DIR, "packages output root");
  assertContainedDirectory(ROOT, AI_DOCS_DIR, "AI output root");
  assertContainedDirectory(ROOT, TEMPLATES_DIR, "template root");
}

// ─── Export Parser ───────────────────────────────────────────────────

function parseExports(
  indexPath: string,
  apiNotes?: Record<string, { description: string; kind?: string }>,
): ExportInfo[] {
  if (!existsSync(indexPath)) return [];

  const raw = readFileSync(indexPath, "utf-8");
  // Strip block comments (JSDoc, multi-line) then line comments to avoid false positives
  const content = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const exports: ExportInfo[] = [];
  const seen = new Set<string>();

  function addExport(name: string, kind: string) {
    if (!name || seen.has(name)) return;
    seen.add(name);
    // apiNotes.kind overrides auto-detected kind
    const finalKind = apiNotes?.[name]?.kind ?? kind;
    exports.push({
      name,
      kind: finalKind,
      description: apiNotes?.[name]?.description ?? "",
    });
  }

  // Pattern 1: export { Foo, Bar } from './module'  AND  export { Foo, Bar };
  const reExportBraces = /^export\s*\{([^}]+)\}(?:\s*from\s*['"][^'"]+['"])?/gm;
  let match: RegExpExecArray | null;
  while ((match = reExportBraces.exec(content)) !== null) {
    // Skip "export type {" — handled separately
    if (/^export\s+type\s*\{/.test(match[0])) continue;
    const names = match[1].split(",").map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    for (const name of names) {
      addExport(name, classifyExport(name, false));
    }
  }

  // Pattern 2: export type { Foo } from './module'  AND  export type { Foo };
  const reTypeExport =
    /^export\s+type\s*\{([^}]+)\}(?:\s*from\s*['"][^'"]+['"])?/gm;
  while ((match = reTypeExport.exec(content)) !== null) {
    const names = match[1].split(",").map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    for (const name of names) {
      addExport(name, "type");
    }
  }

  // Pattern 3: export function foo / export const foo / export class Foo
  const reDirectExport =
    /^export\s+(?:(?:async\s+)?function|const|let|class)\s+(\w+)/gm;
  while ((match = reDirectExport.exec(content)) !== null) {
    const name = match[1];
    const isFunc = /export\s+(?:async\s+)?function/.test(match[0]);
    const isClass = /export\s+class/.test(match[0]);
    addExport(
      name,
      isClass ? "class" : isFunc ? classifyExport(name, true) : "const",
    );
  }

  return exports;
}

function classifyExport(name: string, isFuncDecl: boolean): string {
  if (/^use[A-Z]/.test(name)) return "hook";
  if (/^[A-Z]/.test(name) && !isFuncDecl) return "component";
  if (/^[A-Z]/.test(name) && isFuncDecl) return "function";
  return "function";
}

// ─── Package Data Loader ─────────────────────────────────────────────

async function loadPackageData(dirName: string): Promise<PackageData | null> {
  assertSafePackageDirName(dirName);
  const pkgDir = join(PACKAGES_DIR, dirName);
  const pkgJsonPath = join(pkgDir, "package.json");
  const docYamlPath = join(pkgDir, "doc.yaml");
  const indexPath = join(pkgDir, "src", "index.ts");

  if (!existsSync(pkgDir)) {
    console.warn(`  ⚠ ${dirName}: package directory not found, skipping`);
    return null;
  }
  assertContainedDirectory(PACKAGES_DIR, pkgDir, `${dirName}: package root`);

  if (!existsSync(pkgJsonPath)) {
    console.warn(`  ⚠ ${dirName}: package.json not found, skipping`);
    return null;
  }

  if (!existsSync(docYamlPath)) {
    console.warn(`  ⚠ ${dirName}: doc.yaml not found, skipping`);
    return null;
  }

  // Parse package.json
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
  const fullName = pkgJson.name as string;
  // @hua-labs/i18n-core → i18n-core, create-hua → create-hua
  const shortName = fullName.startsWith("@hua-labs/")
    ? fullName.replace("@hua-labs/", "")
    : fullName;

  const rawPeerDeps: Record<string, string> = pkgJson.peerDependencies ?? {};
  // Clean version for display: ">=19.0.0" → "19", "^5.0.0" → "5"
  const peerDeps: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawPeerDeps)) {
    peerDeps[k] = v;
  }
  const peerDepsList = Object.entries(rawPeerDeps)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");

  // Extract clean major version for badge (>=19.0.0 → 19)
  const reactMajor = rawPeerDeps.react?.match(/(\d+)/)?.[1];

  // Parse doc.yaml
  const docYaml: DocYaml = parseYaml(readFileSync(docYamlPath, "utf-8"));
  assertExactKeys(docYaml, DOC_YAML_KEYS, `${dirName}: doc.yaml`);
  if (docYaml.readme !== undefined) {
    assertExactKeys(docYaml.readme, README_KEYS, `${dirName}: readme`);
  }
  if (
    docYaml.detailedGuide !== undefined &&
    docYaml.readme?.detailedGuide !== undefined
  ) {
    throw new Error(
      `${dirName}: detailedGuide authority cannot be declared twice`,
    );
  }
  const documentationAx = buildDocumentationAxProjection({
    detailedGuide: docYaml.detailedGuide,
    packageDir: pkgDir,
    packageDirName: dirName,
    packageFiles: pkgJson.files,
  }) as PackageData["documentationAx"] &
    Partial<NonNullable<PackageData["detailedGuide"]>>;
  const readmeFeatureLimit =
    typeof docYaml.readme?.featureLimit === "number"
      ? docYaml.readme.featureLimit
      : undefined;
  const readmeFeatures =
    docYaml.readme?.features ??
    (readmeFeatureLimit
      ? (docYaml.features ?? []).slice(0, readmeFeatureLimit)
      : (docYaml.features ?? []));

  // Parse exports (filter to apiNotes-only when configured)
  let exports = parseExports(indexPath, docYaml.apiNotes);
  if (docYaml.apiFilter === "notes-only" && docYaml.apiNotes) {
    const noteKeys = new Set(Object.keys(docYaml.apiNotes));
    const detectedNames = new Set(exports.map((e) => e.name));
    exports = exports.filter((e) => noteKeys.has(e.name));
    // Add apiNotes entries not found in auto-detected exports (e.g., subpath-only exports)
    for (const [name, note] of Object.entries(docYaml.apiNotes)) {
      if (!detectedNames.has(name)) {
        exports.push({
          name,
          kind: note.kind ?? classifyExport(name, false),
          description: note.description,
        });
      }
    }
  }

  const axCatalog = await buildPackageAxCatalog({
    packageDirName: dirName,
    packageFullName: fullName,
    packageVersion: pkgJson.version,
  });

  return {
    dirName,
    shortName,
    fullName,
    version: pkgJson.version,
    description: pkgJson.description ?? "",
    peerDeps,
    peerDepsList,
    reactMajor,
    exports,
    readmeFeatures,
    showReadmeApi: docYaml.readme?.hideApi !== true,
    showReadmeSections: docYaml.readme?.hideSections !== true,
    legacyDetailedGuide: docYaml.readme?.detailedGuide,
    detailedGuide:
      documentationAx.state === "absent"
        ? undefined
        : (documentationAx as NonNullable<PackageData["detailedGuide"]>),
    documentationAx,
    axSummary: axCatalog ? summarizeHuaPackageAxCatalog(axCatalog) : null,
    aiGuide: docYaml.readme?.aiGuide,
    overview: docYaml.overview,
    features: docYaml.features ?? [],
    quickStart: docYaml.readme?.quickStart ?? docYaml.quickStart ?? "",
    codeBlockLang:
      docYaml.readme?.codeBlockLang ?? docYaml.codeBlockLang ?? "tsx",
    docsUrl: docYaml.docsUrl,
    related: docYaml.related,
    sections: docYaml.sections,
    subpathExports: docYaml.subpathExports,
  };
}

// ─── Generators ──────────────────────────────────────────────────────

function compileTemplate(name: string): HandlebarsTemplateDelegate {
  const tplPath = join(TEMPLATES_DIR, name);
  assertRegularFile(tplPath, `${name} template`);
  // Normalize to LF for consistent Handlebars output across platforms (Windows CRLF breaks standalone block removal)
  const tplSource = readFileSync(tplPath, "utf-8").replace(/\r\n/g, "\n");
  return Handlebars.compile(tplSource, { noEscape: true });
}

function generateReadme(data: PackageData): string {
  const template = compileTemplate("readme.hbs");
  // Normalize CRLF→LF first so \n{3,} collapse works correctly on Windows
  return (
    template(data)
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}

function generateAiYaml(data: PackageData): string {
  const template = compileTemplate("ai-yaml.hbs");
  const generated =
    template(data)
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n";
  if (!data.detailedGuide) return generated;

  const guide = data.detailedGuide;
  const yamlString = (value: string) => JSON.stringify(value);
  return `${generated.trimEnd()}\n\ndocumentation:\n  detailedGuide:\n    state: ${yamlString(guide.state)}\n    path: ${yamlString(guide.path)}\n    distribution: ${yamlString(guide.distribution)}\n    description: ${yamlString(guide.description)}\n    link: ${yamlString(guide.link)}\n`;
}

// ─── AI-docs filename mapping ────────────────────────────────────────
// packages/hua-i18n-core → i18n-core.ai.yaml
// packages/hua → hua.ai.yaml
// packages/eslint-plugin-i18n → eslint-plugin-i18n.ai.yaml

function aiYamlFilename(dirName: string): string {
  const name = dirName.startsWith("hua-") ? dirName.slice(4) : dirName;
  return `${name}.ai.yaml`;
}

// ─── Commands ────────────────────────────────────────────────────────

function discoverPackages(): string[] {
  return readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      const pkgJson = join(PACKAGES_DIR, name, "package.json");
      const docYaml = join(PACKAGES_DIR, name, "doc.yaml");
      return existsSync(pkgJson) && existsSync(docYaml);
    })
    .sort()
    .map((name) => {
      assertSafePackageDirName(name);
      return name;
    });
}

async function generate(packageFilter?: string): Promise<{
  generated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let generated = 0;
  mkdirSync(AI_DOCS_DIR, { recursive: true });
  assertWriterRoots();

  const dirs = packageFilter ? [packageFilter] : discoverPackages();

  for (const dirName of dirs) {
    try {
      const data = await loadPackageData(dirName);
      if (!data) {
        errors.push(`${dirName}: failed to load package data`);
        continue;
      }
      // Generate README.md
      const readmePath = join(PACKAGES_DIR, dirName, "README.md");
      if (existsSync(readmePath)) {
        assertRegularFile(readmePath, `${dirName}/README.md`);
      }
      const readmeContent = generateReadme(data);
      writeFileSync(readmePath, readmeContent, "utf-8");

      // Generate ai.yaml
      const aiYamlPath = join(AI_DOCS_DIR, aiYamlFilename(dirName));
      if (existsSync(aiYamlPath)) {
        assertRegularFile(aiYamlPath, aiYamlFilename(dirName));
      }
      const aiYamlContent = generateAiYaml(data);
      writeFileSync(aiYamlPath, aiYamlContent, "utf-8");

      console.log(
        `  ✓ ${data.fullName} → README.md + ${aiYamlFilename(dirName)}`,
      );
      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${dirName}: ${msg}`);
      console.error(`  ✗ ${dirName}: ${msg}`);
    }
  }

  return { generated, errors };
}

async function validate(packageFilter?: string): Promise<{
  valid: number;
  drifted: string[];
}> {
  const drifted: string[] = [];
  let valid = 0;
  assertWriterRoots();

  const dirs = packageFilter ? [packageFilter] : discoverPackages();

  for (const dirName of dirs) {
    try {
      const data = await loadPackageData(dirName);
      if (!data) {
        drifted.push(`${dirName}: failed to load`);
        continue;
      }

      let hasDrift = false;
      const norm = (s: string) => s.replace(/\r\n/g, "\n");

      const readmePath = join(PACKAGES_DIR, dirName, "README.md");
      if (existsSync(readmePath)) {
        assertRegularFile(readmePath, `${dirName}/README.md`);
        const current = norm(readFileSync(readmePath, "utf-8"));
        const expected = norm(generateReadme(data));
        if (current !== expected) {
          drifted.push(`${dirName}/README.md`);
          hasDrift = true;
        }
      } else {
        drifted.push(`${dirName}/README.md (missing)`);
        hasDrift = true;
      }

      const aiYamlPath = join(AI_DOCS_DIR, aiYamlFilename(dirName));
      if (existsSync(aiYamlPath)) {
        assertRegularFile(aiYamlPath, aiYamlFilename(dirName));
        const current = norm(readFileSync(aiYamlPath, "utf-8"));
        const expected = norm(generateAiYaml(data));
        if (current !== expected) {
          drifted.push(`${aiYamlFilename(dirName)}`);
          hasDrift = true;
        }
      } else {
        drifted.push(`${aiYamlFilename(dirName)} (missing)`);
        hasDrift = true;
      }

      if (!hasDrift) {
        valid++;
        console.log(`  ✓ ${data.fullName}`);
      } else {
        console.log(`  ✗ ${data.fullName} — drift detected`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      drifted.push(`${dirName}: ${message}`);
      console.error(`  ✗ ${dirName}: ${message}`);
    }
  }

  return { valid, drifted };
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isValidate = args.includes("--validate");
  const pkgFlag = args.find((a) => a.startsWith("--package"));
  let packageFilter: string | undefined;

  if (pkgFlag) {
    const idx = args.indexOf(pkgFlag);
    // --package hua-i18n-core  or  --package=hua-i18n-core
    if (pkgFlag.includes("=")) {
      packageFilter = pkgFlag.split("=")[1];
    } else if (args[idx + 1]) {
      packageFilter = args[idx + 1];
    }
  }

  console.log(`\n📄 Documentation SSOT Generator\n`);

  if (isValidate) {
    console.log("Mode: validate (checking drift)\n");
    const { valid, drifted } = await validate(packageFilter);
    console.log(`\nResult: ${valid} valid, ${drifted.length} drifted`);
    if (drifted.length > 0) {
      console.log("\nDrifted files:");
      drifted.forEach((f) => console.log(`  - ${f}`));
      console.log("\nRun `pnpm generate:docs` to fix.\n");
      process.exit(1);
    }
    console.log("");
  } else {
    console.log("Mode: generate\n");
    const { generated, errors } = await generate(packageFilter);
    console.log(`\nResult: ${generated} generated, ${errors.length} errors`);
    if (errors.length > 0) {
      console.log("\nErrors:");
      errors.forEach((e) => console.log(`  - ${e}`));
      process.exitCode = 1;
    }
    console.log("");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Documentation writer failed: ${message}`);
  process.exitCode = 1;
});
