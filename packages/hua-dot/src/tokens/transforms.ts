/** Rotation values (degrees) */
export const ROTATE: Record<string, string> = {
  '0': '0deg',
  '1': '1deg',
  '2': '2deg',
  '3': '3deg',
  '6': '6deg',
  '12': '12deg',
  '45': '45deg',
  '90': '90deg',
  '180': '180deg',
} as const;

/** Scale values (percentage → decimal) */
export const SCALE: Record<string, string> = {
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
} as const;

/** Transform-origin values */
export const TRANSFORM_ORIGIN: Record<string, string> = {
  'center': 'center',
  'top': 'top',
  'top-right': 'top right',
  'right': 'right',
  'bottom-right': 'bottom right',
  'bottom': 'bottom',
  'bottom-left': 'bottom left',
  'left': 'left',
  'top-left': 'top left',
} as const;

/** Skew values (degrees) */
export const SKEW: Record<string, string> = {
  '0': '0deg',
  '1': '1deg',
  '2': '2deg',
  '3': '3deg',
  '6': '6deg',
  '12': '12deg',
} as const;
