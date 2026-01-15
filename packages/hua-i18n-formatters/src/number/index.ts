/**
 * @hua-labs/i18n-number - 숫자 포맷팅 및 현지화 유틸리티
 * 
 * i18n-core와 통합하여 숫자 관련 기능을 제공하는 패키지입니다.
 */

// 훅
export { useNumberFormatter } from './hooks/useNumberFormatter';

// 유틸리티 함수
export {
  formatNumber,
  formatCompact,
} from './utils/number-formatter';

export {
  formatPercent,
} from './utils/percent-formatter';

// 타입
export type {
  NumberFormatterOptions,
  PercentFormatterOptions,
  NumberFormatterReturn,
} from './types';

