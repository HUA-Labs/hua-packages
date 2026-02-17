// ========================================
// 1단계: useSimplePageMotion (프리셋 기반) - 기존 방식
// ========================================

import { useRef, useEffect, useState, useCallback } from 'react'
import type { PageType, PageMotionsConfig, PageMotionElement, PageMotionRef } from '../types'
import { getPagePreset, getMotionPreset, mergeWithPreset } from '../presets'

/**
 * 1단계 API: 프리셋 기반 페이지 모션 (기존 방식)
 * 
 * 사용법:
 * ```typescript
 * const motions = useSimplePageMotion('home')
 * ```
 * 
 * 지원하는 페이지 타입:
 * - 'home': 홈페이지
 * - 'dashboard': 대시보드
 * - 'product': 제품 페이지
 * - 'blog': 블로그
 */
export function useSimplePageMotion(pageType: PageType) {
  const config = getPagePreset(pageType)
  return useSimplePageMotions(config)
}

/**
 * 1단계 내부 구현: 간단한 페이지 모션 (상태 관리자 없음)
 */
function useSimplePageMotions(config: PageMotionsConfig) {
  const [motions, setMotions] = useState<Map<string, PageMotionRef>>(new Map())
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())

  // 모션 값 계산
    const calculateMotionValues = useCallback((
    isVisible: boolean,
    elementConfig: PageMotionElement
  ) => {
    const preset = getMotionPreset(elementConfig.type)
    const mergedConfig = mergeWithPreset(preset, elementConfig)
    
    const opacity = isVisible ? 1 : 0
    const translateY = isVisible ? 0 : 20
    const translateX = 0
    const scale = isVisible ? 1 : 0.95

    return { opacity, translateY, translateX, scale }
  }, [])

  // 모션 초기화
  useEffect(() => {
    const newMotions = new Map<string, PageMotionRef>()
    
    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const ref = { current: null }
      const { opacity, translateY, translateX, scale } = calculateMotionValues(false, elementConfig as any)

              newMotions.set(elementId, {
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

    setMotions(newMotions)
  }, [config, calculateMotionValues])

  // Intersection Observer 설정
  useEffect(() => {
    const visibleElements = new Set<string>()

    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !visibleElements.has(elementId)) {
              visibleElements.add(elementId)
              
              // 프리셋의 delay를 적용하여 모션 실행
              const preset = getMotionPreset(elementConfig.type)
              const mergedConfig = mergeWithPreset(preset, elementConfig)
              const delay = mergedConfig.delay || 0
              
              setTimeout(() => {
                const { opacity, translateY, translateX, scale } = calculateMotionValues(true, elementConfig as any)
                
                setMotions(prev => {
                  const current = prev.get(elementId)
                  if (!current) return prev

                  const newMotion: PageMotionRef = {
                    ...current,
                    style: {
                      ...current.style,
                      opacity,
                      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
                    },
                    isVisible: true
                  }

                  const newMap = new Map(prev)
                  newMap.set(elementId, newMotion)
                  return newMap
                })
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('모션 실행:', elementId, 'delay:', delay)
                }
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
          const element = document.querySelector(`[data-motion-id="${elementId}"]`)
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
  }, [config, calculateMotionValues])

  // 모션 refs 반환
  const getPageMotionRefs = useCallback(() => {
    const result: Record<string, PageMotionRef> = {}
    motions.forEach((motion, elementId) => {
      result[elementId] = motion
    })
    return result
  }, [motions])

  return getPageMotionRefs()
}

/**
 * 커스텀 페이지 모션 설정
 * 
 * 사용법:
 * ```typescript
 * const motions = useCustomPageMotion({
 *   hero: { type: 'hero' },
 *   title: { type: 'title' }
 * })
 * ```
 */
export function useCustomPageMotion(config: PageMotionsConfig) {
  return useSimplePageMotions(config)
} 