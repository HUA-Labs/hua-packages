# @hua-labs/i18n-formatters Detailed Guide

Locale-aware formatting for dates, numbers, and currencies.

---

## Architecture

This is a **unified package** with tree-shakeable subpath exports:

```
@hua-labs/i18n-formatters          # All formatters
@hua-labs/i18n-formatters/date     # Date only
@hua-labs/i18n-formatters/number   # Number only
@hua-labs/i18n-formatters/currency # Currency only
```

All hooks use `useI18n()` internally to get `currentLanguage`, so they must be used inside an `I18nProvider`.

### useDateFormatter

Returns 9 values:

| Return | Type | Description |
|--------|------|-------------|
| `monthNames` | `string[]` | Localized month names from `common.month_names` |
| `dayNames` | `string[]` | Localized day names from `common.day_names` |
| `formatDate` | `(date, options?) => string` | Pattern-based date formatting |
| `formatDateTime` | `(date, options?) => string` | Pattern-based date+time |
| `formatDateLocalized` | `(date, options?) => string` | `Intl.DateTimeFormat` locale-aware |
| `formatDateTimeLocalized` | `(date, options?) => string` | `Intl.DateTimeFormat` locale-aware with time |
| `formatRelativeTime` | `(date, options?) => string` | Relative time ("3분 전", "2 hours ago") |
| `currentLanguage` | `string` | Current language code |
| `locale` | `string` | Locale string (e.g. `ko-KR`, `en-US`) |

```tsx
import { useDateFormatter } from '@hua-labs/i18n-formatters/date';

function EventCard({ date }: { date: Date }) {
  const { formatDateLocalized, formatRelativeTime } = useDateFormatter();

  return (
    <div>
      <time>{formatDateLocalized(date)}</time>
      <span>{formatRelativeTime(date)}</span>
    </div>
  );
}
```

### useNumberFormatter

Returns 4 values:

| Return | Type | Description |
|--------|------|-------------|
| `formatNumber` | `(value, options?) => string` | Locale-aware number grouping |
| `formatPercent` | `(value, options?) => string` | Percentage formatting |
| `formatCompact` | `(value, options?) => string` | Compact notation (1.2M, 123만) |
| `currentLanguage` | `string` | Current language code |

```tsx
import { useNumberFormatter } from '@hua-labs/i18n-formatters/number';

function MetricCard({ count, rate }: { count: number; rate: number }) {
  const { formatCompact, formatPercent } = useNumberFormatter();

  return (
    <div>
      <span>{formatCompact(count)}</span>
      <span>{formatPercent(rate)}</span>
    </div>
  );
}
```

### useCurrencyFormatter

Returns 3 values:

| Return | Type | Description |
|--------|------|-------------|
| `formatCurrency` | `(value, options?) => string` | Currency formatting with symbol |
| `currentLanguage` | `string` | Current language code |
| `defaultCurrency` | `string` | Default currency for language (KRW, USD, JPY) |

`options` is `CurrencyFormatterOptions` — pass `{ currency: 'USD' }` to override.

```tsx
import { useCurrencyFormatter } from '@hua-labs/i18n-formatters/currency';

function Price({ amount }: { amount: number }) {
  const { formatCurrency } = useCurrencyFormatter();

  return <span>{formatCurrency(amount, { currency: 'USD' })}</span>;
}
```

### Standalone Functions

Hooks are wrappers. The underlying functions can be used directly (e.g. in server code):

```ts
import { formatDate } from '@hua-labs/i18n-formatters/date';
import { formatNumber } from '@hua-labs/i18n-formatters/number';
import { formatCurrency } from '@hua-labs/i18n-formatters/currency';

// Standalone functions require explicit language parameter
formatNumber(1234567, {}, 'ko');     // "1,234,567"
formatCurrency(10000, {}, 'ko');     // "₩10,000"
```
