import { describe, it, expect } from 'vitest';
import { validatePassword } from '../password/validator';

describe('validatePassword', () => {
  it('should accept a valid password', () => {
    const result = validatePassword('MyP@ssw0rd');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject short password', () => {
    const result = validatePassword('Ab1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('8자 이상 / At least 8 characters');
  });

  it('should require uppercase', () => {
    const result = validatePassword('myp@ssw0rd');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('대문자 포함 / Uppercase letter');
  });

  it('should require lowercase', () => {
    const result = validatePassword('MYP@SSW0RD');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('소문자 포함 / Lowercase letter');
  });

  it('should require numbers', () => {
    const result = validatePassword('MyP@ssword');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('숫자 포함 / Number');
  });

  it('should require special characters', () => {
    const result = validatePassword('MyPassw0rd');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('특수문자 포함 / Special character');
  });

  it('should reject spaces', () => {
    const result = validatePassword('My P@ss0rd');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('공백 불가 / No spaces');
  });

  it('should reject 3 consecutive identical chars', () => {
    const result = validatePassword('MyP@ss000rd');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('동일 문자 3회 이상 불가 / No 3 consecutive identical chars');
  });

  it('should return multiple errors', () => {
    const result = validatePassword('ab');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  describe('boundary tests', () => {
    it('should reject 7-char password', () => {
      expect(validatePassword('Ab1!xyz').isValid).toBe(false);
    });

    it('should accept 8-char password', () => {
      expect(validatePassword('Ab1!xyzW').isValid).toBe(true);
    });
  });

  describe('unicode/special', () => {
    it('should handle unicode characters in password', () => {
      const result = validatePassword('Ab1!한글xx');
      expect(result.isValid).toBe(true);
    });

    it('should reject tab character', () => {
      const result = validatePassword('Ab1!\txyzW');
      expect(result.errors).toContain('공백 불가 / No spaces');
    });

    it('should reject newline', () => {
      const result = validatePassword('Ab1!\nxyzW');
      expect(result.errors).toContain('공백 불가 / No spaces');
    });
  });

  describe('consecutive identical', () => {
    it('should allow 2 consecutive identical chars', () => {
      expect(validatePassword('AAb1!xyz').isValid).toBe(true);
    });

    it('should reject 4 consecutive identical chars', () => {
      expect(validatePassword('AAAAb1!x').isValid).toBe(false);
    });
  });

  describe('long password', () => {
    it('should accept very long valid password', () => {
      const pw = 'Ab1!' + 'xyZ9!'.repeat(20); // Valid long password without consecutive chars
      expect(validatePassword(pw).isValid).toBe(true);
      expect(pw.length).toBeGreaterThan(50);
    });
  });

  describe('empty', () => {
    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });
});
