import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { RepeatOptions, BaseMotionReturn, MotionElement } from '../types'

export function useRepeat<T extends MotionElement = HTMLDivElement>(
  options: RepeatOptions = {}
): BaseMotionReturn<T> & { isAnimating: boolean } {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    type = 'pulse',
    intensity = 0.1
  } = options

  const ref = useRef<T>(null)
  const [scale, setScale] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)

  // 타이머 ID들을 ref로 관리하여 cleanup 보장
  const animationTimers = useRef<number[]>([])
  const isRunning = useRef(false)

  const clearAllTimers = useCallback(() => {
    animationTimers.current.forEach(id => clearTimeout(id))
    animationTimers.current = []
  }, [])

  const addTimer = useCallback((callback: () => void, ms: number): number => {
    const id = window.setTimeout(callback, ms)
    animationTimers.current.push(id)
    return id
  }, [])

  const animate = useCallback(() => {
    if (!isRunning.current) return

    setIsAnimating(true)
    setProgress(0)

    switch (type) {
      case 'pulse':
        setScale(1 + intensity)
        addTimer(() => {
          if (!isRunning.current) return
          setScale(1)
          setProgress(0.5)
        }, duration / 2)
        break
      case 'bounce':
        setScale(1 + intensity)
        addTimer(() => {
          if (!isRunning.current) return
          setScale(1 - intensity)
          setProgress(0.33)
        }, duration / 3)
        addTimer(() => {
          if (!isRunning.current) return
          setScale(1)
          setProgress(0.66)
        }, duration)
        break
      case 'wave':
        setScale(1 + intensity)
        addTimer(() => {
          if (!isRunning.current) return
          setScale(1 - intensity)
          setProgress(0.5)
        }, duration / 2)
        addTimer(() => {
          if (!isRunning.current) return
          setScale(1)
          setProgress(0.75)
        }, duration)
        break
      case 'fade':
        setOpacity(0.5)
        addTimer(() => {
          if (!isRunning.current) return
          setOpacity(1)
          setProgress(0.5)
        }, duration / 2)
        break
    }

    // 1사이클 완료 후 다음 반복
    addTimer(() => {
      if (!isRunning.current) return
      setProgress(1)
      setIsAnimating(false)
      // 다음 반복 시작
      animate()
    }, duration)
  }, [type, intensity, duration, addTimer])

  const start = useCallback(() => {
    isRunning.current = true
    clearAllTimers()
    if (delay > 0) {
      addTimer(() => animate(), delay)
    } else {
      animate()
    }
  }, [delay, animate, clearAllTimers, addTimer])

  const stop = useCallback(() => {
    isRunning.current = false
    clearAllTimers()
    setIsAnimating(false)
    setScale(1)
    setOpacity(1)
    setProgress(0)
  }, [clearAllTimers])

  const reset = useCallback(() => {
    stop()
  }, [stop])

  useEffect(() => {
    if (autoStart) {
      start()
    }
    return () => {
      isRunning.current = false
      clearAllTimers()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const style = useMemo(() => ({
    transform: `scale(${scale})`,
    opacity,
    transition: `transform ${duration / 2}ms ease-in-out, opacity ${duration / 2}ms ease-in-out`
  }), [scale, opacity, duration])

  return {
    ref,
    isVisible: true,
    isAnimating,
    style,
    progress,
    start,
    stop,
    reset
  }
}
