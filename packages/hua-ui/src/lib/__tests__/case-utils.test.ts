import { describe, it, expect } from 'vitest';
import { toCamelCase, toPascalCase } from '../case-utils';

describe('toCamelCase', () => {
  it('should convert kebab-case to camelCase', () => {
    expect(toCamelCase('arrow-left')).toBe('arrowLeft');
    expect(toCamelCase('heart-circle')).toBe('heartCircle');
    expect(toCamelCase('arrow-up-right')).toBe('arrowUpRight');
  });

  it('should convert snake_case to camelCase', () => {
    expect(toCamelCase('arrow_left')).toBe('arrowLeft');
    expect(toCamelCase('heart_circle')).toBe('heartCircle');
  });

  it('should convert PascalCase to camelCase', () => {
    expect(toCamelCase('ArrowLeft')).toBe('arrowLeft');
    expect(toCamelCase('HeartCircle')).toBe('heartCircle');
  });

  it('should convert UPPERCASE to lowercase', () => {
    expect(toCamelCase('HEART')).toBe('heart');
    expect(toCamelCase('USER')).toBe('user');
    expect(toCamelCase('ARROW')).toBe('arrow');
  });

  it('should keep already camelCase strings unchanged', () => {
    expect(toCamelCase('arrowLeft')).toBe('arrowLeft');
    expect(toCamelCase('heartCircle')).toBe('heartCircle');
    expect(toCamelCase('user')).toBe('user');
  });

  it('should handle empty string', () => {
    expect(toCamelCase('')).toBe('');
  });

  it('should handle single character', () => {
    expect(toCamelCase('a')).toBe('a');
    expect(toCamelCase('A')).toBe('a');
  });

  it('should handle mixed delimiters', () => {
    expect(toCamelCase('arrow-left_right')).toBe('arrowLeftRight');
  });
});

describe('toPascalCase', () => {
  it('should convert kebab-case to PascalCase', () => {
    expect(toPascalCase('arrow-left')).toBe('ArrowLeft');
    expect(toPascalCase('heart-circle')).toBe('HeartCircle');
    expect(toPascalCase('arrow-up-right')).toBe('ArrowUpRight');
  });

  it('should convert snake_case to PascalCase', () => {
    expect(toPascalCase('arrow_left')).toBe('ArrowLeft');
    expect(toPascalCase('heart_circle')).toBe('HeartCircle');
  });

  it('should convert camelCase to PascalCase', () => {
    expect(toPascalCase('arrowLeft')).toBe('ArrowLeft');
    expect(toPascalCase('heartCircle')).toBe('HeartCircle');
  });

  it('should keep already PascalCase strings unchanged', () => {
    expect(toPascalCase('ArrowLeft')).toBe('ArrowLeft');
    expect(toPascalCase('HeartCircle')).toBe('HeartCircle');
  });

  it('should handle lowercase single word', () => {
    expect(toPascalCase('heart')).toBe('Heart');
    expect(toPascalCase('user')).toBe('User');
  });

  it('should handle empty string', () => {
    expect(toPascalCase('')).toBe('');
  });

  it('should handle single character', () => {
    expect(toPascalCase('a')).toBe('A');
    expect(toPascalCase('A')).toBe('A');
  });

  it('should handle mixed delimiters', () => {
    expect(toPascalCase('arrow-left_right')).toBe('ArrowLeftRight');
  });
});
