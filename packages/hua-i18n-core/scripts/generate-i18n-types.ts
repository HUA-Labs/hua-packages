#!/usr/bin/env tsx
/**
 * i18n 타입 생성 스크립트
 *
 * 기준 언어(ko) JSON 파일들을 파싱하여 TypeScript 타입을 자동 생성합니다.
 *
 * Usage:
 *   pnpm tsx scripts/generate-i18n-types.ts \
 *     --translations-dir apps/my-app/app/lib/translations/ko \
 *     --output apps/my-app/types/i18n-types.generated.ts
 *
 *   # docs-*.json → docs 네임스페이스로 머지 (런타임 API 병합 구조 반영)
 *   pnpm tsx scripts/generate-i18n-types.ts \
 *     --translations-dir apps/my-docs/lib/translations/ko \
 *     --output apps/my-docs/types/i18n-types.generated.ts \
 *     --merge-prefix docs
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
function parseArgs(): { translationsDir: string; output: string; mergePrefixes: string[] } {
  const args = process.argv.slice(2);
  let translationsDir = '';
  let output = '';
  const mergePrefixes: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--translations-dir' && args[i + 1]) {
      translationsDir = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[++i];
    } else if (args[i] === '--merge-prefix' && args[i + 1]) {
      // e.g. --merge-prefix docs → merge docs-*.json keys into docs namespace
      mergePrefixes.push(args[++i]);
    }
  }

  if (!translationsDir || !output) {
    console.error('Usage: generate-i18n-types.ts --translations-dir <path> --output <path> [--merge-prefix <prefix>]');
    process.exit(1);
  }

  return { translationsDir: path.resolve(translationsDir), output: path.resolve(output), mergePrefixes };
}

// ---------------------------------------------------------------------------
// JSON → key 분류
// ---------------------------------------------------------------------------
const PLURAL_CATEGORIES = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

function isPluralObject(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;
  const entries = Object.entries(obj as Record<string, unknown>);
  return (
    entries.length > 0 &&
    entries.every(([k, v]) => PLURAL_CATEGORIES.has(k) && typeof v === 'string') &&
    'other' in (obj as Record<string, unknown>)
  );
}

interface NamespaceKeys {
  strings: string[];
  arrays: string[];
  plurals: string[];
}

function collectKeys(obj: unknown, prefix: string = ''): NamespaceKeys {
  const result: NamespaceKeys = { strings: [], arrays: [], plurals: [] };

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return result;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result.strings.push(fullKey);
    } else if (Array.isArray(value)) {
      if (value.every((v) => typeof v === 'string')) {
        result.arrays.push(fullKey);
      }
      // object[] 등은 향후 확장
    } else if (typeof value === 'object' && value !== null) {
      // 복수형 객체인지 먼저 확인 (nested namespace 전에)
      if (isPluralObject(value)) {
        result.plurals.push(fullKey);
      } else {
        const nested = collectKeys(value, fullKey);
        result.strings.push(...nested.strings);
        result.arrays.push(...nested.arrays);
        result.plurals.push(...nested.plurals);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 타입 문자열 생성
// ---------------------------------------------------------------------------
function escapeKey(k: string): string {
  // TypeScript string literal에서 특수문자 이스케이프
  return k.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildUnion(keys: string[]): string {
  if (keys.length === 0) return 'never';
  return keys.map((k) => `'${escapeKey(k)}'`).join(' | ');
}

function generateTypeFile(namespaces: Record<string, NamespaceKeys>): string {
  const nsNames = Object.keys(namespaces).sort();

  // I18nKeys interface
  let interfaceBody = '';
  for (const ns of nsNames) {
    const { strings, arrays, plurals } = namespaces[ns];
    // 하이픈 포함 시 따옴표 필요 (e.g., 'docs-cards')
    const nsKey = /[^a-zA-Z0-9_$]/.test(ns) ? `'${ns}'` : ns;
    interfaceBody += `  ${nsKey}: {\n`;
    interfaceBody += `    strings: ${buildUnion(strings)};\n`;
    interfaceBody += `    arrays: ${buildUnion(arrays)};\n`;
    interfaceBody += `    plurals: ${buildUnion(plurals)};\n`;
    interfaceBody += `  };\n`;
  }

  // TranslationStringKey
  const stringKeyUnion = nsNames
    .filter((ns) => namespaces[ns].strings.length > 0)
    .map((ns) => `\`${ns}:\${I18nKeys['${ns}']['strings']}\``)
    .join('\n  | ');

  // TranslationArrayKey
  const arrayKeyUnion = nsNames
    .filter((ns) => namespaces[ns].arrays.length > 0)
    .map((ns) => `\`${ns}:\${I18nKeys['${ns}']['arrays']}\``)
    .join('\n  | ');

  // TranslationPluralKey
  const pluralKeyUnion = nsNames
    .filter((ns) => namespaces[ns].plurals.length > 0)
    .map((ns) => `\`${ns}:\${I18nKeys['${ns}']['plurals']}\``)
    .join('\n  | ');

  return `// Auto-generated by generate-i18n-types.ts — DO NOT EDIT
// Generated at: ${new Date().toISOString()}

export interface I18nKeys {
${interfaceBody}}

// t()용 — string 키만
export type TranslationStringKey =
  | ${stringKeyUnion || 'never'};

// tArray()용 — 배열 키만
export type TranslationArrayKey =
  | ${arrayKeyUnion || 'never'};

// tPlural()용 — 복수형 키만
export type TranslationPluralKey =
  | ${pluralKeyUnion || 'never'};

// 전체 키 (validate용)
export type AllTranslationKeys = TranslationStringKey | TranslationArrayKey | TranslationPluralKey;

// 네임스페이스 이름
export type TranslationNamespaceName = ${nsNames.map((n) => `'${n}'`).join(' | ') || 'never'};
`;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
/**
 * --merge-prefix 처리: {prefix}-* 네임스페이스 키들을 {prefix} 네임스페이스에 머지
 *
 * 런타임에서 docs-*.json → docs 네임스페이스로 병합되는 구조를 타입에 반영.
 * 개별 docs-* 네임스페이스는 제거되고 docs에 통합됨.
 */
