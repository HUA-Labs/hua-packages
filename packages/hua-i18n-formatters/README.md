# @hua-labs/i18n-formatters

Locale-aware formatting utilities that integrate with @hua-labs/i18n-core. Provides React hooks and standalone functions for dates, numbers, and currencies with full Korean/English/Japanese support.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-formatters.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Date formatting — Custom patterns, relative time, timezone support**
- **Number formatting — Locale-aware grouping, compact notation (1K, 1M), percentages**
- **Currency formatting — Symbol positioning, decimal control, 6 currencies (KRW, USD, EUR, GBP, JPY, CNY)**
- **React hooks — useDateFormatter, useNumberFormatter, useCurrencyFormatter**
- **Tree-shakeable — Subpath exports for date, number, currency independently**

## Installation

```bash
pnpm add @hua-labs/i18n-formatters
```

> Peer dependencies: react >=19.0.0

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

## API

| Export | Type | Description |
|--------|------|-------------|
| `useDateFormatter` | hook | Date formatting hook — formatDate, formatRelativeTime, monthNames, dayNames |
| `formatDate` | function |  |
| `formatDateTime` | function |  |
| `formatRelativeTime` | function |  |
| `applyTimezoneOffset` | function |  |
| `getKoreanDate` | function |  |
| `getKoreanDateString` | function |  |
| `parseDateAsTimezone` | function |  |
| `convertToTimezone` | function |  |
| `KST_OFFSET` | component |  |
| `useNumberFormatter` | hook | Number formatting hook — formatNumber, formatPercent, formatCompact |
| `formatNumber` | function |  |
| `formatCompact` | function |  |
| `formatPercent` | function |  |
| `useCurrencyFormatter` | hook | Currency formatting hook — formatCurrency with 6 currency support |
| `formatCurrency` | function |  |
| `getDefaultCurrency` | function |  |
| `getCurrencyDecimals` | function |  |
| `LANGUAGE_TO_CURRENCY` | component |  |
| `CURRENCY_DECIMALS` | component |  |
| `DateFormatterOptions` | type |  |
| `TimezoneConfig` | type |  |
| `RelativeTimeOptions` | type |  |
| `DateFormatterReturn` | type |  |
| `NumberFormatterOptions` | type |  |
| `PercentFormatterOptions` | type |  |
| `NumberFormatterReturn` | type |  |
| `CurrencyFormatterOptions` | type |  |
| `CurrencyFormatterReturn` | type |  |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders)

## License

MIT — [HUA Labs](https://hua-labs.com)
