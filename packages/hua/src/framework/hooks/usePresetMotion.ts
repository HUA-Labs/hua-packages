"use client"

import { useComponentMotion, useMotionConfig, useReducedMotion } from '@hua-labs/ui'
import type { ComponentMotionConfig } from '@hua-labs/ui'

/**
 * usePresetMotion — convenience hook for app developers
 *
 * Combines preset component motion lookup + reducedMotion + global enableAnimations.
 *
 * @param role - Component role key (e.g. 'card', 'hero', 'button')
 * @returns config for the role and whether animation should run
 *
 * @example
 * const { config, shouldAnimate } = usePresetMotion('card')
 * // config: { entrance: 'slideUp', delay: 100, duration: 300, hover: true, click: false }
 * // shouldAnimate: true (unless reducedMotion or enableAnimations=false)
 */
export function usePresetMotion(role: string): {
  config: ComponentMotionConfig | undefined
  shouldAnimate: boolean
} {
  const config = useComponentMotion(role)
  const { enableAnimations } = useMotionConfig()
  const prefersReducedMotion = useReducedMotion()

  return {
    config,
    shouldAnimate: enableAnimations && !prefersReducedMotion,
  }
}
