'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  useSimpleMotion,
  usePageMotions,
  useSmartMotion,
  useFadeIn,
  useSlideUp,
  useScaleIn,
  useBounceIn
} from '@hua-labs/motion'
import { Icon, Button, Action, Panel, Tabs, TabsList, TabsTrigger, TabsContent, Breadcrumb, BreadcrumbItem } from '@hua-labs/ui'
import PerformanceMonitor from '../components/PerformanceMonitor'
import PageHeader from '../components/PageHeader'
import UsageExample from './components/UsageExample'
import { ColorPresetSelector, type ColorPreset, getColorClasses } from '../components/ColorPresetManager'

type TabType = 'simple' | 'smart' | 'page' | 'advanced'

interface TestSettings {
  reducedMotion: boolean
  hoverEnabled: boolean
  rtlDirection: boolean
}

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simple')
  const [testSettings, setTestSettings] = useState<TestSettings>({
    reducedMotion: false,
    hoverEnabled: true,
    rtlDirection: false
  })

  // 로컬스토리지에서 설정 불러오기
  useEffect(() => {
    const savedSettings = localStorage.getItem('hua-motion-test-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setTestSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  // 설정 변경 시 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem('hua-motion-test-settings', JSON.stringify(testSettings))
  }, [testSettings])

  const tabs = [
    { id: 'simple' as TabType, name: 'Simple Motion', icon: 'zap' as const, color: 'indigo' as ColorPreset },
    { id: 'smart' as TabType, name: 'Smart Motion', icon: 'sparkles' as const, color: 'emerald' as ColorPreset }, // green에서 emerald로 변경
    { id: 'page' as TabType, name: 'Page Motion', icon: 'layers' as const, color: 'purple' as ColorPreset },
    { id: 'advanced' as TabType, name: 'Advanced', icon: 'settings' as const, color: 'blue' as ColorPreset }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 성능 모니터 컴포넌트 */}
      <PerformanceMonitor position="top-right" showByDefault={true} />

      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* 브레드크럼 */}
        <div className="flex justify-start animate-fade-in-down">
          <Breadcrumb variant="glass" className="mb-6">
            <BreadcrumbItem href="/">홈</BreadcrumbItem>
            <BreadcrumbItem isCurrent>테스트 랩</BreadcrumbItem>
          </Breadcrumb>
        </div>

        {/* 페이지 헤더 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <PageHeader
            title="통합 테스트 랩"
            description="모든 모션 훅들을 실제로 테스트하고 성능을 확인해보세요"
            icon="flask-conical"
            color="green"
            maxWidth="4xl"
            variant="default"
          >
            <div className="flex flex-wrap gap-4 justify-center">
              <Action 
                href="/showcase"
                variant="gradient" 
                gradient="blue"
                size="md"
                className="flex items-center justify-center"
              >
                쇼케이스 보기
              </Action>
              <Action 
                href="/playground"
                variant="gradient" 
                gradient="purple"
                size="md"
                className="flex items-center justify-center"
              >
                플레이그라운드
              </Action>
            </div>
          </PageHeader>
        </div>

        {/* 탭 네비게이션 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <Tabs value={activeTab} onValueChange={(value) => {
            console.log('Tabs onValueChange called:', value)
            setActiveTab(value as TabType)
          }} className="mb-8">
            <TabsList variant="pills" size="lg" className="grid w-full grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  active={activeTab === tab.id}
                  className="flex items-center gap-2"
                  onClick={() => {
                    console.log('TabsTrigger direct onClick:', tab.id)
                    setActiveTab(tab.id)
                  }}
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
        <div className="animate-fade-in-up" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
          <div className="bg-gradient-to-br from-white/90 via-green-50/30 to-emerald-50/30 dark:from-slate-800/90 dark:via-slate-800/90 dark:to-slate-800/90 backdrop-blur-sm p-8 shadow-2xl border border-green-200/30 dark:border-slate-700/30">
            <TabsContent value="simple" active={activeTab === 'simple'}>
              <SimpleMotionTab />
            </TabsContent>
            
            <TabsContent value="smart" active={activeTab === 'smart'}>
              <SmartMotionTab />
            </TabsContent>
            
            <TabsContent value="page" active={activeTab === 'page'}>
              <PageMotionTab />
            </TabsContent>
            
            <TabsContent value="advanced" active={activeTab === 'advanced'}>
              <AdvancedMotionTab />
            </TabsContent>
          </div>
        </div>

        {/* 실제 사용 예시 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <UsageExample 
            examples={[
              {
                title: "Simple Motion",
                description: "프리셋 기반, 빠른 설정",
                code: "useSimpleMotion('home')",
                color: "blue"
              },
              {
                title: "Smart Motion", 
                description: "개별 요소 제어",
                code: "useMotion({type: 'hero'})",
                color: "green"
              },
              {
                title: "Advanced Motion",
                description: "완전한 커스터마이징", 
                code: "useFadeIn(), useSlideUp()",
                color: "purple"
              }
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// Simple Motion Sample Component
function SimpleMotionSample() {
  const motions = useSimpleMotion('home')

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section 
        data-motion-id="hero"
        style={motions.hero?.style}
        className="text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white"
      >
        <div className="max-w-3xl mx-auto">
          <Icon name="star" size={64} className="mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            HUA Motion SDK
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-indigo-100 leading-relaxed">
            React 모션을 더 간단하고 빠르게 만들어보세요
          </p>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 text-lg">
            시작하기
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div 
          data-motion-id="title"
          style={motions.title?.style}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 lg:p-8 text-white text-center"
        >
          <Icon name="zap" size={40} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">빠른 설정</h3>
          <p className="text-purple-100">한 줄의 코드로 모션 시작</p>
        </div>
        
        <div 
          data-motion-id="description"
          style={motions.description?.style}
          className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 lg:p-8 text-white text-center"
        >
          <Icon name="layers" size={40} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">3단계 추상화</h3>
          <p className="text-pink-100">Simple → Smart → Advanced</p>
        </div>
        
        <div 
          data-motion-id="cta"
          style={motions.cta?.style}
          className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 lg:p-8 text-white text-center"
        >
          <Icon name="sparkles" size={40} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">성능 최적화</h3>
          <p className="text-rose-100">60fps 부드러운 모션</p>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 dark:border-slate-700/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            왜 HUA Motion인가요?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            복잡한 모션 설정 없이도 아름다운 웹사이트를 만들 수 있습니다. 
프리셋 기반의 Simple Motion으로 빠르게 시작하고, 
필요에 따라 Smart와 Advanced 단계로 발전시킬 수 있습니다.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 px-4 sm:px-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white">
        <h2 className="text-3xl font-bold mb-4">지금 시작해보세요</h2>
        <p className="text-xl mb-8 text-blue-100">
          HUA Motion SDK로 더 나은 사용자 경험을 만들어보세요
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300">
            문서 보기
          </button>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
            예제 보기
          </button>
        </div>
      </section>
    </div>
  )
}

// Simple Motion Tab Component
function SimpleMotionTab() {
  const [key, setKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const restartAnimation = () => {
    setIsAnimating(true)
    // 컴포넌트를 언마운트/마운트하여 모션 재시작
    setKey(prev => prev + 1)
    setTimeout(() => setIsAnimating(false), 100)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Icon name="zap" size={24} />
          Simple Motion
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          프리셋 기반의 간단하고 빠른 모션
        </p>
        
        {/* 재실행 버튼 */}
        <button
          onClick={restartAnimation}
          disabled={isAnimating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="refresh" size={16} className={isAnimating ? 'animate-spin' : ''} />
          모션 재실행
        </button>
      </div>

      {/* 샘플 컴포넌트 */}
      <div key={key}>
        <SimpleMotionSample />
      </div>
    </div>
  )
}

