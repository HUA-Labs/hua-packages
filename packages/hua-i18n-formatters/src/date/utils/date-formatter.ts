/**
 * 날짜 포맷팅 유틸리티
 */

import { DateFormatterOptions, TimezoneConfig, LocaleDateFormatterOptions } from '../types';
import { getKoreanDate, getKoreanDateString, convertToTimezone } from './timezone';

/**
 * 언어 코드를 로케일 코드로 변환
 */
const LOCALE_MAP: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
};

/**
 * 언어 코드를 로케일 코드로 변환
 */
export function getLocaleFromLanguage(language: string): string {
  return LOCALE_MAP[language] || 'en-US';
}

/**
 * 날짜 포맷팅 함수
 * 
 * @param date - 포맷팅할 날짜
 * @param options - 포맷 옵션
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: Date,
  options: DateFormatterOptions = {}
): string {
  const { format = 'YYYY-MM-DD', timezone } = options;
  
  // 타임존 적용
  const targetDate = timezone 
    ? convertToTimezone(date, timezone)
    : getKoreanDate(date);
  
  // 포맷 문자열 파싱
  return formatDateString(targetDate, format);
}

/**
 * 날짜+시간 포맷팅 함수
 * 
 * @param date - 포맷팅할 날짜
 * @param options - 포맷 옵션
 * @returns 포맷팅된 날짜+시간 문자열
 */
export function formatDateTime(
  date: Date,
  options: DateFormatterOptions = {}
): string {
  const { format = 'YYYY-MM-DD HH:mm:ss', timezone } = options;
  
  // 타임존 적용
  const targetDate = timezone 
    ? convertToTimezone(date, timezone)
    : getKoreanDate(date);
  
  // 포맷 문자열 파싱
  return formatDateString(targetDate, format);
}

/**
 * 포맷 문자열을 파싱하여 날짜 문자열 생성
 */
function formatDateString(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // 포맷 치환
  return format
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, String(month).padStart(2, '0'))
    .replace(/DD/g, String(day).padStart(2, '0'))
    .replace(/HH/g, String(hours).padStart(2, '0'))
    .replace(/mm/g, String(minutes).padStart(2, '0'))
    .replace(/ss/g, String(seconds).padStart(2, '0'))
    .replace(/M/g, String(month))
    .replace(/D/g, String(day))
    .replace(/H/g, String(hours))
    .replace(/m/g, String(minutes))
    .replace(/s/g, String(seconds));
}

/**
 * 로케일 기반 날짜 포맷팅 함수
 * 현재 언어에 맞는 네이티브 날짜 형식으로 포맷팅
 *
 * @param date - 포맷팅할 날짜
 * @param locale - 로케일 코드 (ko-KR, en-US, ja-JP)
 * @param options - 포맷 옵션
 * @returns 로케일에 맞는 날짜 문자열
 *
 * @example
 * formatDateLocalized(new Date(), 'ko-KR') // "2025년 1월 25일"
 * formatDateLocalized(new Date(), 'en-US') // "January 25, 2025"
 * formatDateLocalized(new Date(), 'ja-JP') // "2025年1月25日"
 */
export function formatDateLocalized(
  date: Date,
  locale: string,
  options: LocaleDateFormatterOptions = {}
): string {
  const { dateStyle = 'long', timeZone } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle,
    ...(timeZone && { timeZone }),
  };

  let formatted = new Intl.DateTimeFormat(locale, formatOptions).format(date);

  // 한국어의 경우 마지막 trailing 점 제거 (short/medium 스타일에서 발생)
  if (locale.startsWith('ko') && formatted.endsWith('.')) {
    formatted = formatted.slice(0, -1);
  }

  return formatted;
}

/**
 * 로케일 기반 날짜+시간 포맷팅 함수
 *
 * @param date - 포맷팅할 날짜
 * @param locale - 로케일 코드 (ko-KR, en-US, ja-JP)
 * @param options - 포맷 옵션
 * @returns 로케일에 맞는 날짜+시간 문자열
 *
 * @example
 * formatDateTimeLocalized(new Date(), 'ko-KR') // "2025년 1월 25일 오후 3:30"
 * formatDateTimeLocalized(new Date(), 'en-US') // "January 25, 2025 at 3:30 PM"
 */
export function formatDateTimeLocalized(
  date: Date,
  locale: string,
  options: LocaleDateFormatterOptions = {}
): string {
  const { dateStyle = 'long', timeStyle = 'short', timeZone } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle,
    timeStyle,
    ...(timeZone && { timeZone }),
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

