/** List style type values — prefix resolver (list-disc, list-decimal, list-none) */
export const LIST_STYLE_TYPE: Record<string, string> = {
  disc: 'disc',
  decimal: 'decimal',
  none: 'none',
} as const;

/** List style position values — prefix resolver (list-inside, list-outside) */
export const LIST_STYLE_POSITION: Record<string, string> = {
  inside: 'inside',
  outside: 'outside',
} as const;
