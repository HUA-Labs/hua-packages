/** Object fit values */
export const OBJECT_FIT: Record<string, string> = {
  'object-contain': 'contain',
  'object-cover': 'cover',
  'object-fill': 'fill',
  'object-none': 'none',
  'object-scale-down': 'scale-down',
} as const;

/** Object position values — standalone tokens */
export const OBJECT_POSITION: Record<string, string> = {
  'object-center': 'center',
  'object-top': 'top',
  'object-bottom': 'bottom',
  'object-left': 'left',
  'object-right': 'right',
  'object-left-top': 'left top',
  'object-left-bottom': 'left bottom',
  'object-right-top': 'right top',
  'object-right-bottom': 'right bottom',
} as const;
