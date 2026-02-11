import { describe, it, expect } from 'vitest';
import { formatDate, formatNumber, formatFileSize, formatTimeAgo } from '../formatters';

describe('formatDate', () => {
  it('should format Date object with default options', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    expect(result).toContain('2024');
    expect(result).toContain('1');
    expect(result).toContain('15');
  });

  it('should format date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('2024');
  });

  it('should accept custom format options', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
    expect(result).toContain('2024');
    expect(result).toContain('01');
    expect(result).toContain('15');
  });
});

describe('formatNumber', () => {
  it('should format integer', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('should format decimal number', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1,234');
    expect(result).toContain('56');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should accept custom format options', () => {
    const result = formatNumber(1234.5678, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    expect(result).toContain('1,234');
    expect(result).toContain('57'); // rounded
  });

  it('should format currency', () => {
    const result = formatNumber(1000, { style: 'currency', currency: 'KRW' });
    expect(result).toContain('1,000');
  });
});

describe('formatFileSize', () => {
  it('should format 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should format MB', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
  });

  it('should format GB', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(1610612736)).toBe('1.5 GB');
  });

  it('should format TB', () => {
    expect(formatFileSize(1099511627776)).toBe('1 TB');
  });

  it('should round to 2 decimal places', () => {
    expect(formatFileSize(1234567)).toBe('1.18 MB');
  });
});

describe('formatTimeAgo', () => {
  it('should show "방금 전" for recent times', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    expect(formatTimeAgo(recent)).toBe('방금 전');
  });

  it('should show minutes ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    expect(formatTimeAgo(past)).toBe('5분 전');
  });

  it('should show hours ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatTimeAgo(past)).toBe('3시간 전');
  });

  it('should show days ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    expect(formatTimeAgo(past)).toBe('5일 전');
  });

  it('should show months ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // ~60 days ago
    expect(formatTimeAgo(past)).toBe('2개월 전');
  });

  it('should show years ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000); // ~400 days ago
    expect(formatTimeAgo(past)).toBe('1년 전');
  });

  it('should handle string date input', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
    expect(formatTimeAgo(past)).toBe('2시간 전');
  });
});