function applyMergePrefixes(
  namespaces: Record<string, NamespaceKeys>,
  prefixes: string[]
): void {
  for (const prefix of prefixes) {
    // 기존 prefix 네임스페이스 (e.g. docs) 확보
    if (!namespaces[prefix]) {
      namespaces[prefix] = { strings: [], arrays: [], plurals: [] };
    }

    const target = namespaces[prefix];
    const toDelete: string[] = [];

    for (const ns of Object.keys(namespaces)) {
      if (ns === prefix) continue;
      if (!ns.startsWith(`${prefix}-`)) continue;

      // 키를 머지
      const source = namespaces[ns];
      target.strings.push(...source.strings);
      target.arrays.push(...source.arrays);
      target.plurals.push(...source.plurals);
      toDelete.push(ns);
    }

    // 개별 네임스페이스 제거
    for (const ns of toDelete) {
      delete namespaces[ns];
    }

    // 중복 제거 (docs.json fallback과 docs-*.json에 같은 키 있을 수 있음)
    target.strings = [...new Set(target.strings)];
    target.arrays = [...new Set(target.arrays)];
    target.plurals = [...new Set(target.plurals)];

    if (toDelete.length > 0) {
      console.log(`   Merged ${toDelete.length} ${prefix}-* namespaces into '${prefix}'`);
    }
  }
}

function main() {
  const { translationsDir, output, mergePrefixes } = parseArgs();

  if (!fs.existsSync(translationsDir)) {
    console.error(`❌ Translations directory not found: ${translationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(translationsDir).filter((f) => f.endsWith('.json'));

  if (files.length === 0) {
    console.error(`❌ No JSON files found in: ${translationsDir}`);
    process.exit(1);
  }

  const namespaces: Record<string, NamespaceKeys> = {};

  for (const file of files) {
    const ns = path.basename(file, '.json');
    const filePath = path.join(translationsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    namespaces[ns] = collectKeys(content);
  }

  // --merge-prefix 적용
  if (mergePrefixes.length > 0) {
    applyMergePrefixes(namespaces, mergePrefixes);
  }

  const typeContent = generateTypeFile(namespaces);

  // 출력 디렉토리 생성
  const outputDir = path.dirname(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(output, typeContent, 'utf-8');

  // 통계 출력
  let totalStrings = 0;
  let totalArrays = 0;
  let totalPlurals = 0;
  for (const ns of Object.keys(namespaces)) {
    totalStrings += namespaces[ns].strings.length;
    totalArrays += namespaces[ns].arrays.length;
    totalPlurals += namespaces[ns].plurals.length;
  }

  console.log(`✅ Generated i18n types: ${output}`);
  console.log(`   ${Object.keys(namespaces).length} namespaces, ${totalStrings} string keys, ${totalArrays} array keys, ${totalPlurals} plural keys`);
}

main();
