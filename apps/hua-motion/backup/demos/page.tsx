'use client'

import React from 'react'
import Link from 'next/link'
import { Icon, Button } from '@hua-labs/ui'
import { useSmartAnimation } from '@hua-labs/animation'

export default function DemosPage() {
  const heroRef = useSmartAnimation({ 
    type: 'hero',
    entrance: 'fadeIn',
    delay: 0,
    threshold: 0
  })
  
  const titleRef = useSmartAnimation({ 
    type: 'title',
    entrance: 'slideUp',
    delay: 200,
    threshold: 0
  })

  const demos = [
    {
      id: 'simple',
      title: '1단계: Simple Animation',
      description: '프리셋 기반의 간단하고 빠른 애니메이션',
      href: '/demos/simple-animation',
      icon: 'zap',
      color: 'blue',
      features: ['자동 애니메이션', '프리셋 시스템', '빠른 설정']
    },
    {
      id: 'page',
      title: '2단계: Page Animation',
      description: '페이지 레벨의 애니메이션 관리',
      href: '/demos/page-animation',
      icon: 'layers',
      color: 'green',
      features: ['페이지 전환', '레이아웃 애니메이션', '상태 관리']
    },
    {
      id: 'smart',
      title: '3단계: Smart Animation',
      description: '개별 요소별 완전한 제어',
      href: '/demos/smart-animation',
      icon: 'sparkles',
      color: 'purple',
      features: ['개별 제어', '호버/클릭 효과', '고급 커스터마이징']
    },
    {
      id: 'advanced',
      title: '고급 기능',
      description: '고급 애니메이션 기능과 유틸리티',
      href: '/demos/advanced',
      icon: 'settings',
      color: 'orange',
      features: ['스프링 애니메이션', '제스처 인식', '고급 이징']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* 헤더 */}
        <header 
          ref={heroRef.ref}
          style={heroRef.style}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <img 
                src="/images/favicon_wh.svg" 
                alt="HUA Logo" 
                className="w-8 h-8"
              />
            </div>
            <h1 
              ref={titleRef.ref}
              style={titleRef.style}
              className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
            >
              3단계 추상화 데모
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            HUA Animation의 3단계 추상화 시스템을 체험해보세요
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            간단한 사용법부터 고급 기능까지, 모든 단계를 직접 체험할 수 있습니다
          </p>
        </header>

        {/* 데모 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {demos.map((demo, index) => (
            <div
              key={demo.id}
              className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
            >
              {/* 배경 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                {/* 아이콘 */}
                <div className={`w-16 h-16 bg-gradient-to-r from-${demo.color}-500 to-${demo.color}-600 rounded-2xl flex items-center justify-center shadow-lg shadow-${demo.color}-500/25 mb-6`}>
                  <Icon name={demo.icon as any} size={32} className="text-white" />
                </div>
                
                {/* 제목 */}
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {demo.title}
                </h3>
                
                {/* 설명 */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {demo.description}
                </p>
                
                {/* 기능 리스트 */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    주요 기능:
                  </h4>
                  <ul className="space-y-2">
                    {demo.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className={`w-2 h-2 bg-${demo.color}-500 rounded-full mr-3`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* 버튼 */}
                <Button
                  href={demo.href}
                  variant="gradient"
                  gradient={demo.color as any}
                  size="lg"
                  className="w-full group-hover:scale-105 transition-transform duration-300"
                >
                  <Icon name="arrowRight" size={20} className="mr-2" />
                  데모 보기
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 링크 */}
        <div className="text-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/50">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              더 많은 기능을 체험해보세요
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              테스트 랩과 플레이그라운드에서 모든 기능을 자유롭게 체험할 수 있습니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/test"
                variant="gradient"
                gradient="blue"
                size="lg"
              >
                <Icon name="zap" size={20} className="mr-2" />
                테스트 랩
              </Button>
              <Button
                href="/playground"
                variant="gradient"
                gradient="green"
                size="lg"
              >
                <Icon name="settings" size={20} className="mr-2" />
                플레이그라운드
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 