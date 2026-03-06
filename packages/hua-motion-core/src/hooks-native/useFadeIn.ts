import { useRef, useEffect, useState, useCallback } from 'react'
import { Animated } from 'react-native'
import { useMotionProfile } from '../profiles/MotionProfileContext'
import { getEasing, easeOut } from '../utils/easing'
import type { NativeMotionReturn, NativeMotionOptions } from './types'

export interface NativeFadeInOptions extends NativeMotionOptions {
  initialOpacity?: number
  targetOpacity?: number
}

export function useFadeIn(options: NativeFadeInOptions = {}): NativeMotionReturn {
  const profile = useMotionProfile()
  const {
    duration = profile.base.duration,
    delay = 0,
    easing = getEasing(profile.base.easing) || easeOut,
    autoStart = true,
    useNativeDriver = true,
    initialOpacity = profile.entrance.fade.initialOpacity,
    targetOpacity = 1,
    onComplete,
    onStart,
  } = options

  const opacity = useRef(new Animated.Value(initialOpacity)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  const start = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    onStart?.()

    animRef.current = Animated.timing(opacity, {
      toValue: targetOpacity,
      duration,
      delay,
      easing,
      useNativeDriver,
    })
    animRef.current.start(({ finished }) => {
      if (finished) {
        setIsVisible(true)
        setIsAnimating(false)
        setProgress(1)
        onComplete?.()
      }
    })
  }, [opacity, duration, delay, easing, useNativeDriver, targetOpacity, isAnimating, onStart, onComplete])

  const stop = useCallback(() => {
    animRef.current?.stop()
    setIsAnimating(false)
  }, [])

  const reset = useCallback(() => {
    animRef.current?.stop()
    opacity.setValue(initialOpacity)
    setIsAnimating(false)
    setIsVisible(false)
    setProgress(0)
  }, [opacity, initialOpacity])

  useEffect(() => {
    if (autoStart) start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  return {
    style: { opacity },
    isVisible,
    isAnimating,
    progress,
    start,
    stop,
    reset,
  }
}
