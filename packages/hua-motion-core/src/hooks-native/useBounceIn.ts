import { useRef, useEffect, useState, useCallback } from 'react'
import { Animated } from 'react-native'
import { useMotionProfile } from '../profiles/MotionProfileContext'
import type { NativeMotionReturn, NativeMotionOptions } from './types'

export interface NativeBounceInOptions extends NativeMotionOptions {
  initialScale?: number
  /** Spring friction (lower = more bouncy) @default 4 */
  friction?: number
  /** Spring tension @default 80 */
  tension?: number
}

export function useBounceIn(options: NativeBounceInOptions = {}): NativeMotionReturn {
  const profile = useMotionProfile()
  const {
    delay = 0,
    autoStart = true,
    useNativeDriver = true,
    initialScale = 0.3,
    friction = 4,
    tension = 80,
    onComplete,
    onStart,
  } = options

  const scale = useRef(new Animated.Value(initialScale)).current
  const opacity = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  const start = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    onStart?.()

    animRef.current = Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction,
        tension,
        useNativeDriver,
        delay,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay,
        useNativeDriver,
      }),
    ])
    animRef.current.start(({ finished }) => {
      if (finished) {
        setIsVisible(true)
        setIsAnimating(false)
        setProgress(1)
        onComplete?.()
      }
    })
  }, [scale, opacity, friction, tension, delay, useNativeDriver, isAnimating, onStart, onComplete])

  const stop = useCallback(() => {
    animRef.current?.stop()
    setIsAnimating(false)
  }, [])

  const reset = useCallback(() => {
    animRef.current?.stop()
    scale.setValue(initialScale)
    opacity.setValue(0)
    setIsAnimating(false)
    setIsVisible(false)
    setProgress(0)
  }, [scale, opacity, initialScale])

  useEffect(() => {
    if (autoStart) start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  return {
    style: {
      opacity,
      transform: [{ scale }],
    },
    isVisible,
    isAnimating,
    progress,
    start,
    stop,
    reset,
  }
}
