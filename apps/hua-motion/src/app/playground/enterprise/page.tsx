'use client'

import React from 'react'
import { Icon, Tabs, TabsContent, TabsList, TabsTrigger, Panel, Breadcrumb, BreadcrumbItem, Action } from '@hua-labs/ui'
import Link from 'next/link'
import PageHeader from '@/app/components/PageHeader'
import { Enterprise3D } from './components/Enterprise3D'
import { EnterprisePhysics } from './components/EnterprisePhysics'
import { EnterprisePerformance } from './components/EnterprisePerformance'
import { EnterpriseAI } from './components/EnterpriseAI'
import { EnterpriseAnalytics } from './components/EnterpriseAnalytics'

export default function EnterprisePlaygroundPage() {
  const [activeTab, setActiveTab] = React.useState('3d')

  const tabs = [
    {
      id: '3d',
      title: '3D 모션',
      description: '3D 변환과 원근감을 활용한 고급 모션',
      icon: 'square' as const,
      color: 'blue' as const,
      features: ['3D 변환', '원근감', '회전 애니메이션']
    },
    {
      id: 'physics',
      title: '물리 기반 모션',
      description: '자연스러운 물리 법칙을 따르는 모션',
      icon: 'atom' as const,
      color: 'green' as const,
      features: ['스프링 모션', '중력 효과', '탄성 애니메이션']
    },
    {
      id: 'performance',
      title: '성능 최적화',
      description: '고성능 모션과 최적화 기법',
      icon: 'zap' as const,
      color: 'purple' as const,
      features: ['GPU 가속', '메모리 최적화', '프레임 드롭 방지']
    },
    {
      id: 'ai',
      title: 'AI 모션',
      description: '머신러닝 기반 지능형 모션',
      icon: 'brain' as const,
      color: 'orange' as const,
      features: ['사용자 패턴 학습', '자동 모션 생성', '맥락 인식']
    },
    {
      id: 'analytics',
      title: '모션 분석',
      description: '모션 성능과 사용자 경험 분석',
      icon: 'barChart' as const,
      color: 'pink' as const,
      features: ['성능 메트릭', '사용자 행동 분석', 'A/B 테스트']
    }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  // 탭별 컴포넌트 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case '3d':
        return <Enterprise3D />
      case 'physics':
        return <EnterprisePhysics />
      case 'performance':
        return <EnterprisePerformance />
      case 'ai':
        return <EnterpriseAI />
      case 'analytics':
        return <EnterpriseAnalytics />
      default:
        return <Enterprise3D />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* 브레드크럼 */}
        <div className="flex justify-start">
          <Breadcrumb variant="glass" className="mb-6">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/playground">Playground</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Enterprise</BreadcrumbItem>
          </Breadcrumb>
        </div>

        {/* 통일된 페이지 헤더 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <PageHeader
            title="Enterprise 플레이그라운드"
            description="전문가용 고급 모션 기능들을 체험해보세요"
            icon="rocket"
            color="orange"
            maxWidth="4xl"
            variant="default"
          />
        </div>

        {/* 단계 정보 섹션 */}
        <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <Panel style="glass" className="p-6 bg-gradient-to-br from-orange-50/80 via-red-50/60 to-pink-50/80 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/30">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full border border-orange-200 dark:border-orange-600/50 mb-4 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 mr-3 animate-pulse" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  Enterprise Stage
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                전문가용 고급 기능
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                3D 모션, 물리 기반 애니메이션, AI 모션 등 최첨단 기능을 체험해보세요
              </p>
            </div>
          </Panel>
        </section>

        {/* Tab Navigation */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {tabs.map((tab) => (
              <Action
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                variant={activeTab === tab.id ? 'gradient' : 'outline'}
                gradient={tab.color}
                size="lg"
                hover="glow"
                feedback="ripple"
                className="min-w-[200px] flex items-center justify-center"
              >
                <Icon name={tab.icon} className="w-5 h-5 mr-2" />
                {tab.title}
              </Action>
            ))}
          </div>
        </section>

        {/* Tab Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Tab Header */}
            {activeTabData && (
              <div className="text-center mb-12">
                <div className={`w-20 h-20 mx-auto rounded-full ${
                  activeTabData.color === 'blue' ? 'bg-blue-100' : 
                  activeTabData.color === 'green' ? 'bg-green-100' : 
                  activeTabData.color === 'purple' ? 'bg-purple-100' : 
                  activeTabData.color === 'orange' ? 'bg-orange-100' : 
                  'bg-pink-100'
                } flex items-center justify-center mb-6`}>
                  <Icon 
                    name={activeTabData.icon} 
                    className={`w-10 h-10 ${
                      activeTabData.color === 'blue' ? 'text-blue-600' : 
                      activeTabData.color === 'green' ? 'text-green-600' : 
                      activeTabData.color === 'purple' ? 'text-purple-600' : 
                      activeTabData.color === 'orange' ? 'text-orange-600' : 
                      'text-pink-600'
                    }`}
                  />
                </div>
                <h2 className={`text-3xl font-bold mb-4 text-gray-900 dark:text-white`}>
                  {activeTabData.title}
                </h2>
                <p className={`text-lg mb-6 text-gray-600 dark:text-gray-300`}>
                  {activeTabData.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {activeTabData.features.map((feature) => (
                    <span
                      key={feature}
                      className={`px-3 py-1 text-sm font-mono rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border dark:border-yellow-700/30`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className={`rounded-xl shadow-lg p-8 transition-colors duration-300 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700`}>
              {renderTabContent()}
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/playground">
              <Action variant="outline" size="lg" hover="glow" className="flex items-center justify-center">
                <Icon name="arrowLeft" className="w-4 h-4 mr-2" />
                플레이그라운드 메인
              </Action>
            </Link>
            <Link href="/playground/core">
              <Action variant="gradient" gradient="blue" size="lg" hover="glow" className="flex items-center justify-center">
                <Icon name="zap" className="w-4 h-4 mr-2" />
                Core 플레이그라운드
              </Action>
            </Link>
            <Link href="/playground/advanced">
              <Action variant="gradient" gradient="purple" size="lg" hover="glow" className="flex items-center justify-center">
                <Icon name="zap" className="w-4 h-4 mr-2" />
                Advanced 플레이그라운드
              </Action>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