// Smart Motion Sample Component
function SmartMotionSample() {
  // Smart Motion - threshold를 0.1로 설정하여 모션이 처음부터 시작되도록 함
  const heroRef = useSmartMotion<HTMLDivElement>({ type: 'hero', threshold: 0.1 })
  const titleRef = useSmartMotion<HTMLHeadingElement>({ type: 'title', threshold: 0.1 })
  const buttonRef = useSmartMotion<HTMLButtonElement>({ type: 'button', threshold: 0.1 })
  const cardRef = useSmartMotion<HTMLDivElement>({ type: 'card', threshold: 0.1 })

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl text-white">
        <div 
          ref={heroRef.ref}
          style={heroRef.style}
          className="max-w-3xl mx-auto"
        >
          <Icon name="sparkles" size={64} className="mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Smart Motion
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-green-100 leading-relaxed">
            개별 요소별 완전한 제어가 가능한 모션
          </p>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 text-lg">
            시작하기
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          ref={titleRef.ref}
          style={titleRef.style}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="type" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Title Element</h3>
          <p>개별 제어 가능한 타이틀</p>
        </div>
        
        <div 
          ref={cardRef.ref}
          style={cardRef.style}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="layers" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Card Element</h3>
          <p>호버/클릭 효과 포함</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white text-center">
          <Icon name="mousePointer" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Interactive Button</h3>
          <p>호버와 클릭 효과를 체험해보세요</p>
          <button
            ref={buttonRef.ref}
            style={buttonRef.style}
            className="mt-4 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300"
          >
            클릭해보세요
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <Icon name="settings" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Custom Control</h3>
          <p>각 요소별 개별 설정 가능</p>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 dark:border-slate-700/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Smart Motion의 장점
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            각 요소별로 개별적인 모션 설정이 가능합니다. 
            threshold, delay, duration 등을 세밀하게 조정할 수 있어 
            더욱 정교한 모션을 구현할 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  )
}

