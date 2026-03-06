import { useRef, useEffect, useState, useCallback } from 'react'
import { Animated } from 'react-native'
import { useMotionProfile } from '../profiles/MotionProfileContext'
import type { NativeMotionOptions } from './types'

export interface NativeSpringMotionOptions extends NativeMotionOptions {
  from: number
  to: number
  friction?: number
  tension?: number
  enabled?: boolean
}

export interface NativeSpringMotionReturn {
  value: Animated.Value
  isAnimating: boolean
  start: () => void
  stop: () => void
  reset: () => void
  animateTo: (toValue: number) => void
}

export function useSpringMotion(options: NativeSpringMotionOptions): NativeSpringMotionReturn {
  const profile = useMotionProfile()
  const {
    from,
    to,
    friction = Math.sqrt(4 * profile.spring.mass * profile.spring.stiffness) / (2 * profile.spring.damping) * 10 || 26,
    tension = profile.spring.stiffness / 2 || 170,
    autoStart = true,
    useNativeDriver = true,
    enabled = true,
    onComplete,
    onStart,
  } = options

  const value = useRef(new Animated.Value(from)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  const animateTo = useCallback((toValue: number) => {
    if (!enabled) return
    setIsAnimating(true)
    onStart?.()

    animRef.current?.stop()
    animRef.current = Animated.spring(value, {
      toValue,
      friction,
      tension,
      useNativeDriver,
    })
    animRef.current.start(({ finished }) => {
      if (finished) {
        setIsAnimating(false)
        onComplete?.()
      }
    })
  }, [value, friction, tension, useNativeDriver, enabled, onStart, onComplete])

  const start = useCallback(() => {
    animateTo(to)
  }, [animateTo, to])

  const stop = useCallback(() => {
    animRef.current?.stop()
    setIsAnimating(false)
  }, [])

  const reset = useCallback(() => {
    animRef.current?.stop()
    value.setValue(from)
    setIsAnimating(false)
  }, [value, from])

  useEffect(() => {
    if (autoStart && enabled) start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  return { value, isAnimating, start, stop, reset, animateTo }
}
