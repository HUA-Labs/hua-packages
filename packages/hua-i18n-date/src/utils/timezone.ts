/**
 * 타임존 처리 유틸리티
 */

import { TimezoneConfig } from '../types';

/**
 * 한국 시간대 오프셋 (UTC+9, 540분)
 */
export const KST_OFFSET = 9 * 60;

/**
 * 타임존 오프셋을 적용한 Date 객체 반환
 */
export function applyTimezoneOffset(date: Date, offset: number): Date {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (offset * 60000));
}

/**
 * 한국 시간 기준으로 Date 객체 반환
 */
export function getKoreanDate(date: Date = new Date()): Date {
  return applyTimezoneOffset(date, KST_OFFSET);
}

/**
 * 한국 시간 기준으로 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getKoreanDateString(date: Date = new Date()): string {
  const koreanTime = getKoreanDate(date);
  const year = koreanTime.getFullYear();
  const month = String(koreanTime.getMonth() + 1).padStart(2, '0');
  const day = String(koreanTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 문자열을 타임존 기준 Date 객체로 변환
 */
export function parseDateAsTimezone(
  dateString: string,
  config?: TimezoneConfig
): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const offset = config?.offset ?? KST_OFFSET;
  
  // UTC 기준으로 해당 날짜의 자정을 만듦
  const utcDate = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  
  // UTC 자정에서 타임존 오프셋을 뺌
  const timezoneDate = new Date(utcDate - (offset * 60000));
  
  return timezoneDate;
}

/**
 * Date 객체를 타임존 기준으로 변환
 */
export function convertToTimezone(
  date: Date,
  config?: TimezoneConfig
): Date {
  const offset = config?.offset ?? KST_OFFSET;
  return applyTimezoneOffset(date, offset);
}

