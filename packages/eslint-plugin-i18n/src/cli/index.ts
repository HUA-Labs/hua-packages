/**
 * i18n-lint CLI
 *
 * Commands:
 *   unused-keys   — Find translation keys not used in source code
 *   common-report — Find values that could be consolidated into common namespace
 *   missing       — Find translations missing across languages
 */
import { parseArgs } from './parse-args';
import { unusedKeys } from './commands/unused-keys';
import { commonReport } from './commands/common-report';
import { missingTranslations } from './commands/missing-translations';
import { clearTranslationCache } from '../utils/translation-loader';

const HELP = `
i18n-lint — Translation analysis CLI

Usage:
  i18n-lint <command> [options]

Commands:
  unused-keys         Find unused translation keys
  common-report       Find values that can be consolidated into common namespace
  missing             Find translations missing across languages

Common Options:
  --translations-dir  Path to translations directory (required)
  --language          Base language (default: ko)
  --format            Output format: text | json (default: text)

Command-specific Options:
  unused-keys:
    --source-dir      Path to source directory to scan (required)

  missing:
    --languages       Comma-separated list of target languages (required)

Examples:
  i18n-lint unused-keys --translations-dir ./lib/translations --source-dir ./app
  i18n-lint common-report --translations-dir ./lib/translations
  i18n-lint missing --translations-dir ./lib/translations --languages en,ja
`.trim();

function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (command === 'help' || flags['help']) {
    console.log(HELP);
    process.exit(0);
  }

  const translationsDir = flags['translations-dir'];
  if (!translationsDir && command !== 'help') {
    console.error('Error: --translations-dir is required.\n');
    console.log(HELP);
    process.exit(1);
  }

  const format = (flags['format'] || 'text') as 'text' | 'json';
  const language = flags['language'] || 'ko';

  // Clear cache before each run
  clearTranslationCache();

  switch (command) {
    case 'unused-keys': {
      const sourceDir = flags['source-dir'];
      if (!sourceDir) {
        console.error('Error: --source-dir is required for unused-keys.\n');
        process.exit(1);
      }
      unusedKeys({ translationsDir: translationsDir!, sourceDir, language, format });
      break;
    }

    case 'common-report': {
      const commonNamespace = flags['common-namespace'] || 'common';
      commonReport({
        translationsDir: translationsDir!,
        language,
        commonNamespace,
        format,
      });
      break;
    }

    case 'missing': {
      const langs = flags['languages'];
      if (!langs) {
        console.error('Error: --languages is required for missing.\n');
        process.exit(1);
      }
      missingTranslations({
        translationsDir: translationsDir!,
        languages: langs.split(',').map((l) => l.trim()),
        baseLanguage: language,
        format,
      });
      break;
    }

    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP);
      process.exit(1);
  }
}

main();
