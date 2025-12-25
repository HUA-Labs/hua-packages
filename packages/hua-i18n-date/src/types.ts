/**
 * @hua-labs/i18n-date - 타입 정의
 */

/**
 * 날짜 포맷 옵션
 */
export interface DateFormatterOptions {
  /**
   * 날짜 포맷 문자열
   * - 'YYYY-MM-DD': 기본 날짜 형식
   * - 'YYYY-MM-DD HH:mm:ss': 날짜 + 시간
   * - 'YYYY년 MM월 DD일': 한국어 형식
   * - 'MM/DD/YYYY': 미국 형식
   * - 'DD/MM/YYYY': 유럽 형식
   */
  format?: string;
  
  /**
   * 타임존 설정
   */
  timezone?: TimezoneConfig;
}

/**
 * 타임존 설정
 */
export interface TimezoneConfig {
  /**
   * 타임존 오프셋 (분 단위)
   * 예: 한국(KST) = 540 (UTC+9)
   */
  offset?: number;
  
  /**
   * 타임존 이름
   * 예: 'Asia/Seoul', 'America/New_York'
   */
  name?: string;
}

/**
 * 상대 시간 옵션
 */
export interface RelativeTimeOptions {
  /**
   * 최소 단위 (초, 분, 시간, 일, 주, 월, 년)
   */
  minUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  
  /**
   * 최대 단위
   */
  maxUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  
  /**
   * 숫자 표시 여부
   * true: "3분 전", false: "방금 전" (1분 미만)
   */
  numeric?: boolean;
}

/**
 * 날짜 포맷터 반환 타입
 */
export interface DateFormatterReturn {
  /**
   * 월 이름 배열 (현재 언어 기준)
   */
  monthNames: string[];
  
  /**
   * 요일 이름 배열 (현재 언어 기준)
   */
  dayNames: string[];
  
  /**
   * 날짜 포맷팅 함수
   */
  formatDate: (date: Date, options?: DateFormatterOptions) => string;
  
  /**
   * 날짜+시간 포맷팅 함수
   */
  formatDateTime: (date: Date, options?: DateFormatterOptions) => string;
  
  /**
   * 상대 시간 포맷팅 함수 ("3분 전", "2시간 전" 등)
   */
  formatRelativeTime: (date: Date, options?: RelativeTimeOptions) => string;
  
  /**
   * 현재 언어 코드
   */
  currentLanguage: string;
}

