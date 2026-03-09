/** Scroll behavior values — prefix resolver (scroll-auto, scroll-smooth) */
export const SCROLL_BEHAVIOR: Record<string, string> = {
  auto: 'auto',
  smooth: 'smooth',
} as const;

/** Scroll margin/padding direction mappings */
export const SCROLL_SPACING_PROP_MAP: Record<string, readonly string[]> = {
  'scroll-m': ['scrollMarginTop', 'scrollMarginRight', 'scrollMarginBottom', 'scrollMarginLeft'],
  'scroll-mx': ['scrollMarginLeft', 'scrollMarginRight'],
  'scroll-my': ['scrollMarginTop', 'scrollMarginBottom'],
  'scroll-mt': ['scrollMarginTop'],
  'scroll-mr': ['scrollMarginRight'],
  'scroll-mb': ['scrollMarginBottom'],
  'scroll-ml': ['scrollMarginLeft'],
  'scroll-p': ['scrollPaddingTop', 'scrollPaddingRight', 'scrollPaddingBottom', 'scrollPaddingLeft'],
  'scroll-px': ['scrollPaddingLeft', 'scrollPaddingRight'],
  'scroll-py': ['scrollPaddingTop', 'scrollPaddingBottom'],
  'scroll-pt': ['scrollPaddingTop'],
  'scroll-pr': ['scrollPaddingRight'],
  'scroll-pb': ['scrollPaddingBottom'],
  'scroll-pl': ['scrollPaddingLeft'],
} as const;
