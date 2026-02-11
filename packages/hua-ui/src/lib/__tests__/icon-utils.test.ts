import { describe, it, expect } from 'vitest';
import { normalizeIconName, normalizeLucideIconName, normalizePhosphorIconName } from '../icon-utils';

describe('normalizeIconName', () => {
  it('should normalize lowercase to PascalCase', () => {
    expect(normalizeIconName('heart')).toBe('Heart');
    expect(normalizeIconName('user')).toBe('User');
  });

  it('should normalize kebab-case to PascalCase', () => {
    expect(normalizeIconName('heart-circle')).toBe('HeartCircle');
    expect(normalizeIconName('arrow-left')).toBe('ArrowLeft');
    expect(normalizeIconName('arrow-up-right')).toBe('ArrowUpRight');
  });

  it('should normalize snake_case to PascalCase', () => {
    expect(normalizeIconName('heart_circle')).toBe('HeartCircle');
    expect(normalizeIconName('arrow_left')).toBe('ArrowLeft');
  });

  it('should normalize camelCase to PascalCase', () => {
    expect(normalizeIconName('heartCircle')).toBe('HeartCircle');
    expect(normalizeIconName('arrowLeft')).toBe('ArrowLeft');
  });

  it('should keep PascalCase unchanged', () => {
    expect(normalizeIconName('HeartCircle')).toBe('HeartCircle');
    expect(normalizeIconName('ArrowLeft')).toBe('ArrowLeft');
  });

  it('should normalize UPPERCASE to PascalCase', () => {
    expect(normalizeIconName('HEART')).toBe('Heart');
    expect(normalizeIconName('USER')).toBe('User');
    expect(normalizeIconName('ARROW')).toBe('Arrow');
  });

  it('should handle empty string', () => {
    expect(normalizeIconName('')).toBe('');
  });

  it('should handle single character', () => {
    expect(normalizeIconName('x')).toBe('X');
    expect(normalizeIconName('X')).toBe('X');
  });

  it('should handle complex multi-word names', () => {
    expect(normalizeIconName('arrow-up-left-circle')).toBe('ArrowUpLeftCircle');
    expect(normalizeIconName('check-circle-outline')).toBe('CheckCircleOutline');
  });
});

describe('normalizeLucideIconName', () => {
  it('should delegate to normalizeIconName', () => {
    expect(normalizeLucideIconName('heart')).toBe('Heart');
    expect(normalizeLucideIconName('arrow-left')).toBe('ArrowLeft');
    expect(normalizeLucideIconName('heartCircle')).toBe('HeartCircle');
  });

  it('should return PascalCase for Lucide icons', () => {
    expect(normalizeLucideIconName('check')).toBe('Check');
    expect(normalizeLucideIconName('x-circle')).toBe('XCircle');
  });
});

describe('normalizePhosphorIconName', () => {
  it('should delegate to normalizeIconName', () => {
    expect(normalizePhosphorIconName('heart')).toBe('Heart');
    expect(normalizePhosphorIconName('arrow-left')).toBe('ArrowLeft');
    expect(normalizePhosphorIconName('heartCircle')).toBe('HeartCircle');
  });

  it('should return PascalCase for Phosphor icons', () => {
    expect(normalizePhosphorIconName('check')).toBe('Check');
    expect(normalizePhosphorIconName('x-circle')).toBe('XCircle');
  });
});
