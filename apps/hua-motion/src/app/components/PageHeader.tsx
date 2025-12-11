'use client'

import React from 'react'
import { Icon } from '@hua-labs/ui'

interface PageHeaderProps {
  title: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'pink' | 'teal'
  children?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  variant?: 'default' | 'compact' | 'hero'
}

const colorConfig = {
  blue: {
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    titleGradient: 'from-blue-700 via-indigo-700 to-purple-700',
    shadow: 'shadow-blue-500/30',
    bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
    darkBgGradient: 'from-blue-900/20 via-indigo-900/20 to-purple-900/20'
  },
  green: {
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    titleGradient: 'from-green-700 via-emerald-700 to-teal-700',
    shadow: 'shadow-green-500/30',
    bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
    darkBgGradient: 'from-green-900/20 via-emerald-900/20 to-teal-900/20'
  },
  purple: {
    gradient: 'from-purple-500 via-violet-600 to-fuchsia-600',
    titleGradient: 'from-purple-700 via-violet-700 to-fuchsia-700',
    shadow: 'shadow-purple-500/30',
    bgGradient: 'from-purple-50 via-violet-50 to-fuchsia-50',
    darkBgGradient: 'from-purple-900/20 via-violet-900/20 to-fuchsia-900/20'
  },
  orange: {
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    titleGradient: 'from-orange-700 via-red-700 to-pink-700',
    shadow: 'shadow-orange-500/30',
    bgGradient: 'from-orange-50 via-red-50 to-pink-50',
    darkBgGradient: 'from-orange-900/20 via-red-900/20 to-pink-900/20'
  },
  indigo: {
    gradient: 'from-indigo-500 via-purple-600 to-violet-600',
    titleGradient: 'from-indigo-700 via-purple-700 to-violet-700',
    shadow: 'shadow-indigo-500/30',
    bgGradient: 'from-indigo-50 via-purple-50 to-violet-50',
    darkBgGradient: 'from-indigo-900/20 via-purple-900/20 to-violet-900/20'
  },
  pink: {
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    titleGradient: 'from-pink-700 via-rose-700 to-red-700',
    shadow: 'shadow-pink-500/30',
    bgGradient: 'from-pink-50 via-rose-50 to-red-50',
    darkBgGradient: 'from-pink-900/20 via-rose-900/20 to-red-900/20'
  },
  teal: {
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    titleGradient: 'from-teal-700 via-cyan-700 to-blue-700',
    shadow: 'shadow-teal-500/30',
    bgGradient: 'from-teal-50 via-cyan-50 to-blue-50',
    darkBgGradient: 'from-teal-900/20 via-cyan-900/20 to-blue-900/20'
  }
}

export default function PageHeader({
  title,
  description,
  icon,
  color,
  children,
  maxWidth = '4xl',
  variant = 'default'
}: PageHeaderProps): React.ReactElement {
  const config = colorConfig[color]

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'mb-8 sm:mb-12',
          iconSize: 'w-10 h-10 sm:w-12 sm:h-12',
          iconContainer: 'rounded-xl sm:rounded-2xl',
          titleSize: 'text-2xl sm:text-3xl md:text-4xl',
          descriptionSize: 'text-base sm:text-lg',
          spacing: 'space-x-2 sm:space-x-3'
        }
      case 'hero':
        return {
          container: 'mb-16 sm:mb-20',
          iconSize: 'w-16 h-16 sm:w-20 sm:h-20',
          iconContainer: 'rounded-3xl sm:rounded-4xl',
          titleSize: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
          descriptionSize: 'text-xl sm:text-2xl lg:text-3xl',
          spacing: 'space-x-4 sm:space-x-6'
        }
      default:
        return {
          container: 'mb-10 sm:mb-12',
          iconSize: 'w-10 h-10 sm:w-12 sm:h-12',
          iconContainer: 'rounded-xl sm:rounded-2xl',
          titleSize: 'text-2xl sm:text-3xl md:text-4xl',
          descriptionSize: 'text-base sm:text-lg',
          spacing: 'space-x-2 sm:space-x-3'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <header className={`text-center ${styles.container}`}>
      {/* 배경 그라데이션 효과 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 dark:opacity-30 -z-10 rounded-3xl`} />
      
      {/* 아이콘과 제목 */}
      <div className={`inline-flex items-center ${styles.spacing} mb-6 sm:mb-8`}>
        <div className={`${styles.iconSize} ${styles.iconContainer} bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-lg sm:shadow-2xl ${config.shadow} backdrop-blur-sm relative overflow-hidden`}>
          {/* 글로우 효과 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} blur-lg opacity-50`} />
          <Icon 
            name={icon as any} 
            size={variant === 'compact' ? 18 : variant === 'hero' ? 32 : 20} 
            className="text-white drop-shadow-sm relative z-10" 
          />
        </div>
        <h1 className={`${styles.titleSize} font-bold bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent leading-tight tracking-tight relative`}>
          {title}
          {/* 텍스트 글로우 효과 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${config.titleGradient} blur-sm opacity-30 -z-10`} />
        </h1>
      </div>
      
      {/* 설명 */}
      <p className={`${styles.descriptionSize} text-gray-700 dark:text-gray-300 mb-8 mx-auto leading-relaxed font-medium ${
        maxWidth === 'sm' ? 'max-w-sm' : 
        maxWidth === 'md' ? 'max-w-md' : 
        maxWidth === 'lg' ? 'max-w-lg' : 
        maxWidth === 'xl' ? 'max-w-xl' : 
        maxWidth === '2xl' ? 'max-w-2xl' : 
        maxWidth === '3xl' ? 'max-w-3xl' : 
        maxWidth === '4xl' ? 'max-w-4xl' : 
        maxWidth === '5xl' ? 'max-w-5xl' : 
        maxWidth === '6xl' ? 'max-w-6xl' : 
        maxWidth === '7xl' ? 'max-w-7xl' : 'max-w-4xl'
      }`}>
        {description}
      </p>
      
      {/* 추가 컨텐츠 (옵셔널) */}
      {children && (
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      )}
    </header>
  )
} 