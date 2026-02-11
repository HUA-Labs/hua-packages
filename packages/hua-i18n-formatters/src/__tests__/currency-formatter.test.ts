import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../currency/utils/currency-formatter';
import {
  getDefaultCurrency,
  getCurrencyDecimals,
  LANGUAGE_TO_CURRENCY,
  CURRENCY_DECIMALS,
} from '../currency/utils/currency-data';

describe('Currency Data Utils', () => {
  describe('LANGUAGE_TO_CURRENCY', () => {
    it('한국어는 KRW 매핑', () => {
      expect(LANGUAGE_TO_CURRENCY.ko).toBe('KRW');
      expect(LANGUAGE_TO_CURRENCY['ko-KR']).toBe('KRW');
    });

    it('영어는 USD 매핑', () => {
      expect(LANGUAGE_TO_CURRENCY.en).toBe('USD');
      expect(LANGUAGE_TO_CURRENCY['en-US']).toBe('USD');
    });

    it('일본어는 JPY 매핑', () => {
      expect(LANGUAGE_TO_CURRENCY.ja).toBe('JPY');
      expect(LANGUAGE_TO_CURRENCY['ja-JP']).toBe('JPY');
    });
  });

  describe('CURRENCY_DECIMALS', () => {
    it('KRW는 소수점 0자리', () => {
      expect(CURRENCY_DECIMALS.KRW).toBe(0);
    });

    it('JPY는 소수점 0자리', () => {
      expect(CURRENCY_DECIMALS.JPY).toBe(0);
    });

    it('USD는 소수점 2자리', () => {
      expect(CURRENCY_DECIMALS.USD).toBe(2);
    });

    it('EUR는 소수점 2자리', () => {
      expect(CURRENCY_DECIMALS.EUR).toBe(2);
    });
  });

  describe('getDefaultCurrency', () => {
    it('한국어 언어 코드는 KRW 반환', () => {
      expect(getDefaultCurrency('ko')).toBe('KRW');
      expect(getDefaultCurrency('ko-KR')).toBe('KRW');
    });

    it('영어 언어 코드는 USD 반환', () => {
      expect(getDefaultCurrency('en')).toBe('USD');
      expect(getDefaultCurrency('en-US')).toBe('USD');
    });

    it('매핑되지 않은 언어는 USD 기본값 반환', () => {
      expect(getDefaultCurrency('unknown')).toBe('USD');
    });
  });

  describe('getCurrencyDecimals', () => {
    it('KRW는 0 반환', () => {
      expect(getCurrencyDecimals('KRW')).toBe(0);
    });

    it('USD는 2 반환', () => {
      expect(getCurrencyDecimals('USD')).toBe(2);
    });

    it('정의되지 않은 통화는 2 기본값 반환', () => {
      expect(getCurrencyDecimals('UNKNOWN')).toBe(2);
    });
  });
});

describe('Currency Formatter Utils', () => {
  describe('formatCurrency', () => {
    it('기본 KRW 포맷팅 (한국어 로케일)', () => {
      const result = formatCurrency(10000, {}, 'ko-KR');
      expect(result).toContain('10,000');
      // KRW 기호 포함 확인
      expect(result.length).toBeGreaterThan('10,000'.length);
    });

    it('USD 포맷팅 (영어 로케일)', () => {
      const result = formatCurrency(1234.56, { currency: 'USD' }, 'en-US');
      expect(result).toContain('$');
      expect(result).toContain('1,234.56');
    });

    it('EUR 포맷팅', () => {
      const result = formatCurrency(1234.56, { currency: 'EUR' }, 'de-DE');
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('JPY 포맷팅 (소수점 없음)', () => {
      const result = formatCurrency(1234, { currency: 'JPY' }, 'ja-JP');
      expect(result).toContain('1,234');
      expect(result).not.toContain('.');
    });

    it('showSymbol false일 때 통화 기호 제거', () => {
      const result = formatCurrency(10000, { showSymbol: false }, 'ko-KR');
      expect(result).toMatch(/^[\d,.-]+$/);
    });

    it('symbolPosition after일 때 기호를 뒤로 이동', () => {
      const result = formatCurrency(10000, {
        currency: 'USD',
        symbolPosition: 'after',
      }, 'en-US');
      // 숫자가 기호보다 앞에 위치
      const numberIndex = result.search(/\d/);
      const dollarIndex = result.indexOf('$');
      if (dollarIndex !== -1) {
        expect(numberIndex).toBeLessThan(dollarIndex);
      }
    });

    it('minimumFractionDigits 옵션 적용', () => {
      const result = formatCurrency(100, {
        currency: 'USD',
        minimumFractionDigits: 2,
      }, 'en-US');
      expect(result).toContain('100.00');
    });

    it('maximumFractionDigits 옵션 적용', () => {
      const result = formatCurrency(100.999, {
        currency: 'USD',
        maximumFractionDigits: 2,
      }, 'en-US');
      expect(result).toContain('101.00');
    });

    it('음수 금액 포맷팅', () => {
      const result = formatCurrency(-1000, { currency: 'USD' }, 'en-US');
      expect(result).toContain('-');
    });

    it('0 금액 포맷팅', () => {
      const result = formatCurrency(0, { currency: 'USD' }, 'en-US');
      expect(result).toContain('0');
    });

    it('매우 큰 금액 포맷팅', () => {
      const result = formatCurrency(1234567890, {}, 'ko-KR');
      expect(result).toContain(',');
    });

    it('통화 코드 지정 없이 로케일 기본값 사용', () => {
      const resultKo = formatCurrency(10000, {}, 'ko-KR');
      const resultEn = formatCurrency(10000, {}, 'en-US');
      // 두 결과는 다른 통화 기호를 가져야 함
      expect(resultKo).not.toBe(resultEn);
    });
  });
});
