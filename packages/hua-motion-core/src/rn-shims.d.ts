/**
 * Minimal react-native type declarations for building native hooks.
 * Overridden by actual react-native types in consuming RN apps.
 */
declare module 'react-native' {
  export namespace Animated {
    class Value {
      constructor(value: number)
      setValue(value: number): void
      interpolate(config: {
        inputRange: number[]
        outputRange: number[] | string[]
        extrapolate?: 'extend' | 'identity' | 'clamp'
      }): AnimatedInterpolation
    }

    class AnimatedInterpolation extends Value {}

    interface TimingAnimationConfig {
      toValue: number
      duration?: number
      delay?: number
      easing?: (value: number) => number
      useNativeDriver?: boolean
    }

    interface SpringAnimationConfig {
      toValue: number
      friction?: number
      tension?: number
      speed?: number
      bounciness?: number
      useNativeDriver?: boolean
      delay?: number
    }

    interface CompositeAnimation {
      start(callback?: (result: { finished: boolean }) => void): void
      stop(): void
      reset(): void
    }

    function timing(value: Value, config: TimingAnimationConfig): CompositeAnimation
    function spring(value: Value, config: SpringAnimationConfig): CompositeAnimation
    function parallel(animations: CompositeAnimation[]): CompositeAnimation
    function sequence(animations: CompositeAnimation[]): CompositeAnimation
    function stagger(time: number, animations: CompositeAnimation[]): CompositeAnimation
    function loop(animation: CompositeAnimation, config?: { iterations?: number }): CompositeAnimation
  }

  export interface ViewStyle {
    opacity?: number | Animated.Value
    transform?: Array<
      | { translateX: number | Animated.Value }
      | { translateY: number | Animated.Value }
      | { scale: number | Animated.Value }
      | { scaleX: number | Animated.Value }
      | { scaleY: number | Animated.Value }
      | { rotate: string | Animated.AnimatedInterpolation }
    >
  }
}
