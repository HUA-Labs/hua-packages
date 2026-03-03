/** Transition property shorthand values */
export const TRANSITION_PROPERTY: Record<string, string> = {
  'none': 'none',
  'all': 'all',
  '': 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
  'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
  'opacity': 'opacity',
  'shadow': 'box-shadow',
  'transform': 'transform',
} as const;

/** Duration values (milliseconds) */
export const DURATION: Record<string, string> = {
  '0': '0s',
  '75': '75ms',
  '100': '100ms',
  '150': '150ms',
  '200': '200ms',
  '300': '300ms',
  '500': '500ms',
  '700': '700ms',
  '1000': '1000ms',
} as const;

/** Timing function values */
export const TIMING: Record<string, string> = {
  'linear': 'linear',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'snap': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;