// Smart Motion Tab Component
function SmartMotionTab() {
  const [key, setKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const restartAnimation = () => {
    setIsAnimating(true)
    // 컴포넌트를 언마운트/마운트하여 모션 재시작
    setKey(prev => prev + 1)
    setTimeout(() => setIsAnimating(false), 100)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Icon name="sparkles" size={24} />
          Smart Motion
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          개별 요소별 완전한 제어가 가능한 모션
        </p>
        
        {/* 재실행 버튼 */}
        <button
          onClick={restartAnimation}
          disabled={isAnimating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="refresh" size={16} className={isAnimating ? 'animate-spin' : ''} />
          모션 재실행
        </button>
      </div>

      {/* 샘플 컴포넌트 */}
      <div key={key}>
        <SmartMotionSample />
      </div>
    </div>
  )
}

// Page Motion Sample Component
function PageMotionSample() {
  // Page Motion - 진짜 페이지 레벨 모션
  const pageMotions = usePageMotions(useMemo(() => ({
    hero: { type: 'hero' },
    enter: { type: 'hero' },
    exit: { type: 'title' },
    layout: { type: 'card' },
    transition: { type: 'button' },
    flow: { type: 'card', delay: 400, threshold: 0.1 } // threshold를 낮춰서 더 빨리 트리거되도록
  }), []))

  // 안전한 접근을 위한 헬퍼 함수
  const getMotionRef = (id: string) => {
    return (pageMotions as any)[id] || null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section 
        data-motion-id="hero"
        ref={getMotionRef('hero')?.ref}
        style={getMotionRef('hero')?.style}
        className="text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl text-white"
      >
        <div 
          data-motion-id="enter"
          ref={getMotionRef('enter')?.ref}
          style={getMotionRef('enter')?.style}
          className="max-w-3xl mx-auto"
        >
          <Icon name="logIn" size={64} className="mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Page Motion
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-purple-100 leading-relaxed">
            페이지 전환과 레이아웃 모션
          </p>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 text-lg">
            시작하기
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          data-motion-id="exit"
          ref={getMotionRef('exit')?.ref}
          style={getMotionRef('exit')?.style}
          className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="logOut" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Exit Motion</h3>
          <p>페이지 종료 모션</p>
        </div>
        
        <div 
          data-motion-id="layout"
          ref={getMotionRef('layout')?.ref}
          style={getMotionRef('layout')?.style}
          className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="layers" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Layout Motion</h3>
          <p>레이아웃 변화 모션</p>
        </div>
        
        <div 
          data-motion-id="transition"
          ref={getMotionRef('transition')?.ref}
          style={getMotionRef('transition')?.style}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="arrowRight" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Transition</h3>
          <p>부드러운 전환 효과</p>
        </div>
        
        <div 
          data-motion-id="flow"
          ref={getMotionRef('flow')?.ref}
          style={getMotionRef('flow')?.style}
          className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="navigation" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Page Flow</h3>
          <p>페이지 간 자연스러운 흐름</p>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 dark:border-slate-700/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Page Motion의 특징
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            페이지 전환 시 자연스러운 모션을 제공합니다. 
            진입, 종료, 레이아웃 변화, 전환 효과를 통합적으로 관리하여 
            일관된 사용자 경험을 만들어냅니다.
          </p>
        </div>
      </section>
    </div>
  )
}

// Page Motion Tab Component
function PageMotionTab() {
  const [key, setKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const restartAnimation = () => {
    setIsAnimating(true)
    // 컴포넌트를 언마운트/마운트하여 모션 재시작
    setKey(prev => prev + 1)
    setTimeout(() => setIsAnimating(false), 100)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Icon name="layers" size={24} />
            Page Motion
          </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          페이지 전환과 레이아웃 애니메이션
        </p>
        
        {/* 재실행 버튼 */}
        <button
          onClick={restartAnimation}
          disabled={isAnimating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="refresh" size={16} className={isAnimating ? 'animate-spin' : ''} />
          애니메이션 재실행
        </button>
      </div>

      {/* 샘플 컴포넌트 */}
      <div key={key}>
        <PageMotionSample />
      </div>
    </div>
  )
}

// Advanced Motion Tab Component
function AdvancedMotionTab() {
  // 간단한 인트로 모션들
  const titleRef = useFadeIn({ delay: 100 })
  const heroRef = useSlideUp({ delay: 200 })
  const cardsRef = useScaleIn({ delay: 300 })
  const ctaRef = useBounceIn({ delay: 500 })

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h2 
          ref={titleRef.ref}
          style={titleRef.style}
          className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-2"
        >
          <Icon name="settings" size={24} />
          Advanced Motion
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          개별 애니메이션 훅들을 직접 사용하고 실험해보세요
        </p>
      </div>

      {/* 플레이그라운드 안내 섹션 */}
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <section 
          ref={heroRef.ref}
          style={heroRef.style}
          className="text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl text-white"
        >
          <div className="max-w-3xl mx-auto">
            <Icon name="settings" size={64} className="mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Motion Playground
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 leading-relaxed">
              개별 훅들을 실험하고 조합해보세요
            </p>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 text-lg">
              플레이그라운드로 이동
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={cardsRef.ref}
          style={cardsRef.style}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-8 text-white text-center">
            <Icon name="eye" size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">useFadeIn</h3>
            <p>페이드 인 애니메이션</p>
          </div>
          
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
            <Icon name="arrowUp" size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">useSlideUp</h3>
            <p>슬라이드 업 애니메이션</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white text-center">
            <Icon name="maximize" size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">useScaleIn</h3>
            <p>스케일 인 애니메이션</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-lime-600 rounded-2xl p-8 text-white text-center">
            <Icon name="zap" size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">useBounceIn</h3>
            <p>바운스 인 애니메이션</p>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 dark:border-slate-700/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              플레이그라운드에서 할 수 있는 것들
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔧 개별 훅 실험</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  각 애니메이션 훅의 파라미터를 조정하고 결과를 실시간으로 확인
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎨 훅 조합</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  여러 훅을 조합하여 복잡한 애니메이션 시퀀스 만들기
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📝 코드 생성</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  실험한 설정을 실제 코드로 변환하여 프로젝트에 적용
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={ctaRef.ref}
          style={ctaRef.style}
          className="text-center py-12 px-4 sm:px-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white"
        >
          <h2 className="text-3xl font-bold mb-4">지금 플레이그라운드로 이동하세요</h2>
          <p className="text-xl mb-8 text-indigo-100">
            개별 애니메이션 훅들을 자유롭게 실험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-300">
              플레이그라운드 열기
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
              문서 보기
            </button>
          </div>
        </section>
      </div>
    </div>
  )
} 