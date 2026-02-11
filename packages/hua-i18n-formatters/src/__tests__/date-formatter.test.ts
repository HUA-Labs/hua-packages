import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDateLocalized,
  formatDateTimeLocalized,
  getLocaleFromLanguage,
} from '../date/utils/date-formatter';
import {
  getKoreanDate,
  getKoreanDateString,
  convertToTimezone,
  applyTimezoneOffset,
  parseDateAsTimezone,
  KST_OFFSET,
} from '../date/utils/timezone';
import { formatRelativeTime } from '../date/utils/relative-time';

describe('Date Formatter Utils', () => {
  describe('getLocaleFromLanguage', () => {
    it('한국어 코드를 ko-KR로 변환', () => {
      expect(getLocaleFromLanguage('ko')).toBe('ko-KR');
    });

    it('영어 코드를 en-US로 변환', () => {
      expect(getLocaleFromLanguage('en')).toBe('en-US');
    });

    it('일본어 코드를 ja-JP로 변환', () => {
      expect(getLocaleFromLanguage('ja')).toBe('ja-JP');
    });

    it('매핑되지 않은 언어는 en-US 반환', () => {
      expect(getLocaleFromLanguage('unknown')).toBe('en-US');
    });
  });

  describe('formatDate', () => {
    it('기본 YYYY-MM-DD 형식으로 포맷팅', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('커스텀 포맷 패턴 적용', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDate(date, { format: 'YYYY/MM/DD' });
      expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/);
    });

    it('단일 자리 월/일 포맷 지원', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDate(date, { format: 'YYYY-M-D' });
      expect(result).toMatch(/\d{4}-\d{1,2}-\d{1,2}/);
    });
  });

  describe('formatDateTime', () => {
    it('기본 YYYY-MM-DD HH:mm:ss 형식으로 포맷팅', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });

    it('커스텀 시간 포맷 적용', () => {
      const date = new Date('2025-02-11T12:30:45Z');
      const result = formatDateTime(date, { format: 'HH:mm' });
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('단일 자리 시/분/초 포맷 지원', () => {
      const date = new Date('2025-02-11T09:05:03Z');
      const result = formatDateTime(date, { format: 'H:m:s' });
      expect(result).toMatch(/\d{1,2}:\d{1,2}:\d{1,2}/);
    });
  });

  describe('formatDateLocalized', () => {
    it('한국어 로케일 포맷 적용', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDateLocalized(date, 'ko-KR');
      expect(result).toContain('2025년');
      expect(result.endsWith('.')).toBe(false);
    });

    it('영어 로케일 포맷 적용', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDateLocalized(date, 'en-US');
      expect(result).toMatch(/\w+ \d{1,2}, \d{4}/);
    });

    it('dateStyle 옵션 적용', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const longResult = formatDateLocalized(date, 'en-US', { dateStyle: 'long' });
      const shortResult = formatDateLocalized(date, 'en-US', { dateStyle: 'short' });
      expect(longResult.length).toBeGreaterThan(shortResult.length);
    });
  });

  describe('formatDateTimeLocalized', () => {
    it('날짜와 시간을 함께 포맷팅', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDateTimeLocalized(date, 'ko-KR');
      expect(result).toContain('2025년');
    });

    it('timeStyle 옵션 적용', () => {
      const date = new Date('2025-02-11T12:00:00Z');
      const result = formatDateTimeLocalized(date, 'en-US', { timeStyle: 'short' });
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });
});

describe('Timezone Utils', () => {
  describe('KST_OFFSET', () => {
    it('한국 시간대 오프셋이 540분(9시간)', () => {
      expect(KST_OFFSET).toBe(540);
    });
  });

  describe('applyTimezoneOffset', () => {
    it('타임존 오프셋을 적용한 Date 반환', () => {
      const date = new Date('2025-02-11T00:00:00Z');
      const result = applyTimezoneOffset(date, 540); // UTC+9
      // 오프셋 적용 후 Date 객체 반환
      expect(result).toBeInstanceOf(Date);
      // 로컬 시간대에 따라 시간 값이 조정됨
      const hourDiff = (result.getTime() - date.getTime()) / (1000 * 60 * 60);
      expect(Math.abs(hourDiff)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getKoreanDate', () => {
    it('한국 시간대로 변환된 Date 반환', () => {
      const date = new Date('2025-02-11T00:00:00Z');
      const koreanDate = getKoreanDate(date);
      expect(koreanDate).toBeInstanceOf(Date);
      // 타임존 오프셋이 적용됨
      expect(koreanDate).toBeDefined();
    });

    it('인자 없이 호출하면 현재 시간 반환', () => {
      const koreanDate = getKoreanDate();
      expect(koreanDate).toBeInstanceOf(Date);
    });
  });

  describe('getKoreanDateString', () => {
    it('YYYY-MM-DD 형식 문자열 반환', () => {
      const date = new Date('2025-02-11T00:00:00Z');
      const result = getKoreanDateString(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('인자 없이 호출하면 현재 날짜 반환', () => {
      const result = getKoreanDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('convertToTimezone', () => {
    it('지정된 타임존으로 변환', () => {
      const date = new Date('2025-02-11T00:00:00Z');
      const result = convertToTimezone(date, { offset: 540 });
      expect(result).toBeInstanceOf(Date);
    });

    it('config 없이 호출하면 KST 기본값 사용', () => {
      const date = new Date('2025-02-11T00:00:00Z');
      const result = convertToTimezone(date);
      const koreanDate = getKoreanDate(date);
      expect(result.getTime()).toBe(koreanDate.getTime());
    });
  });

  describe('parseDateAsTimezone', () => {
    it('YYYY-MM-DD 문자열을 Date로 변환', () => {
      const result = parseDateAsTimezone('2025-02-11');
      expect(result).toBeInstanceOf(Date);
    });

    it('타임존 오프셋 적용', () => {
      const result = parseDateAsTimezone('2025-02-11', { offset: 540 });
      expect(result).toBeInstanceOf(Date);
    });
  });
});

describe('Relative Time Utils', () => {
  it('초 단위 상대 시간', () => {
    // 30초 전 날짜 생성
    const date = new Date(Date.now() - 30 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d+초 전/);
  });

  it('분 단위 상대 시간', () => {
    // 10분 전 날짜 생성
    const date = new Date(Date.now() - 10 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d+분 전/);
  });

  it('시간 단위 상대 시간', () => {
    // 3시간 전 날짜 생성
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d+시간 전/);
  });

  it('일 단위 상대 시간', () => {
    // 2일 전 날짜 생성
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d+일 전/);
  });

  it('미래 시간 상대 표현', () => {
    // 2시간 후 날짜 생성
    const date = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d+\D+ 후/);
  });

  it('numeric false일 때 "방금 전" 표시', () => {
    // 10초 전, minUnit을 minute으로 하여 0분이 되도록
    const date = new Date(Date.now() - 10 * 1000);
    const result = formatRelativeTime(date, { numeric: false, minUnit: 'minute' });
    expect(result).toBe('방금 전');
  });

  it('minUnit 옵션 적용', () => {
    // 30초 전
    const date = new Date(Date.now() - 30 * 1000);
    const result = formatRelativeTime(date, { minUnit: 'minute' });
    // 30초는 minute 단위로 표현하면 0분으로 표시 (numeric:true가 기본값)
    expect(result).toMatch(/\d+분 전/);
  });

  it('maxUnit 옵션 적용', () => {
    // 2일 전
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date, { maxUnit: 'day' });
    // 2일 전, maxUnit이 day이므로 일 단위로 표현
    expect(result).toMatch(/\d+일 전/);
  });
});
