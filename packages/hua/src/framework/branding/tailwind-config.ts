/**
 * @hua-labs/hua/framework - Tailwind Config Generator
 * 
 * 브랜딩 설정을 Tailwind Config로 자동 생성
 */

import type { HuaConfig } from '../types';

/**
 * Generate Tailwind config from branding configuration
 * 
 * 브랜딩 설정을 Tailwind Config 객체로 변환합니다.
 * 
 * @param branding - Branding configuration
 * @returns Tailwind config object
 * 
 * @example
 * ```ts
 * const tailwindConfig = generateTailwindConfig({
 *   colors: { primary: '#3B82F6' },
 *   typography: { fontFamily: ['Inter', 'sans-serif'] },
 * });
 * 
 * // Use in tailwind.config.js:
 * module.exports = {
 *   ...tailwindConfig,
 *   // ... other config
 * };
 * ```
 */
export function generateTailwindConfig(
  branding: NonNullable<HuaConfig['branding']>
): {
  theme: {
    extend: {
      colors?: Record<string, string>;
      fontFamily?: Record<string, string[]>;
      fontSize?: Record<string, string>;
    };
  };
} {
  const config: {
    theme: {
      extend: {
        colors?: Record<string, string>;
        fontFamily?: Record<string, string[]>;
        fontSize?: Record<string, string>;
      };
    };
  } = {
    theme: {
      extend: {},
    },
  };
  
  // 색상 설정
  if (branding.colors) {
    const colors: Record<string, string> = {};
    Object.entries(branding.colors).forEach(([key, value]) => {
      if (value) {
        colors[key] = value;
      }
    });
    if (Object.keys(colors).length > 0) {
      config.theme.extend.colors = colors;
    }
  }
  
  // 타이포그래피 설정
  if (branding.typography) {
    if (branding.typography.fontFamily) {
      config.theme.extend.fontFamily = {
        sans: branding.typography.fontFamily,
      };
    }
    if (branding.typography.fontSize) {
      const fontSize: Record<string, string> = {};
      Object.entries(branding.typography.fontSize).forEach(([key, value]) => {
        if (value) {
          fontSize[key] = value;
        }
      });
      if (Object.keys(fontSize).length > 0) {
        config.theme.extend.fontSize = fontSize;
      }
    }
  }
  
  return config;
}
