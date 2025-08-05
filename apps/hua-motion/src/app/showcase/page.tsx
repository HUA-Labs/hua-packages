'use client'

import React from 'react'
import Link from 'next/link'
import { Icon, Action, Panel } from '@hua-labs/ui'
import PageHeader from '../components/PageHeader'

export default function ShowcasePage() {

  const showcases = [
    {
      id: 'simple',
      title: '1단계: Simple Animation',
      description: '프리셋 기반의 간단하고 빠른 애니메이션',
      href: '/showcase/simple-animation',
      icon: 'zap',
      color: 'blue',
      features: ['자동 애니메이션', '프리셋 시스템', '빠른 설정'],
      highlight: '가장 쉬운 시작점',
      codeExample: 'useSimplePageAnimation("home")',
      useCase: '간단한 웹사이트, 프로토타입, 빠른 개발'
    },
    {
      id: 'page',
      title: '2단계: Page Animation',
      description: '페이지 레벨의 애니메이션 관리',
      href: '/showcase/page-animation',
      icon: 'layers',
      color: 'green',
      features: ['페이지 전환', '레이아웃 애니메이션', '상태 관리'],
      highlight: '실무에서 가장 유용',
      codeExample: 'usePageAnimations(config)',
      useCase: '실무 프로젝트, 복잡한 레이아웃, 팀 협업'
    },
    {
      id: 'smart',
      title: '3단계: Smart Animation',
      description: '개별 요소별 완전한 제어',
      href: '/showcase/smart-animation',
      icon: 'sparkles',
      color: 'purple',
      features: ['개별 제어', '호버/클릭 효과', '고급 커스터마이징'],
      highlight: '완전한 자유도',
      codeExample: 'useSmartAnimation({ type: "hero" })',
      useCase: '고급 인터랙션, 디자인 시스템, 완벽한 제어'
    },
    {
      id: 'advanced',
      title: '고급 기능',
      description: '고급 애니메이션 기능과 유틸리티',
      href: '/showcase/advanced',
      icon: 'settings',
      color: 'orange',
      features: ['스프링 애니메이션', '제스처 인식', '고급 이징'],
      highlight: '프로 개발자를 위한',
      codeExample: 'useFadeIn({ delay: 200 })',
      useCase: '고급 애니메이션, 성능 최적화, 커스텀 로직'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <PageHeader
          title="3단계 추상화 쇼케이스"
          description="HUA Motion의 3단계 추상화 시스템을 체험해보세요"
          icon="layers"
          color="blue"
          maxWidth="4xl"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              간단한 사용법부터 고급 기능까지, 모든 단계를 직접 체험할 수 있습니다
            </p>
          </div>
          
          {/* CTA 버튼들 */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Action 
              href="/test"
              variant="gradient" 
              gradient="blue" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
            >
              <Icon name="flask-conical" size={20} className="mr-2" />
              통합 테스트 랩
            </Action>
            <Action 
              href="/playground"
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
            >
              <Icon name="palette" size={20} className="mr-2" />
              플레이그라운드
            </Action>
            <Action 
              href="/docs"
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
            >
              <Icon name="book" size={20} className="mr-2" />
              문서 보기
            </Action>
          </div>
        </PageHeader>

        {/* 3단계 추상화 설명 섹션 */}
        <section className="py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              왜 3단계 추상화인가?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              개발자의 경험과 프로젝트의 복잡도에 따라 적절한 추상화 레벨을 선택할 수 있습니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="zap" size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">빠른 시작</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                복잡한 설정 없이 바로 사용할 수 있는 프리셋 시스템
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="layers" size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">체계적 관리</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                페이지 단위로 애니메이션을 체계적으로 관리하고 일관성 유지
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="sparkles" size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">완전한 제어</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                개별 요소별로 세밀한 제어와 고급 커스터마이징 가능
              </p>
            </div>
          </div>
        </section>

        {/* 쇼케이스 카드들 섹션 */}
        <section className="py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              단계별 체험하기
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              각 단계를 클릭하여 실제 동작을 확인하고 코드를 살펴보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {showcases.map((showcase) => (
              <Panel
                key={showcase.id}
                style="glass"
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* 카드 헤더 */}
                <div className={`bg-gradient-to-r from-${showcase.color}-500 to-${showcase.color}-600 p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon name={showcase.icon} size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{showcase.title}</h3>
                        <p className="text-sm opacity-90">{showcase.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 하이라이트 */}
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm font-medium">
                      <Icon name="star" size={16} className="inline mr-1" />
                      {showcase.highlight}
                    </p>
                  </div>
                </div>

                {/* 카드 내용 */}
                <div className="p-6 space-y-6">
                  {/* 사용 사례 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Icon name="target" size={16} className="mr-2" />
                      사용 사례
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {showcase.useCase}
                    </p>
                  </div>

                  {/* 코드 예시 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Icon name="code" size={16} className="mr-2" />
                      코드 예시
                    </h4>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                        {showcase.codeExample}
                      </code>
                    </div>
                  </div>

                  {/* 주요 기능 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Icon name="zap" size={16} className="mr-2" />
                      주요 기능
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {showcase.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-3 pt-4">
                    <Action 
                      href={showcase.href}
                      variant="gradient" 
                      gradient={showcase.color}
                      className="flex-1"
                    >
                      체험해보기
                    </Action>
                    <Action 
                      href="/playground"
                      variant="outline" 
                      size="sm"
                      className="px-4"
                    >
                      실험실
                    </Action>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </section>

        {/* 다음 단계 안내 섹션 */}
        <section className="py-16 sm:py-24">
          <Panel style="glass" className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              다음 단계로 이동하세요
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              각 단계를 체험한 후, 더 자세한 테스트와 실험을 해보세요
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Action 
                href="/test"
                variant="gradient" 
                gradient="blue" 
                size="lg"
              >
                <Icon name="flask-conical" size={20} className="mr-2" />
                통합 테스트 랩
              </Action>
              <Action 
                href="/playground"
                variant="gradient" 
                gradient="purple" 
                size="lg"
              >
                <Icon name="palette" size={20} className="mr-2" />
                플레이그라운드
              </Action>
              <Action 
                href="/docs"
                variant="outline" 
                size="lg"
              >
                <Icon name="book" size={20} className="mr-2" />
                문서 보기
              </Action>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  )
} 