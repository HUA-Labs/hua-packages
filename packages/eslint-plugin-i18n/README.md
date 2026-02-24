# @hua-labs/eslint-plugin-i18n

ESLint plugin for i18n type safety — catch missing keys, hardcoded text, dynamic key patterns, and unlocalized metadata fields at lint time. Includes CLI for project-wide translation analysis.

[![npm version](https://img.shields.io/npm/v/@hua-labs/eslint-plugin-i18n.svg)](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/eslint-plugin-i18n.svg)](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n)
[![license](https://img.shields.io/npm/l/@hua-labs/eslint-plugin-i18n.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **no-missing-key** — Detect t() keys not found in generated types + did-you-mean suggestions (up to 3 alternatives with autofix)
- **no-raw-text** — Catch CJK hardcoded text in JSX + reverse-lookup key suggestions via `translationsDir` + `ignorePattern`
- **no-dynamic-key** — Warn on non-literal arguments to t() / tArray()
- **no-unlocalized-field** — Detect description/label/value fields with literal strings instead of i18n keys
- **prefer-common-key** — Suggest common namespace keys when the same translation value exists there
- **no-unused-key** — Placeholder rule for unused translation key detection (CLI recommended)

## Installation

```bash
pnpm add -D @hua-labs/eslint-plugin-i18n
```

> Peer dependencies: eslint >=8.0.0

## Quick Start

```js
// eslint.config.mjs (flat config)
import i18nPlugin from '@hua-labs/eslint-plugin-i18n';

export default [
  {
    plugins: { i18n: i18nPlugin },
    rules: {
      'i18n/no-missing-key': ['error', {
        keysFile: './types/i18n-types.generated.ts'
      }],
      'i18n/no-raw-text': ['warn', {
        translationsDir: './lib/translations',
        ignorePattern: '^\\d+[가-힣]$',
      }],
      'i18n/no-dynamic-key': 'warn',
      'i18n/prefer-common-key': ['warn', {
        translationsDir: './lib/translations',
      }],
    },
  },
  // Metadata files — ensure description/label/value use i18n keys
  {
    files: ['registry/**/*.ts'],
    plugins: { i18n: i18nPlugin },
    rules: {
      'i18n/no-unlocalized-field': ['warn', {
        fields: ['description', 'label', 'value'],
        ignoreParentProperties: ['codeExamples'],
      }],
    },
  },
];
```

## CLI (i18n-lint)

Project-wide translation analysis tool.

```bash
# Find unused translation keys
i18n-lint unused-keys --translations-dir ./lib/translations --source-dir ./app

# Find values that can be consolidated into common namespace
i18n-lint common-report --translations-dir ./lib/translations

# Find translations missing across languages
i18n-lint missing --translations-dir ./lib/translations --languages en,ja

# JSON output for CI integration
i18n-lint unused-keys --translations-dir ./lib/translations --source-dir ./app --format json
```

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)

## License

MIT — [HUA Labs](https://hua-labs.com)
