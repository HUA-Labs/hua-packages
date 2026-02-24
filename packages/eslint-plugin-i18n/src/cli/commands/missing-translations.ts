/**
 * missing-translations command
 *
 * Compares translation keys across languages to find missing translations.
 */
import { loadTranslations } from '../../utils/translation-loader';

export interface MissingTranslationsOptions {
  translationsDir: string;
  languages: string[];
  baseLanguage?: string;
  format?: 'text' | 'json';
}

interface MissingEntry {
  key: string;
  missingIn: string[];
}

export function missingTranslations(options: MissingTranslationsOptions): {
  missing: MissingEntry[];
} {
  const {
    translationsDir,
    languages,
    baseLanguage = 'ko',
    format = 'text',
  } = options;

  // Load base language
  const baseMap = loadTranslations(translationsDir, baseLanguage);
  const baseKeys = new Set(baseMap.keyToValue.keys());

  // Load target languages
  const targetMaps = new Map<string, Set<string>>();
  for (const lang of languages) {
    if (lang === baseLanguage) continue;
    const map = loadTranslations(translationsDir, lang);
    targetMaps.set(lang, new Set(map.keyToValue.keys()));
  }

  const missing: MissingEntry[] = [];

  // Check which base keys are missing in target languages
  for (const key of baseKeys) {
    const missingIn: string[] = [];
    for (const [lang, keys] of targetMaps) {
      if (!keys.has(key)) {
        missingIn.push(lang);
      }
    }
    if (missingIn.length > 0) {
      missing.push({ key, missingIn });
    }
  }

  // Check reverse: keys in target that don't exist in base
  for (const [lang, keys] of targetMaps) {
    for (const key of keys) {
      if (!baseKeys.has(key)) {
        // Check if already recorded
        const existing = missing.find((m) => m.key === key);
        if (existing) {
          if (!existing.missingIn.includes(baseLanguage)) {
            existing.missingIn.push(baseLanguage);
          }
        } else {
          missing.push({ key, missingIn: [baseLanguage] });
        }
      }
    }
  }

  // Sort by key
  missing.sort((a, b) => a.key.localeCompare(b.key));

  // Output
  if (format === 'json') {
    console.log(JSON.stringify({ missing, total: missing.length }, null, 2));
  } else {
    if (missing.length === 0) {
      console.log('All translations are in sync.');
    } else {
      console.log(`Found ${missing.length} missing translation(s):\n`);
      for (const m of missing) {
        console.log(`  ${m.key}`);
        console.log(`    missing in: ${m.missingIn.join(', ')}`);
      }
    }
  }

  return { missing };
}
