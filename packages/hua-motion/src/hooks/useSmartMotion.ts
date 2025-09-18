// ========================================
// 3단계: useSmartMotion (개별 요소) - 완전한 제어
// ========================================

import { useRef, useEffect, useState, useCallback } from 'react'

type MotionType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'
type ElementType = 'hero' | 'title' | 'button' | 'card' | 'text' | 'image'

interface SmartMotionOptions {
  type?: ElementType
  entrance?: MotionType
  hover?: boolean
  click?: boolean
  delay?: number
  duration?: number
  threshold?: number
  autoLanguageSync?: boolean
}

interface SmartMotionState {
  isVisible: boolean
  isHovered: boolean
  isClicked: boolean
  opacity: number
  translateY: number
  translateX: number
  scale: number
}

/**
 * 3단계 API: 개별 요소 모션 (완전한 제어)
 * 
 * 1단계, 2단계와의 차이점:
 * - 개별 요소별 완전한 제어
 * - 커스텀 모션 타입 정의
 * - 실시간 상태 변경
 * - 언어 변경 감지 등 고급 기능
 * 
 * 사용법:
 * ```typescript
 * const heroRef = useSmartMotion({ type: 'hero' })
 * const titleRef = useSmartMotion({ type: 'title' })
 * const buttonRef = useSmartMotion({ type: 'button' })
 * ```
 */
