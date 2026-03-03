"use client"

import { useState, useEffect } from "react"

/** Breakpoint thresholds (Tailwind defaults) */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * useBreakpoint — 현재 뷰포트에 맞는 breakpoint 반환
 *
 * dot()의 breakpoint 옵션과 함께 사용하여 반응형 인라인 스타일 적용.
 * SSR에서는 기본값 'lg' 반환 (데스크톱 우선).
 *
 * @example
 * const bp = useBreakpoint()
 * const styles = dot('p-4 sm:p-6 lg:p-8', { breakpoint: bp })
 */
export function useBreakpoint(): Breakpoint | undefined {
  const [bp, setBp] = useState<Breakpoint | undefined>(
    typeof window !== 'undefined' ? getBreakpoint() : 'lg' // SSR default
  )

  useEffect(() => {
    const check = () => setBp(getBreakpoint())
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return bp
}

function getBreakpoint(): Breakpoint | undefined {
  const w = window.innerWidth
  if (w >= BREAKPOINTS['2xl']) return '2xl'
  if (w >= BREAKPOINTS.xl) return 'xl'
  if (w >= BREAKPOINTS.lg) return 'lg'
  if (w >= BREAKPOINTS.md) return 'md'
  if (w >= BREAKPOINTS.sm) return 'sm'
  return undefined
}
