// ========================================
// 2단계: usePageMotions (페이지 레벨) - 상태 관리자 버전
// ========================================

import { useRef, useEffect, useState, useCallback } from 'react'
import type { 
  PageMotionsConfig, 
  PageMotionElement, 
  MotionState, 
  PageMotionRef
} from '../types'
import { getMotionPreset, mergeWithPreset } from '../presets'
import { motionStateManager } from '../managers/MotionStateManager'

/**
 * 2단계 API: 페이지 레벨 모션 관리 (상태 관리자 버전)
 * 
 * 사용법:
 * ```typescript
 * const motions = usePageMotions({
 *   hero: { type: 'hero' },
 *   title: { type: 'title' },
 *   button: { type: 'button', hover: true, click: true }
 * })
 * ```
 */
export function usePageMotions(config: PageMotionsConfig) {
  const [motions, setMotions] = useState<Map<string, PageMotionRef>>(new Map())
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())
  const unsubscribeRef = useRef<Map<string, () => void>>(new Map())
  const [resetKey, setResetKey] = useState(0)

  // 리셋 함수
  const reset = useCallback(() => {
    // 기존 observer들 정리
    observersRef.current.forEach(observer => observer.disconnect())
    observersRef.current.clear()
    
    // 구독 해제
    unsubscribeRef.current.forEach(unsubscribe => unsubscribe())
    unsubscribeRef.current.clear()
    
    // 상태 관리자 리셋
    motionStateManager.reset()
    
    // 모션 상태 초기화
    setMotions(new Map())
    
    // 리셋 키 증가로 useEffect 재실행
    setResetKey(prev => prev + 1)
  }, [])

  // 모션 값 계산
  const calculateMotionValues = useCallback((
    state: MotionState, 
    elementConfig: PageMotionElement
  ) => {
    const preset = getMotionPreset(elementConfig.type)
    const mergedConfig = mergeWithPreset(preset, elementConfig)
    
    // 스크롤 리빌 모션 처리
    let opacity = state.finalVisibility ? 1 : 0
    let translateY = state.finalVisibility ? 0 : 20
    let translateX = 0
    let scale = state.finalVisibility ? 1 : 0.95

    // 호버 효과 (더 눈에 띄게)
    if (mergedConfig.hover && state.isHovered) {
      scale *= 1.1  // 10% 확대
      translateY -= 5  // 5px 위로
      opacity = 0.9  // 약간 투명도
    }

    // 클릭 효과 (더 눈에 띄게)
    if (mergedConfig.click && state.isClicked) {
      scale *= 0.9  // 10% 축소
      translateY += 3  // 3px 아래로
      opacity = 0.8  // 더 투명하게
    }

    return { opacity, translateY, translateX, scale }
  }, []) // 빈 의존성 배열로 고정

  // 모션 상태 업데이트
  const updateMotionState = useCallback((elementId: string, updates: Partial<MotionState>) => {
    const currentState = motionStateManager.getState(elementId)
    if (!currentState) return

    // 상태 관리자에 업데이트 적용
    if (updates.opacity !== undefined || updates.translateY !== undefined || 
        updates.translateX !== undefined || updates.scale !== undefined) {
      motionStateManager.updateMotionValues(elementId, updates)
    }

    if (updates.isHovered !== undefined) {
      currentState.isHovered = updates.isHovered
      // 호버 상태 변경 시 리스너들에게 알림
      motionStateManager.notifyListeners(elementId, currentState)
    }

    if (updates.isClicked !== undefined) {
      currentState.isClicked = updates.isClicked
      // 클릭 상태 변경 시 리스너들에게 알림
      motionStateManager.notifyListeners(elementId, currentState)
    }
  }, []) // 빈 의존성 배열로 고정

  // 모션 초기화
  useEffect(() => {
    const newMotions = new Map<string, PageMotionRef>()
    
    // config가 유효하지 않으면 early return
    if (!config || typeof config !== 'object') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('usePageMotions: config가 유효하지 않습니다:', config)
      }
      return
    }
    
    // 페이지별로 상태 관리자 초기화 (기존 상태 클리어)
    motionStateManager.reset()
    
    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const ref = { current: null }
      
      // 상태 관리자에 요소 초기화
      motionStateManager.initializeElement(elementId, elementConfig as any)
      
      // 초기 상태 가져오기
      const initialState = motionStateManager.getState(elementId)!
      if (process.env.NODE_ENV === 'development') {
        console.log(`초기 상태 [${elementId}]:`, initialState)
      }
      const { opacity, translateY, translateX, scale } = calculateMotionValues(initialState, elementConfig)

      newMotions.set(elementId, {
        ref,
        style: {
          opacity,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transition: `all ${elementConfig.duration || 700}ms ease-out`,
          pointerEvents: 'auto',
          willChange: 'transform, opacity'
        },
        isVisible: initialState.finalVisibility,
        isHovered: initialState.isHovered,
        isClicked: initialState.isClicked
      })

      // 상태 변경 리스너 등록
      const unsubscribe = motionStateManager.subscribe(elementId, (newState) => {
        const { opacity, translateY, translateX, scale } = calculateMotionValues(newState, elementConfig as any)
        
        setMotions(prev => {
          const current = prev.get(elementId)
          if (!current) return prev

          // 변경 감지: 실제로 값이 변경되었을 때만 업데이트
          const transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
          const hasChanged = 
            current.style.opacity !== opacity ||
            current.style.transform !== transform ||
            current.isVisible !== newState.finalVisibility ||
            current.isHovered !== newState.isHovered ||
            current.isClicked !== newState.isClicked

          // 변경이 없으면 이전 Map 반환 (불필요한 리렌더링 방지)
          if (!hasChanged) return prev

          const newMotion: PageMotionRef = {
            ...current,
            style: {
              ...current.style,
              opacity,
              transform
            },
            isVisible: newState.finalVisibility,
            isHovered: newState.isHovered,
            isClicked: newState.isClicked
          }

          // 변경된 항목만 업데이트하는 새 Map 생성
          const newMap = new Map(prev)
          newMap.set(elementId, newMotion)
          return newMap
        })
      })

      unsubscribeRef.current.set(elementId, unsubscribe)
    })

    setMotions(newMotions)

    // 클린업
    return () => {
      unsubscribeRef.current.forEach(unsubscribe => unsubscribe())
      unsubscribeRef.current.clear()
      // 페이지 언마운트 시 상태 관리자 클리어
      motionStateManager.reset()
    }
  }, [config, resetKey]) // resetKey 추가

  // Intersection Observer 설정
  useEffect(() => {
    const visibleElements = new Set<string>()

    // config가 유효하지 않으면 early return
    if (!config || typeof config !== 'object') {
      return
    }

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
                // 외부 트리거로 가시성 설정
                motionStateManager.setTriggeredVisibility(elementId, true)
                if (process.env.NODE_ENV === 'development') {
                  console.log('모션 실행:', elementId, 'delay:', delay)
                }
              }, delay)
              
              observer.unobserve(entry.target)
            }
          })
        },
        { 
          threshold: elementConfig.threshold || 0.3,  // 30% 보여야 실행
          rootMargin: '0px 0px -50px 0px'  // 하단에서 50px 전에 실행
        }
      )

      observersRef.current.set(elementId, observer)
    })

    // DOM이 렌더링된 후 observe 시작
    const timer = setTimeout(() => {
      // config가 유효하지 않으면 early return
      if (!config || typeof config !== 'object') {
        return
      }
      
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
  }, [config, resetKey]) // resetKey 추가

  // 이벤트 리스너 설정
  useEffect(() => {
    // config가 유효하지 않으면 early return
    if (!config || typeof config !== 'object') {
      return
    }
    
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-motion-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-motion-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.hover) {
        if (process.env.NODE_ENV === 'development') {
          console.log('호버 시작:', elementId)
        }
        updateMotionState(elementId, { isHovered: true })
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-motion-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-motion-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.hover) {
        if (process.env.NODE_ENV === 'development') {
          console.log('호버 종료:', elementId)
        }
        updateMotionState(elementId, { isHovered: false })
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-motion-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-motion-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.click) {
        if (process.env.NODE_ENV === 'development') {
          console.log('클릭 시작:', elementId)
        }
        updateMotionState(elementId, { isClicked: true })
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-motion-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-motion-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.click) {
        if (process.env.NODE_ENV === 'development') {
          console.log('클릭 종료:', elementId)
        }
        updateMotionState(elementId, { isClicked: false })
      }
    }

    // 이벤트 위임: bubble phase 사용 (capture phase보다 성능 우수)
    // 각 요소에 직접 등록하는 대신 document에 한 번만 등록하여 메모리 효율성 향상
    const timer = setTimeout(() => {
      document.addEventListener('mouseenter', handleMouseEnter, false)
      document.addEventListener('mouseleave', handleMouseLeave, false)
      document.addEventListener('mousedown', handleMouseDown, false)
      document.addEventListener('mouseup', handleMouseUp, false)
    }, 200)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseenter', handleMouseEnter, false)
      document.removeEventListener('mouseleave', handleMouseLeave, false)
      document.removeEventListener('mousedown', handleMouseDown, false)
      document.removeEventListener('mouseup', handleMouseUp, false)
    }
  }, [config]) // config 직접 사용 (참조 안정성)

  // 디버그 모드 (개발 환경에서만) - 제거됨
  // useEffect(() => {
  //   const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  //   
  //   if (isDevelopment) {
  //     const interval = setInterval(() => {
        //       motionStateManager.debug()
  //     }, 5000)
  // 
  //     return () => clearInterval(interval)
  //   }
  // }, [])

  // 모션 refs 반환
  const getPageMotionRefs = useCallback(() => {
    const result: Record<string, PageMotionRef> = {}
    motions.forEach((motion, elementId) => {
      result[elementId] = motion
    })
    return result
  }, [motions])

  return {
    ...getPageMotionRefs(),
    reset
  }
} 