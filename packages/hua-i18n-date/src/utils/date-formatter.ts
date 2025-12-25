/**
 * 날짜 포맷팅 유틸리티
 */

import { DateFormatterOptions, TimezoneConfig } from '../types';
import { getKoreanDate, getKoreanDateString, convertToTimezone } from './timezone';

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
 * 읽기 쉬운 날짜 형식으로 변환 (한국어)
 * 예: "2025년 12월 7일 오전 1시 39분"
 */
export function formatDateReadable(date: Date, timezone?: TimezoneConfig): string {
  const targetDate = timezone 
    ? convertToTimezone(date, timezone)
    : getKoreanDate(date);
  
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  const hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  
  const ampm = hours < 12 ? '오전' : '오후';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${year}년 ${month}월 ${day}일 ${ampm} ${displayHours}시 ${minutes}분`;
}

