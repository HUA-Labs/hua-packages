/**
 * 통화 데이터 및 유틸리티
 */

/**
 * 언어별 기본 통화 매핑
 */
export const LANGUAGE_TO_CURRENCY: Record<string, string> = {
  ko: 'KRW',
  en: 'USD',
  ja: 'JPY',
  'ko-KR': 'KRW',
  'en-US': 'USD',
  'ja-JP': 'JPY',
};

/**
 * 통화별 기본 소수점 자리수
 */
export const CURRENCY_DECIMALS: Record<string, number> = {
  KRW: 0, // 원화는 소수점 없음
  JPY: 0, // 엔화는 소수점 없음
  USD: 2, // 달러는 소수점 2자리
  EUR: 2, // 유로는 소수점 2자리
  GBP: 2, // 파운드는 소수점 2자리
  CNY: 2, // 위안은 소수점 2자리
};

/**
 * 언어 코드에서 기본 통화 가져오기
 */
export function getDefaultCurrency(language: string): string {
  return LANGUAGE_TO_CURRENCY[language] || LANGUAGE_TO_CURRENCY['en'] || 'USD';
}

/**
 * 통화의 기본 소수점 자리수 가져오기
 */
export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency] ?? 2;
}

