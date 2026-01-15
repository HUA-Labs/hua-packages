/**
 * 퍼센트 포맷팅 유틸리티
 */

import { PercentFormatterOptions } from '../types';

/**
 * 퍼센트 포맷팅 함수
 * 
 * @param value - 포맷팅할 값 (0.1 = 10%)
 * @param options - 포맷 옵션
 * @param locale - 로케일 (언어 코드)
 * @returns 포맷팅된 퍼센트 문자열
 */
export function formatPercent(
  value: number,
  options: PercentFormatterOptions = {},
  locale: string = 'ko'
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    signDisplay = 'auto',
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
  });

  return formatter.format(value);
}

