"use client"

import React, { useMemo } from "react"
import { useInView } from "./useInView"
import { useReducedMotion } from "./useReducedMotion"
import { useComponentMotion, useMotionConfig } from "../context/MotionConfigContext"

export interface UseAnimatedEntranceOptions {
  /** Component role key for preset lookup (e.g. 'card', 'hero') */
  role: string
  /** Explicitly enable/disable animation (overrides preset) */
  enabled?: boolean
}

export interface UseAnimatedEntranceReturn<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>
  style: React.CSSProperties
  className: string
}

/** Map entrance type to initial CSS transform */
function getInitialTransform(entrance: string): string {
  switch (entrance) {
    case "slideUp":
      return "translateY(24px)"
    case "slideLeft":
      return "translateX(24px)"
    case "slideRight":
      return "translateX(-24px)"
    case "scaleIn":
      return "scale(0.95)"
    case "bounceIn":
      return "scale(0.9)"
    case "fadeIn":
    default:
      return "none"
  }
}

/**
 * useAnimatedEntrance — CSS-based entrance animation hook
 *
 * Uses IntersectionObserver (triggerOnce) + CSS transition.
 * Respects prefers-reduced-motion and MotionConfig.enableAnimations.
 *
 * @example
 * const { ref, style, className } = useAnimatedEntrance({ role: 'card', enabled: true })
 * <div ref={ref} style={style} className={className}>...</div>
 */
export function useAnimatedEntrance<T extends HTMLElement = HTMLElement>({
  role,
  enabled,
}: UseAnimatedEntranceOptions): UseAnimatedEntranceReturn<T> {
  const config = useComponentMotion(role)
  const { enableAnimations } = useMotionConfig()
  const prefersReducedMotion = useReducedMotion()
  const { ref, inView } = useInView<T>({ triggerOnce: true, threshold: 0.1 })

  const shouldAnimate = enabled === true && enableAnimations && !prefersReducedMotion

  const style = useMemo<React.CSSProperties>(() => {
    if (!shouldAnimate || !config) return {}

    const initialTransform = getInitialTransform(config.entrance)

    if (inView) {
      return {
        opacity: 1,
        transform: "none",
        transition: `opacity ${config.duration}ms ease-out ${config.delay}ms, transform ${config.duration}ms ease-out ${config.delay}ms`,
      }
    }

    return {
      opacity: 0,
      transform: initialTransform,
      transition: `opacity ${config.duration}ms ease-out ${config.delay}ms, transform ${config.duration}ms ease-out ${config.delay}ms`,
    }
  }, [shouldAnimate, config, inView])

  return {
    ref,
    style,
    className: shouldAnimate && !inView ? "will-change-[opacity,transform]" : "",
  }
}
