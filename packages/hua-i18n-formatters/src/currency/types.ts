/**
 * @hua-labs/i18n-currency - 타입 정의
 */

/**
 * 화폐 포맷 옵션
 */
export interface CurrencyFormatterOptions {
  /**
   * 통화 코드 ('KRW', 'USD', 'JPY', 'EUR' 등)
   * 지정하지 않으면 언어별 기본 통화 사용
   */
  currency?: string;
  
  /**
   * 최소 소수점 자리수
   */
  minimumFractionDigits?: number;
  
  /**
   * 최대 소수점 자리수
   */
  maximumFractionDigits?: number;
  
  /**
   * 통화 기호 표시 여부
   */
  showSymbol?: boolean;
  
  /**
   * 통화 기호 위치
   * - 'before': ₩1,000
   * - 'after': 1,000₩
   */
  symbolPosition?: 'before' | 'after';
}

/**
 * 화폐 포맷터 반환 타입
 */
export interface CurrencyFormatterReturn {
  /**
   * 화폐 포맷팅 함수
   */
  formatCurrency: (value: number, options?: CurrencyFormatterOptions) => string;
  
  /**
   * 현재 언어 코드
   */
  currentLanguage: string;
  
  /**
   * 현재 언어의 기본 통화 코드
   */
  defaultCurrency: string;
}

