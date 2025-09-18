'use client'

import React from 'react'
import { Icon } from '@hua-labs/ui'

interface PlaygroundHeaderProps {
  title: string
  description: string
  icon: string
  stage: 'core' | 'advanced' | 'enterprise'
  progress: number // 0-100
  features: string[]
  className?: string
}

const stageConfig = {
  core: {
    color: 'blue',
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    titleGradient: 'from-blue-700 via-cyan-700 to-blue-800',
    bgGradient: 'from-blue-50 via-cyan-50 to-blue-100',
    darkBgGradient: 'from-blue-900/20 via-cyan-900/20 to-blue-900/20',
    shadow: 'shadow-blue-500/30',
    stageName: 'Core',
    stageDescription: '기본 모션 훅들과 3단계 추상화'
  },
  advanced: {
    color: 'purple',
    gradient: 'from-purple-500 via-violet-500 to-purple-600',
    titleGradient: 'from-purple-700 via-violet-700 to-purple-800',
    bgGradient: 'from-purple-50 via-violet-50 to-purple-100',
    darkBgGradient: 'from-purple-900/20 via-violet-900/20 to-purple-900/20',
    shadow: 'shadow-purple-500/30',
    stageName: 'Advanced',
    stageDescription: '고급 페이지 전환과 애니메이션'
  },
  enterprise: {
    color: 'orange',
    gradient: 'from-orange-500 via-red-500 to-orange-600',
    titleGradient: 'from-orange-700 via-red-700 to-orange-800',
    bgGradient: 'from-orange-50 via-red-50 to-orange-100',
    darkBgGradient: 'from-orange-900/20 via-red-900/20 to-orange-900/20',
    shadow: 'shadow-orange-500/30',
    stageName: 'Enterprise',
    stageDescription: '전문가용 고급 기능'
  }
}

export default function PlaygroundHeader({
  title,
  description,
  icon,
  stage,
  progress,
  features,
  className = ''
}: PlaygroundHeaderProps): React.ReactElement {
  const config = stageConfig[stage]

  return (
    <header className={`text-center relative ${className}`}>
      {/* 배경 그라데이션 효과 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} dark:${config.darkBgGradient} opacity-50 -z-10 rounded-3xl`} />
      
      {/* 단계 표시 */}
      <div className="mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient} mr-3`} />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {config.stageName} Stage
          </span>
        </div>
      </div>

      {/* 진행률 표시 */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 아이콘과 제목 */}
      <div className="inline-flex items-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${config.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg sm:shadow-2xl ${config.shadow} backdrop-blur-sm relative overflow-hidden`}>
          {/* 글로우 효과 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} blur-lg opacity-50`} />
          <Icon 
            name={icon} 
            size={28} 
            className="text-white drop-shadow-sm relative z-10" 
          />
        </div>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent leading-tight tracking-tight relative`}>
          {title}
          {/* 텍스트 글로우 효과 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${config.titleGradient} blur-sm opacity-30 -z-10`} />
        </h1>
      </div>
      
      {/* 설명 */}
      <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
        {description}
      </p>

      {/* 단계 설명 */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {config.stageDescription}
        </p>
      </div>
      
      {/* 주요 기능들 */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {features.map((feature, index) => (
          <span
            key={index}
            className="px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 rounded-full border border-gray-200/50 dark:border-gray-600/50 shadow-sm"
          >
            {feature}
          </span>
        ))}
      </div>
    </header>
  )
}
