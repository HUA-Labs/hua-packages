/** Flex direction standalone tokens */
export const FLEX_DIRECTION: Record<string, string> = {
  'flex-row': 'row',
  'flex-row-reverse': 'row-reverse',
  'flex-col': 'column',
  'flex-col-reverse': 'column-reverse',
} as const;

/** Flex wrap standalone tokens */
export const FLEX_WRAP: Record<string, string> = {
  'flex-wrap': 'wrap',
  'flex-wrap-reverse': 'wrap-reverse',
  'flex-nowrap': 'nowrap',
} as const;

/** Align items standalone tokens */
export const ALIGN_ITEMS: Record<string, string> = {
  'items-start': 'flex-start',
  'items-end': 'flex-end',
  'items-center': 'center',
  'items-baseline': 'baseline',
  'items-stretch': 'stretch',
} as const;

/** Align self standalone tokens */
export const ALIGN_SELF: Record<string, string> = {
  'self-auto': 'auto',
  'self-start': 'flex-start',
  'self-end': 'flex-end',
  'self-center': 'center',
  'self-stretch': 'stretch',
  'self-baseline': 'baseline',
} as const;

/** Justify content standalone tokens */
export const JUSTIFY_CONTENT: Record<string, string> = {
  'justify-start': 'flex-start',
  'justify-end': 'flex-end',
  'justify-center': 'center',
  'justify-between': 'space-between',
  'justify-around': 'space-around',
  'justify-evenly': 'space-evenly',
} as const;

/** Align content standalone tokens */
export const ALIGN_CONTENT: Record<string, string> = {
  'content-start': 'flex-start',
  'content-end': 'flex-end',
  'content-center': 'center',
  'content-between': 'space-between',
  'content-around': 'space-around',
  'content-evenly': 'space-evenly',
  'content-stretch': 'stretch',
} as const;

/** Flex shorthand values (prefix: flex) */
export const FLEX_VALUES: Record<string, string> = {
  '1': '1 1 0%',
  'auto': '1 1 auto',
  'initial': '0 1 auto',
  'none': 'none',
} as const;

/** Flex grow values */
export const FLEX_GROW: Record<string, string> = {
  'grow': '1',
  'grow-0': '0',
} as const;

/** Flex shrink values */
export const FLEX_SHRINK: Record<string, string> = {
  'shrink': '1',
  'shrink-0': '0',
} as const;

/** Order values (prefix: order) */
export const ORDER_VALUES: Record<string, string> = {
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  '11': '11',
  '12': '12',
  'first': '-9999',
  'last': '9999',
  'none': '0',
} as const;
