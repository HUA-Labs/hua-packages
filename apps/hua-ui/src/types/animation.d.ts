declare module '@hua-labs/animation' {
  import { RefObject } from 'react'

  export interface GradientConfig {
    colors?: string[]
    duration?: number
    direction?: 'horizontal' | 'vertical' | 'diagonal'
    size?: number
    easing?: 'linear' | 'ease-in-out' | 'ease-in' | 'ease-out'
    paused?: boolean
  }

  export interface GradientState {
    style: React.CSSProperties
    isAnimating: boolean
    pause: () => void
    resume: () => void
    reset: () => void
  }

  export interface PulseConfig {
    duration?: number
    intensity?: number
    repeat?: number
    yoyo?: boolean
  }

  export interface PulseState {
    ref: (element: HTMLElement | null) => void
    start: () => void
    stop: () => void
    isAnimating: boolean
  }

  export interface HoverAnimationConfig {
    scale?: number
    y?: number
    x?: number
    duration?: number
    easing?: string
  }

  export interface HoverAnimationState {
    ref: (element: HTMLElement | null) => void
    start: () => void
    stop: () => void
    isAnimating: boolean
  }

  export interface ScrollRevealOptions {
    threshold?: number
    rootMargin?: string
    triggerOnce?: boolean
  }

  export function useGradient(config?: GradientConfig): GradientState
  export function usePulse(config?: PulseConfig): PulseState
  export function useHoverAnimation(config?: HoverAnimationConfig): HoverAnimationState
  export function useScrollReveal(
    animationHook: () => any,
    options?: ScrollRevealOptions
  ): any
  export function createGradientKeyframes(name?: string): void
} 