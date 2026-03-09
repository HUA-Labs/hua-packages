/** Table layout values — prefix resolver (table-auto, table-fixed) */
export const TABLE_LAYOUT: Record<string, string> = {
  auto: 'auto',
  fixed: 'fixed',
} as const;

/** Caption side values — prefix resolver (caption-top, caption-bottom) */
export const CAPTION_SIDE: Record<string, string> = {
  top: 'top',
  bottom: 'bottom',
} as const;
