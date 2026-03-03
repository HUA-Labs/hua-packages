/** Border width values */
export const BORDER_WIDTHS: Record<string, string> = {
  '': '1px',
  '0': '0px',
  '2': '2px',
  '4': '4px',
  '8': '8px',
} as const;

/** Border style values */
export const BORDER_STYLES: Record<string, string> = {
  'solid': 'solid',
  'dashed': 'dashed',
  'dotted': 'dotted',
  'double': 'double',
  'none': 'none',
} as const;

/** Border radius values */
export const BORDER_RADIUS: Record<string, string> = {
  'none': '0px',
  'sm': '2px',
  '': '4px',
  'md': '6px',
  'lg': '8px',
  'xl': '12px',
  '2xl': '16px',
  '3xl': '24px',
  'full': '9999px',
} as const;

/** Maps border-width prefix to CSS properties */
export const BORDER_WIDTH_PROP_MAP: Record<string, readonly string[]> = {
  'border': ['borderWidth'],
  'border-t': ['borderTopWidth'],
  'border-r': ['borderRightWidth'],
  'border-b': ['borderBottomWidth'],
  'border-l': ['borderLeftWidth'],
  'border-x': ['borderLeftWidth', 'borderRightWidth'],
  'border-y': ['borderTopWidth', 'borderBottomWidth'],
} as const;

/** Maps border-radius prefix to CSS properties */
export const BORDER_RADIUS_PROP_MAP: Record<string, readonly string[]> = {
  'rounded': ['borderRadius'],
  'rounded-t': ['borderTopLeftRadius', 'borderTopRightRadius'],
  'rounded-r': ['borderTopRightRadius', 'borderBottomRightRadius'],
  'rounded-b': ['borderBottomLeftRadius', 'borderBottomRightRadius'],
  'rounded-l': ['borderTopLeftRadius', 'borderBottomLeftRadius'],
  'rounded-tl': ['borderTopLeftRadius'],
  'rounded-tr': ['borderTopRightRadius'],
  'rounded-bl': ['borderBottomLeftRadius'],
  'rounded-br': ['borderBottomRightRadius'],
} as const;
