'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Action, 
  Panel, 
  Icon, 
  Breadcrumb, 
  BreadcrumbItem
} from '@hua-labs/ui'
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core'
import PageHeader from '../components/PageHeader'
 

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<'core' | 'advanced' | 'enterprise'>('core')
  
  // 모션 라이브러리 훅 사용
  const breadcrumbRef = useFadeIn({ delay: 0, duration: 600 })
  const headerRef = useFadeIn({ delay: 150, duration: 600 })
  const tabsRef = useSlideUp({ delay: 300, duration: 600 })
  
  const tabs = [
    {
      id: 'core',
      title: 'Core',
      description: '기본 모션 훅들과 3단계 추상화',
      icon: 'zap' as const,
      color: 'blue',
      status: 'available',
      path: '/playground/core'
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: '고급 페이지 전환과 애니메이션 (개발 중)',
      icon: 'rocket' as const,
      color: 'purple',
      status: 'development',
      path: '/playground/advanced'
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      description: '전문가용 고급 기능',
      icon: 'crown' as const,
      color: 'gold',
      status: 'planned',
      path: '/playground/enterprise'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* 브레드크럼 */}
        <div ref={breadcrumbRef.ref} style={breadcrumbRef.style} className="flex justify-start">
          <Breadcrumb variant="glass" className="mb-6">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Playground</BreadcrumbItem>
          </Breadcrumb>
        </div>

        {/* 통일된 페이지 헤더 */}
        <div ref={headerRef.ref} style={headerRef.style}>
          <PageHeader
            title="HUA Motion Playground"
            description="모션 훅들을 직접 체험하고 테스트해보세요. Core부터 Enterprise까지 단계별로 기능을 경험할 수 있습니다."
            icon="play"
            color="blue"
            maxWidth="4xl"
            variant="default"
          />
        </div>

        {/* Package Selection Tabs */}
        <section ref={tabsRef.ref} style={tabsRef.style}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${450 + index * 100}ms`, animationFillMode: 'both' }}
              >
                <Panel
                  className={`relative overflow-hidden transition-all duration-300 hover:scale-105 min-h-[320px] flex flex-col ${
                    tab.status === 'available' 
                      ? 'border-2 border-blue-200 dark:border-blue-600/50 shadow-lg' 
                      : tab.status === 'development'
                      ? 'border-2 border-orange-200 dark:border-orange-600/50 shadow-md opacity-80'
                      : 'border-2 border-gray-200 dark:border-gray-600/50 opacity-75'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {tab.status === 'available' && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full border border-green-200 dark:border-green-700/50">
                        <Icon name="check" className="w-3 h-3 mr-1" />
                        사용 가능
                      </span>
                    )}
                    {tab.status === 'development' && (
                      <span className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full border border-orange-200 dark:border-orange-700/50">
                        <Icon name="code" className="w-3 h-3 mr-1" />
                        개발 중
                      </span>
                    )}
                    {tab.status === 'coming-soon' && (
                      <span className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full border border-yellow-200 dark:border-yellow-700/50">
                        <Icon name="clock" className="w-3 h-3 mr-1" />
                        준비 중
                      </span>
                    )}
                    {tab.status === 'planned' && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-700/50">
                        <Icon name="calendar" className="w-3 h-3 mr-1" />
                        계획됨
                      </span>
                    )}
                  </div>

                  {/* Panel Content */}
                  <div className="p-6 text-center flex-1 flex flex-col justify-center">
                    <div className="mb-4">
                      <Icon 
                        name={tab.icon} 
                        className={`w-16 h-16 mx-auto text-${tab.color}-500`}
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{tab.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1">{tab.description}</p>
                    
                    {tab.status === 'available' ? (
                      <Link href={tab.path}>
                        <Action 
                          variant="default" 
                          size="lg"
                          className="w-full flex items-center justify-center"
                        >
                          시작하기
                        </Action>
                      </Link>
                    ) : tab.status === 'development' ? (
                      <Action 
                        variant="secondary" 
                        size="lg"
                        className="w-full cursor-not-allowed opacity-50"
                        disabled
                      >
                        개발 중
                      </Action>
                    ) : (
                      <Action 
                        variant="secondary" 
                        size="lg"
                        className="w-full cursor-not-allowed opacity-50"
                        disabled
                      >
                        {tab.status === 'coming-soon' ? '준비 중' : '계획됨'}
                      </Action>
                    )}
                  </div>
                </Panel>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
} 