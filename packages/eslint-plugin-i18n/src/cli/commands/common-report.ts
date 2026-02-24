/**
 * common-report command
 *
 * Finds translation values that exist in multiple namespaces
 * and could be consolidated into the common namespace.
 */
import { loadTranslations } from '../../utils/translation-loader';

export interface CommonReportOptions {
  translationsDir: string;
  language?: string;
  commonNamespace?: string;
  format?: 'text' | 'json';
}

interface ConsolidationCandidate {
  value: string;
  keys: string[];
  hasCommonKey: boolean;
  suggestedCommonKey: string | null;
}

export function commonReport(options: CommonReportOptions): {
  candidates: ConsolidationCandidate[];
} {
  const {
    translationsDir,
    language = 'ko',
    commonNamespace = 'common',
    format = 'text',
  } = options;

  const map = loadTranslations(translationsDir, language);
  const candidates: ConsolidationCandidate[] = [];

  for (const [value, keys] of map.valueToKeys) {
    if (keys.size < 2) continue;

    const keyArr = [...keys];
    const hasCommonKey = keyArr.some((k) => k.startsWith(`${commonNamespace}:`));

    // Find non-common keys that could use common
    const nonCommonKeys = keyArr.filter(
      (k) => !k.startsWith(`${commonNamespace}:`),
    );

    if (nonCommonKeys.length === 0) continue;

    const commonKey = keyArr.find((k) =>
      k.startsWith(`${commonNamespace}:`),
    );

    candidates.push({
      value,
      keys: keyArr,
      hasCommonKey,
      suggestedCommonKey: commonKey || null,
    });
  }

  // Sort: candidates with existing common key first (easiest to fix)
  candidates.sort((a, b) => {
    if (a.hasCommonKey && !b.hasCommonKey) return -1;
    if (!a.hasCommonKey && b.hasCommonKey) return 1;
    return b.keys.length - a.keys.length;
  });

  // Output
  if (format === 'json') {
    console.log(JSON.stringify({ candidates, total: candidates.length }, null, 2));
  } else {
    if (candidates.length === 0) {
      console.log('No consolidation candidates found.');
    } else {
      console.log(
        `Found ${candidates.length} value(s) shared across namespaces:\n`,
      );
      for (const c of candidates) {
        const tag = c.hasCommonKey ? '[can consolidate]' : '[needs common key]';
        console.log(`  ${tag} "${c.value}"`);
        for (const k of c.keys) {
          const marker = k.startsWith(`${commonNamespace}:`) ? ' <-- common' : '';
          console.log(`    - ${k}${marker}`);
        }
        if (c.suggestedCommonKey) {
          console.log(`    => Use: ${c.suggestedCommonKey}`);
        }
        console.log();
      }
    }
  }

  return { candidates };
}
