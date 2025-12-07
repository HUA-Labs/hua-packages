'use client'

import React from 'react'
import { Icon, Tabs, TabsContent, TabsList, TabsTrigger, Panel, Breadcrumb, BreadcrumbItem } from '@hua-labs/ui'
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core'
import PageHeader from '@/app/components/PageHeader'
import { CoreAbstraction } from './components/CoreAbstraction'
import { CorePage } from './components/CorePage'

export default function CorePlaygroundPage() {
  const [activeTab, setActiveTab] = React.useState('abstraction')

  // 모션 라이브러리 훅 사용
  const breadcrumbRef = useFadeIn({ delay: 0, duration: 600 })
  const headerRef = useFadeIn({ delay: 150, duration: 600 })
  const stageInfoRef = useSlideUp({ delay: 300, duration: 600 })
  const tabsRef = useSlideUp({ delay: 450, duration: 600 })
  const contentRef = useSlideUp({ delay: 600, duration: 600 })

  const tabs = [
    {
      id: 'abstraction',
      name: '3단계 추상화',
      icon: 'layers' as const,
      description: 'Simple, Page, Smart Motion의 차이점을 체험해보세요'
    },
    {
      id: 'page',
      name: '페이지 모션',
      icon: 'fileText' as const,
      description: 'usePageMotions로 페이지 레벨 모션을 관리해보세요'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* 브레드크럼 */}
        <div ref={breadcrumbRef.ref} style={breadcrumbRef.style} className="flex justify-start">
          <Breadcrumb variant="glass" className="mb-6">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/playground">Playground</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Core</BreadcrumbItem>
          </Breadcrumb>
        </div>

        {/* 통일된 페이지 헤더 */}
        <div ref={headerRef.ref} style={headerRef.style}>
          <PageHeader
            title="Core 플레이그라운드"
            description="기본 모션 훅들과 3단계 추상화 시스템을 체험해보세요"
            icon="zap"
            color="blue"
            maxWidth="4xl"
            variant="default"
          />
        </div>

        {/* 단계 정보 섹션 */}
        <section ref={stageInfoRef.ref} style={stageInfoRef.style} className="mb-12">
          <Panel style="glass" className="p-6 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full border border-blue-200 dark:border-blue-600/50 mb-4 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mr-3 animate-pulse" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Core Stage
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                기본 모션 훅들과 3단계 추상화
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Simple Motion부터 Smart Motion까지 단계별로 체험해보세요
              </p>
            </div>
          </Panel>
        </section>

        {/* 탭 네비게이션 */}
        <div ref={tabsRef.ref} style={tabsRef.style}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList variant="pills" size="lg" className="flex w-full gap-2">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  active={activeTab === tab.id}
                  className="flex items-center gap-2 flex-1"
                >
                  <Icon name={tab.icon as any} className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 탭 컨텐츠 */}
        <div ref={contentRef.ref} style={contentRef.style}>
          <div className="bg-gradient-to-br from-white/90 via-blue-50/30 to-indigo-50/30 dark:from-slate-800/90 dark:via-slate-800/90 dark:to-slate-800/90 backdrop-blur-sm p-8 shadow-2xl border border-blue-200/30 dark:border-slate-700/30">
            <TabsContent value="abstraction">
              <CoreAbstraction />
            </TabsContent>
            
            <TabsContent value="page">
              <CorePage />
            </TabsContent>
          </div>
        </div>
      </div>
    </div>
  )
}
