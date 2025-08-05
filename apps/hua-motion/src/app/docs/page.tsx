'use client'

import React from 'react'
import { 
  Icon, 
  Action,
  ScrollToTop
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        <PageHeader
          title="HUA Motion 문서"
          description="3단계 모션 시스템 완전 가이드"
          icon="book"
          color="blue"
          maxWidth="4xl"
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Action 
              onClick={() => scrollToSection('getting-started')}
              variant="outline"
              size="lg"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <Icon name="rocket" size={20} className="mr-1" />
              시작하기
            </Action>
            
            <Action 
              onClick={() => scrollToSection('api-reference')}
              variant="outline"
              size="lg"
              className="border-gray-500 text-gray-700 hover:bg-gray-50 dark:border-gray-400 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              <Icon name="code" size={20} className="mr-1" />
              API 참조
            </Action>
          </div>
        </PageHeader>

        {/* 섹션들 */}
        <GettingStartedSection scrollToSection={scrollToSection} />
        <TierSystemSection />
        <IndividualHooksSection />
        <ApiReferenceSection />
      </div>
      
      {/* 스크롤 투 탑 버튼 */}
      <ScrollToTop 
        threshold={300}
        smooth={true}
        size="lg"
        variant="primary"
        icon="arrowUp"
        className="shadow-2xl shadow-blue-500/25"
      />
    </div>
  )
} 