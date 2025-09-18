// ========================================
// 2단계: usePageMotions (페이지 레벨) - 고급 기능 포함
// ========================================

import { useRef, useEffect, useState, useCallback } from 'react'
import type { PageMotionsConfig, PageMotionElement, MotionRef } from '../types'
import { getMotionPreset, mergeWithPreset } from '../presets'

/**
 * 2단계 API: 페이지 레벨 모션 관리 (고급 기능 포함)
 * 
 * 1단계와의 차이점:
 * - 호버/클릭 인터랙션 지원
 * - 요소 간 상태 동기화
 * - 더 정교한 모션 제어
 * 
 * 사용법:
 * ```typescript
 * const motions = usePageMotions({
 *   hero: { type: 'hero', hover: true },
 *   title: { type: 'title' },
 *   button: { type: 'button', hover: true, click: true }
 * })
 * ```
 */
export function usePageMotions(config: PageMotionsConfig) {
  const [motions, setMotions] = useState<Map<string, MotionRef>>(new Map())
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)

  // 모션 값 계산 (2단계는 인터랙션 포함)
  const calculateMotionValues = useCallback((
    isVisible: boolean,
    elementConfig: PageMotionElement,
    isHovered: boolean = false,
    isClicked: boolean = false
  ) => {
    const preset = getMotionPreset(elementConfig.type)
    const mergedConfig = mergeWithPreset(preset, elementConfig)

    let opacity = isVisible ? 1 : 0
    let translateY = isVisible ? 0 : 20
    let translateX = 0
    let scale = isVisible ? 1 : 0.95

    // 2단계: 호버 효과
    if (mergedConfig.hover && isHovered) {
      scale *= 1.05
      translateY -= 2
    }

    // 2단계: 클릭 효과 - 더 명확한 시각적 피드백
    if (mergedConfig.click && isClicked) {
      scale *= 0.9  // 더 작게 축소
      translateY += 3  // 더 아래로 이동
      translateX = Math.random() * 4 - 2  // 약간의 흔들림 효과
    }

    return { opacity, translateY, translateX, scale }
  }, [])

  // 모션 초기화
  useEffect(() => {
    if (!config || typeof config !== 'object' || isInitialized) {
      return
    }

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
    setIsInitialized(true)
  }, [config, calculateMotionValues, isInitialized])

  // Intersection Observer 설정
  useEffect(() => {
    if (!isInitialized || !config || typeof config !== 'object') {
      return
    }

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
                
                console.log('2단계 모션 실행:', elementId, 'delay:', delay)
              }, delay)
              
              observer.unobserve(entry.target)
            }
          })
        },
        { 
          threshold: elementConfig.threshold || 0.3,
          rootMargin: '0px 0px -50px 0px'
        }
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
  }, [config, isInitialized, calculateMotionValues])

  // 2단계: 호버/클릭 이벤트 처리
  useEffect(() => {
    if (!isInitialized || !config || typeof config !== 'object') {
      return
    }

    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return

      // data-motion-id를 가진 요소 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        // 타입 가드 추가
        if (element && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-motion-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.hover) {
        setMotions(prev => {
          const current = prev.get(elementId!)
          if (!current) return prev

          const { opacity, translateY, translateX, scale } = calculateMotionValues(
            current.isVisible, 
            config[elementId!], 
            true, 
            current.isClicked
          )

          const newMotion: MotionRef = {
            ...current,
            style: {
              ...current.style,
              opacity,
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
            },
            isHovered: true
          }

          const newMap = new Map(prev)
          newMap.set(elementId!, newMotion)
          return newMap
        })
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return

      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        // 타입 가드 추가
        if (element && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-motion-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.hover) {
        setMotions(prev => {
          const current = prev.get(elementId!)
          if (!current) return prev

          const { opacity, translateY, translateX, scale } = calculateMotionValues(
            current.isVisible, 
            config[elementId!], 
            false, 
            current.isClicked
          )

          const newMotion: MotionRef = {
            ...current,
            style: {
              ...current.style,
              opacity,
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
            },
            isHovered: false
          }

          const newMap = new Map(prev)
          newMap.set(elementId!, newMotion)
          return newMap
        })
      }
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return

      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        // 타입 가드 추가
        if (element && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-motion-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.click) {
        setMotions(prev => {
          const current = prev.get(elementId!)
          if (!current) return prev

          const { opacity, translateY, translateX, scale } = calculateMotionValues(
            current.isVisible, 
            config[elementId!], 
            current.isHovered, 
            true
          )

          const newMotion: MotionRef = {
            ...current,
            style: {
              ...current.style,
              opacity,
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
            },
            isClicked: true
          }

          const newMap = new Map(prev)
          newMap.set(elementId!, newMotion)
          return newMap
        })

        // 클릭 효과는 잠시 후 원래대로
        setTimeout(() => {
          setMotions(prev => {
            const current = prev.get(elementId!)
            if (!current) return prev

            const { opacity, translateY, translateX, scale } = calculateMotionValues(
              current.isVisible, 
              config[elementId!], 
              current.isHovered, 
              false
            )

            const newMotion: MotionRef = {
              ...current,
              style: {
                ...current.style,
                opacity,
                transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
              },
              isClicked: false
            }

            const newMap = new Map(prev)
            newMap.set(elementId!, newMotion)
            return newMap
          })
        }, 150)
      }
    }

    // 이벤트 리스너 등록
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      document.removeEventListener('click', handleClick, true)
    }
  }, [config, isInitialized, calculateMotionValues])

  // 리셋 함수
  const reset = useCallback(() => {
    observersRef.current.forEach(observer => observer.disconnect())
    observersRef.current.clear()
    setMotions(new Map())
    setIsInitialized(false)
  }, [])

  // 모션 refs 반환
  const getMotionRefs = useCallback(() => {
    const result: Record<string, MotionRef> = {}
    motions.forEach((motion, elementId) => {
      result[elementId] = motion
    })
    return result
  }, [motions])

  // 명확한 반환 타입 정의
  const motionRefs = getMotionRefs()
  
  return {
    ...motionRefs,
    reset,
    // 타입 안전성을 위한 명시적 속성들
    getMotionRefs,
    getMotion: (elementId: string) => motionRefs[elementId]
  } as Record<string, MotionRef> & {
    reset: () => void
    getMotionRefs: () => Record<string, MotionRef>
    getMotion: (elementId: string) => MotionRef | undefined
  }
} 