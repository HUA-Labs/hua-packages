/**
 * @hua-labs/hua/framework - CSS Variables Tests
 */

import { describe, it, expect } from 'vitest';
import { generateCSSVariables, generateCSSVariablesObject, isValidCSSColor } from '../css-vars';

describe('branding/css-vars', () => {
  describe('generateCSSVariables', () => {
    it('should return empty string for empty config', () => {
      const result = generateCSSVariables({});
      expect(result).toBe('');
    });

    it('should generate color variables', () => {
      const result = generateCSSVariables({
        colors: {
          primary: '#3B82F6',
        },
      });
      expect(result).toContain(':root {');
      expect(result).toContain('--color-primary: #3B82F6;');
      expect(result).toContain('}');
    });

    it('should generate font family variable', () => {
      const result = generateCSSVariables({
        typography: {
          fontFamily: ['Inter', 'sans-serif'],
        },
      });
      expect(result).toContain('--font-family: Inter, sans-serif;');
    });

    it('should generate font size variables', () => {
      const result = generateCSSVariables({
        typography: {
          fontSize: {
            h1: '2rem',
            h2: '1.5rem',
          },
        },
      });
      expect(result).toContain('--font-size-h1: 2rem;');
      expect(result).toContain('--font-size-h2: 1.5rem;');
    });

    it('should generate custom variables', () => {
      const result = generateCSSVariables({
        customVariables: {
          'brand-color': '#ffffff',
          'spacing': '8px',
        },
      });
      expect(result).toContain('--brand-color: #ffffff;');
      expect(result).toContain('--spacing: 8px;');
    });

    it('should generate all types of variables together', () => {
      const result = generateCSSVariables({
        colors: {
          primary: '#ff0000',
        },
        typography: {
          fontFamily: ['Arial'],
        },
      });
      expect(result).toContain('--color-primary: #ff0000;');
      expect(result).toContain('--font-family: Arial;');
    });
  });

  describe('isValidCSSColor', () => {
    it('should validate hex colors', () => {
      expect(isValidCSSColor('#RGB')).toBe(false); // invalid — must be actual hex digits
      expect(isValidCSSColor('#3B8')).toBe(true);   // 3-digit hex
      expect(isValidCSSColor('#3B82F6')).toBe(true); // 6-digit hex
      expect(isValidCSSColor('#3B82F6AA')).toBe(true); // 8-digit hex with alpha
      expect(isValidCSSColor('#GGG')).toBe(false);  // invalid hex chars
      expect(isValidCSSColor('#12345')).toBe(false); // invalid length
    });

    it('should validate rgb/rgba colors', () => {
      expect(isValidCSSColor('rgb(255, 0, 0)')).toBe(true);
      expect(isValidCSSColor('rgba(255, 0, 0, 0.5)')).toBe(true);
      expect(isValidCSSColor('rgb(255 0 0)')).toBe(true);
      expect(isValidCSSColor('rgb(255 0 0 / 50%)')).toBe(true);
    });

    it('should validate hsl/hsla colors', () => {
      expect(isValidCSSColor('hsl(120, 100%, 50%)')).toBe(true);
      expect(isValidCSSColor('hsla(120, 100%, 50%, 0.5)')).toBe(true);
      expect(isValidCSSColor('hsl(120 100% 50%)')).toBe(true);
      expect(isValidCSSColor('hsl(120 100% 50% / 50%)')).toBe(true);
    });

    it('should validate CSS variables', () => {
      expect(isValidCSSColor('var(--primary)')).toBe(true);
      expect(isValidCSSColor('var(--color-brand, #fff)')).toBe(true);
      expect(isValidCSSColor('var(primary)')).toBe(false); // missing -- prefix
    });

    it('should validate named colors', () => {
      expect(isValidCSSColor('red')).toBe(true);
      expect(isValidCSSColor('blue')).toBe(true);
      expect(isValidCSSColor('transparent')).toBe(true);
      expect(isValidCSSColor('currentColor')).toBe(true);
      expect(isValidCSSColor('RED')).toBe(true); // case-insensitive
      expect(isValidCSSColor('notacolor')).toBe(false);
    });

    it('should validate modern color formats', () => {
      expect(isValidCSSColor('oklch(70% 0.2 120)')).toBe(true);
      expect(isValidCSSColor('oklab(70% -0.1 0.2)')).toBe(true);
      expect(isValidCSSColor('color(display-p3 0.5 0.5 0.5)')).toBe(true);
    });

    it('should reject invalid values', () => {
      expect(isValidCSSColor('')).toBe(false);
      expect(isValidCSSColor('   ')).toBe(false);
      expect(isValidCSSColor('notacolor')).toBe(false);
      expect(isValidCSSColor('12345')).toBe(false);
    });
  });

  describe('generateCSSVariablesObject', () => {
    it('should return empty object for empty config', () => {
      const result = generateCSSVariablesObject({});
      expect(result).toEqual({});
    });

    it('should generate color variables as object', () => {
      const result = generateCSSVariablesObject({
        colors: {
          primary: '#ff0000',
        },
      });
      expect(result).toEqual({
        '--color-primary': '#ff0000',
      });
    });

    it('should generate typography variables as object', () => {
      const result = generateCSSVariablesObject({
        typography: {
          fontFamily: ['Arial', 'sans-serif'],
          fontSize: {
            base: '16px',
          },
        },
      });
      expect(result).toEqual({
        '--font-family': 'Arial, sans-serif',
        '--font-size-base': '16px',
      });
    });

    it('should generate custom variables as object', () => {
      const result = generateCSSVariablesObject({
        customVariables: {
          'custom-var': 'value',
        },
      });
      expect(result).toEqual({
        '--custom-var': 'value',
      });
    });
  });
});
