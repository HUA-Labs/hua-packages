/** Ring width scale (maps to boxShadow inset) */
export const RING_WIDTHS: Record<string, string> = {
  '0': '0px',
  '1': '1px',
  '2': '2px',
  '': '3px',  // bare `ring` defaults to 3px
  '4': '4px',
  '8': '8px',
} as const;

/** Ring offset width scale */
export const RING_OFFSETS: Record<string, string> = {
  '0': '0px',
  '1': '1px',
  '2': '2px',
  '4': '4px',
  '8': '8px',
} as const;

/** Default ring color (Tailwind blue-500) */
export const RING_DEFAULT_COLOR = '#3b82f6';

/**
 * Build a ring box-shadow value.
 *
 * @example
 * buildRingShadow('3px', '#3b82f6') → '0 0 0 3px #3b82f6'
 */
export function buildRingShadow(width: string, color: string): string {
  return `0 0 0 ${width} ${color}`;
}
