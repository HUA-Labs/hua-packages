import { useRef, useEffect, useState, useCallback } from 'react'
import { Animated } from 'react-native'
import { getEasing, easeInOut } from '../utils/easing'
import type { NativeMotionReturn, NativeMotionOptions } from './types'

export interface NativePulseOptions extends NativeMotionOptions {
  /** Min opacity @default 0.3 */
  minOpacity?: number
  /** Number of iterations (Infinity for forever) @default Infinity */
  iterations?: number
}

export function usePulse(options: NativePulseOptions = {}): NativeMotionReturn {
  const {
    duration = 1500,
    autoStart = true,
    useNativeDriver = true,
    easing = getEasing('easeInOut') || easeInOut,
    minOpacity = 0.3,
    iterations = -1,
    onStart,
  } = options

  const opacity = useRef(new Animated.Value(1)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  const start = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    onStart?.()

    const pulse = Animated.sequence([
      Animated.timing(opacity, {
        toValue: minOpacity,
        duration: duration / 2,
        easing,
        useNativeDriver,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        easing,
        useNativeDriver,
      }),
    ])

    animRef.current = iterations === -1 || iterations === Infinity
      ? Animated.loop(pulse)
      : Animated.loop(pulse, { iterations })

    animRef.current.start(({ finished }) => {
      if (finished) setIsAnimating(false)
    })
  }, [opacity, duration, easing, useNativeDriver, minOpacity, iterations, isAnimating, onStart])

  const stop = useCallback(() => {
    animRef.current?.stop()
    setIsAnimating(false)
  }, [])

  const reset = useCallback(() => {
    animRef.current?.stop()
    opacity.setValue(1)
    setIsAnimating(false)
  }, [opacity])

  useEffect(() => {
    if (autoStart) start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  return {
    style: { opacity },
    isVisible: true,
    isAnimating,
    progress: 0,
    start,
    stop,
    reset,
  }
}
