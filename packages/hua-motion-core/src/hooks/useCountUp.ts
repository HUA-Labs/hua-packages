"use client"

import { useState, useEffect, useRef } from 'react'

export interface CountUpOptions {
  /** 목표 숫자 */
  end: number
  /** 숫자 뒤에 붙는 접미사 (%, +, 명 등) */
  suffix?: string
  /** 애니메이션 지속 시간 (ms) */
  duration?: number
  /** 시작 지연 시간 (ms) */
  delay?: number
  /** 애니메이션 활성화 여부 (true가 되면 시작, 한 번만 실행) */
  active?: boolean
}

export interface CountUpReturn {
  /** 현재 숫자 값 */
  value: number
  /** 접미사 포함 표시 문자열 */
  display: string
}

/**
 * useCountUp — 숫자 카운트업 애니메이션
 *
 * 통계, 대시보드, 메트릭 수치 강조에 적합.
 * ease-out cubic 이징으로 자연스러운 감속 효과.
 *
 * @example
 * ```tsx
 * const { display } = useCountUp({ end: 1200, suffix: '+', active: isInView })
 * return <span>{display}</span>
 * ```
 */
export function useCountUp(options: CountUpOptions): CountUpReturn {
  const {
    end,
    suffix = '',
    duration = 1500,
    delay = 0,
    active = true,
  } = options

  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!active || startedRef.current) return

    const timer = setTimeout(() => {
      startedRef.current = true
      const startTime = performance.now()

      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * end))
        if (progress < 1) requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [active, end, duration, delay])

  return { value, display: `${value}${suffix}` }
}
