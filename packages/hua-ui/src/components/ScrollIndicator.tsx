'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { cn } from '../lib/utils'

export interface ScrollIndicatorProps {
  className?: string
  targetId?: string
  text?: string
  iconName?: string
  iconSize?: number
  position?: 'bottom-center' | 'bottom-left' | 'bottom-right'
  variant?: 'default' | 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  autoHide?: boolean
  hideThreshold?: number
}

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
      className={cn(
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
        className={cn(
          'flex flex-col items-center space-y-2 transition-all duration-300',
          sizeClasses[size],
          variantClasses[variant],
          animated && 'animate-in fade-in-0 slide-in-from-bottom-2 duration-500'
        )}
        aria-label={text}
      >
        <span className="text-xs opacity-80">{text}</span>
        <Icon
          name={iconName as any}
          size={iconSize}
          className={cn(
            animated && 'animate-bounce'
          )}
        />
      </Button>
    </div>
  )
})

ScrollIndicator.displayName = 'ScrollIndicator'

export { ScrollIndicator } 