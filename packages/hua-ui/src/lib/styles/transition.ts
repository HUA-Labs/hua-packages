/**
 * Shared transition presets for HUA-UI components
 *
 * Standard durations:
 * - instant: 100ms (micro-interactions)
 * - normal: 200ms (most components)
 * - slow: 300ms (heavy elements)
 * - spring: 180ms with HUA signature springy easing
 */

import { EASING_FUNCTIONS } from "../motion/presets";

export type TransitionPreset = "instant" | "normal" | "slow" | "spring";

/** Pre-built transition strings for common use cases */
export const TRANSITIONS = {
  /** all 200ms ease-in-out — default for most components */
  normal: "all 200ms ease-in-out",
  /** all 100ms ease-out — snappy micro-interactions */
  instant: "all 100ms ease-out",
  /** all 300ms ease-out — deliberate, heavy elements */
  slow: "all 300ms ease-out",
  /** all 180ms springy — HUA signature */
  spring: `all 180ms ${EASING_FUNCTIONS.springy}`,
  /** background-color + color — dropdown items */
  colors: "background-color 200ms ease-in-out, color 200ms ease-in-out",
  /** background-color + border-color — switch track */
  bgBorder:
    "background-color 200ms ease-in-out, border-color 200ms ease-in-out",
  /** transform only — switch thumb, chevron rotation */
  transform: "transform 200ms ease-out",
} as const;

/**
 * Create a transition string for specific CSS properties with a preset timing.
 *
 * @example
 * createPropertyTransition(["transform", "box-shadow"], "normal")
 * // → "transform 200ms ease-in-out, box-shadow 200ms ease-in-out"
 */
export function createPropertyTransition(
  properties: string[],
  preset: TransitionPreset = "normal",
): string {
  const timings: Record<TransitionPreset, string> = {
    instant: "100ms ease-out",
    normal: "200ms ease-in-out",
    slow: "300ms ease-out",
    spring: `180ms ${EASING_FUNCTIONS.springy}`,
  };
  return properties.map((prop) => `${prop} ${timings[preset]}`).join(", ");
}
