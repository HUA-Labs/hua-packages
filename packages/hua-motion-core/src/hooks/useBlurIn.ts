"use client"

import { useState, useEffect, useMemo, type CSSProperties } from 'react'

/** 부드러운 감속 — 기본 */
const SMOOTH_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'

export interface BlurInOptions {
  /** 시작 지연 시간 (ms) */
  delay?: number
  /** 애니메이션 지속 시간 (ms) */
  duration?: number
  /** 초기 블러 강도 (px) */
  blurAmount?: number
  /** 초기 스케일 (0~1) */
  scale?: number
  /** CSS 이징 함수 */
  easing?: string
  /** 애니메이션 활성화 여부 (true가 되면 시작, 한 번만 실행) */
  active?: boolean
}

export interface BlurInReturn {
  /** 요소에 적용할 스타일 */
  style: CSSProperties
  /** 등장 완료 여부 */
  isVisible: boolean
}

/**
 * useBlurIn — 블러에서 선명하게 + 스케일 등장
 *
 * 인용구, 임팩트 문구, 핵심 메시지에 적합.
 * blur + scale + opacity 세 가지가 동시에 전환됨.
 *
 * @example
 * ```tsx
 * const { style } = useBlurIn({ blurAmount: 12, scale: 0.95, active: isInView })
 * return <blockquote style={style}>Deep insight here</blockquote>
 * ```
 */
export function useBlurIn(options: BlurInOptions = {}): BlurInReturn {
  const {
    delay = 0,
    duration = 1200,
    blurAmount = 12,
    scale = 0.95,
    easing = SMOOTH_EASING,
    active = true,
  } = options

  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (active && !triggered) {
      setTriggered(true)
    }
  }, [active, triggered])

  const style = useMemo<CSSProperties>(() => ({
    opacity: triggered ? 1 : 0,
    filter: triggered ? 'blur(0px)' : `blur(${blurAmount}px)`,
    transform: triggered ? 'scale(1)' : `scale(${scale})`,
    transition: [
      `opacity ${duration}ms ${easing} ${delay}ms`,
      `filter ${duration}ms ${easing} ${delay}ms`,
      `transform ${duration}ms ${easing} ${delay}ms`,
    ].join(', '),
  }), [triggered, duration, blurAmount, scale, easing, delay])

  return { style, isVisible: triggered }
}
