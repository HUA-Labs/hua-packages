// ========================================
// 2단계: usePageAnimations (페이지 레벨) - 상태 관리자 버전
// ========================================

import { useRef, useEffect, useState, useCallback } from 'react'
import type { 
  PageAnimationsConfig, 
  AnimationElement, 
  AnimationState, 
  AnimationRef 
} from '../types'
import { getAnimationPreset, mergeWithPreset } from '../presets'
import { animationStateManager } from '../managers/AnimationStateManager'

/**
 * 2단계 API: 페이지 레벨 애니메이션 관리 (상태 관리자 버전)
 * 
 * 사용법:
 * ```typescript
 * const animations = usePageAnimations({
 *   hero: { type: 'hero' },
 *   title: { type: 'title' },
 *   button: { type: 'button', hover: true, click: true }
 * })
 * ```
 */
export function usePageAnimations(config: PageAnimationsConfig) {
  const [animations, setAnimations] = useState<Map<string, AnimationRef>>(new Map())
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
    animationStateManager.reset()
    
    // 애니메이션 상태 초기화
    setAnimations(new Map())
    
    // 리셋 키 증가로 useEffect 재실행
    setResetKey(prev => prev + 1)
  }, [])

  // 애니메이션 값 계산
  const calculateAnimationValues = useCallback((
    state: AnimationState, 
    elementConfig: AnimationElement
  ) => {
    const preset = getAnimationPreset(elementConfig.type)
    const mergedConfig = mergeWithPreset(preset, elementConfig)
    
    // 스크롤 리빌 애니메이션 처리
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

  // 애니메이션 상태 업데이트
  const updateAnimationState = useCallback((elementId: string, updates: Partial<AnimationState>) => {
    const currentState = animationStateManager.getState(elementId)
    if (!currentState) return

    // 상태 관리자에 업데이트 적용
    if (updates.opacity !== undefined || updates.translateY !== undefined || 
        updates.translateX !== undefined || updates.scale !== undefined) {
      animationStateManager.updateAnimationValues(elementId, updates)
    }

    if (updates.isHovered !== undefined) {
      currentState.isHovered = updates.isHovered
      // 호버 상태 변경 시 리스너들에게 알림
      animationStateManager.notifyListeners(elementId, currentState)
    }

    if (updates.isClicked !== undefined) {
      currentState.isClicked = updates.isClicked
      // 클릭 상태 변경 시 리스너들에게 알림
      animationStateManager.notifyListeners(elementId, currentState)
    }
  }, []) // 빈 의존성 배열로 고정

  // 애니메이션 초기화
  useEffect(() => {
    const newAnimations = new Map<string, AnimationRef>()
    
    // 페이지별로 상태 관리자 초기화 (기존 상태 클리어)
    animationStateManager.reset()
    
    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const ref = { current: null }
      
      // 상태 관리자에 요소 초기화
      animationStateManager.initializeElement(elementId, elementConfig)
      
      // 초기 상태 가져오기
      const initialState = animationStateManager.getState(elementId)!
      console.log(`초기 상태 [${elementId}]:`, initialState)
      const { opacity, translateY, translateX, scale } = calculateAnimationValues(initialState, elementConfig)

      newAnimations.set(elementId, {
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
      const unsubscribe = animationStateManager.subscribe(elementId, (newState) => {
        const { opacity, translateY, translateX, scale } = calculateAnimationValues(newState, elementConfig)
        
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
            isVisible: newState.finalVisibility,
            isHovered: newState.isHovered,
            isClicked: newState.isClicked
          }

          const newMap = new Map(prev)
          newMap.set(elementId, newAnimation)
          return newMap
        })
      })

      unsubscribeRef.current.set(elementId, unsubscribe)
    })

    setAnimations(newAnimations)

    // 클린업
    return () => {
      unsubscribeRef.current.forEach(unsubscribe => unsubscribe())
      unsubscribeRef.current.clear()
      // 페이지 언마운트 시 상태 관리자 클리어
      animationStateManager.reset()
    }
  }, [config, resetKey]) // resetKey 추가

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
                // 외부 트리거로 가시성 설정
                animationStateManager.setTriggeredVisibility(elementId, true)
                console.log('애니메이션 실행:', elementId, 'delay:', delay)
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
  }, [config, resetKey]) // resetKey 추가

  // 이벤트 리스너 설정
  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-animation-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-animation-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      // elementId가 있을 때만 로그 출력
      if (elementId) {
        console.log('호버 시작:', elementId)
      }
      
      if (elementId && config[elementId]?.hover) {
        updateAnimationState(elementId, { isHovered: true })
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-animation-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-animation-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.hover) {
        console.log('호버 종료:', elementId)
        updateAnimationState(elementId, { isHovered: false })
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-animation-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-animation-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      // elementId가 있을 때만 로그 출력
      if (elementId && config[elementId]?.click) {
        console.log('클릭 시작:', elementId)
        updateAnimationState(elementId, { isClicked: true })
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return
      
      // data-animation-id를 가진 요소나 그 하위 요소에서 찾기
      let element: HTMLElement | null = target
      let elementId: string | null = null
      
      while (element && element !== document.body) {
        if (element.getAttribute && typeof element.getAttribute === 'function') {
          elementId = element.getAttribute('data-animation-id')
          if (elementId) break
        }
        element = element.parentElement
      }
      
      if (elementId && config[elementId]?.click) {
        console.log('클릭 종료:', elementId)
        updateAnimationState(elementId, { isClicked: false })
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mouseenter', handleMouseEnter, true)
      document.addEventListener('mouseleave', handleMouseLeave, true)
      document.addEventListener('mousedown', handleMouseDown, true)
      document.addEventListener('mouseup', handleMouseUp, true)
    }, 200)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      document.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('mouseup', handleMouseUp, true)
    }
  }, [config]) // config 직접 사용 (참조 안정성)

  // 디버그 모드 (개발 환경에서만) - 제거됨
  // useEffect(() => {
  //   const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  //   
  //   if (isDevelopment) {
  //     const interval = setInterval(() => {
  //       animationStateManager.debug()
  //     }, 5000)
  // 
  //     return () => clearInterval(interval)
  //   }
  // }, [])

  // 애니메이션 refs 반환
  const getAnimationRefs = useCallback(() => {
    const result: Record<string, AnimationRef> = {}
    animations.forEach((animation, elementId) => {
      result[elementId] = animation
    })
    return result
  }, [animations])

  return {
    ...getAnimationRefs(),
    reset
  }
} 