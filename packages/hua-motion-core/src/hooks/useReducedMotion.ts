import { useState, useEffect } from 'react'
import { ReducedMotionReturn } from '../types'

/**
 * useReducedMotion - 모션 감소 설정 감지 훅
 * Reduced motion preference detection hook
 *
 * @description
 * 사용자의 prefers-reduced-motion 설정을 감지.
 * 접근성을 위해 모션을 줄이거나 비활성화할 때 사용.
 * Detects user's prefers-reduced-motion setting.
 * Used to reduce or disable motion for accessibility.
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion } = useReducedMotion()
 *
 * return (
 *   <motion.div
 *     animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
 *     transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
 *   >
 *     Accessible Motion
 *   </motion.div>
 * )
 * ```
 */
export function useReducedMotion(): ReducedMotionReturn {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // SSR 대응
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // 초기값 설정
    setPrefersReducedMotion(mediaQuery.matches)

    // 변경 감지
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return {
    prefersReducedMotion
  }
}
