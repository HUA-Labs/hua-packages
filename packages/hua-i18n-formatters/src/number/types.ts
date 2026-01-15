/**
 * @hua-labs/i18n-number - 타입 정의
 */

/**
 * 숫자 포맷 옵션
 */
export interface NumberFormatterOptions {
  /**
   * 최소 소수점 자리수
   */
  minimumFractionDigits?: number;
  
  /**
   * 최대 소수점 자리수
   */
  maximumFractionDigits?: number;
  
  /**
   * 천 단위 구분자 사용 여부
   */
  useGrouping?: boolean;
  
  /**
   * 표기법
   * - 'standard': 일반 표기 (1,000)
   * - 'compact': 컴팩트 표기 (1K, 1M)
   */
  notation?: 'standard' | 'compact';
}

/**
 * 퍼센트 포맷 옵션
 */
export interface PercentFormatterOptions {
  /**
   * 최소 소수점 자리수
   */
  minimumFractionDigits?: number;
  
  /**
   * 최대 소수점 자리수
   */
  maximumFractionDigits?: number;
  
  /**
   * 부호 표시 방식
   * - 'auto': 필요시만 표시
   * - 'always': 항상 표시
   * - 'never': 표시하지 않음
   */
  signDisplay?: 'auto' | 'always' | 'never';
}

/**
 * 숫자 포맷터 반환 타입
 */
export interface NumberFormatterReturn {
  /**
   * 숫자 포맷팅 함수
   */
  formatNumber: (value: number, options?: NumberFormatterOptions) => string;
  
  /**
   * 퍼센트 포맷팅 함수
   */
  formatPercent: (value: number, options?: PercentFormatterOptions) => string;
  
  /**
   * 컴팩트 표기 포맷팅 함수
   */
  formatCompact: (value: number, options?: NumberFormatterOptions) => string;
  
  /**
   * 현재 언어 코드
   */
  currentLanguage: string;
}

