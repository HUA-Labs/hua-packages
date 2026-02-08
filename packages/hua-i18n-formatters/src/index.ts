/**
 * @hua-labs/i18n-formatters - 날짜, 숫자, 화폐 포맷팅 유틸리티
 *
 * i18n-core와 통합하여 포맷팅 기능을 제공하는 통합 패키지입니다.
 *
 * @example
 * ```tsx
 * // 전체 import
 * import { formatDate, formatNumber, formatCurrency } from '@hua-labs/i18n-formatters';
 *
 * // 개별 import (트리쉐이킹)
 * import { formatDate } from '@hua-labs/i18n-formatters/date';
 * import { formatNumber } from '@hua-labs/i18n-formatters/number';
 * import { formatCurrency } from '@hua-labs/i18n-formatters/currency';
 * ```
 */

// ============================================
// Date Formatters
// ============================================
export {
  useDateFormatter,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  applyTimezoneOffset,
  getKoreanDate,
  getKoreanDateString,
  parseDateAsTimezone,
  convertToTimezone,
  KST_OFFSET,
} from './date';

export type {
  DateFormatterOptions,
  TimezoneConfig,
  RelativeTimeOptions,
  DateFormatterReturn,
} from './date';

// ============================================
// Number Formatters
// ============================================
export {
  useNumberFormatter,
  formatNumber,
  formatCompact,
  formatPercent,
} from './number';

export type {
  NumberFormatterOptions,
  PercentFormatterOptions,
  NumberFormatterReturn,
} from './number';

// ============================================
// Currency Formatters
// ============================================
export {
  useCurrencyFormatter,
  formatCurrency,
  getDefaultCurrency,
  getCurrencyDecimals,
  LANGUAGE_TO_CURRENCY,
  CURRENCY_DECIMALS,
} from './currency';

export type {
  CurrencyFormatterOptions,
  CurrencyFormatterReturn,
} from './currency';
