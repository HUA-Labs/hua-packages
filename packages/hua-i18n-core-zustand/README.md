# @hua-labs/i18n-core-zustand

Type-safe adapter for integrating Zustand state management with @hua-labs/i18n-core. Provides seamless language state synchronization with SSR hydration support and circular reference prevention.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-core-zustand.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/i18n-core-zustand.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-core-zustand.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Type-safe — Full TypeScript support**
- **Auto-sync — Zustand store changes automatically sync to i18n**
- **SSR compatible — Language syncs after hydration to prevent mismatches**
- **Circular reference prevention — Safe unidirectional data flow**
- **Minimal — Only Zustand as peer dependency**

## Installation

```bash
pnpm add @hua-labs/i18n-core-zustand
```

> Peer dependencies: zustand ^4.0.0 || ^5.0.0, react >=19.0.0

## Quick Start

```tsx
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useTranslation } from '@hua-labs/i18n-core';
import { useAppStore } from './store';

const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: 'en',
  namespaces: ['common', 'navigation'],
  translationLoader: 'api',
  translationApiPath: '/api/translations',
  defaultLanguage: 'ko',
});

export default function Layout({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('common:welcome')}</h1>;
}

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `createZustandI18n` | function | Create an i18n Provider integrated with Zustand store |
| `useZustandI18n` | hook | Hook returning { language, setLanguage } from Zustand |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
- [`@hua-labs/state`](https://www.npmjs.com/package/@hua-labs/state)

## License

MIT — [HUA Labs](https://hua-labs.com)
