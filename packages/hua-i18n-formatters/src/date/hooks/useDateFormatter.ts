/**
 * @hua-labs/i18n-date - useDateFormatter 훅
 * 
 * 번역 데이터에서 월/요일 이름을 자동으로 가져오고,
 * 날짜 포맷팅 기능을 제공하는 훅입니다.
 */

import { useMemo } from 'react';
import { useI18n } from '@hua-labs/i18n-core';
import { DateFormatterReturn, DateFormatterOptions, RelativeTimeOptions } from '../types';
import { formatDate, formatDateTime, formatDateReadable } from '../utils/date-formatter';
import { formatRelativeTime } from '../utils/relative-time';

/**
 * 날짜 포맷터 훅
 * 
 * 번역 데이터에서 `month_names`, `day_names`를 자동으로 추출하고,
 * 날짜 포맷팅 함수들을 제공합니다.
 * 
 * @returns 날짜 포맷터 객체
 * 
 * @example
 * ```tsx
 * function Calendar() {
 *   const { monthNames, dayNames, formatDate } = useDateFormatter();
 *   
 *   return (
 *     <div>
 *       {monthNames.map((month, i) => (
 *         <span key={i}>{month}</span>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDateFormatter(): DateFormatterReturn {
  const { debug, currentLanguage } = useI18n();
  const allTranslations = debug.getAllTranslations();
  
  // monthNames 자동 추출
  const monthNames = useMemo(() => {
    const common = (allTranslations[currentLanguage]?.common || 
                   allTranslations['ko']?.common || {}) as Record<string, unknown>;
    return Array.isArray(common.month_names) 
      ? (common.month_names as string[])
      : [];
  }, [allTranslations, currentLanguage]);
  
  // dayNames 자동 추출
  const dayNames = useMemo(() => {
    const common = (allTranslations[currentLanguage]?.common || 
                   allTranslations['ko']?.common || {}) as Record<string, unknown>;
    return Array.isArray(common.day_names) 
      ? (common.day_names as string[])
      : [];
  }, [allTranslations, currentLanguage]);
  
  // 날짜 포맷팅 함수
  const formatDateFn = useMemo(() => {
    return (date: Date, options?: DateFormatterOptions) => {
      return formatDate(date, options);
    };
  }, []);
  
  // 날짜+시간 포맷팅 함수
  const formatDateTimeFn = useMemo(() => {
    return (date: Date, options?: DateFormatterOptions) => {
      return formatDateTime(date, options);
    };
  }, []);
  
  // 상대 시간 포맷팅 함수
  const formatRelativeTimeFn = useMemo(() => {
    return (date: Date, options?: RelativeTimeOptions) => {
      return formatRelativeTime(date, options);
    };
  }, []);
  
  return {
    monthNames,
    dayNames,
    formatDate: formatDateFn,
    formatDateTime: formatDateTimeFn,
    formatRelativeTime: formatRelativeTimeFn,
    currentLanguage,
  };
}

