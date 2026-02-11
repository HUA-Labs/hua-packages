import { describe, it, expect } from 'vitest';
import { merge, mergeIf, mergeMap, cn, formatRelativeTime } from '../utils';

describe('merge', () => {
  it('should merge basic classes', () => {
    expect(merge('text-base', 'font-bold')).toBe('text-base font-bold');
  });

  it('should resolve Tailwind conflicts (last wins)', () => {
    expect(merge('p-4', 'p-2')).toBe('p-2');
    expect(merge('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(merge('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle empty inputs', () => {
    expect(merge()).toBe('');
    expect(merge('')).toBe('');
    expect(merge('', '')).toBe('');
  });

  it('should preserve dark mode classes', () => {
    expect(merge('bg-white', 'dark:bg-slate-900')).toBe('bg-white dark:bg-slate-900');
  });

  it('should handle arrays and conditional classes', () => {
    expect(merge(['text-sm', 'font-bold'])).toBe('text-sm font-bold');
    expect(merge('text-sm', false && 'hidden', 'block')).toBe('text-sm block');
  });

  it('should handle complex Tailwind merges', () => {
    expect(merge('hover:text-red-500', 'hover:text-blue-500')).toBe('hover:text-blue-500');
    expect(merge('bg-red-500/50', 'bg-blue-500/30')).toBe('bg-blue-500/30');
  });
});

describe('mergeIf', () => {
  it('should apply trueClass when condition is true', () => {
    expect(mergeIf(true, 'bg-blue-500', 'bg-gray-200')).toBe('bg-blue-500');
  });

  it('should apply falseClass when condition is false', () => {
    expect(mergeIf(false, 'bg-blue-500', 'bg-gray-200')).toBe('bg-gray-200');
  });

  it('should return empty string when condition is false and no falseClass', () => {
    expect(mergeIf(false, 'bg-blue-500')).toBe('');
  });

  it('should handle complex classes', () => {
    expect(mergeIf(true, 'opacity-50 cursor-not-allowed')).toBe('opacity-50 cursor-not-allowed');
  });
});

describe('mergeMap', () => {
  it('should merge classes based on object conditions', () => {
    const result = mergeMap({
      'bg-blue-500': true,
      'bg-gray-500': false,
      'text-white': true,
      'opacity-50': false
    });
    expect(result).toBe('bg-blue-500 text-white');
  });

  it('should handle null and undefined values', () => {
    const result = mergeMap({
      'bg-blue-500': true,
      'bg-gray-500': null as any,
      'text-white': undefined as any,
      'opacity-50': false
    });
    expect(result).toBe('bg-blue-500');
  });

  it('should handle empty object', () => {
    expect(mergeMap({})).toBe('');
  });

  it('should handle all false conditions', () => {
    const result = mergeMap({
      'bg-blue-500': false,
      'text-white': false
    });
    expect(result).toBe('');
  });
});

describe('cn', () => {
  it('should be an alias for merge', () => {
    expect(cn).toBe(merge);
  });

  it('should work identically to merge', () => {
    expect(cn('p-4', 'p-2')).toBe(merge('p-4', 'p-2'));
    expect(cn('bg-white', 'dark:bg-slate-900')).toBe(merge('bg-white', 'dark:bg-slate-900'));
  });
});

describe('formatRelativeTime', () => {
  it('should return "방금 전" for times less than 1 minute ago (Korean)', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    expect(formatRelativeTime(timestamp)).toBe('방금 전');
  });

  it('should return "just now" for times less than 1 minute ago (English)', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(timestamp, 'en-US')).toBe('just now');
  });

  it('should return minutes ago for times less than 1 hour', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 5 * 60000); // 5 minutes ago
    expect(formatRelativeTime(timestamp)).toBe('5분 전');
    expect(formatRelativeTime(timestamp, 'en-US')).toBe('5m ago');
  });

  it('should return hours ago for times less than 24 hours', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 2 * 3600000); // 2 hours ago
    expect(formatRelativeTime(timestamp)).toBe('2시간 전');
    expect(formatRelativeTime(timestamp, 'en-US')).toBe('2h ago');
  });

  it('should return days ago for times less than 7 days', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 3 * 86400000); // 3 days ago
    expect(formatRelativeTime(timestamp)).toBe('3일 전');
    expect(formatRelativeTime(timestamp, 'en-US')).toBe('3d ago');
  });

  it('should return formatted date for times 7 days or older', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 10 * 86400000); // 10 days ago
    const result = formatRelativeTime(timestamp);
    expect(result).toMatch(/\d{4}.*\d{1,2}.*\d{1,2}/); // Should be a date format
  });

  it('should handle ISO string input', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 5 * 60000).toISOString();
    expect(formatRelativeTime(timestamp)).toBe('5분 전');
  });

  it('should handle Date object input', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 2 * 3600000);
    expect(formatRelativeTime(timestamp)).toBe('2시간 전');
  });

  it('should handle edge case at 1 hour boundary', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 59 * 60000); // 59 minutes
    expect(formatRelativeTime(timestamp)).toBe('59분 전');
  });

  it('should handle edge case at 24 hour boundary', () => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - 23 * 3600000); // 23 hours
    expect(formatRelativeTime(timestamp)).toBe('23시간 전');
  });
});
