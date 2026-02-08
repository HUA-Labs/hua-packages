# @hua-labs/i18n-formatters

Date, number, and currency formatting utilities for i18n applications.
i18n 앱을 위한 날짜, 숫자, 통화 포매팅 유틸리티.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-formatters.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

Locale-aware formatting utilities that integrate with `@hua-labs/i18n-core`. Provides React hooks and standalone functions for dates, numbers, and currencies with full Korean/English/Japanese support.

`@hua-labs/i18n-core`와 통합되는 로케일 기반 포매팅 유틸리티입니다. 한국어/영어/일본어를 완벽 지원하며, React 훅과 독립 함수를 모두 제공합니다.

## Features

- **Date formatting** — Custom patterns, relative time ("3분 전"), timezone support
- **Number formatting** — Locale-aware grouping, compact notation (1K, 1M), percentages
- **Currency formatting** — Symbol positioning, decimal control, 6 currencies (KRW, USD, EUR, GBP, JPY, CNY)
- **React hooks** — `useDateFormatter`, `useNumberFormatter`, `useCurrencyFormatter`
- **Tree-shakeable** — Subpath exports for date, number, currency independently

## Installation | 설치

```bash
pnpm add @hua-labs/i18n-formatters
```

Peer dependency: `react >= 19.0.0`

## Quick Start | 빠른 시작

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

## Entry Points | 진입점

| Path | Description |
|------|-------------|
| `@hua-labs/i18n-formatters` | All formatters |
| `@hua-labs/i18n-formatters/date` | Date utilities only |
| `@hua-labs/i18n-formatters/number` | Number utilities only |
| `@hua-labs/i18n-formatters/currency` | Currency utilities only |

## API Overview | API 개요

| Hook | Functions |
|------|-----------|
| `useDateFormatter()` | `formatDate`, `formatDateTime`, `formatRelativeTime`, `formatDateReadable` |
| `useNumberFormatter()` | `formatNumber`, `formatCompact`, `formatPercent` |
| `useCurrencyFormatter()` | `formatCurrency`, `getDefaultCurrency`, `getCurrencyDecimals` |

## Documentation | 문서

- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core) — Core i18n engine
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) — Zustand state adapter
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders) — Translation loaders and caching

## Requirements | 요구사항

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
