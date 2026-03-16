# @hua-labs/eslint-plugin-i18n

ESLint plugin for i18n type safety — catch missing keys (with did-you-mean), hardcoded text (with key suggestions), dynamic key patterns, unlocalized fields, and common key consolidation. Includes i18n-lint CLI for project-wide analysis.

[![npm version](https://img.shields.io/npm/v/@hua-labs/eslint-plugin-i18n.svg)](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/eslint-plugin-i18n.svg)](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n)
[![license](https://img.shields.io/npm/l/@hua-labs/eslint-plugin-i18n.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **no-missing-key — Detect t() keys not found in generated types + did-you-mean suggestions (up to 3)**
- **no-raw-text — Catch CJK hardcoded text in JSX + reverse-lookup key suggestions via translationsDir + ignorePattern**
- **no-dynamic-key — Warn on non-literal arguments to t() / tArray()**
- **no-unlocalized-field — Detect description/label/value fields with literal strings instead of i18n keys**
- **prefer-common-key — Suggest common namespace keys when same value exists there**
- **no-unused-key — Placeholder rule for unused translation key detection (CLI recommended)**
- **i18n-lint CLI — unused-keys, common-report, missing-translations commands**

## Installation

```bash
pnpm add @hua-labs/eslint-plugin-i18n
```

> Peer dependencies: eslint >=8.0.0

## Quick Start

```js
// eslint.config.mjs (flat config)
import i18nPlugin from "@hua-labs/eslint-plugin-i18n";

export default [
  {
    plugins: { i18n: i18nPlugin },
    rules: {
      "i18n/no-missing-key": [
        "error",
        {
          keysFile: "./types/i18n-types.generated.ts",
        },
      ],
      "i18n/no-raw-text": [
        "warn",
        {
          translationsDir: "./lib/translations",
        },
      ],
      "i18n/no-dynamic-key": "warn",
      "i18n/prefer-common-key": [
        "warn",
        {
          translationsDir: "./lib/translations",
        },
      ],
    },
  },
  // Metadata files — ensure description/label/value use i18n keys
  {
    files: ["registry/**/*.ts"],
    plugins: { i18n: i18nPlugin },
    rules: {
      "i18n/no-unlocalized-field": [
        "warn",
        {
          fields: ["description", "label", "value"],
          ignoreParentProperties: ["codeExamples"],
        },
      ],
    },
  },
];
```

## API

| Export                          | Type   | Description                                                                                                                                                        |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default`                       | plugin | Full plugin object with `rules` and `configs` properties                                                                                                           |
| `rules`                         | object | All 6 rule implementations keyed by rule name                                                                                                                      |
| `configs`                       | object | Named configs — `recommended`                                                                                                                                      |
| `rules['no-missing-key']`       | rule   | Error on `t()` keys not found in generated types; suggests up to 3 similar keys (Levenshtein)                                                                      |
| `rules['no-unused-key']`        | rule   | Warn on translation keys that appear unused (basic single-file detection; CLI recommended for project-wide)                                                        |
| `rules['no-raw-text']`          | rule   | Warn on hardcoded CJK text in JSX and checkable attributes (aria-label, placeholder, title, alt, label); suggests matching i18n keys when `translationsDir` is set |
| `rules['no-dynamic-key']`       | rule   | Warn on non-literal arguments to `t()` / `tArray()` that bypass type checking                                                                                      |
| `rules['no-unlocalized-field']` | rule   | Warn on object property values (e.g. `description`, `label`) that contain string literals instead of i18n key patterns                                             |
| `rules['prefer-common-key']`    | rule   | Suggest replacing a namespace-specific key with a `common:` key when the same translation value exists there; includes autofix                                     |
| `configs.recommended`           | config | Enables no-missing-key (error), no-raw-text (warn), no-dynamic-key (warn); others off                                                                              |

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)

## License

MIT — [HUA Labs](https://hua-labs.com)
