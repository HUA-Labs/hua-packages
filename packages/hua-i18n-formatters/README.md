# @hua-labs/i18n-formatters

Date, number, and currency formatting utilities for i18n applications.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-formatters.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Overview

Locale-aware formatting utilities that integrate with `@hua-labs/i18n-core`. Provides React hooks and standalone functions for dates, numbers, and currencies with full Korean/English/Japanese support.

## Features

- **Date formatting** — Custom patterns, relative time ("3분 전"), timezone support
- **Number formatting** — Locale-aware grouping, compact notation (1K, 1M), percentages
- **Currency formatting** — Symbol positioning, decimal control, 6 currencies (KRW, USD, EUR, GBP, JPY, CNY)
- **React hooks** — `useDateFormatter`, `useNumberFormatter`, `useCurrencyFormatter`
- **Tree-shakeable** — Subpath exports for date, number, currency independently

## Installation

```bash
pnpm add @hua-labs/i18n-formatters
```

Peer dependency: `react >= 19.0.0`

## Quick Start

```tsx
import { useDateFormatter } from '@hua-labs/i18n-formatters/date';
import { useCurrencyFormatter } from '@hua-labs/i18n-formatters/currency';

function PriceCard({ date, amount }: { date: Date; amount: number }) {
  const { formatRelativeTime } = useDateFormatter();
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div>
      <span>{formatRelativeTime(date)}</span>
      <span>{formatCurrency(amount)}</span>
    </div>
  );
}
```

## Entry Points

| Path | Description |
|------|-------------|
| `@hua-labs/i18n-formatters` | All formatters |
| `@hua-labs/i18n-formatters/date` | Date utilities only |
| `@hua-labs/i18n-formatters/number` | Number utilities only |
| `@hua-labs/i18n-formatters/currency` | Currency utilities only |

## API Overview

| Hook | Functions |
|------|-----------|
| `useDateFormatter()` | `formatDate`, `formatDateTime`, `formatRelativeTime`, `formatDateReadable` |
| `useNumberFormatter()` | `formatNumber`, `formatCompact`, `formatPercent` |
| `useCurrencyFormatter()` | `formatCurrency`, `getDefaultCurrency`, `getCurrencyDecimals` |

## Documentation

- [Documentation Site](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core) — Core i18n engine
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) — Zustand state adapter
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders) — Translation loaders and caching

## Requirements

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
