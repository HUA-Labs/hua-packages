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

/** Flex basis fractional values (prefix: basis) */
export const FLEX_BASIS: Record<string, string> = {
  'auto': 'auto',
  'full': '100%',
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
  '1/12': '8.333333%',
  '2/12': '16.666667%',
  '3/12': '25%',
  '4/12': '33.333333%',
  '5/12': '41.666667%',
  '6/12': '50%',
  '7/12': '58.333333%',
  '8/12': '66.666667%',
  '9/12': '75%',
  '10/12': '83.333333%',
  '11/12': '91.666667%',
} as const;

/** Place-content values (standalone tokens) */
export const PLACE_CONTENT: Record<string, string> = {
  'place-content-start': 'start',
  'place-content-end': 'end',
  'place-content-center': 'center',
  'place-content-between': 'space-between',
  'place-content-around': 'space-around',
  'place-content-evenly': 'space-evenly',
  'place-content-baseline': 'baseline',
  'place-content-stretch': 'stretch',
} as const;

/** Place-items values (standalone tokens) */
export const PLACE_ITEMS: Record<string, string> = {
  'place-items-start': 'start',
  'place-items-end': 'end',
  'place-items-center': 'center',
  'place-items-baseline': 'baseline',
  'place-items-stretch': 'stretch',
} as const;

/** Place-self values (standalone tokens) */
export const PLACE_SELF: Record<string, string> = {
  'place-self-auto': 'auto',
  'place-self-start': 'start',
  'place-self-end': 'end',
  'place-self-center': 'center',
  'place-self-stretch': 'stretch',
} as const;
