'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { cn } from '../lib/utils'

export interface ScrollToTopProps {
  className?: string
  threshold?: number
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'outline'
  showIcon?: boolean
  iconName?: string
  iconSize?: number
  animated?: boolean
}

const ScrollToTop = React.forwardRef<HTMLDivElement, ScrollToTopProps>(({
  className,
  threshold = 300,
  position = 'bottom-right',
  size = 'md',
  variant = 'default',
  showIcon = true,
  iconName = 'arrowUp',
  iconSize = 20,
  animated = true,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.scrollY
      const shouldShow = scrollTop > threshold
      setIsVisible(shouldShow)
    }

    // 초기 실행
    toggleVisibility()

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8', // 32px 여백
    'bottom-left': 'bottom-8 left-8', // 32px 여백
    'bottom-center': 'bottom-8 left-1/2 transform -translate-x-1/2' // 32px 여백
  }

  const sizeClasses = {
    sm: 'w-12 h-12', // 48px - 더 넉넉한 크기
    md: 'w-14 h-14', // 56px - 더 넉넉한 크기
    lg: 'w-16 h-16' // 64px - 더 넉넉한 크기
  }

  const variantClasses = {
    default: 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-300',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
  }

  if (!isVisible) return null

  return (
    <div
      ref={ref}
      className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}
      {...props}
    >
      <Button
        onClick={scrollToTop}
        size="icon"
        variant="default"
        className={cn(
          'rounded-full shadow-lg hover:shadow-xl transition-all duration-300',
          sizeClasses[size],
          variantClasses[variant],
          animated && 'animate-in fade-in-0 slide-in-from-bottom-2 duration-300'
        )}
        aria-label="Scroll to top"
      >
        {showIcon && (
          <svg
            className={cn(
              'text-white',
              animated && 'animate-bounce'
            )}
            width={iconSize}
            height={iconSize}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        )}
      </Button>
    </div>
  )
})

ScrollToTop.displayName = 'ScrollToTop'

export { ScrollToTop } 