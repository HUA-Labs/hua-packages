/**
 * 숫자 포맷팅 유틸리티
 */

import { NumberFormatterOptions } from '../types';

/**
 * 숫자 포맷팅 함수
 * 
 * @param value - 포맷팅할 숫자
 * @param options - 포맷 옵션
 * @param locale - 로케일 (언어 코드)
 * @returns 포맷팅된 숫자 문자열
 */
export function formatNumber(
  value: number,
  options: NumberFormatterOptions = {},
  locale: string = 'ko'
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 3,
    useGrouping = true,
    notation = 'standard',
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    notation: notation === 'compact' ? 'compact' : 'standard',
  });

  return formatter.format(value);
}

/**
 * 컴팩트 표기 포맷팅 함수
 * 
 * @param value - 포맷팅할 숫자
 * @param options - 포맷 옵션
 * @param locale - 로케일 (언어 코드)
 * @returns 컴팩트 표기 문자열 (1K, 1M 등)
 */
export function formatCompact(
  value: number,
  options: NumberFormatterOptions = {},
  locale: string = 'ko'
): string {
  return formatNumber(value, { ...options, notation: 'compact' }, locale);
}

