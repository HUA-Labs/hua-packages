/**
 * @hua-labs/i18n-date - 날짜 포맷팅 및 현지화 유틸리티
 * 
 * i18n-core와 통합하여 날짜 관련 기능을 제공하는 패키지입니다.
 */

// 훅
export { useDateFormatter } from './hooks/useDateFormatter';

// 유틸리티 함수
export {
  formatDate,
  formatDateTime,
  formatDateReadable,
  formatDateLocalized,
  formatDateTimeLocalized,
  getLocaleFromLanguage,
} from './utils/date-formatter';

export {
  applyTimezoneOffset,
  getKoreanDate,
  getKoreanDateString,
  parseDateAsTimezone,
  convertToTimezone,
  KST_OFFSET,
} from './utils/timezone';

export {
  formatRelativeTime,
} from './utils/relative-time';

// 타입
export type {
  DateFormatterOptions,
  LocaleDateFormatterOptions,
  TimezoneConfig,
  RelativeTimeOptions,
  DateFormatterReturn,
} from './types';

