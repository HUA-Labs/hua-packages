/**
 * @hua-labs/hua-ux/framework - CSS Variables Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateCSSVariables, generateCSSVariablesObject } from '../../branding/css-vars';
import type { HuaUxConfig } from '../../types';

describe('generateCSSVariables', () => {
  it('should generate empty string for empty branding', () => {
    const branding = {} as NonNullable<HuaUxConfig['branding']>;
    const result = generateCSSVariables(branding);

    expect(result).toBe('');
  });

  it('should generate color variables', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
      },
    };

    const result = generateCSSVariables(branding);

    expect(result).toContain('--color-primary: #3B82F6');
    expect(result).toContain('--color-secondary: #8B5CF6');
    expect(result).toContain(':root');
  });

  it('should generate typography variables', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      typography: {
        fontFamily: ['Inter', 'sans-serif'],
        fontSize: {
          sm: '0.875rem',
          md: '1rem',
        },
      },
    };

    const result = generateCSSVariables(branding);

    expect(result).toContain('--font-family: Inter, sans-serif');
    expect(result).toContain('--font-size-sm: 0.875rem');
    expect(result).toContain('--font-size-md: 1rem');
  });

  it('should generate custom variables', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      customVariables: {
        'spacing-unit': '8px',
        'border-radius': '4px',
      },
    };

    const result = generateCSSVariables(branding);

    expect(result).toContain('--spacing-unit: 8px');
    expect(result).toContain('--border-radius: 4px');
  });

  it('should generate all variable types together', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      colors: {
        primary: '#3B82F6',
      },
      typography: {
        fontFamily: ['Inter', 'sans-serif'],
      },
      customVariables: {
        'spacing-unit': '8px',
      },
    };

    const result = generateCSSVariables(branding);

    expect(result).toContain('--color-primary: #3B82F6');
    expect(result).toContain('--font-family: Inter, sans-serif');
    expect(result).toContain('--spacing-unit: 8px');
  });

  it('should format output correctly', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      colors: {
        primary: '#3B82F6',
      },
    };

    const result = generateCSSVariables(branding);

    expect(result).toMatch(/^:root \{[^}]*\}$/);
    expect(result).toContain('\n');
  });
});

describe('generateCSSVariablesObject', () => {
  it('should generate empty object for empty branding', () => {
    const branding = {} as NonNullable<HuaUxConfig['branding']>;
    const result = generateCSSVariablesObject(branding);

    expect(result).toEqual({});
  });

  it('should generate color variables as object', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
      },
    };

    const result = generateCSSVariablesObject(branding);

    expect(result['--color-primary']).toBe('#3B82F6');
    expect(result['--color-secondary']).toBe('#8B5CF6');
  });

  it('should generate typography variables as object', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      typography: {
        fontFamily: ['Inter', 'sans-serif'],
        fontSize: {
          sm: '0.875rem',
        },
      },
    };

    const result = generateCSSVariablesObject(branding);

    expect(result['--font-family']).toBe('Inter, sans-serif');
    expect(result['--font-size-sm']).toBe('0.875rem');
  });

  it('should generate custom variables as object', () => {
    const branding: NonNullable<HuaUxConfig['branding']> = {
      customVariables: {
        'spacing-unit': '8px',
      },
    };

    const result = generateCSSVariablesObject(branding);

    expect(result['--spacing-unit']).toBe('8px');
  });
});
