/**
 * unused-keys command
 *
 * Scans source files and compares against translation keys to find unused ones.
 */
import * as fs from 'fs';
import * as path from 'path';
import { loadTranslations } from '../../utils/translation-loader';

function globFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const extSet = new Set(extensions);

  function walk(d: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist') continue;
        walk(fullPath);
      } else if (entry.isFile() && extSet.has(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

export interface UnusedKeysOptions {
  translationsDir: string;
  sourceDir: string;
  language?: string;
  format?: 'text' | 'json';
}

export function unusedKeys(options: UnusedKeysOptions): {
  unused: { key: string; namespace: string }[];
} {
  const { translationsDir, sourceDir, language = 'ko', format = 'text' } = options;
  const map = loadTranslations(translationsDir, language);

  // Collect all source content
  const files = globFiles(sourceDir, ['.ts', '.tsx', '.js', '.jsx']);
  let allSource = '';
  for (const file of files) {
    try {
      allSource += fs.readFileSync(file, 'utf-8') + '\n';
    } catch {
      // skip unreadable files
    }
  }

  const unused: { key: string; namespace: string }[] = [];

  for (const [namespace, keys] of map.namespaceKeys) {
    for (const fullKey of keys) {
      // Check both the full key and the key part after namespace
      // e.g., 'common:actions.save' → check for 'common:actions.save' and 'actions.save'
      const keyPart = fullKey.slice(namespace.length + 1);

      // Template literal prefix match: check if namespace + partial key appears
      // e.g., `common:actions.${x}` would match common:actions.*
      const nsPrefix = `${namespace}:`;

      if (
        !allSource.includes(fullKey) &&
        !allSource.includes(`'${fullKey}'`) &&
        !allSource.includes(`"${fullKey}"`)
      ) {
        // Also check for template literal prefix patterns
        // If the key is "common:actions.save", check if "common:actions." appears
        // as part of a template literal pattern
        const dotIndex = keyPart.lastIndexOf('.');
        const prefix = dotIndex !== -1 ? `${nsPrefix}${keyPart.slice(0, dotIndex + 1)}` : null;
        if (prefix && allSource.includes(prefix)) {
          continue; // Likely used via template literal
        }

        unused.push({ key: fullKey, namespace });
      }
    }
  }

  // Output
  if (format === 'json') {
    console.log(JSON.stringify({ unused, total: unused.length }, null, 2));
  } else {
    if (unused.length === 0) {
      console.log('No unused keys found.');
    } else {
      console.log(`Found ${unused.length} potentially unused key(s):\n`);
      const grouped = new Map<string, string[]>();
      for (const u of unused) {
        const arr = grouped.get(u.namespace) || [];
        arr.push(u.key);
        grouped.set(u.namespace, arr);
      }
      for (const [ns, keys] of grouped) {
        console.log(`  [${ns}]`);
        for (const k of keys) {
          console.log(`    - ${k}`);
        }
      }
    }
  }

  return { unused };
}
