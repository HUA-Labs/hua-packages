/**
 * 상대 시간 포맷팅 유틸리티
 */

import { RelativeTimeOptions } from '../types';

/**
 * 상대 시간 단위
 */
type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

/**
 * 단위별 밀리초
 */
const TIME_UNITS: Record<TimeUnit, number> = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

/**
 * 상대 시간 포맷팅
 * 
 * @param date - 포맷팅할 날짜
 * @param options - 옵션
 * @returns 상대 시간 문자열 ("3분 전", "2시간 전" 등)
 */
export function formatRelativeTime(
  date: Date,
  options: RelativeTimeOptions = {}
): string {
  const {
    minUnit = 'second',
    maxUnit = 'year',
    numeric = true,
  } = options;

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const isPast = diff > 0;

  // 단위 순서
  const unitOrder: TimeUnit[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
  const minIndex = unitOrder.indexOf(minUnit);
  const maxIndex = unitOrder.indexOf(maxUnit);

  // 적절한 단위 찾기
  for (let i = minIndex; i <= maxIndex; i++) {
    const unit = unitOrder[i];
    const unitMs = TIME_UNITS[unit];
    const value = Math.floor(absDiff / unitMs);

    if (value > 0 || unit === minUnit) {
      if (!numeric && unit === 'minute' && value === 0) {
        return isPast ? '방금 전' : '곧';
      }

      const unitName = getUnitName(unit, value);
      return isPast ? `${value}${unitName} 전` : `${value}${unitName} 후`;
    }
  }

  return isPast ? '방금 전' : '곧';
}

/**
 * 단위 이름 반환 (한국어)
 */
function getUnitName(unit: TimeUnit, value: number): string {
  const names: Record<TimeUnit, string> = {
    second: '초',
    minute: '분',
    hour: '시간',
    day: '일',
    week: '주',
    month: '개월',
    year: '년',
  };
  return names[unit];
}

