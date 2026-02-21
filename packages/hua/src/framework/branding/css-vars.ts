/**
 * @hua-labs/hua/framework - CSS Variables Generator
 *
 * 브랜딩 설정을 CSS 변수로 자동 생성
 */

import type { HuaConfig } from '../types';

/**
 * Named CSS colors (basic set)
 * https://developer.mozilla.org/en-US/docs/Web/CSS/named-color
 */
const NAMED_COLORS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
  'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
  'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue',
  'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
  'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon',
  'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
  'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick',
  'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
  'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo',
  'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
  'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey',
  'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
  'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta',
  'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
  'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue',
  'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive',
  'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
  'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue',
  'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon',
  'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue',
  'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
  'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
  // Special keywords
  'transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'revert',
]);

/**
 * Validate CSS color value
 *
 * CSS 색상 값의 유효성을 검사합니다.
 *
 * Supported formats:
 * - Hex: #RGB, #RRGGBB, #RRGGBBAA
 * - rgb/rgba: rgb(r, g, b), rgba(r, g, b, a)
 * - hsl/hsla: hsl(h, s%, l%), hsla(h, s%, l%, a)
 * - Modern: oklch(...), oklab(...), color(...)
 * - CSS variables: var(--name)
 * - Named colors: red, blue, transparent, etc.
 *
 * @param value - Color value to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * ```ts
 * isValidCSSColor('#3B82F6')        // true
 * isValidCSSColor('rgb(0, 0, 255)') // true
 * isValidCSSColor('var(--primary)') // true
 * isValidCSSColor('blue')           // true
 * isValidCSSColor('notacolor')      // false
 * ```
 */
export function isValidCSSColor(value: string): boolean {
  if (!value || typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Hex colors: #RGB, #RGBA, #RRGGBB, #RRGGBBAA (3, 4, 6, or 8 hex digits)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return true;
  }

  // css var(): var(--name) or var(--name, fallback)
  if (/^var\(--[^)]+\)$/.test(trimmed)) {
    return true;
  }

  // rgb / rgba
  if (/^rgba?\s*\(/.test(trimmed)) {
    // Legacy: rgb(255, 0, 0) / rgba(255, 0, 0, 0.5)
    if (/^rgba?\s*\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(\s*,\s*[\d.]+%?)?\s*\)$/.test(trimmed)) {
      return true;
    }
    // Modern: rgb(255 0 0) / rgb(255 0 0 / 50%)
    if (/^rgba?\s*\(\s*[\d.]+%?\s+[\d.]+%?\s+[\d.]+%?(\s*\/\s*[\d.]+%?)?\s*\)$/.test(trimmed)) {
      return true;
    }
  }

  // hsl / hsla
  if (/^hsla?\s*\(/.test(trimmed)) {
    // Legacy: hsl(120, 100%, 50%) / hsla(120, 100%, 50%, 0.5)
    if (/^hsla?\s*\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%(\s*,\s*[\d.]+%?)?\s*\)$/.test(trimmed)) {
      return true;
    }
    // Modern: hsl(120 100% 50%) / hsl(120 100% 50% / 50%)
    if (/^hsla?\s*\(\s*[\d.]+\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?\s*\)$/.test(trimmed)) {
      return true;
    }
  }

  // Modern color formats: oklch(...), oklab(...), lab(...), lch(...), display-p3(...)
  if (/^(oklch|oklab|lab|lch|hwb|color)\s*\(/.test(trimmed)) {
    return true;
  }

  // Named colors (case-insensitive)
  if (NAMED_COLORS.has(trimmed.toLowerCase())) {
    return true;
  }

  return false;
}

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
        if (!isValidCSSColor(value)) {
          console.warn(
            `[hua/branding] Invalid CSS color value for "${key}": "${value}". ` +
            `Expected hex (#RGB, #RRGGBB), rgb(), rgba(), hsl(), hsla(), var(), oklch(), or a named color.`
          );
        }
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
        if (!isValidCSSColor(value)) {
          console.warn(
            `[hua/branding] Invalid CSS color value for "${key}": "${value}". ` +
            `Expected hex (#RGB, #RRGGBB), rgb(), rgba(), hsl(), hsla(), var(), oklch(), or a named color.`
          );
        }
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
