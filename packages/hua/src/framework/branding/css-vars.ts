/**
 * @hua-labs/hua/framework - CSS Variables Generator
 * 
 * 브랜딩 설정을 CSS 변수로 자동 생성
 */

import type { HuaConfig } from '../types';

/**
 * Generate CSS variables from branding configuration
 * 
 * 브랜딩 설정을 CSS 변수 문자열로 변환합니다.
 * 
 * @param branding - Branding configuration
 * @returns CSS variables string
 * 
 * @example
 * ```ts
 * const css = generateCSSVariables({
 *   colors: { primary: '#3B82F6' },
 *   typography: { fontFamily: ['Inter', 'sans-serif'] },
 * });
 * // Returns: ":root {\n  --color-primary: #3B82F6;\n  --font-family: Inter, sans-serif;\n}"
 * ```
 */
export function generateCSSVariables(branding: NonNullable<HuaConfig['branding']>): string {
  const vars: string[] = [];
  
  // 색상 변수
  if (branding.colors) {
    Object.entries(branding.colors).forEach(([key, value]) => {
      if (value) {
        vars.push(`  --color-${key}: ${value};`);
      }
    });
  }
  
  // 타이포그래피 변수
  if (branding.typography) {
    if (branding.typography.fontFamily) {
      vars.push(`  --font-family: ${branding.typography.fontFamily.join(', ')};`);
    }
    if (branding.typography.fontSize) {
      Object.entries(branding.typography.fontSize).forEach(([key, value]) => {
        if (value) {
          vars.push(`  --font-size-${key}: ${value};`);
        }
      });
    }
  }
  
  // 커스텀 변수
  if (branding.customVariables) {
    Object.entries(branding.customVariables).forEach(([key, value]) => {
      vars.push(`  --${key}: ${value};`);
    });
  }
  
  if (vars.length === 0) {
    return '';
  }
  
  return `:root {\n${vars.join('\n')}\n}`;
}

/**
 * Generate CSS variables as object
 * 
 * 브랜딩 설정을 CSS 변수 객체로 변환합니다.
 * 
 * @param branding - Branding configuration
 * @returns CSS variables object
 */
export function generateCSSVariablesObject(
  branding: NonNullable<HuaConfig['branding']>
): Record<string, string> {
  const vars: Record<string, string> = {};
  
  // 색상 변수
  if (branding.colors) {
    Object.entries(branding.colors).forEach(([key, value]) => {
      if (value) {
        vars[`--color-${key}`] = value;
      }
    });
  }
  
  // 타이포그래피 변수
  if (branding.typography) {
    if (branding.typography.fontFamily) {
      vars['--font-family'] = branding.typography.fontFamily.join(', ');
    }
    if (branding.typography.fontSize) {
      Object.entries(branding.typography.fontSize).forEach(([key, value]) => {
        if (value) {
          vars[`--font-size-${key}`] = value;
        }
      });
    }
  }
  
  // 커스텀 변수
  if (branding.customVariables) {
    Object.entries(branding.customVariables).forEach(([key, value]) => {
      vars[`--${key}`] = value;
    });
  }
  
  return vars;
}
