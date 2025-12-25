/**
 * @hua-labs/i18n-currency - useCurrencyFormatter 훅
 * 
 * 언어별 화폐 포맷팅 기능을 제공하는 훅입니다.
 */

import { useMemo } from 'react';
import { useI18n } from '@hua-labs/i18n-core';
import { CurrencyFormatterReturn, CurrencyFormatterOptions } from '../types';
import { formatCurrency } from '../utils/currency-formatter';
import { getDefaultCurrency } from '../utils/currency-data';

/**
 * 화폐 포맷터 훅
 * 
 * 언어별 화폐 포맷팅 함수를 제공합니다.
 * 
 * @returns 화폐 포맷터 객체
 * 
 * @example
 * ```tsx
 * function Price() {
 *   const { formatCurrency } = useCurrencyFormatter();
 *   
 *   return (
 *     <div>
 *       <p>가격: {formatCurrency(10000)}</p>
 *       <p>USD: {formatCurrency(10000, { currency: 'USD' })}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrencyFormatter(): CurrencyFormatterReturn {
  const { currentLanguage } = useI18n();
  
  // 기본 통화 코드
  const defaultCurrency = useMemo(() => {
    return getDefaultCurrency(currentLanguage);
  }, [currentLanguage]);
  
  // 화폐 포맷팅 함수
  const formatCurrencyFn = useMemo(() => {
    return (value: number, options?: CurrencyFormatterOptions) => {
      return formatCurrency(value, options, currentLanguage);
    };
  }, [currentLanguage]);
  
  return {
    formatCurrency: formatCurrencyFn,
    currentLanguage,
    defaultCurrency,
  };
}