export function useSmartMotion<T extends HTMLElement = HTMLDivElement>(options: SmartMotionOptions = {}): {
  ref: React.RefObject<T | null>;
  style: React.CSSProperties;
  isVisible: boolean;
  isHovered: boolean;
  isClicked: boolean;
} {
  const {
    type = 'text',
    entrance: customEntrance,
    hover: customHover,
    click: customClick,
    delay: customDelay,
    duration: customDuration,
    threshold = 0.1,
    autoLanguageSync = false
  } = options

  // 프리셋 설정
  const getPresetConfig = useCallback(() => {
    const presets = {
      hero: { entrance: 'fadeIn', delay: 200, duration: 800, hover: false, click: false },
      title: { entrance: 'slideUp', delay: 400, duration: 700, hover: false, click: false },
      button: { entrance: 'scaleIn', delay: 600, duration: 300, hover: true, click: true },
      card: { entrance: 'slideUp', delay: 800, duration: 500, hover: true, click: false },
      text: { entrance: 'fadeIn', delay: 200, duration: 600, hover: false, click: false },
      image: { entrance: 'scaleIn', delay: 400, duration: 600, hover: true, click: false }
    }
    return presets[type] || presets.text
  }, [type])

  const preset = getPresetConfig()

  // 프리셋과 커스텀 옵션 병합
  const entrance = customEntrance || preset.entrance
  const hover = customHover !== undefined ? customHover : preset.hover
  const click = customClick !== undefined ? customClick : preset.click
  const delay = customDelay !== undefined ? customDelay : preset.delay
  const duration = customDuration !== undefined ? customDuration : preset.duration

  const elementRef = useRef<T | null>(null)
  
  // 초기 모션 값 계산
  const getInitialMotionValues = () => {
    const initialState = {
      isVisible: false,
      isHovered: false,
      isClicked: false,
      opacity: 0,
      translateY: 0,
      translateX: 0,
      scale: 1
    }
    
    // 초기 상태에 맞는 모션 값 설정
    switch (entrance) {
      case 'fadeIn':
        initialState.opacity = 0
        break
      case 'slideUp':
        initialState.opacity = 0
        initialState.translateY = 20
        break
      case 'slideLeft':
        initialState.opacity = 0
        initialState.translateX = -20
        break
      case 'slideRight':
        initialState.opacity = 0
        initialState.translateX = 20
        break
      case 'scaleIn':
        initialState.opacity = 0
        initialState.scale = 0.8
        break
      case 'bounceIn':
        initialState.opacity = 0
        initialState.scale = 0.5
        break
    }
    
    return initialState
  }
  
  const [state, setState] = useState<SmartMotionState>(() => {
    const initialValues = getInitialMotionValues()
    // threshold가 0이면 즉시 visible로 설정
    if (threshold === 0) {
      initialValues.isVisible = true
      initialValues.opacity = 1
      initialValues.translateY = 0
      initialValues.translateX = 0
      initialValues.scale = 1
    }
    return initialValues
  })

  // 모션 값 계산 (3단계는 모든 상태 고려)
  const calculateMotionValues = useCallback((currentState: SmartMotionState) => {
    const { isVisible, isHovered, isClicked } = currentState
    
    let opacity = 0
    let translateY = 0
    let translateX = 0
    let scale = 1

    // 진입 모션
    if (isVisible) {
      opacity = 1
      
      switch (entrance) {
        case 'fadeIn':
          // 기본값 유지
          break
        case 'slideUp':
          translateY = 0
          break
        case 'slideLeft':
          translateX = 0
          break
        case 'slideRight':
          translateX = 0
          break
        case 'scaleIn':
          scale = 1
          break
        case 'bounceIn':
          scale = 1
          break
      }
    } else {
      // 초기 상태
      switch (entrance) {
        case 'fadeIn':
          opacity = 0
          break
        case 'slideUp':
          opacity = 0
          translateY = 20
          break
        case 'slideLeft':
          opacity = 0
          translateX = -20
          break
        case 'slideRight':
          opacity = 0
          translateX = 20
          break
        case 'scaleIn':
          opacity = 0
          scale = 0.8
          break
        case 'bounceIn':
          opacity = 0
          scale = 0.5
          break
      }
    }

    // 3단계: 고급 호버 효과
    if (hover && isHovered) {
      scale *= 1.1  // 더 큰 확대
      translateY -= 5  // 더 큰 이동
    }

    // 3단계: 고급 클릭 효과
    if (click && isClicked) {
      scale *= 0.85  // 더 큰 축소
      translateY += 3  // 더 큰 이동
    }

    return { opacity, translateY, translateX, scale }
  }, [entrance, hover, click])

  // Intersection Observer
  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setState(prev => ({ ...prev, isVisible: true }))
            }, delay)
          }
        })
      },
      { threshold }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [delay, threshold])

  // 3단계: 고급 호버 이벤트
  useEffect(() => {
    if (!hover || !elementRef.current) return

    const element = elementRef.current

    const handleMouseEnter = () => {
      setState(prev => ({ ...prev, isHovered: true }))
    }

    const handleMouseLeave = () => {
      setState(prev => ({ ...prev, isHovered: false }))
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hover])

  // 3단계: 고급 클릭 이벤트
  useEffect(() => {
    if (!click || !elementRef.current) return

    const element = elementRef.current

    const handleClick = () => {
      setState(prev => ({ ...prev, isClicked: true }))
      setTimeout(() => {
        setState(prev => ({ ...prev, isClicked: false }))
      }, 300)  // 더 긴 지속시간
    }

    element.addEventListener('click', handleClick)

    return () => {
      element.removeEventListener('click', handleClick)
    }
  }, [click])

  // 상태 변경 시 모션 값 업데이트 (무한 루프 방지)
  useEffect(() => {
    const { opacity, translateY, translateX, scale } = calculateMotionValues(state)
    setState(prev => ({ ...prev, opacity, translateY, translateX, scale }))
  }, [state.isVisible, state.isHovered, state.isClicked])

  // 3단계: 언어 변경 감지 (고급 기능)
  useEffect(() => {
    if (!autoLanguageSync) return

    const handleLanguageChange = () => {
      // 언어 변경 시 모션 재시작
      setState(prev => ({ ...prev, isVisible: false }))
      setTimeout(() => {
        setState(prev => ({ ...prev, isVisible: true }))
      }, 100)
    }

    // 간단한 언어 변경 감지 (실제로는 i18n 훅과 연동 필요)
    window.addEventListener('storage', handleLanguageChange)

    return () => {
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [autoLanguageSync])

  const motionStyle: React.CSSProperties = {
    opacity: state.opacity,
    transform: `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`,
    transition: `all ${duration}ms ease-out`,
    // CSS transition과 충돌 방지
    pointerEvents: 'auto',
    // 강제로 스타일 적용
    willChange: 'transform, opacity'
  }

  return {
    ref: elementRef,
    style: motionStyle,
    isVisible: state.isVisible,
    isHovered: state.isHovered,
    isClicked: state.isClicked
  }
} 