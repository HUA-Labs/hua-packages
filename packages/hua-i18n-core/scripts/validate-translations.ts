#!/usr/bin/env tsx
/**
 * 번역 누락 검증 스크립트
 *
 * base 언어 대비 각 언어의 누락/초과 키, 보간 파라미터 불일치, 배열 길이 불일치를 검증합니다.
 *
 * Usage:
 *   pnpm tsx scripts/validate-translations.ts \
 *     --translations-dir apps/my-app/app/lib/translations \
 *     --base ko \
 *     --strict ko,en,ja \
 *     --warn zh:0.9 \
 *     --report
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
interface ValidationConfig {
  translationsDir: string;
  base: string;
  strict: string[];
  warn: Record<string, number>;
  skip: string[];
  report: boolean;
}

function parseArgs(): ValidationConfig {
  const args = process.argv.slice(2);
  const config: ValidationConfig = {
    translationsDir: '',
    base: 'ko',
    strict: [],
    warn: {},
    skip: [],
    report: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--translations-dir' && args[i + 1]) {
      config.translationsDir = path.resolve(args[++i]);
    } else if (arg === '--base' && args[i + 1]) {
      config.base = args[++i];
    } else if (arg === '--strict' && args[i + 1]) {
      config.strict = args[++i].split(',').map((s) => s.trim());
    } else if (arg === '--warn' && args[i + 1]) {
      const pairs = args[++i].split(',');
      for (const pair of pairs) {
        const [lang, threshold] = pair.split(':');
        if (lang && threshold) {
          config.warn[lang.trim()] = parseFloat(threshold);
        }
      }
    } else if (arg === '--skip' && args[i + 1]) {
      config.skip = args[++i].split(',').map((s) => s.trim());
    } else if (arg === '--report') {
      config.report = true;
    }
  }

  if (!config.translationsDir) {
    console.error('Usage: validate-translations.ts --translations-dir <path> --base <lang> [--strict langs] [--warn lang:threshold] [--report]');
    process.exit(1);
  }

  return config;
}

// ---------------------------------------------------------------------------
// Key extraction
// ---------------------------------------------------------------------------
function flattenKeys(obj: unknown, prefix: string = ''): Map<string, { type: 'string' | 'array' | 'object'; params: string[]; arrayLength?: number }> {
  const result = new Map<string, { type: 'string' | 'array' | 'object'; params: string[]; arrayLength?: number }>();

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return result;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      // 보간 파라미터 추출: {param} 또는 {{param}}
      const params = [...value.matchAll(/\{\{?(\w+)\}?\}/g)].map((m) => m[1]);
      result.set(fullKey, { type: 'string', params: [...new Set(params)] });
    } else if (Array.isArray(value)) {
      if (value.every((v) => typeof v === 'string')) {
        // 배열 내 보간 파라미터 추출
        const params: string[] = [];
        for (const item of value) {
          const matches = [...(item as string).matchAll(/\{\{?(\w+)\}?\}/g)].map((m) => m[1]);
          params.push(...matches);
        }
        result.set(fullKey, { type: 'array', params: [...new Set(params)], arrayLength: value.length });
      }
    } else if (typeof value === 'object' && value !== null) {
      const nested = flattenKeys(value, fullKey);
      for (const [k, v] of nested) {
        result.set(k, v);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
interface ValidationIssue {
  level: 'error' | 'warning';
  lang: string;
  namespace: string;
  key: string;
  message: string;
}

function validate(config: ValidationConfig): { issues: ValidationIssue[]; stats: Record<string, { total: number; found: number }> } {
  const issues: ValidationIssue[] = [];
  const stats: Record<string, { total: number; found: number }> = {};

  const baseDir = path.join(config.translationsDir, config.base);
  if (!fs.existsSync(baseDir)) {
    console.error(`❌ Base language directory not found: ${baseDir}`);
    process.exit(1);
  }

  // 기준 언어의 모든 네임스페이스 + 키 수집
  const baseNamespaces = new Map<string, Map<string, { type: 'string' | 'array' | 'object'; params: string[]; arrayLength?: number }>>();
  const nsFiles = fs.readdirSync(baseDir).filter((f) => f.endsWith('.json'));

  let baseTotalKeys = 0;
  for (const file of nsFiles) {
    const ns = path.basename(file, '.json');
    const content = JSON.parse(fs.readFileSync(path.join(baseDir, file), 'utf-8'));
    const keys = flattenKeys(content);
    baseNamespaces.set(ns, keys);
    baseTotalKeys += keys.size;
  }

  stats[config.base] = { total: baseTotalKeys, found: baseTotalKeys };

  // 다른 언어 디렉토리 탐색
  const langDirs = fs.readdirSync(config.translationsDir).filter((d) => {
    const fullPath = path.join(config.translationsDir, d);
    return fs.statSync(fullPath).isDirectory() && d !== config.base;
  });

  for (const lang of langDirs) {
    if (config.skip.includes(lang)) continue;

    const langDir = path.join(config.translationsDir, lang);
    let found = 0;

    for (const [ns, baseKeys] of baseNamespaces) {
      const langFile = path.join(langDir, `${ns}.json`);

      if (!fs.existsSync(langFile)) {
        // 네임스페이스 파일 자체가 없음
        for (const key of baseKeys.keys()) {
          issues.push({
            level: config.strict.includes(lang) ? 'error' : 'warning',
            lang,
            namespace: ns,
            key,
            message: `Missing key (namespace file missing)`,
          });
        }
        continue;
      }

      const langContent = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
      const langKeys = flattenKeys(langContent);

      // 누락 키 검사
      for (const [key, baseInfo] of baseKeys) {
        const langInfo = langKeys.get(key);

        if (!langInfo) {
          issues.push({
            level: config.strict.includes(lang) ? 'error' : 'warning',
            lang,
            namespace: ns,
            key,
            message: `Missing key`,
          });
          continue;
        }

        found++;

        // 타입 불일치
        if (baseInfo.type !== langInfo.type) {
          issues.push({
            level: 'error',
            lang,
            namespace: ns,
            key,
            message: `Type mismatch: base=${baseInfo.type}, ${lang}=${langInfo.type}`,
          });
          continue;
        }

        // 보간 파라미터 불일치
        const missingParams = baseInfo.params.filter((p) => !langInfo.params.includes(p));
        if (missingParams.length > 0) {
          issues.push({
            level: 'warning',
            lang,
            namespace: ns,
            key,
            message: `Missing interpolation params: {${missingParams.join('}, {')}}`,
          });
        }

        // 배열 길이 불일치
        if (baseInfo.type === 'array' && baseInfo.arrayLength !== langInfo.arrayLength) {
          issues.push({
            level: 'warning',
            lang,
            namespace: ns,
            key,
            message: `Array length mismatch: base=${baseInfo.arrayLength}, ${lang}=${langInfo.arrayLength}`,
          });
        }
      }

      // Orphan 키 검사 (base에 없는데 다른 언어에만 있는 키)
      for (const key of langKeys.keys()) {
        if (!baseKeys.has(key)) {
          issues.push({
            level: 'warning',
            lang,
            namespace: ns,
            key,
            message: `Orphan key (not in base language)`,
          });
        }
      }
    }

    stats[lang] = { total: baseTotalKeys, found };
  }

  return { issues, stats };
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
function printResults(config: ValidationConfig, issues: ValidationIssue[], stats: Record<string, { total: number; found: number }>): boolean {
  let hasStrictErrors = false;

  console.log('\n📊 Translation Validation Report\n');

  // 통계
  for (const [lang, { total, found }] of Object.entries(stats).sort()) {
    const pct = total > 0 ? ((found / total) * 100).toFixed(1) : '100.0';
    const icon = lang === config.base ? '🏠' : found === total ? '✅' : config.strict.includes(lang) && found < total ? '❌' : '⚠️';
    const label = lang === config.base ? '(base)' : config.strict.includes(lang) ? '(strict)' : '';
    console.log(`  ${icon} ${lang}: ${found}/${total} (${pct}%) ${label}`);
  }

  // Errors
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');

  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    const grouped = groupByLang(errors);
    for (const [lang, langIssues] of Object.entries(grouped)) {
      console.log(`\n  [${lang}]`);
      for (const issue of langIssues.slice(0, 20)) {
        console.log(`    ${issue.namespace}:${issue.key} — ${issue.message}`);
      }
      if (langIssues.length > 20) {
        console.log(`    ... and ${langIssues.length - 20} more`);
      }

      if (config.strict.includes(lang)) {
        hasStrictErrors = true;
      }
    }
  }

  if (warnings.length > 0 && config.report) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    const grouped = groupByLang(warnings);
    for (const [lang, langIssues] of Object.entries(grouped)) {
      console.log(`\n  [${lang}]`);
      for (const issue of langIssues.slice(0, 10)) {
        console.log(`    ${issue.namespace}:${issue.key} — ${issue.message}`);
      }
      if (langIssues.length > 10) {
        console.log(`    ... and ${langIssues.length - 10} more`);
      }
    }
  }

  // warn tier 검사
  for (const [lang, threshold] of Object.entries(config.warn)) {
    const stat = stats[lang];
    if (stat) {
      const pct = stat.total > 0 ? stat.found / stat.total : 1;
      if (pct < threshold) {
        console.log(`\n⚠️  ${lang} coverage ${(pct * 100).toFixed(1)}% is below threshold ${(threshold * 100).toFixed(1)}%`);
      }
    }
  }

  console.log('');
  return hasStrictErrors;
}

function groupByLang(issues: ValidationIssue[]): Record<string, ValidationIssue[]> {
  const grouped: Record<string, ValidationIssue[]> = {};
  for (const issue of issues) {
    if (!grouped[issue.lang]) grouped[issue.lang] = [];
    grouped[issue.lang].push(issue);
  }
  return grouped;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main() {
  const config = parseArgs();
  const { issues, stats } = validate(config);
  const hasStrictErrors = printResults(config, issues, stats);

  if (hasStrictErrors) {
    console.error('❌ Strict validation failed — missing translations in strict languages');
    process.exit(1);
  }

  console.log('✅ Validation passed');
}

main();
