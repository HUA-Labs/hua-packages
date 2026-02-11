/**
 * Debug test for no-raw-text rule internals
 */
import { describe, it, expect } from 'vitest';

// Test the regex patterns directly
describe('no-raw-text patterns', () => {
  const CJK_PATTERN = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u3400-\u4DBF]/;
  const DEFAULT_ALLOW_PATTERN = /^[\s\d\W]*$/;

  it('should match Korean text', () => {
    expect(CJK_PATTERN.test('안녕하세요')).toBe(true);
  });

  it('should match Japanese text', () => {
    expect(CJK_PATTERN.test('こんにちは')).toBe(true);
  });

  it('should match Chinese text', () => {
    expect(CJK_PATTERN.test('你好')).toBe(true);
  });

  it('should not match English text', () => {
    expect(CJK_PATTERN.test('Hello World')).toBe(false);
  });

  it('should allow empty/whitespace/numbers', () => {
    expect(DEFAULT_ALLOW_PATTERN.test('123')).toBe(true);
    expect(DEFAULT_ALLOW_PATTERN.test('$100')).toBe(true);
    expect(DEFAULT_ALLOW_PATTERN.test('   ')).toBe(true);
  });

  it('should not allow text with letters', () => {
    expect(DEFAULT_ALLOW_PATTERN.test('Hello')).toBe(false);
  });
});
