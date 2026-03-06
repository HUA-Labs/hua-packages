import { useRef, useEffect, useState, useCallback } from 'react'
import { Animated } from 'react-native'
import { useMotionProfile } from '../profiles/MotionProfileContext'
import { getEasing, easeOut } from '../utils/easing'
import type { NativeMotionReturn, NativeMotionOptions } from './types'

export interface NativeScaleInOptions extends NativeMotionOptions {
  initialScale?: number
  targetScale?: number
}

export function useScaleIn(options: NativeScaleInOptions = {}): NativeMotionReturn {
  const profile = useMotionProfile()
  const {
    duration = profile.base.duration,
    delay = 0,
    easing = getEasing(profile.base.easing) || easeOut,
    autoStart = true,
    useNativeDriver = true,
    initialScale = profile.entrance.scale.from,
    targetScale = 1,
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
      Animated.timing(scale, {
        toValue: targetScale,
        duration,
        delay,
        easing,
        useNativeDriver,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing,
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
  }, [scale, opacity, duration, delay, easing, useNativeDriver, targetScale, isAnimating, onStart, onComplete])

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
