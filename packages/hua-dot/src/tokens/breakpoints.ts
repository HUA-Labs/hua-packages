/** Breakpoint order for responsive cascade (mobile-first, smallest to largest) */
export const BREAKPOINT_ORDER = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

export const BREAKPOINT_SET = new Set<string>(BREAKPOINT_ORDER);
