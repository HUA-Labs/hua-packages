# @hua-labs/eslint-plugin-i18n

ESLint plugin for i18n type safety — catch missing keys, hardcoded text, and dynamic key patterns at lint time.

## Installation

```bash
pnpm add -D @hua-labs/eslint-plugin-i18n
```

Peer dependency: `eslint >= 8.0.0`

## Setup

```js
// eslint.config.js (flat config)
import i18nPlugin from '@hua-labs/eslint-plugin-i18n';

export default [
  {
    plugins: { i18n: i18nPlugin },
    rules: {
      'i18n/no-missing-key': ['error', {
        generatedKeysPath: './types/i18n-types.generated.ts'
      }],
      'i18n/no-raw-text': ['warn', {
        allowedTerms: ['HUA', 'Sum']
      }],
      'i18n/no-dynamic-key': ['warn', {
        allowPatterns: ['loading\\.messages\\.\\d+']
      }],
    },
  },
];
```

Or use the recommended config:

```js
import i18nPlugin from '@hua-labs/eslint-plugin-i18n';

export default [
  i18nPlugin.configs.recommended,
];
```

## Rules

| Rule | Description | Default |
|------|-------------|---------|
| `no-missing-key` | `t()` key not found in generated types | error |
| `no-raw-text` | CJK hardcoded text in JSX (Korean, Japanese, Chinese) | warn |
| `no-dynamic-key` | Non-literal first argument to `t()` / `tArray()` | warn |
| `no-unused-key` | Translation key not referenced in code (placeholder) | warn |

### no-missing-key

Loads all valid keys from the generated types file and checks `t('...')` / `tArray('...')` calls against them.

**Options:**
- `generatedKeysPath` (string): Path to the generated types file

### no-raw-text

Detects CJK characters (Korean, Japanese, Chinese) in JSX text nodes and checkable attributes (`aria-label`, `placeholder`, `title`, `alt`).

**Options:**
- `allowedTerms` (string[]): Brand names or terms to allow (e.g., `['HUA', 'Sum']`)

### no-dynamic-key

Warns when the first argument to `t()` or `tArray()` is not a string literal. Template literals with expressions are flagged since they can't be statically validated.

**Options:**
- `allowPatterns` (string[]): Regex patterns for template literals to allow (e.g., `['loading\\.messages\\.\\d+']`)

### no-unused-key

Placeholder rule. For comprehensive unused key detection, use the CLI validator:

```bash
pnpm tsx node_modules/@hua-labs/i18n-core/scripts/validate-translations.ts --report
```

## Related

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core) — Core i18n library with type generation scripts

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
