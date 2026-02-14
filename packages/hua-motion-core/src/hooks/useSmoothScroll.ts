import { useEffect, useRef, useCallback, useState } from 'react'

export interface SmoothScrollOptions {
  /** 활성화 여부 @default true */
  enabled?: boolean
  /** 스무딩 계수 (0-1, 낮을수록 부드러움) @default 0.1 */
  lerp?: number
  /** 마우스 휠 배율 @default 1 */
  wheelMultiplier?: number
  /** 터치 배율 @default 2 */
  touchMultiplier?: number
  /** 방향 @default 'vertical' */
  direction?: 'vertical' | 'horizontal'
  /** 콜백: 스크롤 값 변경 시 */
  onScroll?: (scroll: number) => void
}

export interface SmoothScrollReturn {
  /** 현재 스크롤 위치 (smoothed) */
  scroll: number
  /** 목표 스크롤 위치 */
  targetScroll: number
  /** 스크롤 진행률 (0-1) */
  progress: number
  /** 특정 위치로 스크롤 */
  scrollTo: (target: number | HTMLElement, options?: { offset?: number }) => void
  /** 스크롤 중지 */
  stop: () => void
}

/**
 * useSmoothScroll - 부드러운 스크롤 훅
 *
 * lenis 스타일의 smooth scrolling. 네이티브 스크롤을 가로채서
 * lerp 보간으로 부드러운 스크롤 경험을 제공합니다.
 *
 * @example
 * ```tsx
 * const { scroll, progress, scrollTo } = useSmoothScroll({ lerp: 0.08 })
 * return <button onClick={() => scrollTo(document.getElementById('section')!)}>Go</button>
 * ```
 */
export function useSmoothScroll(options: SmoothScrollOptions = {}): SmoothScrollReturn {
  const {
    enabled = true,
    lerp = 0.1,
    wheelMultiplier = 1,
    touchMultiplier = 2,
    direction = 'vertical',
    onScroll,
  } = options

  const [scroll, setScroll] = useState(0)
  const [progress, setProgress] = useState(0)

  const targetRef = useRef(0)
  const currentRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const touchStartRef = useRef(0)

  const getMaxScroll = useCallback(() => {
    if (typeof document === 'undefined') return 0
    return direction === 'vertical'
      ? document.documentElement.scrollHeight - window.innerHeight
      : document.documentElement.scrollWidth - window.innerWidth
  }, [direction])

  const clamp = useCallback((val: number) => {
    return Math.max(0, Math.min(val, getMaxScroll()))
  }, [getMaxScroll])

  // Animation loop
  const animate = useCallback(() => {
    const dx = targetRef.current - currentRef.current

    if (Math.abs(dx) < 0.5) {
      currentRef.current = targetRef.current
      setScroll(currentRef.current)
      isRunningRef.current = false
      return
    }

    currentRef.current += dx * lerp
    setScroll(currentRef.current)

    const max = getMaxScroll()
    setProgress(max > 0 ? currentRef.current / max : 0)
    onScroll?.(currentRef.current)

    // Apply to native scroll position
    if (direction === 'vertical') {
      window.scrollTo(0, currentRef.current)
    } else {
      window.scrollTo(currentRef.current, 0)
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [lerp, direction, getMaxScroll, onScroll])

  const startAnimation = useCallback(() => {
    if (isRunningRef.current) return
    isRunningRef.current = true
    rafRef.current = requestAnimationFrame(animate)
  }, [animate])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Prevent native smooth scrolling
    document.documentElement.style.scrollBehavior = 'auto'

    // Sync initial position
    currentRef.current = direction === 'vertical' ? window.scrollY : window.scrollX
    targetRef.current = currentRef.current

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = direction === 'vertical' ? e.deltaY : e.deltaX
      targetRef.current = clamp(targetRef.current + delta * wheelMultiplier)
      startAnimation()
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = direction === 'vertical'
        ? e.touches[0].clientY
        : e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      const current = direction === 'vertical'
        ? e.touches[0].clientY
        : e.touches[0].clientX
      const delta = (touchStartRef.current - current) * touchMultiplier
      touchStartRef.current = current
      targetRef.current = clamp(targetRef.current + delta)
      startAnimation()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.documentElement.style.scrollBehavior = ''
    }
  }, [enabled, direction, wheelMultiplier, touchMultiplier, clamp, startAnimation])

  const scrollTo = useCallback((target: number | HTMLElement, opts?: { offset?: number }) => {
    const offset = opts?.offset ?? 0
    if (typeof target === 'number') {
      targetRef.current = clamp(target + offset)
    } else {
      const rect = target.getBoundingClientRect()
      const pos = direction === 'vertical'
        ? rect.top + currentRef.current + offset
        : rect.left + currentRef.current + offset
      targetRef.current = clamp(pos)
    }
    startAnimation()
  }, [clamp, direction, startAnimation])

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    isRunningRef.current = false
    targetRef.current = currentRef.current
  }, [])

  return {
    scroll,
    targetScroll: targetRef.current,
    progress,
    scrollTo,
    stop,
  }
}
