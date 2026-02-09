import { useRef, useState, useEffect, useCallback } from 'react'
import { InViewOptions, InViewReturn } from '../types'

/**
 * useInView - 요소의 뷰포트 가시성 감지 훅
 * Viewport visibility detection hook
 *
 * @description
 * Intersection Observer를 사용하여 요소가 뷰포트에 보이는지 감지.
 * 스크롤 애니메이션, 레이지 로딩 등에 활용.
 * Detects whether an element is visible in the viewport using Intersection Observer.
 * Useful for scroll animations, lazy loading, etc.
 *
 * @example
 * ```tsx
 * const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true })
 *
 * return (
 *   <div ref={ref} style={{ opacity: inView ? 1 : 0 }}>
 *     {inView ? 'Visible!' : 'Not visible'}
 *   </div>
 * )
 * ```
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: InViewOptions = {}
): InViewReturn<T> {
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
    initialInView = false
  } = options

  const ref = useRef<T>(null)
  const [inView, setInView] = useState(initialInView)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const frozenRef = useRef(false)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [observerEntry] = entries

      if (frozenRef.current) return

      setEntry(observerEntry)
      setInView(observerEntry.isIntersecting)

      if (triggerOnce && observerEntry.isIntersecting) {
        frozenRef.current = true
      }
    },
    [triggerOnce]
  )

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, handleIntersect])

  return {
    ref,
    inView,
    entry
  }
}
