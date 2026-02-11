# @hua-labs/eslint-plugin-i18n

ESLint plugin for i18n type safety — catch missing keys, hardcoded text, and dynamic key patterns at lint time.

[![npm version](https://img.shields.io/npm/v/@hua-labs/eslint-plugin-i18n.svg)](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/eslint-plugin-i18n.svg)](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n)
[![license](https://img.shields.io/npm/l/@hua-labs/eslint-plugin-i18n.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **no-missing-key — Detect t() keys not found in generated types**
- **no-raw-text — Catch CJK hardcoded text in JSX (Korean, Japanese, Chinese)**
- **no-dynamic-key — Warn on non-literal arguments to t() / tArray()**
- **no-unused-key — Placeholder rule for unused translation key detection**

## Installation

```bash
pnpm add @hua-labs/eslint-plugin-i18n
```

> Peer dependencies: eslint >=8.0.0

## Quick Start

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
      'i18n/no-dynamic-key': 'warn',
    },
  },
];

```

## API

| Export | Type | Description |
|--------|------|-------------|


## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)

## License

MIT — [HUA Labs](https://hua-labs.com)
