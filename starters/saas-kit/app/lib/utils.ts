/**
 * Common utility functions
 *
 * Provides CSS class merging.
 *
 * @remarks
 * Use `date-utils.ts` for date formatting.
 * Use `sentiment-utils.ts` for sentiment colors.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes.
 *
 * Combines clsx and tailwind-merge to handle conditional and duplicate classes.
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * ```typescript
 * cn('px-4 py-2', condition && 'bg-indigo-500', { 'text-white': isActive })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
