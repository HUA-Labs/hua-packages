import { describe, it, expect } from 'vitest';
import { formatNumber, formatCompact } from '../number/utils/number-formatter';
import { formatPercent } from '../number/utils/percent-formatter';

describe('Number Formatter Utils', () => {
  describe('formatNumber', () => {
    it('기본 천 단위 구분 포맷팅', () => {
      const result = formatNumber(1234567, {}, 'ko-KR');
      expect(result).toContain(',');
    });

    it('소수점 자리수 옵션 적용', () => {
      const result = formatNumber(123.456789, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }, 'ko-KR');
      expect(result).toMatch(/123\.46/);
    });

    it('천 단위 구분 비활성화', () => {
      const result = formatNumber(1234567, { useGrouping: false }, 'ko-KR');
      expect(result).toBe('1234567');
    });

    it('영어 로케일 포맷팅', () => {
      const result = formatNumber(1234.567, {}, 'en-US');
      expect(result).toContain('1,234');
    });

    it('음수 포맷팅', () => {
      const result = formatNumber(-1234, {}, 'ko-KR');
      expect(result).toContain('-');
      expect(result).toContain('1,234');
    });

    it('0 포맷팅', () => {
      const result = formatNumber(0, {}, 'ko-KR');
      expect(result).toBe('0');
    });

    it('매우 큰 수 포맷팅', () => {
      const result = formatNumber(1234567890, {}, 'ko-KR');
      expect(result).toContain(',');
    });

    it('최소 소수점 자리수 강제', () => {
      const result = formatNumber(100, {
        minimumFractionDigits: 2,
      }, 'en-US');
      expect(result).toBe('100.00');
    });
  });

  describe('formatCompact', () => {
    it('천 단위 K 표기', () => {
      const result = formatCompact(1234, {}, 'en-US');
      // 1.2K 또는 1K 형태
      expect(result).toMatch(/1[.,]?\d*K/i);
    });

    it('백만 단위 M 표기', () => {
      const result = formatCompact(1234567, {}, 'en-US');
      // 1.2M 또는 1M 형태
      expect(result).toMatch(/1[.,]?\d*M/i);
    });

    it('십억 단위 B 표기', () => {
      const result = formatCompact(1234567890, {}, 'en-US');
      // 1.2B 또는 1B 형태
      expect(result).toMatch(/1[.,]?\d*B/i);
    });

    it('한국어 로케일 컴팩트 표기', () => {
      const result = formatCompact(12345, {}, 'ko-KR');
      // 한국어는 만 단위 사용 (1.2만 등)
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('작은 수는 그대로 표시', () => {
      const result = formatCompact(123, {}, 'en-US');
      expect(result).toBe('123');
    });

    it('음수 컴팩트 표기', () => {
      const result = formatCompact(-1234567, {}, 'en-US');
      expect(result).toContain('-');
    });
  });
});

describe('Percent Formatter Utils', () => {
  describe('formatPercent', () => {
    it('기본 퍼센트 포맷팅 (0.1 = 10%)', () => {
      const result = formatPercent(0.1, {}, 'ko-KR');
      expect(result).toContain('10');
      expect(result).toContain('%');
    });

    it('소수점 자리수 옵션 적용', () => {
      const result = formatPercent(0.12345, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }, 'ko-KR');
      expect(result).toMatch(/12\.3\d%/);
    });

    it('100% 포맷팅', () => {
      const result = formatPercent(1, {}, 'ko-KR');
      expect(result).toContain('100');
      expect(result).toContain('%');
    });

    it('음수 퍼센트 포맷팅', () => {
      const result = formatPercent(-0.15, {}, 'ko-KR');
      expect(result).toContain('-');
      expect(result).toContain('15');
      expect(result).toContain('%');
    });

    it('0% 포맷팅', () => {
      const result = formatPercent(0, {}, 'ko-KR');
      expect(result).toContain('0');
      expect(result).toContain('%');
    });

    it('영어 로케일 퍼센트 포맷팅', () => {
      const result = formatPercent(0.5, {}, 'en-US');
      expect(result).toContain('50');
      expect(result).toContain('%');
    });

    it('signDisplay always 옵션', () => {
      const result = formatPercent(0.1, { signDisplay: 'always' }, 'en-US');
      expect(result).toContain('+');
    });

    it('매우 작은 퍼센트 포맷팅', () => {
      const result = formatPercent(0.001, {
        maximumFractionDigits: 1,
      }, 'en-US');
      expect(result).toContain('0.1');
    });
  });
});
