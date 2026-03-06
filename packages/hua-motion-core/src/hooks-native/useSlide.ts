import { useRef, useEffect, useState, useCallback } from 'react'
import { Animated } from 'react-native'
import { useMotionProfile } from '../profiles/MotionProfileContext'
import { getEasing, easeOut } from '../utils/easing'
import type { NativeMotionReturn, NativeMotionOptions } from './types'

export interface NativeSlideOptions extends NativeMotionOptions {
  distance?: number
}

type SlideDirection = 'up' | 'down' | 'left' | 'right'

function useSlideBase(direction: SlideDirection, options: NativeSlideOptions = {}): NativeMotionReturn {
  const profile = useMotionProfile()
  const {
    duration = profile.base.duration,
    delay = 0,
    easing = getEasing(profile.entrance.slide.easing) || easeOut,
    distance = profile.entrance.slide.distance,
    autoStart = true,
    useNativeDriver = true,
    onComplete,
    onStart,
  } = options

  const isVertical = direction === 'up' || direction === 'down'
  const sign = direction === 'up' || direction === 'left' ? 1 : -1
  const initialValue = sign * distance

  const translate = useRef(new Animated.Value(initialValue)).current
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
      Animated.timing(translate, {
        toValue: 0,
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
  }, [translate, opacity, duration, delay, easing, useNativeDriver, isAnimating, onStart, onComplete])

  const stop = useCallback(() => {
    animRef.current?.stop()
    setIsAnimating(false)
  }, [])

  const reset = useCallback(() => {
    animRef.current?.stop()
    translate.setValue(initialValue)
    opacity.setValue(0)
    setIsAnimating(false)
    setIsVisible(false)
    setProgress(0)
  }, [translate, opacity, initialValue])

  useEffect(() => {
    if (autoStart) start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  const style = isVertical
    ? { opacity, transform: [{ translateY: translate }] }
    : { opacity, transform: [{ translateX: translate }] }

  return {
    style,
    isVisible,
    isAnimating,
    progress,
    start,
    stop,
    reset,
  }
}

export function useSlideUp(options: NativeSlideOptions = {}): NativeMotionReturn {
  return useSlideBase('up', options)
}

export function useSlideDown(options: NativeSlideOptions = {}): NativeMotionReturn {
  return useSlideBase('down', options)
}

export function useSlideLeft(options: NativeSlideOptions = {}): NativeMotionReturn {
  return useSlideBase('left', options)
}

export function useSlideRight(options: NativeSlideOptions = {}): NativeMotionReturn {
  return useSlideBase('right', options)
}
