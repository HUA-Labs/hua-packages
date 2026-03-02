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

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import { parse as parseYaml } from 'yaml';

// ─── Types ───────────────────────────────────────────────────────────

interface DocYaml {
  overview: string;
  features: string[];
  quickStart: string;
  codeBlockLang?: string;
  docsUrl?: string;
  apiNotes?: Record<string, { description: string; kind?: string }>;
  apiFilter?: 'all' | 'notes-only'; // 'notes-only' = only show exports in apiNotes
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
  fullName: string;  // @hua-labs/xxx
  version: string;
  description: string;
  peerDeps: Record<string, string>;
  peerDepsList: string;
  reactMajor?: string;
  exports: ExportInfo[];
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
const ROOT = resolve(__dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const AI_DOCS_DIR = join(ROOT, 'docs', 'ai-docs');
const TEMPLATES_DIR = join(ROOT, 'scripts', 'templates');

// ─── Export Parser ───────────────────────────────────────────────────

function parseExports(indexPath: string, apiNotes?: Record<string, { description: string; kind?: string }>): ExportInfo[] {
  if (!existsSync(indexPath)) return [];

  const raw = readFileSync(indexPath, 'utf-8');
  // Strip block comments (JSDoc, multi-line) then line comments to avoid false positives
  const content = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  const exports: ExportInfo[] = [];
  const seen = new Set<string>();

  function addExport(name: string, kind: string) {
    if (!name || seen.has(name)) return;
    seen.add(name);
    // apiNotes.kind overrides auto-detected kind
    const finalKind = apiNotes?.[name]?.kind ?? kind;
    exports.push({ name, kind: finalKind, description: apiNotes?.[name]?.description ?? '' });
  }

  // Pattern 1: export { Foo, Bar } from './module'  AND  export { Foo, Bar };
  const reExportBraces = /^export\s*\{([^}]+)\}(?:\s*from\s*['"][^'"]+['"])?/gm;
  let match: RegExpExecArray | null;
  while ((match = reExportBraces.exec(content)) !== null) {
    // Skip "export type {" — handled separately
    if (/^export\s+type\s*\{/.test(match[0])) continue;
    const names = match[1].split(',').map(n => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    for (const name of names) {
      addExport(name, classifyExport(name, false));
    }
  }

  // Pattern 2: export type { Foo } from './module'  AND  export type { Foo };
  const reTypeExport = /^export\s+type\s*\{([^}]+)\}(?:\s*from\s*['"][^'"]+['"])?/gm;
  while ((match = reTypeExport.exec(content)) !== null) {
    const names = match[1].split(',').map(n => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    for (const name of names) {
      addExport(name, 'type');
    }
  }

  // Pattern 3: export function foo / export const foo / export class Foo
  const reDirectExport = /^export\s+(?:(?:async\s+)?function|const|let|class)\s+(\w+)/gm;
  while ((match = reDirectExport.exec(content)) !== null) {
    const name = match[1];
    const isFunc = /export\s+(?:async\s+)?function/.test(match[0]);
    const isClass = /export\s+class/.test(match[0]);
    addExport(name, isClass ? 'class' : isFunc ? classifyExport(name, true) : 'const');
  }

  return exports;
}

function classifyExport(name: string, isFuncDecl: boolean): string {
  if (/^use[A-Z]/.test(name)) return 'hook';
  if (/^[A-Z]/.test(name) && !isFuncDecl) return 'component';
  if (/^[A-Z]/.test(name) && isFuncDecl) return 'function';
  return 'function';
}

// ─── Package Data Loader ─────────────────────────────────────────────

function loadPackageData(dirName: string): PackageData | null {
  const pkgDir = join(PACKAGES_DIR, dirName);
  const pkgJsonPath = join(pkgDir, 'package.json');
  const docYamlPath = join(pkgDir, 'doc.yaml');
  const indexPath = join(pkgDir, 'src', 'index.ts');

  if (!existsSync(pkgJsonPath)) {
    console.warn(`  ⚠ ${dirName}: package.json not found, skipping`);
    return null;
  }

  if (!existsSync(docYamlPath)) {
    console.warn(`  ⚠ ${dirName}: doc.yaml not found, skipping`);
    return null;
  }

  // Parse package.json
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  const fullName = pkgJson.name as string;
  // @hua-labs/i18n-core → i18n-core, create-hua → create-hua
  const shortName = fullName.startsWith('@hua-labs/')
    ? fullName.replace('@hua-labs/', '')
    : fullName;

  const rawPeerDeps: Record<string, string> = pkgJson.peerDependencies ?? {};
  // Clean version for display: ">=19.0.0" → "19", "^5.0.0" → "5"
  const peerDeps: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawPeerDeps)) {
    peerDeps[k] = v;
  }
  const peerDepsList = Object.entries(rawPeerDeps)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');

  // Extract clean major version for badge (>=19.0.0 → 19)
  const reactMajor = rawPeerDeps.react?.match(/(\d+)/)?.[1];

  // Parse doc.yaml
  const docYaml: DocYaml = parseYaml(readFileSync(docYamlPath, 'utf-8'));

  // Parse exports (filter to apiNotes-only when configured)
  let exports = parseExports(indexPath, docYaml.apiNotes);
  if (docYaml.apiFilter === 'notes-only' && docYaml.apiNotes) {
    const noteKeys = new Set(Object.keys(docYaml.apiNotes));
    const detectedNames = new Set(exports.map(e => e.name));
    exports = exports.filter(e => noteKeys.has(e.name));
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

  return {
    dirName,
    shortName,
    fullName,
    version: pkgJson.version,
    description: pkgJson.description ?? '',
    peerDeps,
    peerDepsList,
    reactMajor,
    exports,
    overview: docYaml.overview,
    features: docYaml.features ?? [],
    quickStart: docYaml.quickStart ?? '',
    codeBlockLang: docYaml.codeBlockLang ?? 'tsx',
    docsUrl: docYaml.docsUrl,
    related: docYaml.related,
    sections: docYaml.sections,
    subpathExports: docYaml.subpathExports,
  };
}

// ─── Generators ──────────────────────────────────────────────────────

function compileTemplate(name: string): HandlebarsTemplateDelegate {
  const tplPath = join(TEMPLATES_DIR, name);
  const tplSource = readFileSync(tplPath, 'utf-8');
  return Handlebars.compile(tplSource, { noEscape: true });
}

function generateReadme(data: PackageData): string {
  const template = compileTemplate('readme.hbs');
  // 끝 줄바꿈 정리
  return template(data).replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function generateAiYaml(data: PackageData): string {
  const template = compileTemplate('ai-yaml.hbs');
  return template(data).replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ─── AI-docs filename mapping ────────────────────────────────────────
// packages/hua-i18n-core → i18n-core.ai.yaml
// packages/hua → hua.ai.yaml
// packages/eslint-plugin-i18n → eslint-plugin-i18n.ai.yaml

function aiYamlFilename(dirName: string): string {
  const name = dirName.startsWith('hua-') ? dirName.slice(4) : dirName;
  return `${name}.ai.yaml`;
}

// ─── Commands ────────────────────────────────────────────────────────

function discoverPackages(): string[] {
  return readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => {
      const pkgJson = join(PACKAGES_DIR, name, 'package.json');
      const docYaml = join(PACKAGES_DIR, name, 'doc.yaml');
      return existsSync(pkgJson) && existsSync(docYaml);
    })
    .sort();
}

function generate(packageFilter?: string): { generated: number; errors: string[] } {
  const errors: string[] = [];
  let generated = 0;

  const dirs = packageFilter
    ? [packageFilter]
    : discoverPackages();

  for (const dirName of dirs) {
    const data = loadPackageData(dirName);
    if (!data) {
      errors.push(`${dirName}: failed to load package data`);
      continue;
    }

    try {
      // Generate README.md
      const readmePath = join(PACKAGES_DIR, dirName, 'README.md');
      const readmeContent = generateReadme(data);
      writeFileSync(readmePath, readmeContent, 'utf-8');

      // Generate ai.yaml
      const aiYamlPath = join(AI_DOCS_DIR, aiYamlFilename(dirName));
      const aiYamlContent = generateAiYaml(data);
      writeFileSync(aiYamlPath, aiYamlContent, 'utf-8');

      console.log(`  ✓ ${data.fullName} → README.md + ${aiYamlFilename(dirName)}`);
      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${dirName}: ${msg}`);
      console.error(`  ✗ ${dirName}: ${msg}`);
    }
  }

  return { generated, errors };
}

function validate(packageFilter?: string): { valid: number; drifted: string[] } {
  const drifted: string[] = [];
  let valid = 0;

  const dirs = packageFilter
    ? [packageFilter]
    : discoverPackages();

  for (const dirName of dirs) {
    const data = loadPackageData(dirName);
    if (!data) {
      drifted.push(`${dirName}: failed to load`);
      continue;
    }

    let hasDrift = false;

    // Check README
    const readmePath = join(PACKAGES_DIR, dirName, 'README.md');
    if (existsSync(readmePath)) {
      const current = readFileSync(readmePath, 'utf-8');
      const expected = generateReadme(data);
      if (current !== expected) {
        drifted.push(`${dirName}/README.md`);
        hasDrift = true;
      }
    } else {
      drifted.push(`${dirName}/README.md (missing)`);
      hasDrift = true;
    }

    // Check ai.yaml
    const aiYamlPath = join(AI_DOCS_DIR, aiYamlFilename(dirName));
    if (existsSync(aiYamlPath)) {
      const current = readFileSync(aiYamlPath, 'utf-8');
      const expected = generateAiYaml(data);
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
  }

  return { valid, drifted };
}

// ─── Main ────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const isValidate = args.includes('--validate');
  const pkgFlag = args.find(a => a.startsWith('--package'));
  let packageFilter: string | undefined;

  if (pkgFlag) {
    const idx = args.indexOf(pkgFlag);
    // --package hua-i18n-core  or  --package=hua-i18n-core
    if (pkgFlag.includes('=')) {
      packageFilter = pkgFlag.split('=')[1];
    } else if (args[idx + 1]) {
      packageFilter = args[idx + 1];
    }
  }

  console.log(`\n📄 Documentation SSOT Generator\n`);

  if (isValidate) {
    console.log('Mode: validate (checking drift)\n');
    const { valid, drifted } = validate(packageFilter);
    console.log(`\nResult: ${valid} valid, ${drifted.length} drifted`);
    if (drifted.length > 0) {
      console.log('\nDrifted files:');
      drifted.forEach(f => console.log(`  - ${f}`));
      console.log('\nRun `pnpm generate:docs` to fix.\n');
      process.exit(1);
    }
    console.log('');
  } else {
    console.log('Mode: generate\n');
    const { generated, errors } = generate(packageFilter);
    console.log(`\nResult: ${generated} generated, ${errors.length} errors`);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(e => console.log(`  - ${e}`));
    }
    console.log('');
  }
}

main();
