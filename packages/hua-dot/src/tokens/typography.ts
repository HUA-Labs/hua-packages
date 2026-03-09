/** Font size scale */
export const FONT_SIZES: Record<string, string> = {
  'xs': '12px',
  'sm': '14px',
  'base': '16px',
  'lg': '18px',
  'xl': '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
} as const;

/** Font weight scale */
export const FONT_WEIGHTS: Record<string, string> = {
  'thin': '100',
  'extralight': '200',
  'light': '300',
  'normal': '400',
  'medium': '500',
  'semibold': '600',
  'bold': '700',
  'extrabold': '800',
  'black': '900',
} as const;

/** Line height scale */
export const LINE_HEIGHTS: Record<string, string> = {
  'none': '1',
  'tight': '1.25',
  'snug': '1.375',
  'normal': '1.5',
  'relaxed': '1.625',
  'loose': '2',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '7': '28px',
  '8': '32px',
  '9': '36px',
  '10': '40px',
} as const;

/** Letter spacing scale */
export const LETTER_SPACINGS: Record<string, string> = {
  'tighter': '-0.05em',
  'tight': '-0.025em',
  'normal': '0em',
  'wide': '0.025em',
  'wider': '0.05em',
  'widest': '0.1em',
} as const;

/** Font family stacks */
export const FONT_FAMILIES: Record<string, string> = {
  'sans': 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  'serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  'mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

/** Text alignment values */
export const TEXT_ALIGNS: Record<string, string> = {
  'left': 'left',
  'center': 'center',
  'right': 'right',
  'justify': 'justify',
} as const;

/** Text decoration style values (prefix: decoration) */
export const TEXT_DECORATION_STYLE: Record<string, string> = {
  'solid': 'solid',
  'double': 'double',
  'dotted': 'dotted',
  'dashed': 'dashed',
  'wavy': 'wavy',
} as const;

/** Text decoration thickness values (prefix: decoration) */
export const TEXT_DECORATION_THICKNESS: Record<string, string> = {
  '0': '0px',
  '1': '1px',
  '2': '2px',
  '4': '4px',
  '8': '8px',
  'auto': 'auto',
  'from-font': 'from-font',
} as const;

/** Underline offset values (prefix: underline-offset) */
export const UNDERLINE_OFFSET: Record<string, string> = {
  '0': '0px',
  '1': '1px',
  '2': '2px',
  '4': '4px',
  '8': '8px',
  'auto': 'auto',
} as const;
