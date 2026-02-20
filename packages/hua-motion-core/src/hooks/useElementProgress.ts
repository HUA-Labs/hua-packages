import { useState, useEffect, useRef } from 'react'
import { subscribeScroll } from '../utils/sharedScroll'

export interface ElementProgressOptions {
  /** 요소가 뷰포트 아래에서 시작되는 위치 (0 = 하단, 1 = 상단) @default 0 */
  start?: number
  /** 요소가 뷰포트 위에서 끝나는 위치 @default 1 */
  end?: number
  /** 클램프 여부 @default true */
  clamp?: boolean
}

export interface ElementProgressReturn<T extends HTMLElement = HTMLElement> {
  /** 대상 요소 ref */
  ref: React.RefObject<T | null>
  /** 요소의 스크롤 진행률 (0-1) */
  progress: number
  /** 요소가 뷰포트 안에 있는지 */
  isInView: boolean
}

/**
 * useElementProgress - 요소 단위 스크롤 진행률 훅
 *
 * useScrollProgress의 확장판. 페이지 전체가 아니라
 * 특정 요소가 뷰포트를 통과하는 진행률을 추적합니다.
 *
 * 공유 스크롤 리스너(subscribeScroll)를 사용해 N개 인스턴스도
 * 단 하나의 scroll/resize 이벤트 + rAF 배칭으로 처리됩니다.
 *
 * @example
 * ```tsx
 * const { ref, progress, isInView } = useElementProgress<HTMLDivElement>()
 * return (
 *   <div ref={ref} style={{ opacity: progress }}>
 *     Fades in as you scroll
 *   </div>
 * )
 * ```
 */
export function useElementProgress<T extends HTMLElement = HTMLElement>(
  options: ElementProgressOptions = {}
): ElementProgressReturn<T> {
  const { start = 0, end = 1, clamp = true } = options

  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)
  const [isInView, setIsInView] = useState(false)

  // Refs to avoid stale closure comparisons and skip redundant setState calls
  const progressRef = useRef(0)
  const isInViewRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return

    const calculate = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      // Element's center relative to viewport
      const elementTop = rect.top
      const elementBottom = rect.bottom

      // start=0 means tracking begins when element bottom enters viewport bottom
      // end=1 means tracking ends when element top exits viewport top
      const trackStart = vh * (1 - start)
      const trackEnd = vh * end * -1 + vh

      // Calculate raw progress
      const range = trackStart - trackEnd
      const raw = range > 0 ? (trackStart - elementTop) / range : 0

      const clamped = clamp ? Math.max(0, Math.min(1, raw)) : raw

      // Only update progress state when change exceeds threshold (avoids excessive renders)
      if (Math.abs(clamped - progressRef.current) > 0.005) {
        progressRef.current = clamped
        setProgress(clamped)
      }

      // Only update isInView state when it actually changes
      const nowInView = elementBottom > 0 && elementTop < vh
      if (nowInView !== isInViewRef.current) {
        isInViewRef.current = nowInView
        setIsInView(nowInView)
      }
    }

    // Run once immediately for initial state
    calculate()

    // Subscribe to shared scroll/resize listener (rAF-batched)
    return subscribeScroll(calculate)
  }, [start, end, clamp])

  return { ref, progress, isInView }
}
