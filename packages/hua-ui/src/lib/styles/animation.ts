/**
 * Animation utilities
 * Shared spring transition & entrance animation generators for HUA-UI.
 * Reuses EASING_FUNCTIONS from motion/presets.ts.
 */

import type { CSSProperties } from "react";
import { EASING_FUNCTIONS, DURATIONS } from "../motion/presets";

/**
 * Creates a spring-based CSS transition string.
 *
 * @param properties - CSS properties to animate (default: transform + common)
 * @param duration - duration in ms (default: 180)
 * @returns CSS transition string
 *
 * @example
 * style={{ transition: createSpringTransition() }}
 */
export function createSpringTransition(
  properties: string[] = [
    "transform",
    "box-shadow",
    "opacity",
    "background-color",
    "color",
    "border-color",
  ],
  duration: number = 180,
): string {
  const easing = EASING_FUNCTIONS.springy;
  return properties.map((prop) => `${prop} ${duration}ms ${easing}`).join(", ");
}

export type EnterPreset = "modal" | "dropdown";

interface EnterAnimationConfig {
  from: CSSProperties;
  to: CSSProperties;
  transition: string;
}

const ENTER_PRESETS: Record<EnterPreset, EnterAnimationConfig> = {
  modal: {
    from: { opacity: 0, transform: "scale(0.95) translateY(8px)" },
    to: { opacity: 1, transform: "scale(1) translateY(0)" },
    transition: `opacity ${DURATIONS.springy}ms ${EASING_FUNCTIONS.springy}, transform ${DURATIONS.springy}ms ${EASING_FUNCTIONS.springy}`,
  },
  dropdown: {
    from: { opacity: 0, transform: "scale(0.95) translateY(-4px)" },
    to: { opacity: 1, transform: "scale(1) translateY(0)" },
    transition: `opacity ${DURATIONS.soft}ms ${EASING_FUNCTIONS.soft}, transform ${DURATIONS.soft}ms ${EASING_FUNCTIONS.soft}`,
  },
};

/**
 * Returns enter animation config for a given preset.
 *
 * @param preset - "modal" | "dropdown"
 * @returns { from, to, transition } for use with inline styles or useAnimatedEntrance
 *
 * @example
 * const { from, to, transition } = createEnterAnimation("modal")
 */
export function createEnterAnimation(
  preset: EnterPreset,
): EnterAnimationConfig {
  return ENTER_PRESETS[preset];
}
