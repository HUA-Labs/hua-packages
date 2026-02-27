"use client"

import { useState, useEffect, useMemo, type CSSProperties } from 'react'

/** 오버슈트 바운스 — 타이틀, 강조 요소 */
const SPRING_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

export interface ClipRevealOptions {
  /** 시작 지연 시간 (ms) */
  delay?: number
  /** 애니메이션 지속 시간 (ms) */
  duration?: number
  /** CSS 이징 함수 */
  easing?: string
  /** 애니메이션 활성화 여부 (true가 되면 시작, 한 번만 실행) */
  active?: boolean
}

export interface ClipRevealReturn {
  /** overflow:hidden 컨테이너에 적용할 스타일 */
  containerStyle: CSSProperties
  /** 슬라이딩 텍스트에 적용할 스타일 */
  textStyle: CSSProperties
  /** 등장 완료 여부 */
  isVisible: boolean
}

/**
 * useClipReveal — overflow clip으로 텍스트가 아래→위로 등장
 *
 * 커버 타이틀, 히어로 헤드라인, 큰 문구에 적합.
 * 컨테이너에 overflow:hidden을 적용하고, 내부 텍스트가 translateY로 올라옴.
 *
 * @example
 * ```tsx
 * const { containerStyle, textStyle } = useClipReveal({ delay: 200, active: isInView })
 * return (
 *   <span style={containerStyle}>
 *     <span style={textStyle}>Hello World</span>
 *   </span>
 * )
 * ```
 */
export function useClipReveal(options: ClipRevealOptions = {}): ClipRevealReturn {
  const {
    delay = 0,
    duration = 900,
    easing = SPRING_EASING,
    active = true,
  } = options

  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (active && !triggered) {
      setTriggered(true)
    }
  }, [active, triggered])

  const containerStyle = useMemo<CSSProperties>(() => ({
    overflow: 'hidden',
    display: 'inline-block',
  }), [])

  const textStyle = useMemo<CSSProperties>(() => ({
    display: 'block',
    transform: triggered ? 'translateY(0)' : 'translateY(110%)',
    transition: `transform ${duration}ms ${easing} ${delay}ms`,
  }), [triggered, duration, easing, delay])

  return { containerStyle, textStyle, isVisible: triggered }
}
