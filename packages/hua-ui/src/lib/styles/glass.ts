/**
 * Glass effect utility
 * Shared glass/frosted-glass style generator for HUA-UI components.
 */

import type { CSSProperties } from "react";

export type GlassIntensity = "light" | "medium" | "heavy";

const BLUR_MAP: Record<GlassIntensity, string> = {
  light: "blur(4px)",
  medium: "blur(8px)",
  heavy: "blur(12px)",
};

const BG_MAP: Record<GlassIntensity, string> = {
  light: "rgba(255, 255, 255, 0.1)",
  medium: "rgba(255, 255, 255, 0.3)",
  heavy: "rgba(255, 255, 255, 0.5)",
};

const BORDER_MAP: Record<GlassIntensity, string> = {
  light: "1px solid rgba(255, 255, 255, 0.2)",
  medium: "1px solid rgba(255, 255, 255, 0.3)",
  heavy: "1px solid rgba(226, 232, 240, 0.5)",
};

/**
 * Creates glass/frosted-glass CSSProperties.
 *
 * @param intensity - "light" (4px blur), "medium" (8px), "heavy" (12px)
 * @returns CSSProperties with backdrop-filter + webkit prefix
 *
 * @example
 * const glassStyle = createGlassStyle("light")
 * // { backdropFilter: "blur(4px)", ... }
 */
export function createGlassStyle(
  intensity: GlassIntensity = "light",
): CSSProperties {
  return {
    backdropFilter: BLUR_MAP[intensity],
    WebkitBackdropFilter: BLUR_MAP[intensity],
    backgroundColor: BG_MAP[intensity],
    border: BORDER_MAP[intensity],
  };
}
