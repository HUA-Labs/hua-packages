'use client'

import React from 'react'
import { Icon, Action } from '@hua-labs/ui'

interface ShowcasePageLayoutProps {
  title: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  children: React.ReactNode
  
  // 옵셔널 버튼들
  primaryButton?: {
    text: string
    href: string
    icon?: string
  }
  secondaryButton?: {
    text: string
    href: string
    icon?: string
  }
  
  // 옵셔널 추가 섹션들
  showUsageGuide?: boolean
  showDemoSection?: boolean
  
  // 배경 그라데이션
  backgroundGradient?: string
}

const colorConfig = {
  blue: {
    gradient: 'from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    iconGradient: 'from-indigo-500 to-purple-600',
    titleGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    bgGradient: 'from-indigo-500/10 via-purple-500/10 to-pink-500/10',
    shadow: 'shadow-indigo-500/25'
  },
  green: {
    gradient: 'from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    iconGradient: 'from-green-500 to-emerald-600',
    titleGradient: 'from-green-600 via-emerald-600 to-teal-600',
    bgGradient: 'from-green-500/10 via-emerald-500/10 to-teal-500/10',
    shadow: 'shadow-green-500/25'
  },
  purple: {
    gradient: 'from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    iconGradient: 'from-purple-500 to-pink-600',
    titleGradient: 'from-purple-600 via-pink-600 to-rose-600',
    bgGradient: 'from-purple-500/10 via-pink-500/10 to-rose-500/10',
    shadow: 'shadow-purple-500/25'
  },
  orange: {
    gradient: 'from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    iconGradient: 'from-orange-500 to-red-600',
    titleGradient: 'from-orange-600 via-red-600 to-pink-600',
    bgGradient: 'from-orange-500/10 via-red-500/10 to-pink-500/10',
    shadow: 'shadow-orange-500/25'
  }
}

export default function ShowcasePageLayout({
  title,
  description,
  icon,
  color,
  children,
  primaryButton,
  secondaryButton,
  showUsageGuide = true,
  showDemoSection = true,
  backgroundGradient
}: ShowcasePageLayoutProps): React.ReactElement {
  const config = colorConfig[color]
  const bgGradient = backgroundGradient || config.gradient

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-0 w-96 h-96 ${config.bgGradient} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-0 right-0 w-96 h-96 ${config.bgGradient} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${config.bgGradient} rounded-full blur-2xl animate-pulse`} style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8 relative">
        {/* 헤더 섹션 */}
        <header className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-r ${config.iconGradient} rounded-2xl flex items-center justify-center shadow-lg ${config.shadow}`}>
              <Icon name={icon} size={24} className="text-white" />
            </div>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent`}>
              {title}
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
          
          {/* 옵셔널 버튼들 */}
          {(primaryButton || secondaryButton) && (
            <div className="flex flex-wrap gap-4 justify-center">
              {primaryButton && (
                <Action 
                  href={primaryButton.href}
                  variant="gradient" 
                  gradient={color}
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold"
                >
                  {primaryButton.icon && <Icon name={primaryButton.icon} size={20} className="mr-2" />}
                  {primaryButton.text}
                </Action>
              )}
              {secondaryButton && (
                <Action 
                  href={secondaryButton.href}
                  variant="outline" 
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold"
                >
                  {secondaryButton.icon && <Icon name={secondaryButton.icon} size={20} className="mr-2" />}
                  {secondaryButton.text}
                </Action>
              )}
            </div>
          )}
        </header>

        {/* 사용법 가이드 섹션 (옵셔널) */}
        {showUsageGuide && (
          <section className="mb-20">
            <div className={`max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl ${config.shadow} border border-gray-200/50 dark:border-gray-700/50`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-r ${config.iconGradient} rounded-xl flex items-center justify-center`}>
                  <Icon name="bookOpen" size={20} className="text-white" />
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent`}>
                  사용법 가이드
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg hover:${config.shadow} transition-all duration-300`}>
                  <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${config.iconGradient} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                    1
                  </div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">훅 가져오기</h3>
                  <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                    <code className="text-green-400">
                      {`import { use${title.replace(' ', '')} } from '@hua-labs/motion'`}
                    </code>
                  </div>
                </div>
                
                <div className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg hover:${config.shadow} transition-all duration-300`}>
                  <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${config.iconGradient} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                    2
                  </div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">훅 사용</h3>
                  <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                    <code className="text-green-400">
                      {`const animations = use${title.replace(' ', '')}()`}
                    </code>
                  </div>
                </div>
                
                <div className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg hover:${config.shadow} transition-all duration-300`}>
                  <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${config.iconGradient} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                    3
                  </div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">요소에 적용</h3>
                  <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                    <code className="text-green-400">
                      {`<div style={animations.style}>
  애니메이션 요소
</div>`}
                    </code>
                  </div>
                </div>
              </div>
              
              <div className={`bg-gradient-to-r ${config.bgGradient} dark:from-gray-500/20 dark:to-gray-500/20 p-6 rounded-2xl border border-gray-300/30 dark:border-gray-700/30`}>
                <div className="flex items-start space-x-3">
                  <Icon name="zap" size={20} className="text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
                      <Icon name="lightbulb" size={16} className="mr-2" />
                      중요 팁
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      각 애니메이션 훅은 고유한 설정과 옵션을 제공합니다. 
                      자세한 내용은 문서를 참고하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 데모 섹션 (옵셔널) */}
        {showDemoSection && (
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent`}>
                데모 체험
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                실제 동작을 확인해보세요
              </p>
            </div>
          </section>
        )}

        {/* 페이지별 고유 내용 */}
        {children}
      </div>
    </div>
  )
} 