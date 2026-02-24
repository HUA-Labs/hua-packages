import * as fs from 'fs';
import * as path from 'path';

export interface TranslationMap {
  /** "common:actions.save" → "저장" */
  keyToValue: Map<string, string>;
  /** "저장" → Set{"common:actions.save", "diary:save_button"} */
  valueToKeys: Map<string, Set<string>>;
  /** "common" → Set{"common:welcome", "common:actions.save", ...} */
  namespaceKeys: Map<string, Set<string>>;
}

const cache = new Map<string, TranslationMap>();

/**
 * Flatten nested JSON into dot-separated keys.
 * Skips arrays and non-string values.
 */
function flattenJson(
  obj: Record<string, unknown>,
  prefix = '',
): Map<string, string> {
  const result = new Map<string, string>();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result.set(fullKey, value);
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      for (const [k, v] of flattenJson(
        value as Record<string, unknown>,
        fullKey,
      )) {
        result.set(k, v);
      }
    }
    // Skip arrays, numbers, booleans, null
  }

  return result;
}

/**
 * Load translations from JSON files.
 *
 * Directory structure expected:
 *   {translationsDir}/{language}/{namespace}.json
 *
 * Example:
 *   lib/translations/ko/common.json
 *   lib/translations/ko/diary.json
 */
export function loadTranslations(
  translationsDir: string,
  language = 'ko',
): TranslationMap {
  const cacheKey = `${translationsDir}::${language}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const keyToValue = new Map<string, string>();
  const valueToKeys = new Map<string, Set<string>>();
  const namespaceKeys = new Map<string, Set<string>>();

  const langDir = path.resolve(translationsDir, language);

  let files: string[] = [];
  try {
    files = fs
      .readdirSync(langDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
  } catch {
    // Directory not found — return empty maps
    const empty: TranslationMap = { keyToValue, valueToKeys, namespaceKeys };
    cache.set(cacheKey, empty);
    return empty;
  }

  for (const file of files) {
    const namespace = path.basename(file, '.json');
    const filePath = path.join(langDir, file);

    let json: Record<string, unknown>;
    try {
      json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      continue;
    }

    const flattened = flattenJson(json);
    const nsKeys = new Set<string>();

    for (const [key, value] of flattened) {
      const fullKey = `${namespace}:${key}`;
      keyToValue.set(fullKey, value);
      nsKeys.add(fullKey);

      const existing = valueToKeys.get(value);
      if (existing) {
        existing.add(fullKey);
      } else {
        valueToKeys.set(value, new Set([fullKey]));
      }
    }

    namespaceKeys.set(namespace, nsKeys);
  }

  const result: TranslationMap = { keyToValue, valueToKeys, namespaceKeys };
  cache.set(cacheKey, result);
  return result;
}

/**
 * Find translation keys for a given value, sorted with common namespace first
 * and shorter keys preferred.
 */
export function findKeysForValue(
  translationMap: TranslationMap,
  value: string,
  commonNamespace = 'common',
): string[] {
  const keys = translationMap.valueToKeys.get(value.trim());
  if (!keys || keys.size === 0) return [];

  return [...keys].sort((a, b) => {
    const aIsCommon = a.startsWith(`${commonNamespace}:`) ? 0 : 1;
    const bIsCommon = b.startsWith(`${commonNamespace}:`) ? 0 : 1;
    if (aIsCommon !== bIsCommon) return aIsCommon - bIsCommon;
    return a.length - b.length;
  });
}

/**
 * Clear the translation cache. Useful for testing.
 */
export function clearTranslationCache(): void {
  cache.clear();
}
