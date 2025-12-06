'use client'

import React from 'react'
import { Icon, Action, Panel } from '@hua-labs/ui'
import { useSmartMotion } from '@hua-labs/motion-core'

export default function FeatureCards() {
  const featuresRef = useSmartMotion({ 
    type: 'card',
    entrance: 'slideUp',
    delay: 400,
    threshold: 0.1
  })

  const features = [
    {
      icon: 'zap',
      title: '성능 최적화',
      description: '최적화된 모션으로 부드러운 성능을 제공합니다. React의 가상 DOM과 완벽하게 통합되어 있습니다.',
      style: 'glass',
      className: 'bg-gradient-to-br from-blue-500/10 via-blue-600/20 to-purple-600/10 border-blue-200/50 dark:border-blue-800/50',
      iconGradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: 'sparkles',
      title: '쉬운 사용법',
      description: '직관적인 훅 API로 복잡한 모션도 쉽게 구현할 수 있습니다. 3단계 추상화로 모든 수준의 개발자를 지원합니다.',
      style: 'glass',
      className: 'bg-gradient-to-br from-green-500/10 via-emerald-600/20 to-teal-600/10 border-green-200/50 dark:border-green-800/50',
      iconGradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: 'heart',
      title: 'TypeScript 지원',
      description: '완전한 TypeScript 지원으로 타입 안전성을 보장합니다. 자동완성과 타입 체크로 개발 경험을 향상시킵니다.',
      style: 'glass',
      className: 'bg-gradient-to-br from-purple-500/10 via-pink-600/20 to-rose-600/10 border-purple-200/50 dark:border-purple-800/50',
      iconGradient: 'from-purple-500 to-pink-600'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-24">
        {features.map((feature, index) => (
          <Panel
            key={index}
            style={feature.style}
            padding="lg"
            rounded="xl"
            hoverScale={1}
            className={`${feature.className} transition-all duration-300 hover:shadow-xl hover:shadow-lg hover:-translate-y-1 h-full flex flex-col`}
          >
            <div className="text-center flex flex-col h-full">
              {/* 아이콘 - 색상 복원, 스케일 효과 완전 제거 */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-br rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl ${feature.iconGradient}`}>
                <Icon name={feature.icon} size={20} className="sm:text-xl lg:text-2xl text-white" />
              </div>
              
              {/* 제목 */}
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 text-gray-900 dark:text-white transition-colors duration-300">
                {feature.title}
              </h3>
              
              {/* 설명 - flex-grow로 남은 공간 채우기 */}
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300 flex-grow">
                {feature.description}
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
} 