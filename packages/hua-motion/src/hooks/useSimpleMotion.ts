// ========================================
// 1단계: useSimpleMotion (프리셋 기반) - 간단한 버전
// ========================================

import { useRef, useEffect, useState, useCallback } from 'react'
import type { PageType, PageMotionsConfig, PageMotionElement, MotionRef } from '../types'
import { getPagePreset, getMotionPreset, mergeWithPreset } from '../presets'

/**
 * 1단계 API: 프리셋 기반 모션 (간단한 버전)
 * 
 * 사용법:
 * ```typescript
 * const motions = useSimpleMotion('home')
 * ```
 * 
 * 지원하는 페이지 타입:
 * - 'home': 홈페이지
 * - 'dashboard': 대시보드
 * - 'product': 제품 페이지
 * - 'blog': 블로그
 */
export function useSimpleMotion(pageType: PageType) {
  const config = getPagePreset(pageType)
  return useSimpleMotions(config)
}

/**
 * 1단계 내부 구현: 간단한 모션 (기본 모션만)
 */
function useSimpleMotions(config: PageMotionsConfig) {
  const [motions, setMotions] = useState<Map<string, MotionRef>>(new Map())
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())

  // 모션 값 계산 (1단계는 기본 모션만)
  const calculateMotionValues = useCallback((
    isVisible: boolean,
    elementConfig: PageMotionElement
  ) => {
    const preset = getMotionPreset(elementConfig.type)
    const mergedConfig = mergeWithPreset(preset, elementConfig)
    
    // 1단계는 기본 진입 모션만
    let opacity = isVisible ? 1 : 0
    let translateY = isVisible ? 0 : 20
    let translateX = 0
    let scale = isVisible ? 1 : 0.95

    return { opacity, translateY, translateX, scale }
  }, [])

  // 모션 초기화
  useEffect(() => {
    const newMotions = new Map<string, MotionRef>()
    
    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const ref = { current: null }
      const { opacity, translateY, translateX, scale } = calculateMotionValues(false, elementConfig)

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

  // Intersection Observer 설정 (1단계는 기본 진입만)
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
                const { opacity, translateY, translateX, scale } = calculateMotionValues(true, elementConfig)
                
                setMotions(prev => {
                  const current = prev.get(elementId)
                  if (!current) return prev

                  const newMotion: MotionRef = {
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
                
                console.log('1단계 모션 실행:', elementId, 'delay:', delay)
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
  const getMotionRefs = useCallback(() => {
    const result: Record<string, MotionRef> = {}
    motions.forEach((motion, elementId) => {
      result[elementId] = motion
    })
    return result
  }, [motions])

  return getMotionRefs()
}

/**
 * 커스텀 모션 설정 (1단계 수준)
 */
export function useCustomMotion(config: PageMotionsConfig) {
  return useSimpleMotions(config)
} 