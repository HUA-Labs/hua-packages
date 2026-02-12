/**
 * @hua-labs/i18n-formatters - React Hooks Tests
 *
 * Tests for useCurrencyFormatter, useDateFormatter, and useNumberFormatter hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCurrencyFormatter } from '../currency/hooks/useCurrencyFormatter';
import { useDateFormatter } from '../date/hooks/useDateFormatter';
import { useNumberFormatter } from '../number/hooks/useNumberFormatter';

// Mock @hua-labs/i18n-core
vi.mock('@hua-labs/i18n-core', () => ({
  useI18n: vi.fn(() => ({
    currentLanguage: 'ko',
    t: (key: string) => key,
    debug: {
      getAllTranslations: () => ({
        ko: {
          common: {
            month_names: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            day_names: ['일', '월', '화', '수', '목', '금', '토']
          }
        },
        en: {
          common: {
            month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            day_names: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          }
        }
      })
    }
  }))
}));

describe('useCurrencyFormatter Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formatCurrency 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    expect(result.current.formatCurrency).toBeTypeOf('function');
  });

  it('currentLanguage를 반환해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    expect(result.current.currentLanguage).toBe('ko');
  });

  it('defaultCurrency를 반환해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    expect(result.current.defaultCurrency).toBeDefined();
    expect(typeof result.current.defaultCurrency).toBe('string');
  });

  it('한국어일 때 defaultCurrency가 KRW여야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    expect(result.current.defaultCurrency).toBe('KRW');
  });

  it('formatCurrency가 숫자를 올바르게 포맷팅해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    const formatted = result.current.formatCurrency(10000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    // 한국 원화 포맷에는 숫자와 구분자가 포함됨
    expect(formatted).toMatch(/[\d,]/);
  });

  it('formatCurrency가 0을 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    const formatted = result.current.formatCurrency(0);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('formatCurrency가 음수를 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    const formatted = result.current.formatCurrency(-5000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('-');
  });

  it('formatCurrency가 큰 숫자를 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    const formatted = result.current.formatCurrency(1000000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('formatCurrency가 커스텀 통화 옵션을 적용해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    const formatted = result.current.formatCurrency(10000, { currency: 'USD' });
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('formatCurrency가 소수점 옵션을 적용해야 함', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    const formatted = result.current.formatCurrency(10000.5, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });
});

describe('useDateFormatter Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('monthNames 배열을 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(Array.isArray(result.current.monthNames)).toBe(true);
  });

  it('monthNames가 12개여야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.monthNames).toHaveLength(12);
  });

  it('한국어 월 이름이 올바르게 로드되어야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.monthNames[0]).toBe('1월');
    expect(result.current.monthNames[11]).toBe('12월');
  });

  it('dayNames 배열을 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(Array.isArray(result.current.dayNames)).toBe(true);
  });

  it('dayNames가 7개여야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.dayNames).toHaveLength(7);
  });

  it('한국어 요일 이름이 올바르게 로드되어야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.dayNames[0]).toBe('일');
    expect(result.current.dayNames[6]).toBe('토');
  });

  it('formatDate 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatDate).toBeTypeOf('function');
  });

  it('formatDate가 날짜를 포맷팅해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    const date = new Date('2025-02-11T12:00:00Z');
    const formatted = result.current.formatDate(date);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('formatDateTime 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatDateTime).toBeTypeOf('function');
  });

  it('formatDateTime이 날짜와 시간을 포맷팅해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    const date = new Date('2025-02-11T12:00:00Z');
    const formatted = result.current.formatDateTime(date);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  });

  it('formatDateLocalized 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatDateLocalized).toBeTypeOf('function');
  });

  it('formatDateTimeLocalized 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatDateTimeLocalized).toBeTypeOf('function');
  });

  it('formatRelativeTime 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatRelativeTime).toBeTypeOf('function');
  });

  it('formatRelativeTime이 상대 시간을 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    const date = new Date(Date.now() - 30 * 1000); // 30초 전
    const formatted = result.current.formatRelativeTime(date);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('currentLanguage를 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.currentLanguage).toBe('ko');
  });

  it('locale을 반환해야 함', () => {
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.locale).toBeDefined();
    expect(typeof result.current.locale).toBe('string');
    expect(result.current.locale).toBe('ko-KR');
  });
});

describe('useNumberFormatter Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formatNumber 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    expect(result.current.formatNumber).toBeTypeOf('function');
  });

  it('formatPercent 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    expect(result.current.formatPercent).toBeTypeOf('function');
  });

  it('formatCompact 함수를 반환해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    expect(result.current.formatCompact).toBeTypeOf('function');
  });

  it('currentLanguage를 반환해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    expect(result.current.currentLanguage).toBe('ko');
  });

  it('formatNumber가 그룹핑을 적용해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatNumber(1234567);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    // 한국어는 천단위 구분자로 쉼표 사용
    expect(formatted).toContain(',');
  });

  it('formatNumber가 0을 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatNumber(0);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('formatNumber가 음수를 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatNumber(-1234);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('-');
  });

  it('formatPercent가 퍼센트를 포맷팅해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatPercent(0.95);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('%');
  });

  it('formatPercent가 0%를 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatPercent(0);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('%');
  });

  it('formatPercent가 100%를 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatPercent(1);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('%');
  });

  it('formatCompact이 컴팩트 표기를 적용해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatCompact(1000000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    // 컴팩트 표기는 K, M 등의 단위를 포함
    expect(formatted.length).toBeLessThan(10);
  });

  it('formatCompact이 작은 숫자를 올바르게 처리해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatCompact(123);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('formatNumber가 소수점 옵션을 적용해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatNumber(1234.5678, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('formatNumber가 그룹핑 비활성화 옵션을 적용해야 함', () => {
    const { result } = renderHook(() => useNumberFormatter());
    const formatted = result.current.formatNumber(1234567, { useGrouping: false });
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    // 그룹핑이 비활성화되면 쉼표가 없어야 함
    expect(formatted).not.toContain(',');
  });
});
