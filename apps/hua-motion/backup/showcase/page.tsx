'use client'

import React from 'react'
import Link from 'next/link'
import { Icon, Button } from '@hua-labs/ui'
import { useSmartAnimation } from '@hua-labs/animation'

export default function ShowcasePage() {
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

  const showcases = [
    {
      id: 'simple',
      title: '1단계: Simple Animation',
      description: '프리셋 기반의 간단하고 빠른 애니메이션',
      href: '/showcase/simple-animation',
      icon: 'zap',
      color: 'blue',
      features: ['자동 애니메이션', '프리셋 시스템', '빠른 설정'],
      highlight: '가장 쉬운 시작점'
    },
    {
      id: 'page',
      title: '2단계: Page Animation',
      description: '페이지 레벨의 애니메이션 관리',
      href: '/showcase/page-animation',
      icon: 'layers',
      color: 'green',
      features: ['페이지 전환', '레이아웃 애니메이션', '상태 관리'],
      highlight: '실무에서 가장 유용'
    },
    {
      id: 'smart',
      title: '3단계: Smart Animation',
      description: '개별 요소별 완전한 제어',
      href: '/showcase/smart-animation',
      icon: 'sparkles',
      color: 'purple',
      features: ['개별 제어', '호버/클릭 효과', '고급 커스터마이징'],
      highlight: '완전한 자유도'
    },
    {
      id: 'advanced',
      title: '고급 기능',
      description: '고급 애니메이션 기능과 유틸리티',
      href: '/showcase/advanced',
      icon: 'settings',
      color: 'orange',
      features: ['스프링 애니메이션', '제스처 인식', '고급 이징'],
      highlight: '프로 개발자를 위한'
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
              3단계 추상화 쇼케이스
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            HUA Animation의 3단계 추상화 시스템을 체험해보세요
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            간단한 사용법부터 고급 기능까지, 모든 단계를 직접 체험할 수 있습니다
          </p>
        </header>

        {/* 쇼케이스 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {showcases.map((showcase, index) => (
            <div
              key={showcase.id}
              className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
            >
              {/* 하이라이트 배지 */}
              <div className="absolute -top-3 left-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-lg">
                {showcase.highlight}
              </div>
              
              {/* 아이콘 */}
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r from-${showcase.color}-500 to-${showcase.color}-600 rounded-2xl flex items-center justify-center shadow-lg shadow-${showcase.color}-500/25 mr-4`}>
                  <Icon name={showcase.icon as any} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showcase.title}
                </h3>
              </div>
              
              {/* 설명 */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                {showcase.description}
              </p>
              
              {/* 기능 리스트 */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  주요 기능
                </h4>
                <ul className="space-y-2">
                  {showcase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* CTA 버튼 */}
              <div className="flex justify-between items-center">
                <Link href={showcase.href}>
                  <Button 
                    variant="gradient"
                    gradient={showcase.color as any}
                    size="lg"
                    hover="glow"
                    className="group-hover:scale-105 transition-transform duration-300"
                  >
                    <Icon name="arrowRight" className="w-5 h-5 mr-2" />
                    체험해보기
                  </Button>
                </Link>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  단계 {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 CTA 섹션 */}
        <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/50">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            더 깊이 탐험해보세요
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            쇼케이스를 통해 기본을 익혔다면, 이제 실제로 개발해보세요
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button 
              href="/test" 
              variant="gradient"
              gradient="blue"
              size="lg"
              hover="glow"
            >
              <Icon name="zap" className="w-5 h-5 mr-2" />
              테스트 랩
            </Button>
            <Button 
              href="/playground" 
              variant="gradient"
              gradient="green"
              size="lg"
              hover="glow"
            >
              <Icon name="settings" className="w-5 h-5 mr-2" />
              플레이그라운드
            </Button>
            <Button 
              href="/docs" 
              variant="gradient"
              gradient="purple"
              size="lg"
              hover="glow"
            >
              <Icon name="bookOpen" className="w-5 h-5 mr-2" />
              문서
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 