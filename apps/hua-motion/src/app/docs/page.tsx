'use client'

import React from 'react'
import { 
  Icon, 
  Action,
  Breadcrumb,
  BreadcrumbItem
} from '@hua-labs/ui'
import PageHeader from '../components/PageHeader'
import GettingStartedSection from './components/GettingStartedSection'
import TierSystemSection from './components/TierSystemSection'
import IndividualHooksSection from './components/IndividualHooksSection'
import ApiReferenceSection from './components/ApiReferenceSection'

export default function DocsPage() {
  // 스무스 스크롤 함수
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 80 // 헤더 높이 (px)
      const elementPosition = element.offsetTop - headerHeight - 20 // 헤더 높이 + 추가 여백
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  // 페이지 로드 시 해시 프래그먼트 처리
  React.useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        // 약간의 지연을 주어 DOM이 완전히 로드된 후 스크롤
        setTimeout(() => {
          scrollToSection(hash)
        }, 100)
      }
    }

    handleHashScroll()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* 브레드크럼 */}
        <div className="flex justify-start animate-fade-in-down">
          <Breadcrumb variant="glass" className="mb-6">
            <BreadcrumbItem href="/">홈</BreadcrumbItem>
            <BreadcrumbItem isCurrent>문서</BreadcrumbItem>
          </Breadcrumb>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <PageHeader
            title="HUA Motion 문서"
            description="3단계 모션 시스템 완전 가이드"
            icon="book"
            color="blue"
            maxWidth="4xl"
            variant="default"
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Action 
                onClick={() => scrollToSection('getting-started')}
              variant="outline"
                size="lg"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center"
            >
              <Icon name="rocket" size={20} className="mr-1" />
              시작하기
              </Action>
              
              <Action 
                onClick={() => scrollToSection('api-reference')}
                variant="outline"
                size="lg"
              className="border-gray-500 text-gray-700 hover:bg-gray-50 dark:border-gray-400 dark:text-gray-300 dark:hover:bg-slate-700 flex items-center justify-center"
              >
              <Icon name="code" size={20} className="mr-1" />
                  API 참조
              </Action>
          </div>
        </PageHeader>
        </div>

        {/* 섹션들 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <GettingStartedSection scrollToSection={scrollToSection} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
          <TierSystemSection />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <IndividualHooksSection />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '750ms', animationFillMode: 'both' }}>
          <ApiReferenceSection />
        </div>
       </div>
       

     </div>
   )
 } 