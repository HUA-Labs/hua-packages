/** Cursor values — standalone tokens (e.g., cursor-pointer) */
export const CURSOR: Record<string, string> = {
  'cursor-auto': 'auto',
  'cursor-default': 'default',
  'cursor-pointer': 'pointer',
  'cursor-wait': 'wait',
  'cursor-text': 'text',
  'cursor-move': 'move',
  'cursor-help': 'help',
  'cursor-not-allowed': 'not-allowed',
  'cursor-none': 'none',
  'cursor-context-menu': 'context-menu',
  'cursor-progress': 'progress',
  'cursor-cell': 'cell',
  'cursor-crosshair': 'crosshair',
  'cursor-grab': 'grab',
  'cursor-grabbing': 'grabbing',
  'cursor-col-resize': 'col-resize',
  'cursor-row-resize': 'row-resize',
} as const;

/** User-select values */
export const USER_SELECT: Record<string, string> = {
  'select-none': 'none',
  'select-text': 'text',
  'select-all': 'all',
  'select-auto': 'auto',
} as const;

/** Resize values */
export const RESIZE: Record<string, string> = {
  'resize-none': 'none',
  'resize': 'both',
  'resize-x': 'horizontal',
  'resize-y': 'vertical',
} as const;

/** Pointer-events values */
export const POINTER_EVENTS: Record<string, string> = {
  'pointer-events-none': 'none',
  'pointer-events-auto': 'auto',
} as const;

/** Appearance values */
export const APPEARANCE: Record<string, string> = {
  'appearance-none': 'none',
  'appearance-auto': 'auto',
} as const;

/** Whitespace values */
export const WHITESPACE: Record<string, string> = {
  'whitespace-normal': 'normal',
  'whitespace-nowrap': 'nowrap',
  'whitespace-pre': 'pre',
  'whitespace-pre-line': 'pre-line',
  'whitespace-pre-wrap': 'pre-wrap',
  'whitespace-break-spaces': 'break-spaces',
} as const;

/** Word break values — standalone tokens */
export const WORD_BREAK: Record<string, string> = {
  'break-normal': 'normal',
  'break-words': 'break-word',
  'break-all': 'break-all',
  'break-keep': 'keep-all',
} as const;

/** Touch action values — standalone tokens */
export const TOUCH_ACTION: Record<string, string> = {
  'touch-auto': 'auto',
  'touch-none': 'none',
  'touch-pan-x': 'pan-x',
  'touch-pan-y': 'pan-y',
  'touch-pinch-zoom': 'pinch-zoom',
  'touch-manipulation': 'manipulation',
} as const;

/** Will change values — standalone tokens */
export const WILL_CHANGE: Record<string, string> = {
  'will-change-auto': 'auto',
  'will-change-scroll': 'scroll-position',
  'will-change-contents': 'contents',
  'will-change-transform': 'transform',
} as const;
