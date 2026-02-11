/**
 * @hua-labs/hua/framework - CSS Variables Tests
 */

import { describe, it, expect } from 'vitest';
import { generateCSSVariables, generateCSSVariablesObject } from '../css-vars';

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
