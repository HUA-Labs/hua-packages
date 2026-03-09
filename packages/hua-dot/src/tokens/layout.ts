/** Display values mapped to standalone tokens */
export const DISPLAY: Record<string, string> = {
  'block': 'block',
  'inline-block': 'inline-block',
  'inline': 'inline',
  'flex': 'flex',
  'inline-flex': 'inline-flex',
  'grid': 'grid',
  'inline-grid': 'inline-grid',
  'hidden': 'none',
  'table': 'table',
  'table-row': 'table-row',
  'table-cell': 'table-cell',
} as const;

/** Position values mapped to standalone tokens */
export const POSITION: Record<string, string> = {
  'static': 'static',
  'relative': 'relative',
  'absolute': 'absolute',
  'fixed': 'fixed',
  'sticky': 'sticky',
} as const;

/** Sizing keyword values (for w-, h-, min-w-, etc.) */
export const SIZE_KEYWORDS: Record<string, string> = {
  'auto': 'auto',
  'full': '100%',
  'screen': '100vh',
  'svh': '100svh',
  'dvh': '100dvh',
  'min': 'min-content',
  'max': 'max-content',
  'fit': 'fit-content',
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '2/4': '50%',
  '3/4': '75%',
  '1/5': '20%',
  '2/5': '40%',
  '3/5': '60%',
  '4/5': '80%',
  '1/6': '16.666667%',
  '5/6': '83.333333%',
} as const;

/** Max-width keyword values */
export const MAX_WIDTH_KEYWORDS: Record<string, string> = {
  'none': 'none',
  'xs': '320px',
  'sm': '384px',
  'md': '448px',
  'lg': '512px',
  'xl': '576px',
  '2xl': '672px',
  '3xl': '768px',
  '4xl': '896px',
  '5xl': '1024px',
  '6xl': '1152px',
  '7xl': '1280px',
  'full': '100%',
  'prose': '65ch',
  'screen-sm': '640px',
  'screen-md': '768px',
  'screen-lg': '1024px',
  'screen-xl': '1280px',
  'screen-2xl': '1536px',
} as const;

/** Inset keyword values (for top/right/bottom/left/inset) */
export const INSET_KEYWORDS: Record<string, string> = {
  'auto': 'auto',
  'full': '100%',
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '3/4': '75%',
} as const;

/** Maps inset prefix to CSS properties */
export const INSET_PROP_MAP: Record<string, readonly string[]> = {
  'top': ['top'],
  'right': ['right'],
  'bottom': ['bottom'],
  'left': ['left'],
  'inset': ['top', 'right', 'bottom', 'left'],
  'inset-x': ['left', 'right'],
  'inset-y': ['top', 'bottom'],
  'start': ['insetInlineStart'],
  'end': ['insetInlineEnd'],
} as const;

/** Aspect-ratio values */
export const ASPECT_RATIO: Record<string, string> = {
  'auto': 'auto',
  'square': '1 / 1',
  'video': '16 / 9',
} as const;

/** Maps sizing prefix to CSS property */
export const SIZE_PROP_MAP: Record<string, string> = {
  'w': 'width',
  'h': 'height',
  'min-w': 'minWidth',
  'min-h': 'minHeight',
  'max-w': 'maxWidth',
  'max-h': 'maxHeight',
} as const;

/** Float values — standalone tokens */
export const FLOAT: Record<string, string> = {
  'float-left': 'left',
  'float-right': 'right',
  'float-none': 'none',
  'float-start': 'inline-start',
  'float-end': 'inline-end',
} as const;

/** Clear values — standalone tokens */
export const CLEAR: Record<string, string> = {
  'clear-left': 'left',
  'clear-right': 'right',
  'clear-both': 'both',
  'clear-none': 'none',
  'clear-start': 'inline-start',
  'clear-end': 'inline-end',
} as const;

/** Isolation values — standalone tokens */
export const ISOLATION: Record<string, string> = {
  'isolate': 'isolate',
  'isolation-auto': 'auto',
} as const;
