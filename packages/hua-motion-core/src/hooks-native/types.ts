import type { Animated, ViewStyle } from 'react-native'

/** Animated-compatible style — each property can be a static value or Animated.Value */
export type NativeAnimatedStyle = {
  [K in keyof ViewStyle]?: ViewStyle[K] | Animated.Value | Animated.AnimatedInterpolation
}

/**
 * Native motion hook return type.
 * style is an Animated-compatible object for use with Animated.View.
 */
export interface NativeMotionReturn {
  style: NativeAnimatedStyle
  isVisible: boolean
  isAnimating: boolean
  progress: number
  start: () => void
  stop: () => void
  reset: () => void
}

export interface NativeMotionOptions {
  duration?: number
  delay?: number
  easing?: (t: number) => number
  autoStart?: boolean
  useNativeDriver?: boolean
  onComplete?: () => void
  onStart?: () => void
}
