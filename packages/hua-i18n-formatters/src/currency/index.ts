/**
 * @hua-labs/i18n-currency - 화폐 포맷팅 및 현지화 유틸리티
 * 
 * i18n-core와 통합하여 화폐 관련 기능을 제공하는 패키지입니다.
 */

// 훅
export { useCurrencyFormatter } from './hooks/useCurrencyFormatter';

// 유틸리티 함수
export {
  formatCurrency,
} from './utils/currency-formatter';

export {
  getDefaultCurrency,
  getCurrencyDecimals,
  LANGUAGE_TO_CURRENCY,
  CURRENCY_DECIMALS,
} from './utils/currency-data';

// 타입
export type {
  CurrencyFormatterOptions,
  CurrencyFormatterReturn,
} from './types';

