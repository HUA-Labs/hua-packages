/**
 * 화폐 포맷팅 유틸리티
 */

import { CurrencyFormatterOptions } from '../types';
import { getDefaultCurrency, getCurrencyDecimals } from './currency-data';

/**
 * 화폐 포맷팅 함수
 * 
 * @param value - 포맷팅할 금액
 * @param options - 포맷 옵션
 * @param locale - 로케일 (언어 코드)
 * @returns 포맷팅된 화폐 문자열
 */
export function formatCurrency(
  value: number,
  options: CurrencyFormatterOptions = {},
  locale: string = 'ko'
): string {
  const {
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    showSymbol = true,
    symbolPosition = 'before',
  } = options;

  // 통화 코드 결정
  const currencyCode = currency || getDefaultCurrency(locale);
  
  // 소수점 자리수 결정
  const defaultDecimals = getCurrencyDecimals(currencyCode);
  const minDecimals = minimumFractionDigits ?? defaultDecimals;
  const maxDecimals = maximumFractionDigits ?? defaultDecimals;

  // Intl.NumberFormat 사용
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });

  let formatted = formatter.format(value);

  // 통화 기호 표시 여부 처리
  if (!showSymbol) {
    // 통화 기호 제거 (정규식으로 제거)
    formatted = formatted.replace(/[^\d,.-]/g, '').trim();
  } else if (symbolPosition === 'after') {
    // 통화 기호를 뒤로 이동
    const symbolMatch = formatted.match(/[^\d,.-]+/);
    if (symbolMatch) {
      const symbol = symbolMatch[0].trim();
      const numberPart = formatted.replace(symbol, '').trim();
      formatted = `${numberPart} ${symbol}`;
    }
  }

  return formatted;
}

