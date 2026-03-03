/** Grid template columns: grid-cols-{n} */
export const GRID_COLS: Record<string, string> = {
  'none': 'none',
  '1': 'repeat(1, minmax(0, 1fr))',
  '2': 'repeat(2, minmax(0, 1fr))',
  '3': 'repeat(3, minmax(0, 1fr))',
  '4': 'repeat(4, minmax(0, 1fr))',
  '5': 'repeat(5, minmax(0, 1fr))',
  '6': 'repeat(6, minmax(0, 1fr))',
  '7': 'repeat(7, minmax(0, 1fr))',
  '8': 'repeat(8, minmax(0, 1fr))',
  '9': 'repeat(9, minmax(0, 1fr))',
  '10': 'repeat(10, minmax(0, 1fr))',
  '11': 'repeat(11, minmax(0, 1fr))',
  '12': 'repeat(12, minmax(0, 1fr))',
  'subgrid': 'subgrid',
} as const;

/** Grid template rows: grid-rows-{n} */
export const GRID_ROWS: Record<string, string> = {
  'none': 'none',
  '1': 'repeat(1, minmax(0, 1fr))',
  '2': 'repeat(2, minmax(0, 1fr))',
  '3': 'repeat(3, minmax(0, 1fr))',
  '4': 'repeat(4, minmax(0, 1fr))',
  '5': 'repeat(5, minmax(0, 1fr))',
  '6': 'repeat(6, minmax(0, 1fr))',
  'subgrid': 'subgrid',
} as const;

/** Column span: col-span-{n} */
export const COL_SPAN: Record<string, string> = {
  'auto': 'auto',
  'full': '1 / -1',
  '1': 'span 1 / span 1',
  '2': 'span 2 / span 2',
  '3': 'span 3 / span 3',
  '4': 'span 4 / span 4',
  '5': 'span 5 / span 5',
  '6': 'span 6 / span 6',
  '7': 'span 7 / span 7',
  '8': 'span 8 / span 8',
  '9': 'span 9 / span 9',
  '10': 'span 10 / span 10',
  '11': 'span 11 / span 11',
  '12': 'span 12 / span 12',
} as const;

/** Row span: row-span-{n} */
export const ROW_SPAN: Record<string, string> = {
  'auto': 'auto',
  'full': '1 / -1',
  '1': 'span 1 / span 1',
  '2': 'span 2 / span 2',
  '3': 'span 3 / span 3',
  '4': 'span 4 / span 4',
  '5': 'span 5 / span 5',
  '6': 'span 6 / span 6',
} as const;

/** Column start/end: col-start-{n}, col-end-{n} */
export const COL_START_END: Record<string, string> = {
  'auto': 'auto',
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
  '13': '13',
} as const;

/** Row start/end: row-start-{n}, row-end-{n} */
export const ROW_START_END: Record<string, string> = {
  'auto': 'auto',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
} as const;

/** Auto track sizing: auto-cols-{value}, auto-rows-{value} */
export const AUTO_TRACK: Record<string, string> = {
  'auto': 'auto',
  'min': 'min-content',
  'max': 'max-content',
  'fr': 'minmax(0, 1fr)',
} as const;

/** Grid flow values (standalone): grid-flow-{value} */
export const GRID_FLOW: Record<string, string> = {
  'grid-flow-row': 'row',
  'grid-flow-col': 'column',
  'grid-flow-dense': 'dense',
  'grid-flow-row-dense': 'row dense',
  'grid-flow-col-dense': 'column dense',
} as const;
