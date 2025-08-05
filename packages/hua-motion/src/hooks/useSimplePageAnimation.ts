// ========================================
// 1단계: useSimplePageAnimation (프리셋 기반) - 기존 방식
// ========================================

import { useRef, useEffect, useState, useCallback } from 'react'
import type { PageType, PageAnimationsConfig, AnimationElement, AnimationRef } from '../types'
import { getPagePreset, getAnimationPreset, mergeWithPreset } from '../presets'

/**
 * 1단계 API: 프리셋 기반 페이지 애니메이션 (기존 방식)
 * 
 * 사용법:
 * ```typescript
 * const animations = useSimplePageAnimation('home')
 * ```
 * 
 * 지원하는 페이지 타입:
 * - 'home': 홈페이지
 * - 'dashboard': 대시보드
 * - 'product': 제품 페이지
 * - 'blog': 블로그
 */
export function useSimplePageAnimation(pageType: PageType) {
  const config = getPagePreset(pageType)
  return useSimplePageAnimations(config)
}

/**
 * 1단계 내부 구현: 간단한 페이지 애니메이션 (상태 관리자 없음)
 */
function useSimplePageAnimations(config: PageAnimationsConfig) {
  const [animations, setAnimations] = useState<Map<string, AnimationRef>>(new Map())
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())

  // 애니메이션 값 계산
  const calculateAnimationValues = useCallback((
    isVisible: boolean, 
    elementConfig: AnimationElement
  ) => {
    const preset = getAnimationPreset(elementConfig.type)
    const mergedConfig = mergeWithPreset(preset, elementConfig)
    
    let opacity = isVisible ? 1 : 0
    let translateY = isVisible ? 0 : 20
    let translateX = 0
    let scale = isVisible ? 1 : 0.95

    return { opacity, translateY, translateX, scale }
  }, [])

  // 애니메이션 초기화
  useEffect(() => {
    const newAnimations = new Map<string, AnimationRef>()
    
    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const ref = { current: null }
      const { opacity, translateY, translateX, scale } = calculateAnimationValues(false, elementConfig)

      newAnimations.set(elementId, {
        ref,
        style: {
          opacity,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transition: `all ${elementConfig.duration || 700}ms ease-out`,
          pointerEvents: 'auto',
          willChange: 'transform, opacity'
        },
        isVisible: false,
        isHovered: false,
        isClicked: false
      })
    })

    setAnimations(newAnimations)
  }, [config, calculateAnimationValues])

  // Intersection Observer 설정
  useEffect(() => {
    const visibleElements = new Set<string>()

    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !visibleElements.has(elementId)) {
              visibleElements.add(elementId)
              
              // 프리셋의 delay를 적용하여 애니메이션 실행
              const preset = getAnimationPreset(elementConfig.type)
              const mergedConfig = mergeWithPreset(preset, elementConfig)
              const delay = mergedConfig.delay || 0
              
              setTimeout(() => {
                const { opacity, translateY, translateX, scale } = calculateAnimationValues(true, elementConfig)
                
                setAnimations(prev => {
                  const current = prev.get(elementId)
                  if (!current) return prev

                  const newAnimation: AnimationRef = {
                    ...current,
                    style: {
                      ...current.style,
                      opacity,
                      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
                    },
                    isVisible: true
                  }

                  const newMap = new Map(prev)
                  newMap.set(elementId, newAnimation)
                  return newMap
                })
                
                console.log('애니메이션 실행:', elementId, 'delay:', delay)
              }, delay)
              
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: elementConfig.threshold || 0.1 }
      )

      observersRef.current.set(elementId, observer)
    })

    // DOM이 렌더링된 후 observe 시작
    const timer = setTimeout(() => {
      Object.entries(config).forEach(([elementId]) => {
        const observer = observersRef.current.get(elementId)
        if (observer) {
          const element = document.querySelector(`[data-animation-id="${elementId}"]`)
          if (element) {
            observer.observe(element)
          }
        }
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observersRef.current.forEach(observer => observer.disconnect())
      observersRef.current.clear()
    }
  }, [config, calculateAnimationValues])

  // 애니메이션 refs 반환
  const getAnimationRefs = useCallback(() => {
    const result: Record<string, AnimationRef> = {}
    animations.forEach((animation, elementId) => {
      result[elementId] = animation
    })
    return result
  }, [animations])

  return getAnimationRefs()
}

/**
 * 커스텀 페이지 애니메이션 설정
 * 
 * 사용법:
 * ```typescript
 * const animations = useCustomPageAnimation({
 *   hero: { type: 'hero' },
 *   title: { type: 'title' }
 * })
 * ```
 */
export function useCustomPageAnimation(config: PageAnimationsConfig) {
  return useSimplePageAnimations(config)
} 