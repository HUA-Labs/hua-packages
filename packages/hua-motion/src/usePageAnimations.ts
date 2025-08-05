import { useRef, useEffect, useState, useCallback } from 'react'

type AnimationType = 'hero' | 'title' | 'button' | 'card' | 'text' | 'image'
type EntranceType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'

interface AnimationElement {
  type: AnimationType
  entrance?: EntranceType
  hover?: boolean
  click?: boolean
  delay?: number
  duration?: number
  threshold?: number
}

interface PageAnimationsConfig {
  [elementId: string]: AnimationElement
}

export interface AnimationRef {
  ref: React.RefObject<HTMLElement>
  style: React.CSSProperties
  isVisible: boolean
  isHovered: boolean
  isClicked: boolean
}

export function usePageAnimations(config: PageAnimationsConfig) {
  const [animations, setAnimations] = useState<Map<string, AnimationRef>>(new Map())
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())

  // 프리셋 설정
  const getPresetConfig = useCallback((type: AnimationType) => {
    const presets = {
      hero: { entrance: 'fadeIn', delay: 200, duration: 800, hover: false, click: false },
      title: { entrance: 'slideUp', delay: 400, duration: 700, hover: false, click: false },
      button: { entrance: 'scaleIn', delay: 600, duration: 300, hover: true, click: true },
      card: { entrance: 'slideUp', delay: 800, duration: 500, hover: true, click: false },
      text: { entrance: 'fadeIn', delay: 200, duration: 600, hover: false, click: false },
      image: { entrance: 'scaleIn', delay: 400, duration: 600, hover: true, click: false }
    }
    return presets[type] || presets.text
  }, [])

  // 애니메이션 값 계산
  const calculateAnimationValues = useCallback((
    state: { isVisible: boolean; isHovered: boolean; isClicked: boolean },
    config: AnimationElement
  ) => {
    const { isVisible, isHovered, isClicked } = state
    const preset = getPresetConfig(config.type)
    const finalConfig = { ...preset, ...config }
    
    let opacity = 0
    let translateY = 0
    let translateX = 0
    let scale = 1

    // 진입 애니메이션
    if (isVisible) {
      opacity = 1
      
      switch (finalConfig.entrance) {
        case 'fadeIn':
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
      switch (finalConfig.entrance) {
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

    // 호버 효과
    if (finalConfig.hover && isHovered) {
      scale *= 1.1
      translateY -= 5
    }

    // 클릭 효과
    if (finalConfig.click && isClicked) {
      scale *= 0.85
      translateY += 3
    }

    return { opacity, translateY, translateX, scale }
  }, [getPresetConfig])

  // 애니메이션 상태 업데이트
  const updateAnimationState = useCallback((elementId: string, updates: Partial<{
    isVisible: boolean
    isHovered: boolean
    isClicked: boolean
  }>) => {
    setAnimations(prev => {
      const current = prev.get(elementId)
      if (!current) return prev

      const newState = {
        isVisible: updates.isVisible ?? current.isVisible,
        isHovered: updates.isHovered ?? current.isHovered,
        isClicked: updates.isClicked ?? current.isClicked
      }

      const elementConfig = config[elementId]
      const { opacity, translateY, translateX, scale } = calculateAnimationValues(newState, elementConfig)

      const newAnimation: AnimationRef = {
        ref: current.ref,
        style: {
          opacity,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transition: `all ${elementConfig.duration || 700}ms ease-out`,
          pointerEvents: 'auto',
          willChange: 'transform, opacity'
        },
        ...newState
      }

      const newMap = new Map(prev)
      newMap.set(elementId, newAnimation)
      return newMap
    })
  }, [config, calculateAnimationValues])

  // 애니메이션 초기화
  useEffect(() => {
    const newAnimations = new Map<string, AnimationRef>()

    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const ref = { current: null } as React.RefObject<HTMLElement>
      
      newAnimations.set(elementId, {
        ref,
        style: {
          opacity: 0,
          transform: 'translate(0px, 0px) scale(1)',
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
  }, [config])

  // Intersection Observer 설정
  useEffect(() => {
    const observers = new Map<string, IntersectionObserver>()

    Object.entries(config).forEach(([elementId, elementConfig]) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                updateAnimationState(elementId, { isVisible: true })
              }, elementConfig.delay || 0)
            }
          })
        },
        { threshold: elementConfig.threshold || 0.1 }
      )

      observers.set(elementId, observer)
    })

    observersRef.current = observers

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [config, updateAnimationState])

  // 이벤트 리스너 설정
  useEffect(() => {
    const handleMouseEnter = (elementId: string) => {
      const elementConfig = config[elementId]
      if (elementConfig.hover) {
        updateAnimationState(elementId, { isHovered: true })
      }
    }

    const handleMouseLeave = (elementId: string) => {
      const elementConfig = config[elementId]
      if (elementConfig.hover) {
        updateAnimationState(elementId, { isHovered: false })
      }
    }

    const handleClick = (elementId: string) => {
      const elementConfig = config[elementId]
      if (elementConfig.click) {
        updateAnimationState(elementId, { isClicked: true })
        setTimeout(() => {
          updateAnimationState(elementId, { isClicked: false })
        }, 300)
      }
    }

    // DOM 요소에 이벤트 리스너 추가
    const addEventListeners = () => {
      Object.keys(config).forEach(elementId => {
        const element = document.querySelector(`[data-animation-id="${elementId}"]`) as HTMLElement
        if (element) {
          const elementConfig = config[elementId]
          
          if (elementConfig.hover) {
            element.addEventListener('mouseenter', () => handleMouseEnter(elementId))
            element.addEventListener('mouseleave', () => handleMouseLeave(elementId))
          }
          
          if (elementConfig.click) {
            element.addEventListener('click', () => handleClick(elementId))
          }
        }
      })
    }

    // DOM이 준비되면 이벤트 리스너 추가
    setTimeout(addEventListeners, 0)

    return () => {
      // cleanup은 필요시 추가
    }
  }, [config, updateAnimationState])

  // 애니메이션 ref들을 객체로 반환
  const getAnimationRefs = useCallback(() => {
    const refs: Record<string, AnimationRef> = {}
    animations.forEach((animation, elementId) => {
      refs[elementId] = animation
    })
    return refs
  }, [animations])

  return getAnimationRefs()
} 