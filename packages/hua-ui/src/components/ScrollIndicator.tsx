'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { merge } from '../lib/utils'
import type { IconName } from '../lib/icons'

/**
 * ScrollIndicator 컴포넌트의 props / ScrollIndicator component props
 * @typedef {Object} ScrollIndicatorProps
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {string} [targetId] - 스크롤 대상 요소 ID / Target element ID to scroll to
 * @property {string} [text='Scroll down'] - 표시 텍스트 / Display text
 * @property {IconName} [iconName='arrowDown'] - 아이콘 이름 / Icon name
 * @property {number} [iconSize=20] - 아이콘 크기 / Icon size
 * @property {'bottom-center' | 'bottom-left' | 'bottom-right'} [position='bottom-center'] - 표시 위치 / Display position
 * @property {'default' | 'primary' | 'secondary' | 'outline'} [variant='default'] - ScrollIndicator 스타일 변형 / ScrollIndicator style variant
 * @property {'sm' | 'md' | 'lg'} [size='md'] - ScrollIndicator 크기 / ScrollIndicator size
 * @property {boolean} [animated=true] - 애니메이션 활성화 여부 / Enable animation
 * @property {boolean} [autoHide=true] - 자동 숨김 여부 / Auto hide
 * @property {number} [hideThreshold=100] - 숨김 임계값 (px) / Hide threshold (px)
 */
export interface ScrollIndicatorProps {
  className?: string
  targetId?: string
  text?: string
  iconName?: IconName
  iconSize?: number
  position?: 'bottom-center' | 'bottom-left' | 'bottom-right'
  variant?: 'default' | 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  autoHide?: boolean
  hideThreshold?: number
}

/**
 * ScrollIndicator 컴포넌트 / ScrollIndicator component
 * 
 * 스크롤 가능함을 나타내는 인디케이터 컴포넌트입니다.
 * 클릭 시 지정된 요소로 스크롤하거나 다음 섹션으로 스크롤합니다.
 * 
 * Indicator component that shows scrollability.
 * Scrolls to specified element or next section on click.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ScrollIndicator />
 * 
 * @example
 * // 특정 요소로 스크롤 / Scroll to specific element
 * <ScrollIndicator 
 *   targetId="section-2"
 *   text="다음 섹션으로"
 *   position="bottom-right"
 * />
 * 
 * @param {ScrollIndicatorProps} props - ScrollIndicator 컴포넌트의 props / ScrollIndicator component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ScrollIndicator 컴포넌트 / ScrollIndicator component
 */
const ScrollIndicator = React.forwardRef<HTMLDivElement, ScrollIndicatorProps>(({
  className,
  targetId,
  text = 'Scroll down',
  iconName = 'arrowDown',
  iconSize = 20,
  position = 'bottom-center',
  variant = 'default',
  size = 'md',
  animated = true,
  autoHide = true,
  hideThreshold = 100,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!autoHide) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsVisible(scrollTop < hideThreshold)
    }

    // 초기 실행
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [autoHide, hideThreshold])

  const scrollToTarget = () => {
    if (targetId) {
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // 기본적으로 다음 섹션으로 스크롤
      const currentSection = ref as React.RefObject<HTMLDivElement>
      if (currentSection.current) {
        const nextSection = currentSection.current.nextElementSibling
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  const positionClasses = {
    'bottom-center': 'bottom-8 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-8 left-8',
    'bottom-right': 'bottom-8 right-8'
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const variantClasses = {
    default: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
    primary: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200',
    secondary: 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200',
    outline: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
  }

  if (!isVisible) return null

  return (
    <div
      ref={ref}
      className={merge(
        'absolute z-10',
        positionClasses[position],
        className
      )}
      {...props}
    >
      <Button
        onClick={scrollToTarget}
        variant="ghost"
        size="sm"
        className={merge(
          'flex flex-col items-center space-y-2 transition-all duration-300',
          sizeClasses[size],
          variantClasses[variant],
          animated && 'animate-in fade-in-0 slide-in-from-bottom-2 duration-500'
        )}
        aria-label={text}
      >
        <span className="text-xs opacity-80">{text}</span>
        <Icon
          name={iconName}
          size={iconSize}
          className={merge(
            animated && 'animate-bounce'
          )}
        />
      </Button>
    </div>
  )
})

ScrollIndicator.displayName = 'ScrollIndicator'

export { ScrollIndicator } 