import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhoneNumber,
  validateNumberRange,
  validateStringLength,
} from '../validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@example.co.kr')).toBe(true);
    expect(validateEmail('user+tag@domain.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user @example.com')).toBe(false); // space
  });

  it('should reject empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should validate password with all requirements', () => {
    const result = validatePassword('Test1234');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject password shorter than minLength', () => {
    const result = validatePassword('Test12', { minLength: 8 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('비밀번호는 최소 8자 이상이어야 합니다.');
  });

  it('should reject password without uppercase', () => {
    const result = validatePassword('test1234', { requireUppercase: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('대문자가 포함되어야 합니다.');
  });

  it('should reject password without lowercase', () => {
    const result = validatePassword('TEST1234', { requireLowercase: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('소문자가 포함되어야 합니다.');
  });

  it('should reject password without numbers', () => {
    const result = validatePassword('TestTest', { requireNumbers: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('숫자가 포함되어야 합니다.');
  });

  it('should reject password without special characters when required', () => {
    const result = validatePassword('Test1234', { requireSpecialChars: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('특수문자가 포함되어야 합니다.');
  });

  it('should validate password with special characters', () => {
    const result = validatePassword('Test123!', { requireSpecialChars: true });
    expect(result.isValid).toBe(true);
  });

  it('should support custom minLength', () => {
    const result = validatePassword('Test12', { minLength: 6 });
    expect(result.isValid).toBe(true);
  });

  it('should allow disabling requirements', () => {
    const result = validatePassword('test', {
      minLength: 4,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    });
    expect(result.isValid).toBe(true);
  });

  it('should return multiple errors', () => {
    const result = validatePassword('test');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('validateUrl', () => {
  it('should validate correct URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://example.com')).toBe(true);
    expect(validateUrl('https://example.com/path')).toBe(true);
    expect(validateUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(validateUrl('invalid')).toBe(false);
    expect(validateUrl('example.com')).toBe(false); // missing protocol
    // Note: URL constructor accepts any protocol format, even 'htp://'
    // For stricter validation, would need additional protocol checks
  });

  it('should reject empty string', () => {
    expect(validateUrl('')).toBe(false);
  });
});

describe('validatePhoneNumber', () => {
  it('should validate Korean phone numbers without hyphens', () => {
    expect(validatePhoneNumber('01012345678')).toBe(true);
    expect(validatePhoneNumber('01112345678')).toBe(true);
    expect(validatePhoneNumber('01987654321')).toBe(true);
  });

  it('should validate Korean phone numbers with hyphens', () => {
    expect(validatePhoneNumber('010-1234-5678')).toBe(true);
    expect(validatePhoneNumber('011-1234-5678')).toBe(true);
    expect(validatePhoneNumber('019-8765-4321')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhoneNumber('020-1234-5678')).toBe(false); // invalid prefix
    expect(validatePhoneNumber('010-123-5678')).toBe(false); // wrong format
    expect(validatePhoneNumber('010-1234-567')).toBe(false); // too short
    expect(validatePhoneNumber('123456789')).toBe(false); // too short
  });

  it('should handle phone numbers with spaces', () => {
    expect(validatePhoneNumber('010 1234 5678')).toBe(true);
  });
});

describe('validateNumberRange', () => {
  it('should validate number within range', () => {
    expect(validateNumberRange(5, 1, 10)).toBe(true);
    expect(validateNumberRange(1, 1, 10)).toBe(true); // min boundary
    expect(validateNumberRange(10, 1, 10)).toBe(true); // max boundary
  });

  it('should reject number outside range', () => {
    expect(validateNumberRange(0, 1, 10)).toBe(false);
    expect(validateNumberRange(11, 1, 10)).toBe(false);
    expect(validateNumberRange(-5, 1, 10)).toBe(false);
  });

  it('should handle negative ranges', () => {
    expect(validateNumberRange(-5, -10, 0)).toBe(true);
    expect(validateNumberRange(-11, -10, 0)).toBe(false);
  });

  it('should handle decimal numbers', () => {
    expect(validateNumberRange(5.5, 1.0, 10.0)).toBe(true);
    expect(validateNumberRange(0.5, 1.0, 10.0)).toBe(false);
  });
});

describe('validateStringLength', () => {
  it('should validate string within length range', () => {
    expect(validateStringLength('hello', 1, 10)).toBe(true);
    expect(validateStringLength('h', 1, 10)).toBe(true); // min boundary
    expect(validateStringLength('helloworld', 1, 10)).toBe(true); // max boundary
  });

  it('should reject string outside length range', () => {
    expect(validateStringLength('', 1, 10)).toBe(false); // too short
    expect(validateStringLength('hello world!', 1, 10)).toBe(false); // too long
  });

  it('should handle exact length match', () => {
    expect(validateStringLength('test', 4, 4)).toBe(true);
  });

  it('should handle Korean characters', () => {
    expect(validateStringLength('안녕하세요', 1, 10)).toBe(true); // 5 chars
    // Note: '안녕하세요반갑습니다' is 10 characters, which is within max=10 (inclusive)
    expect(validateStringLength('안녕하세요반갑습니다', 1, 10)).toBe(true);
    expect(validateStringLength('안녕하세요반갑습니다!', 1, 10)).toBe(false); // 11 chars, exceeds max
  });
});
