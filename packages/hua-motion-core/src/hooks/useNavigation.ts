import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface NavigationOptions extends BaseMotionOptions {
  // 네비게이션 타입
  type?: 'slide' | 'fade' | 'scale' | 'rotate' | 'custom'
  
  // 슬라이드 방향 (slide 타입일 때)
  slideDirection?: 'left' | 'right' | 'up' | 'down'
  
  // 메뉴 아이템 애니메이션
  staggerDelay?: number
  itemScale?: number
  itemOpacity?: number
  itemRotate?: number
  itemTranslateY?: number
  itemTranslateX?: number
  
  // 초기 상태
  initialScale?: number
  initialOpacity?: number
  initialRotate?: number
  initialTranslateY?: number
  initialTranslateX?: number
  
  // 활성 상태
  activeScale?: number
  activeOpacity?: number
  activeRotate?: number
  activeTranslateY?: number
  activeTranslateX?: number
  
  // 호버 상태
  hoverScale?: number
  hoverOpacity?: number
  hoverRotate?: number
  hoverTranslateY?: number
  hoverTranslateX?: number
  
  // 메뉴 아이템 개수
  itemCount?: number
  
  // 자동 시작
  autoStart?: boolean
}

export function useNavigation<T extends MotionElement = HTMLDivElement>(
  options: NavigationOptions = {}
): BaseMotionReturn<T> & {
  isOpen: boolean
  activeIndex: number
  itemStyles: React.CSSProperties[]
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  setActiveItem: (index: number) => void
  goToNext: () => void
  goToPrevious: () => void
} {
  const {
    duration = 300,
    easing = 'ease-out',
    type = 'slide',
    slideDirection = 'left',
    staggerDelay = 50,
    itemScale = 1,
    itemOpacity = 1,
    itemRotate = 0,
    itemTranslateY = 0,
    itemTranslateX = 0,
    initialScale = 0.8,
    initialOpacity = 0,
    initialRotate = -10,
    initialTranslateY = 20,
    initialTranslateX = 0,
    activeScale = 1.05,
    activeOpacity = 1,
    activeRotate = 0,
    activeTranslateY = 0,
    activeTranslateX = 0,
    hoverScale = 1.1,
    hoverOpacity = 1,
    hoverRotate = 5,
    hoverTranslateY = -5,
    hoverTranslateX = 0,
    itemCount = 5,
    autoStart = false,
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // 메뉴 열기 함수
  const openMenu = useCallback(() => {
    if (isOpen) return

    setIsOpen(true)
    setIsAnimating(true)
    setProgress(0)
    onStart?.()

    // 순차적으로 아이템들 나타나기
    const totalDuration = itemCount * staggerDelay + duration
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.1
        if (newProgress >= 1) {
          setIsAnimating(false)
          onComplete?.()
          clearInterval(interval)
          return 1
        }
        return newProgress
      })
    }, totalDuration / 10)
  }, [isOpen, itemCount, staggerDelay, duration, onStart, onComplete])

  // 메뉴 닫기 함수
  const closeMenu = useCallback(() => {
    if (!isOpen) return

    setIsOpen(false)
    setIsAnimating(true)
    setProgress(1)

    setTimeout(() => {
      setIsAnimating(false)
      setProgress(0)
    }, duration)
  }, [isOpen, duration])

  // 메뉴 토글 함수
  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  }, [isOpen, openMenu, closeMenu])

  // 활성 아이템 설정 함수
  const setActiveItem = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      setActiveIndex(index)
    }
  }, [itemCount])

  // 다음 아이템으로 이동
  const goToNext = useCallback(() => {
    setActiveItem((activeIndex + 1) % itemCount)
  }, [activeIndex, itemCount, setActiveItem])

  // 이전 아이템으로 이동
  const goToPrevious = useCallback(() => {
    setActiveItem(activeIndex === 0 ? itemCount - 1 : activeIndex - 1)
  }, [activeIndex, itemCount, setActiveItem])

  // 모션 시작 함수
  const start = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true)
      openMenu()
    }
  }, [isVisible, openMenu])

  // 모션 중단 함수
  const stop = useCallback(() => {
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    setIsOpen(false)
    setActiveIndex(0)
    setHoveredIndex(null)
    onReset?.()
  }, [onReset])

  // 모션 일시정지 함수
  const pause = useCallback(() => {
    setIsAnimating(false)
  }, [])

  // 모션 재개 함수
  const resume = useCallback(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  // 메뉴 아이템 스타일 배열 생성
  const itemStyles = Array.from({ length: itemCount }, (_, index) => {
    const delay = isOpen ? index * staggerDelay : 0
    const isItemVisible = isOpen && delay <= progress * (itemCount * staggerDelay)
    const isActive = index === activeIndex
    const isHovered = index === hoveredIndex

    let scale = initialScale
    let opacity = initialOpacity
    let rotate = initialRotate
    let translateY = initialTranslateY
    let translateX = initialTranslateX

    if (isItemVisible) {
      if (isHovered) {
        scale = hoverScale
        opacity = hoverOpacity
        rotate = hoverRotate
        translateY = hoverTranslateY
        translateX = hoverTranslateX
      } else if (isActive) {
        scale = activeScale
        opacity = activeOpacity
        rotate = activeRotate
        translateY = activeTranslateY
        translateX = activeTranslateX
      } else {
        scale = itemScale
        opacity = itemOpacity
        rotate = itemRotate
        translateY = itemTranslateY
        translateX = itemTranslateX
      }
    }

    return {
      transform: `
        scale(${scale})
        rotate(${rotate}deg)
        translate(${translateX}px, ${translateY}px)
      `,
      opacity,
      transition: `all ${duration}ms ${easing} ${delay}ms`,
      willChange: 'transform, opacity',
      cursor: 'pointer'
    }
  })

  // 네비게이션 스타일 계산
  const getNavigationStyle = (): React.CSSProperties => {
    let baseStyle: React.CSSProperties = {
      transition: `all ${duration}ms ${easing}`,
      willChange: 'transform, opacity'
    }

    switch (type) {
      case 'slide':
        if (slideDirection === 'left') {
          baseStyle.transform = `translateX(${isOpen ? 0 : -100}%)`
        } else if (slideDirection === 'right') {
          baseStyle.transform = `translateX(${isOpen ? 0 : 100}%)`
        } else if (slideDirection === 'up') {
          baseStyle.transform = `translateY(${isOpen ? 0 : -100}%)`
        } else if (slideDirection === 'down') {
          baseStyle.transform = `translateY(${isOpen ? 0 : 100}%)`
        }
        break
      
      case 'fade':
        baseStyle.opacity = isOpen ? 1 : 0
        break
      
      case 'scale':
        baseStyle.transform = `scale(${isOpen ? 1 : 0})`
        break
      
      case 'rotate':
        baseStyle.transform = `rotate(${isOpen ? 0 : 180}deg)`
        break
      
      case 'custom':
        // 사용자 정의 스타일은 기본값 사용
        break
    }

    return baseStyle
  }

  const style = getNavigationStyle()

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress,
    start,
    stop,
    reset,
    pause,
    resume,
    isOpen,
    activeIndex,
    itemStyles,
    openMenu,
    closeMenu,
    toggleMenu,
    setActiveItem,
    goToNext,
    goToPrevious
  }
}
