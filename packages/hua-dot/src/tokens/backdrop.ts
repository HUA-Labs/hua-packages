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

/** Backdrop grayscale values — bare '' = 100% */
export const BACKDROP_GRAYSCALE: Record<string, string> = {
  '': '100%',
  '0': '0',
} as const;

/** Backdrop sepia values — bare '' = 100% */
export const BACKDROP_SEPIA: Record<string, string> = {
  '': '100%',
  '0': '0',
} as const;

/** Backdrop invert values — bare '' = 100% */
export const BACKDROP_INVERT: Record<string, string> = {
  '': '100%',
  '0': '0',
} as const;

/** Backdrop hue-rotate values (degrees) */
export const BACKDROP_HUE_ROTATE: Record<string, string> = {
  '0': '0deg',
  '15': '15deg',
  '30': '30deg',
  '60': '60deg',
  '90': '90deg',
  '180': '180deg',
} as const;

/** Backdrop opacity values */
export const BACKDROP_OPACITY: Record<string, string> = {
  '0': '0',
  '5': '0.05',
  '10': '0.1',
  '20': '0.2',
  '25': '0.25',
  '30': '0.3',
  '40': '0.4',
  '50': '0.5',
  '60': '0.6',
  '70': '0.7',
  '75': '0.75',
  '80': '0.8',
  '90': '0.9',
  '95': '0.95',
  '100': '1',
} as const;
