/** Backdrop blur values */
export const BACKDROP_BLUR: Record<string, string> = {
  'none': '0',
  'sm': '4px',
  '': '8px',
  'md': '12px',
  'lg': '16px',
  'xl': '24px',
  '2xl': '40px',
  '3xl': '64px',
} as const;

/** Backdrop brightness values */
export const BACKDROP_BRIGHTNESS: Record<string, string> = {
  '0': '0',
  '50': '.5',
  '75': '.75',
  '90': '.9',
  '95': '.95',
  '100': '1',
  '105': '1.05',
  '110': '1.1',
  '125': '1.25',
  '150': '1.5',
  '200': '2',
} as const;

/** Backdrop contrast values */
export const BACKDROP_CONTRAST: Record<string, string> = {
  '0': '0',
  '50': '.5',
  '75': '.75',
  '100': '1',
  '125': '1.25',
  '150': '1.5',
  '200': '2',
} as const;

/** Backdrop saturate values */
export const BACKDROP_SATURATE: Record<string, string> = {
  '0': '0',
  '50': '.5',
  '100': '1',
  '150': '1.5',
  '200': '2',
} as const;
