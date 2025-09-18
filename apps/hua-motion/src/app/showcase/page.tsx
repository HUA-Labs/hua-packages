'use client'

import React from 'react'
import Link from 'next/link'
import { Icon, Action, Panel, Breadcrumb, BreadcrumbItem } from '@hua-labs/ui'
import PageHeader from '../components/PageHeader'
import { type ColorPreset } from '../components/ColorPresetManager'

export default function ShowcasePage() {

  const showcases = [
    {
      id: 'simple',
      title: '1단계: Simple Motion',
      description: '프리셋 기반의 간단하고 빠른 모션',
              href: '/showcase/simple-motion',
      icon: 'zap',
      color: 'blue' as ColorPreset,
      features: ['자동 모션', '프리셋 시스템', '빠른 설정'],
      highlight: '가장 쉬운 시작점',
              codeExample: 'useSimpleMotion("home")',
      useCase: '간단한 웹사이트, 프로토타입, 빠른 개발'
    },
    {
      id: 'page',
      title: '2단계: Page Motion',
      description: '페이지 레벨의 모션 관리',
              href: '/showcase/page-motion',
      icon: 'layers',
      color: 'emerald' as ColorPreset,
      features: ['페이지 전환', '레이아웃 모션', '상태 관리'],
      highlight: '실무에서 가장 유용',
      codeExample: 'usePageMotions(config)',
      useCase: '실무 프로젝트, 복잡한 레이아웃, 팀 협업'
    },
    {
      id: 'smart',
      title: '3단계: Smart Motion',
      description: '개별 요소별 완전한 제어',
              href: '/showcase/smart-motion',
      icon: 'sparkles',
      color: 'purple' as ColorPreset,
      features: ['개별 제어', '호버/클릭 효과', '고급 커스터마이징'],
      highlight: '완전한 자유도',
      codeExample: 'useMotion({ type: "hero" })',
      useCase: '고급 인터랙션, 디자인 시스템, 완벽한 제어'
    },
    {
      id: 'advanced',
      title: '고급 기능',
      description: '고급 모션 기능과 유틸리티',
      href: '/showcase/advanced',
      icon: 'settings',
      color: 'orange' as ColorPreset,
      features: ['스프링 모션', '제스처 인식', '고급 이징'],
      highlight: '프로 개발자를 위한',
      codeExample: 'useFadeIn({ delay: 200 })',
      useCase: '고급 모션, 성능 최적화, 커스텀 로직'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* 브레드크럼 */}
        <div className="flex justify-start animate-fade-in-down">
          <Breadcrumb variant="glass" className="mb-6">
            <BreadcrumbItem href="/">홈</BreadcrumbItem>
            <BreadcrumbItem isCurrent>쇼케이스</BreadcrumbItem>
          </Breadcrumb>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <PageHeader
            title="3단계 추상화 쇼케이스"
            description="간단한 사용법부터 고급 기능까지, 모든 단계를 직접 체험할 수 있습니다"
            icon="layers"
            color="indigo"
            maxWidth="4xl"
            variant="default"
          >
            <div className="flex flex-wrap gap-4 justify-center">
              <Action 
                href="/test"
                variant="outline" 
                size="md"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                통합 테스트 랩
              </Action>
              <Action 
                href="/playground"
                variant="outline" 
                size="md"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                플레이그라운드
              </Action>
              <Action 
                href="/docs"
                variant="outline" 
                size="md"
                className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
              >
                문서 보기
              </Action>
            </div>
          </PageHeader>
        </div>

        {/* 3단계 추상화 설명 섹션 */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <Panel style="glass" className="p-8 sm:p-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                왜 3단계 추상화인가?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                개발자의 경험과 프로젝트의 복잡도에 따라 적절한 추상화 레벨을 선택할 수 있습니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                  <Icon name="zap" size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">빠른 시작</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  복잡한 설정 없이 바로 사용할 수 있는 프리셋 시스템
                </p>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in" style={{ animationDelay: '300ms' }}>
                  <Icon name="layers" size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">체계적 관리</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  페이지 단위로 애니메이션을 체계적으로 관리하고 일관성 유지
                </p>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in" style={{ animationDelay: '500ms' }}>
                  <Icon name="sparkles" size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">완전한 제어</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  개별 요소별로 세밀한 제어와 고급 커스터마이징 가능
                </p>
              </div>
            </div>
          </Panel>
        </section>

        {/* 쇼케이스 카드들 섹션 */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 dark:from-blue-400 dark:via-green-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              단계별 체험하기
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              각 단계를 클릭하여 실제 동작을 확인하고 코드를 살펴보세요
            </p>
          </div>
          
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {showcases.map((showcase) => (
                <div
                  key={showcase.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] animate-fade-in-up"
                  style={{
                    animationDelay: `${showcase.id === 'simple' ? 0 : showcase.id === 'page' ? 100 : showcase.id === 'smart' ? 200 : 300}ms`,
                    animationFillMode: 'both'
                  }}
                >
                 {/* 글로우 효과 */}
                 <div className={`absolute inset-0 bg-gradient-to-r from-${showcase.color}-500/10 via-${showcase.color}-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                 
                 {/* 카드 헤더 */}
                 <div className={`relative bg-gradient-to-br from-${showcase.color}-500 via-${showcase.color}-600 to-${showcase.color}-700 p-8 text-white overflow-hidden`}>
                   {/* 배경 패턴 */}
                   <div className="absolute inset-0 opacity-10">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16" />
                     <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12" />
                   </div>
                   
                   <div className="relative flex items-center justify-between mb-6">
                     <div className="flex items-center space-x-4">
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                         <Icon name={showcase.icon as any} size={28} className="text-white" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold mb-2">{showcase.title}</h3>
                         <p className="text-sm opacity-90 leading-relaxed">{showcase.description}</p>
                       </div>
                     </div>
                   </div>
                   
                   {/* 하이라이트 배지 */}
                    <div className="relative inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                      <Icon name="star" size={16} className="mr-2 text-yellow-300" />
                      <span className="text-sm font-semibold">{showcase.highlight}</span>
                    </div>
                 </div>

                                 {/* 카드 내용 */}
                 <div className="p-8 space-y-8">
                   {/* 사용 사례 */}
                   <div className="space-y-3">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                         <Icon name="target" size={16} className="text-blue-600 dark:text-blue-400" />
                       </div>
                       사용 사례
                     </h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-11">
                       {showcase.useCase}
                     </p>
                   </div>

                   {/* 코드 예시 */}
                   <div className="space-y-3">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                         <Icon name="code" size={16} className="text-green-600 dark:text-green-400" />
                       </div>
                       코드 예시
                     </h4>
                     <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 ml-11">
                       <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                         {showcase.codeExample}
                       </code>
                     </div>
                   </div>

                   {/* 주요 기능 */}
                   <div className="space-y-3">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-3">
                         <Icon name="zap" size={16} className="text-purple-600 dark:text-purple-400" />
                       </div>
                       주요 기능
                     </h4>
                     <div className="flex flex-wrap gap-2 pl-11">
                       {showcase.features.map((feature, index) => (
                         <span
                           key={index}
                           className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-xs text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 font-medium"
                         >
                           {feature}
                         </span>
                       ))}
                     </div>
                   </div>

                                                           {/* 액션 버튼 */}
                    <div className="pt-8 pb-6 flex justify-center">
                      <Action 
                        href={showcase.href}
                        variant="gradient" 
                        gradient={showcase.color as "blue" | "green" | "purple" | "orange"}
                        className="px-12 py-5 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group min-w-[280px] text-lg pointer-events-auto relative z-10 flex items-center justify-center"
                      >
                        <span className="flex items-center justify-center">
                          <span className="mr-2">체험해보기</span>
                          <Icon name="externalLink" size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </Action>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </section>

        {/* 다음 단계 안내 섹션 */}
        <section className="animate-fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
          <Panel style="glass" className="p-8 sm:p-12 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              다음 단계로 이동하세요
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              각 단계를 체험한 후, 더 자세한 테스트와 실험을 해보세요
            </p>
                         <div className="flex flex-wrap gap-4 justify-center">
               <Action 
                 href="/test"
                 variant="outline" 
                 size="md"
                 className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center"
               >
                 통합 테스트 랩
               </Action>
               <Action 
                 href="/playground"
                 variant="outline" 
                 size="md"
                 className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 flex items-center justify-center"
               >
                 플레이그라운드
               </Action>
               <Action 
                 href="/docs"
                 variant="outline" 
                 size="md"
                 className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 flex items-center justify-center"
               >
                 문서 보기
               </Action>
             </div>
          </Panel>
        </section>
      </div>
    </div>
  )
} 