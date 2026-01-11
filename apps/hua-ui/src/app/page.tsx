'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Button, Panel, CodeBlock } from '@hua-labs/hua-ux'
import {
  Lightning,
  Palette,
  Heart,
  DownloadSimple,
  GithubLogo,
  Stack,
  BookOpen,
  Cursor,
  Warning,
  CreditCard,
  Square,
  TextT,
  FolderOpen,
  ChartBar,
  ChatCircle
} from '@phosphor-icons/react'

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    {
      icon: Lightning,
      title: "빠르고 가벼움",
      description: "최적화된 번들 크기로 빠른 로딩과 부드러운 성능을 제공합니다.",
      color: "blue"
    },
    {
      icon: Palette,
      title: "완벽한 커스터마이징",
      description: "Tailwind CSS 기반으로 모든 스타일을 쉽게 커스터마이징할 수 있습니다.",
      color: "green"
    },
    {
      icon: Heart,
      title: "개발자 친화적",
      description: "TypeScript 지원과 직관적인 API로 개발 경험을 향상시킵니다.",
      color: "purple"
    }
  ]

  const componentPreviews = [
    { name: "Button", icon: Cursor, description: "다양한 스타일의 버튼" },
    { name: "Alert", icon: Warning, description: "알림 메시지" },
    { name: "Panel", icon: CreditCard, description: "카드 레이아웃" },
    { name: "Modal", icon: Square, description: "모달 다이얼로그" },
    { name: "Input", icon: TextT, description: "입력 필드" },
    { name: "Navigation", icon: FolderOpen, description: "탭 네비게이션" },
    { name: "Progress", icon: ChartBar, description: "진행률 표시" },
    { name: "Toast", icon: ChatCircle, description: "토스트 메시지" }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
      case 'green': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 히어로 섹션 */}
        <div
          className={`text-center py-16 sm:py-20 lg:py-24 relative overflow-hidden rounded-3xl mb-16 sm:mb-20 lg:mb-24 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            animation: 'gradientShift 8s ease-in-out infinite'
          }}
        >
          {/* 배경 장식 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 sm:p-12 lg:p-16 mx-4">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white hover:scale-105 transition-transform duration-300"
            >
              아름다운 디자인 시스템
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed">
              HUA Labs의 가볍고 스마트한 UI 컴포넌트 라이브러리.
              Tailwind CSS와 Phosphor Icons만으로 구축된 완벽한 디자인 시스템입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button
                variant="glass"
                size="lg"
                className="w-full sm:w-auto hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={() => window.location.href = '/components'}
                icon={<DownloadSimple className="w-5 h-5" />}
              >
                시작하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={() => window.open('https://github.com/hua-labs/hua-ui', '_blank')}
                icon={<GithubLogo className="w-5 h-5" />}
              >
                GitHub
              </Button>
            </div>
          </div>
        </div>

        {/* 설치 섹션 */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 dark:text-white">
              빠른 설치
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              한 줄의 명령어로 시작하세요
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <CodeBlock
              code="pnpm add @hua-labs/hua-ux"
              language="bash"
            />
          </div>
        </div>

        {/* 특징 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 sm:mb-20 lg:mb-24">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Panel key={index} style="elevated" className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className={`w-16 h-16 ${getColorClasses(feature.color)} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <IconComponent className="w-8 h-8" weight="fill" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </Panel>
            )
          })}
        </div>

        {/* 컴포넌트 미리보기 */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              풍부한 컴포넌트 라이브러리
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              30개 이상의 컴포넌트로 모든 UI 요구사항을 충족하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {componentPreviews.map((component, index) => {
              const IconComponent = component.icon
              return (
                <Panel key={index} className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{component.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{component.description}</p>
                </Panel>
              )
            })}
          </div>
        </div>

        {/* CTA 섹션 */}
        <Panel style="glass" className="text-center py-16 sm:py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            지금 시작해보세요
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            HUA UX와 함께 아름다운 웹 애플리케이션을 만들어보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = '/components'}
              icon={<Stack className="w-5 h-5" />}
            >
              컴포넌트 보기
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = '/docs'}
              icon={<BookOpen className="w-5 h-5" />}
            >
              문서 읽기
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
