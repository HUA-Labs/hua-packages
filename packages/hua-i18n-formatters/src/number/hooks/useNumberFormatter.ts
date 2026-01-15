/**
 * @hua-labs/i18n-number - useNumberFormatter 훅
 * 
 * 언어별 숫자 포맷팅 기능을 제공하는 훅입니다.
 */

import { useMemo } from 'react';
import { useI18n } from '@hua-labs/i18n-core';
import { NumberFormatterReturn, NumberFormatterOptions, PercentFormatterOptions } from '../types';
import { formatNumber, formatCompact } from '../utils/number-formatter';
import { formatPercent } from '../utils/percent-formatter';

/**
 * 숫자 포맷터 훅
 * 
 * 언어별 숫자 포맷팅 함수들을 제공합니다.
 * 
 * @returns 숫자 포맷터 객체
 * 
 * @example
 * ```tsx
 * function Stats() {
 *   const { formatNumber, formatPercent, formatCompact } = useNumberFormatter();
 *   
 *   return (
 *     <div>
 *       <p>사용자 수: {formatNumber(1234567)}</p>
 *       <p>성공률: {formatPercent(0.95)}</p>
 *       <p>조회수: {formatCompact(1000000)}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNumberFormatter(): NumberFormatterReturn {
  const { currentLanguage } = useI18n();
  
  // 숫자 포맷팅 함수
  const formatNumberFn = useMemo(() => {
    return (value: number, options?: NumberFormatterOptions) => {
      return formatNumber(value, options, currentLanguage);
    };
  }, [currentLanguage]);
  
  // 퍼센트 포맷팅 함수
  const formatPercentFn = useMemo(() => {
    return (value: number, options?: PercentFormatterOptions) => {
      return formatPercent(value, options, currentLanguage);
    };
  }, [currentLanguage]);
  
  // 컴팩트 표기 포맷팅 함수
  const formatCompactFn = useMemo(() => {
    return (value: number, options?: NumberFormatterOptions) => {
      return formatCompact(value, options, currentLanguage);
    };
  }, [currentLanguage]);
  
  return {
    formatNumber: formatNumberFn,
    formatPercent: formatPercentFn,
    formatCompact: formatCompactFn,
    currentLanguage,
  };
}

