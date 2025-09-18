'use client'

import React from 'react'
import { Icon, Tabs, TabsContent, TabsList, TabsTrigger, Panel, Breadcrumb, BreadcrumbItem } from '@hua-labs/ui'
import { useFadeIn, useSlideUp } from '@hua-labs/motion'
import PageHeader from '@/app/components/PageHeader'
import { AdvancedPageTransition } from './components/AdvancedPageTransition'
import { AdvancedPageMotion } from './components/AdvancedPageMotion'

export default function AdvancedPlaygroundPage() {
  const [activeTab, setActiveTab] = React.useState('pageTransition')

  // 모션 라이브러리 훅 사용
  const breadcrumbRef = useFadeIn({ delay: 0, duration: 600 })
  const headerRef = useFadeIn({ delay: 150, duration: 600 })
  const stageInfoRef = useSlideUp({ delay: 300, duration: 600 })
  const tabsRef = useSlideUp({ delay: 450, duration: 600 })
  const contentRef = useSlideUp({ delay: 600, duration: 600 })

  const tabs = [
    {
      id: 'pageTransition',
      name: '페이지 전환',
      icon: 'arrowRight' as const,
      description: 'usePageTransition으로 부드러운 페이지 전환을 구현해보세요'
    },
    {
      id: 'pageMotion',
      name: '고급 페이지 모션',
      icon: 'layers' as const,
      description: 'usePageMotions의 고급 기능들을 체험해보세요'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* 브레드크럼 */}
        <div ref={breadcrumbRef.ref} style={breadcrumbRef.style} className="flex justify-start">
          <Breadcrumb variant="glass" className="mb-6">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/playground">Playground</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Advanced</BreadcrumbItem>
          </Breadcrumb>
        </div>

        {/* 통일된 페이지 헤더 */}
        <div ref={headerRef.ref} style={headerRef.style}>
          <PageHeader
            title="Advanced 플레이그라운드"
            description="고급 페이지 전환과 애니메이션 기능을 체험해보세요"
            icon="settings"
            color="purple"
            maxWidth="4xl"
            variant="default"
          />
        </div>

        {/* 단계 정보 섹션 */}
        <section ref={stageInfoRef.ref} style={stageInfoRef.style} className="mb-12">
          <Panel style="glass" className="p-6 bg-gradient-to-br from-purple-50/80 via-violet-50/60 to-fuchsia-50/80 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-fuchsia-900/20 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/30">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-full border border-purple-200 dark:border-purple-600/50 mb-4 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 mr-3 animate-pulse" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  Advanced Stage
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                고급 페이지 전환과 애니메이션
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                페이지 전환, 고급 모션, 성능 최적화 기능을 체험해보세요
              </p>
            </div>
          </Panel>
        </section>

        {/* 탭 네비게이션 */}
        <div ref={tabsRef.ref} style={tabsRef.style}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList variant="pills" size="lg" className="grid w-full grid-cols-2">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  active={activeTab === tab.id}
                  className="flex items-center gap-2"
                >
                  <Icon name={tab.icon} className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 탭 컨텐츠 */}
        <div ref={contentRef.ref} style={contentRef.style}>
          <div className="bg-gradient-to-br from-white/90 via-purple-50/30 to-violet-50/30 dark:from-slate-800/90 dark:via-slate-800/90 dark:to-slate-800/90 backdrop-blur-sm p-8 shadow-2xl border border-purple-200/30 dark:border-slate-700/30">
            <TabsContent value="pageTransition" active={activeTab === 'pageTransition'}>
              <AdvancedPageTransition />
            </TabsContent>
            
            <TabsContent value="pageMotion" active={activeTab === 'pageMotion'}>
              <AdvancedPageMotion />
            </TabsContent>
          </div>
        </div>
      </div>
    </div>
  )
}
