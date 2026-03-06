import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Animated } from 'react-native'
import { useMotionProfile } from '../profiles/MotionProfileContext'
import { getEasing, easeOut } from '../utils/easing'
import type { NativeMotionOptions } from './types'

export interface NativeStaggerOptions extends NativeMotionOptions {
  /** Number of items */
  count: number
  /** Delay between each item (ms) @default 100 */
  staggerDelay?: number
  /** Motion type @default 'fadeIn' */
  motionType?: 'fadeIn' | 'slideUp' | 'scaleIn'
  /** Slide distance (px, for slideUp) @default 20 */
  distance?: number
}

export interface NativeStaggerItem {
  style: {
    opacity: Animated.Value
    transform?: Array<{ translateY: Animated.Value } | { scale: Animated.Value }>
  }
}

export interface NativeStaggerReturn {
  items: NativeStaggerItem[]
  isVisible: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

export function useStagger(options: NativeStaggerOptions): NativeStaggerReturn {
  const profile = useMotionProfile()
  const {
    count,
    staggerDelay = profile.stagger.perItem,
    duration = profile.base.duration,
    easing = getEasing(profile.base.easing) || easeOut,
    autoStart = true,
    useNativeDriver = true,
    motionType = 'fadeIn',
    distance = profile.entrance.slide.distance,
    onComplete,
    onStart,
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  // Create animated values for each item (stable across renders)
  const animatedValues = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(distance),
      scale: new Animated.Value(0.8),
    }))
  ).current

  // Rebuild if count changes
  useEffect(() => {
    while (animatedValues.length < count) {
      animatedValues.push({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(distance),
        scale: new Animated.Value(0.8),
      })
    }
  }, [count, animatedValues, distance])

  const start = useCallback(() => {
    setIsVisible(false)
    onStart?.()

    const animations = animatedValues.slice(0, count).map((v) => {
      const itemAnims: Animated.CompositeAnimation[] = [
        Animated.timing(v.opacity, {
          toValue: 1,
          duration,
          easing,
          useNativeDriver,
        }),
      ]

      if (motionType === 'slideUp') {
        itemAnims.push(
          Animated.timing(v.translateY, {
            toValue: 0,
            duration,
            easing,
            useNativeDriver,
          })
        )
      } else if (motionType === 'scaleIn') {
        itemAnims.push(
          Animated.timing(v.scale, {
            toValue: 1,
            duration,
            easing,
            useNativeDriver,
          })
        )
      }

      return Animated.parallel(itemAnims)
    })

    animRef.current = Animated.stagger(staggerDelay, animations)
    animRef.current.start(({ finished }) => {
      if (finished) {
        setIsVisible(true)
        onComplete?.()
      }
    })
  }, [animatedValues, count, staggerDelay, duration, easing, useNativeDriver, motionType, onStart, onComplete])

  const stop = useCallback(() => {
    animRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    animRef.current?.stop()
    animatedValues.forEach((v) => {
      v.opacity.setValue(0)
      v.translateY.setValue(distance)
      v.scale.setValue(0.8)
    })
    setIsVisible(false)
  }, [animatedValues, distance])

  useEffect(() => {
    if (autoStart) start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  const items = useMemo<NativeStaggerItem[]>(() => {
    return animatedValues.slice(0, count).map((v) => {
      if (motionType === 'slideUp') {
        return { style: { opacity: v.opacity, transform: [{ translateY: v.translateY }] } }
      }
      if (motionType === 'scaleIn') {
        return { style: { opacity: v.opacity, transform: [{ scale: v.scale }] } }
      }
      return { style: { opacity: v.opacity } }
    })
  }, [animatedValues, count, motionType])

  return { items, isVisible, start, stop, reset }
}
