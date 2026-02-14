"use client"

import React, { useMemo } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useUnifiedMotion } from '../hooks/useUnifiedMotion'
import type { EntranceType, ScrollRevealOptions, MotionElement } from '../types'
import type { MotionEffects } from '../hooks/useUnifiedMotion'

type MotionAs = 'div' | 'span' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'nav'

export interface MotionProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML 요소 타입 @default 'div' */
  as?: MotionAs
  /** 모션 타입 */
  type?: EntranceType
  /** 멀티이펙트 */
  effects?: MotionEffects
  /** 스크롤 기반 reveal 모드 */
  scroll?: boolean | ScrollRevealOptions
  /** 딜레이 (ms) */
  delay?: number
  /** 지속시간 (ms) */
  duration?: number
  children: React.ReactNode
}

/**
 * Motion wrapper component
 *
 * ref/style 수동 연결 없이 모션을 적용하는 래퍼 컴포넌트.
 *
 * @example
 * // 기본 fadeIn
 * <Motion>content</Motion>
 *
 * // 스크롤 reveal
 * <Motion scroll delay={200} className="grid grid-cols-3">...</Motion>
 *
 * // 커스텀 요소 + 타입
 * <Motion as="section" type="slideUp" duration={800}>...</Motion>
 */
export function Motion({
  as: Component = 'div',
  type,
  effects,
  scroll,
  delay,
  duration,
  children,
  className,
  style: userStyle,
  ...rest
}: MotionProps) {
  // scroll 모드: useScrollReveal
  const scrollOptions = useMemo<ScrollRevealOptions | null>(() => {
    if (!scroll) return null
    const base = typeof scroll === 'object' ? scroll : {}
    return {
      ...base,
      ...(delay != null && { delay }),
      ...(duration != null && { duration }),
      ...(type != null && { motionType: type }),
    }
  }, [scroll, delay, duration, type])

  const scrollMotion = useScrollReveal(scrollOptions ?? { delay: 0 })

  // unified 모드: useUnifiedMotion
  const unifiedMotion = useUnifiedMotion({
    type: type ?? 'fadeIn',
    effects,
    delay,
    duration,
    autoStart: true,
  })

  const isScroll = scroll != null && scroll !== false
  const motion = isScroll ? scrollMotion : unifiedMotion

  const mergedStyle = useMemo(() => {
    if (!userStyle) return motion.style
    return { ...motion.style, ...userStyle }
  }, [motion.style, userStyle])

  return (
    <Component
      ref={motion.ref as React.Ref<any>}
      className={className}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  )
}
