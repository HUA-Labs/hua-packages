/** Breakpoint order for responsive cascade (mobile-first, smallest to largest) */
export const BREAKPOINT_ORDER = ["sm", "md", "lg", "xl", "2xl"] as const;

export const BREAKPOINT_SET = new Set<string>(BREAKPOINT_ORDER);

/** Default breakpoint min-width values (used by class mode for @media generation) */
export const BREAKPOINT_WIDTHS: Record<string, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};
