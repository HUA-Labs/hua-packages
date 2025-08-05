'use client'

import React from 'react'
import { Icon } from '@hua-labs/ui'

interface PageHeaderProps {
  title: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo'
  children?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}

const colorConfig = {
  blue: {
    gradient: 'from-blue-500 via-indigo-600 to-purple-600',
    titleGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    shadow: 'shadow-blue-500/25'
  },
  green: {
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    titleGradient: 'from-green-600 via-emerald-600 to-teal-600',
    shadow: 'shadow-green-500/25'
  },
  purple: {
    gradient: 'from-purple-500 via-pink-600 to-rose-600',
    titleGradient: 'from-purple-600 via-pink-600 to-rose-600',
    shadow: 'shadow-purple-500/25'
  },
  orange: {
    gradient: 'from-orange-500 via-red-600 to-pink-600',
    titleGradient: 'from-orange-600 via-red-600 to-pink-600',
    shadow: 'shadow-orange-500/25'
  },
  indigo: {
    gradient: 'from-indigo-500 via-purple-600 to-pink-600',
    titleGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    shadow: 'shadow-indigo-500/25'
  }
}

export default function PageHeader({
  title,
  description,
  icon,
  color,
  children,
  maxWidth = '4xl'
}: PageHeaderProps): React.ReactElement {
  const config = colorConfig[color]

  return (
    <header className="text-center mb-12 sm:mb-16">
      <div className="inline-flex items-center space-x-3 sm:space-x-4 mb-6">
        <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${config.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg sm:shadow-2xl ${config.shadow}`}>
          <Icon name={icon} size={24} className="text-white" />
        </div>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent`}>
          {title}
        </h1>
      </div>
      <p className={`text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8 mx-auto leading-relaxed ${maxWidth === 'sm' ? 'max-w-sm' : maxWidth === 'md' ? 'max-w-md' : maxWidth === 'lg' ? 'max-w-lg' : maxWidth === 'xl' ? 'max-w-xl' : maxWidth === '2xl' ? 'max-w-2xl' : maxWidth === '3xl' ? 'max-w-3xl' : maxWidth === '4xl' ? 'max-w-4xl' : maxWidth === '5xl' ? 'max-w-5xl' : maxWidth === '6xl' ? 'max-w-6xl' : maxWidth === '7xl' ? 'max-w-7xl' : 'max-w-4xl'}`}>
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