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
