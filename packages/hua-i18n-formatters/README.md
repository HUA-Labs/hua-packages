# @hua-labs/i18n-formatters

Locale-aware formatting utilities that integrate with @hua-labs/i18n-core. Provides React hooks and standalone functions for dates, numbers, and currencies with full Korean/English/Japanese support.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/i18n-formatters.svg)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-formatters.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Date formatting — Custom patterns, relative time, timezone support**
- **Number formatting — Locale-aware grouping, compact notation (1K, 1M), percentages**
- **Currency formatting — Symbol positioning, decimal control, 6 currencies (KRW, USD, EUR, GBP, JPY, CNY)**
- **React hooks — useDateFormatter, useNumberFormatter, useCurrencyFormatter**
- **React Native — Works in Expo and bare RN projects**
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
| `useDateFormatter` | function | Date formatting hook — formatDate, formatRelativeTime, monthNames, dayNames |
| `formatDate` | function | Format a Date or ISO string into a localized date string. Accepts DateFormatterOptions (pattern, locale, timezone). |
| `formatDateTime` | function | Format a Date or ISO string into a localized date-and-time string. |
| `formatRelativeTime` | function | Return a locale-aware relative time string (e.g. '3 minutes ago', '2일 전'). Accepts RelativeTimeOptions. |
| `applyTimezoneOffset` | function | Shift a Date by the given timezone offset in minutes and return the adjusted Date. |
| `getKoreanDate` | function | Return a Date object adjusted to Korea Standard Time (UTC+9). |
| `getKoreanDateString` | function | Return a YYYY-MM-DD string in Korea Standard Time for the given date. |
| `parseDateAsTimezone` | function | Parse a date string as if it were in the given timezone offset. |
| `convertToTimezone` | function | Convert a Date from UTC to the target timezone offset and return the adjusted Date. |
| `KST_OFFSET` | constant | Korea Standard Time UTC offset in minutes (540 = UTC+9). |
| `useNumberFormatter` | function | Number formatting hook — formatNumber, formatPercent, formatCompact |
| `formatNumber` | function | Format a number with locale-aware grouping separators and decimal places. Accepts NumberFormatterOptions. |
| `formatCompact` | function | Format a large number using compact notation (e.g. 1K, 1.2M). Accepts NumberFormatterOptions. |
| `formatPercent` | function | Format a decimal value as a percentage string (e.g. 0.75 → '75%'). Accepts PercentFormatterOptions. |
| `useCurrencyFormatter` | function | Currency formatting hook — formatCurrency with 6 currency support |
| `formatCurrency` | function | Format a number as a currency string (e.g. '₩1,000', '$9.99'). Accepts CurrencyFormatterOptions. |
| `getDefaultCurrency` | function | Resolve the default ISO 4217 currency code for a given language code using LANGUAGE_TO_CURRENCY. |
| `getCurrencyDecimals` | function | Return the standard number of decimal places for a given ISO 4217 currency code using CURRENCY_DECIMALS. |
| `LANGUAGE_TO_CURRENCY` | constant | Constant map from BCP 47 language code to ISO 4217 currency code (e.g. 'ko' → 'KRW', 'en' → 'USD'). |
| `CURRENCY_DECIMALS` | constant | Constant map from ISO 4217 currency code to standard decimal places (e.g. 'KRW' → 0, 'USD' → 2). |
| `DateFormatterOptions` | type | Options for formatDate / formatDateTime — pattern, locale, timezone offset. |
| `TimezoneConfig` | type | Timezone configuration — offset in minutes and optional label. |
| `RelativeTimeOptions` | type | Options for formatRelativeTime — locale, numeric style. |
| `DateFormatterReturn` | type | Return type of useDateFormatter — formatDate, formatDateTime, formatRelativeTime, monthNames, dayNames. |
| `NumberFormatterOptions` | type | Options for formatNumber / formatCompact — locale, minimumFractionDigits, maximumFractionDigits. |
| `PercentFormatterOptions` | type | Options for formatPercent — locale, decimal places. |
| `NumberFormatterReturn` | type | Return type of useNumberFormatter — formatNumber, formatPercent, formatCompact. |
| `CurrencyFormatterOptions` | type | Options for formatCurrency — currency code, locale, symbol display. |
| `CurrencyFormatterReturn` | type | Return type of useCurrencyFormatter — formatCurrency. |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders)

## License

MIT — [HUA Labs](https://hua-labs.com)
