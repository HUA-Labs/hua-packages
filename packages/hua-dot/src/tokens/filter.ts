/**
 * Element filter tokens (CSS `filter` property).
 * Blur values mirror backdrop-blur; brightness/contrast/saturate mirror backdrop equivalents.
 */

/** Blur values — same scale as backdrop-blur */
export const BLUR: Record<string, string> = {
  'none': '0',
  'sm': '4px',
  '': '8px',
  'md': '12px',
  'lg': '16px',
  'xl': '24px',
  '2xl': '40px',
  '3xl': '64px',
} as const;

/** Brightness values */
export const BRIGHTNESS: Record<string, string> = {
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

/** Contrast values */
export const CONTRAST: Record<string, string> = {
  '0': '0',
  '50': '.5',
  '75': '.75',
  '100': '1',
  '125': '1.25',
  '150': '1.5',
  '200': '2',
} as const;

/** Saturate values */
export const SATURATE: Record<string, string> = {
  '0': '0',
  '50': '.5',
  '100': '1',
  '150': '1.5',
  '200': '2',
} as const;

/** Grayscale values — bare '' = 100% */
export const GRAYSCALE: Record<string, string> = {
  '': '100%',
  '0': '0',
} as const;

/** Sepia values — bare '' = 100% */
export const SEPIA: Record<string, string> = {
  '': '100%',
  '0': '0',
} as const;

/** Invert values — bare '' = 100% */
export const INVERT: Record<string, string> = {
  '': '100%',
  '0': '0',
} as const;

/** Hue-rotate values (degrees) */
export const HUE_ROTATE: Record<string, string> = {
  '0': '0deg',
  '15': '15deg',
  '30': '30deg',
  '60': '60deg',
  '90': '90deg',
  '180': '180deg',
} as const;

/** Drop-shadow presets */
export const DROP_SHADOW: Record<string, string> = {
  'sm': 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))',
  '': 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))',
  'md': 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
  'lg': 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
  'xl': 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
  '2xl': 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
  'none': 'drop-shadow(0 0 0 transparent)',
} as const;

/** Mix-blend-mode values */
export const MIX_BLEND: Record<string, string> = {
  'normal': 'normal',
  'multiply': 'multiply',
  'screen': 'screen',
  'overlay': 'overlay',
  'darken': 'darken',
  'lighten': 'lighten',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  'hard-light': 'hard-light',
  'soft-light': 'soft-light',
  'difference': 'difference',
  'exclusion': 'exclusion',
  'hue': 'hue',
  'saturation': 'saturation',
  'color': 'color',
  'luminosity': 'luminosity',
  'plus-lighter': 'plus-lighter',
} as const;
