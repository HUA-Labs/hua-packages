'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  useSimplePageAnimation, 
  useSmartAnimation, 
  usePageAnimations,
  useFadeIn,
  useSlideUp,
  useScaleIn,
  useBounceIn
} from '@hua-labs/motion'
import { Icon, Button, Action, Panel, Tabs, TabsList, TabsTrigger, TabsContent } from '@hua-labs/ui'
import PerformanceMonitor from '../components/PerformanceMonitor'
import PageHeader from '../components/PageHeader'

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
    { id: 'simple' as TabType, name: 'Simple Animation', icon: 'zap' as const, color: 'indigo' },
    { id: 'smart' as TabType, name: 'Smart Animation', icon: 'sparkles' as const, color: 'green' },
    { id: 'page' as TabType, name: 'Page Animation', icon: 'layers' as const, color: 'purple' },
    { id: 'advanced' as TabType, name: 'Advanced', icon: 'settings' as const, color: 'blue' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 성능 모니터 컴포넌트 */}
      <PerformanceMonitor position="top-right" showByDefault={true} />

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <PageHeader
          title="Animation Test Lab"
          description="모든 애니메이션 기능을 한 곳에서 테스트하고 성능을 측정해보세요"
          icon="flask-conical"
          color="indigo"
          maxWidth="4xl"
        >
          {/* 간단한 설명 */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">실시간 성능 모니터링</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">3단계 추상화 테스트</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">개별 훅 실험</span>
              </div>
            </div>
          </div>
        </PageHeader>

        {/* 탭 네비게이션 */}
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

        {/* 탭 컨텐츠 */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20">
          <TabsContent value="simple" active={activeTab === 'simple'}>
            <SimpleAnimationTab />
          </TabsContent>
          
          <TabsContent value="smart" active={activeTab === 'smart'}>
            <SmartAnimationTab />
          </TabsContent>
          
          <TabsContent value="page" active={activeTab === 'page'}>
            <PageAnimationTab />
          </TabsContent>
          
          <TabsContent value="advanced" active={activeTab === 'advanced'}>
            <AdvancedAnimationTab />
          </TabsContent>
        </div>

        {/* 실제 사용 예시 설명 */}
        <div className="mt-8 text-center">
          <Panel 
            style="glass" 
            padding="lg" 
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              💡 실제 사용 예시
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              위의 샘플은 실제 웹사이트에서 HUA Motion SDK를 사용하는 방법을 보여줍니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="font-semibold text-blue-600 dark:text-blue-400">Simple Animation</div>
                <div className="text-gray-600 dark:text-gray-400">프리셋 기반, 빠른 설정</div>
                <code className="text-xs text-blue-500 mt-2 block">useSimplePageAnimation(&apos;home&apos;)</code>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="font-semibold text-green-600 dark:text-green-400">Smart Animation</div>
                <div className="text-gray-600 dark:text-gray-400">개별 요소 제어</div>
                <code className="text-xs text-green-500 mt-2 block">useSmartAnimation(&#123;type: &quot;hero&quot;&#125;)</code>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="font-semibold text-purple-600 dark:text-purple-400">Advanced Animation</div>
                <div className="text-gray-600 dark:text-gray-400">완전한 커스터마이징</div>
                <code className="text-xs text-purple-500 mt-2 block">useFadeIn(), useSlideUp()</code>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>사용법:</strong> 각 탭을 클릭하여 3단계 추상화의 차이점을 체험해보세요. 
                재실행 버튼으로 애니메이션을 다시 볼 수 있습니다.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

// Simple Animation Sample Component
function SimpleAnimationSample() {
  const animations = useSimplePageAnimation('home')

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section 
        data-animation-id="hero"
        style={animations.hero?.style}
        className="text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white"
      >
        <div className="max-w-3xl mx-auto">
          <Icon name="star" size={64} className="mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            HUA Motion SDK
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-indigo-100 leading-relaxed">
            React 애니메이션을 더 간단하고 빠르게 만들어보세요
          </p>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 text-lg">
            시작하기
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div 
          data-animation-id="title"
          style={animations.title?.style}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 lg:p-8 text-white text-center"
        >
          <Icon name="zap" size={40} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">빠른 설정</h3>
          <p className="text-purple-100">한 줄의 코드로 애니메이션 시작</p>
        </div>
        
        <div 
          data-animation-id="description"
          style={animations.description?.style}
          className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 lg:p-8 text-white text-center"
        >
          <Icon name="layers" size={40} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">3단계 추상화</h3>
          <p className="text-pink-100">Simple → Smart → Advanced</p>
        </div>
        
        <div 
          data-animation-id="cta"
          style={animations.cta?.style}
          className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 lg:p-8 text-white text-center"
        >
          <Icon name="sparkles" size={40} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">성능 최적화</h3>
          <p className="text-rose-100">60fps 부드러운 애니메이션</p>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 dark:border-slate-700/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            왜 HUA Motion인가요?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            복잡한 애니메이션 설정 없이도 아름다운 웹사이트를 만들 수 있습니다. 
            프리셋 기반의 Simple Animation으로 빠르게 시작하고, 
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

// Simple Animation Tab Component
function SimpleAnimationTab() {
  const [key, setKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const restartAnimation = () => {
    setIsAnimating(true)
    // 컴포넌트를 언마운트/마운트하여 애니메이션 재시작
    setKey(prev => prev + 1)
    setTimeout(() => setIsAnimating(false), 100)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🎨 Simple Animation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          프리셋 기반의 간단하고 빠른 애니메이션
        </p>
        
        {/* 재실행 버튼 */}
        <button
          onClick={restartAnimation}
          disabled={isAnimating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="refresh" size={16} className={isAnimating ? 'animate-spin' : ''} />
          애니메이션 재실행
        </button>
      </div>

      {/* 샘플 컴포넌트 */}
      <div key={key}>
        <SimpleAnimationSample />
      </div>
    </div>
  )
}

// Smart Animation Sample Component
function SmartAnimationSample() {
  // Smart Animation - threshold를 0.1로 설정하여 애니메이션이 처음부터 시작되도록 함
  const heroRef = useSmartAnimation<HTMLDivElement>({ type: 'hero', threshold: 0.1 })
  const titleRef = useSmartAnimation<HTMLHeadingElement>({ type: 'title', threshold: 0.1 })
  const buttonRef = useSmartAnimation<HTMLButtonElement>({ type: 'button', threshold: 0.1 })
  const cardRef = useSmartAnimation<HTMLDivElement>({ type: 'card', threshold: 0.1 })

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
            Smart Animation
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-green-100 leading-relaxed">
            개별 요소별 완전한 제어가 가능한 애니메이션
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
            Smart Animation의 장점
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            각 요소별로 개별적인 애니메이션 설정이 가능합니다. 
            threshold, delay, duration 등을 세밀하게 조정할 수 있어 
            더욱 정교한 애니메이션을 구현할 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  )
}

// Smart Animation Tab Component
function SmartAnimationTab() {
  const [key, setKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const restartAnimation = () => {
    setIsAnimating(true)
    // 컴포넌트를 언마운트/마운트하여 애니메이션 재시작
    setKey(prev => prev + 1)
    setTimeout(() => setIsAnimating(false), 100)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          🧠 Smart Animation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          개별 요소별 완전한 제어가 가능한 애니메이션
        </p>
        
        {/* 재실행 버튼 */}
        <button
          onClick={restartAnimation}
          disabled={isAnimating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="refresh" size={16} className={isAnimating ? 'animate-spin' : ''} />
          애니메이션 재실행
        </button>
      </div>

      {/* 샘플 컴포넌트 */}
      <div key={key}>
        <SmartAnimationSample />
      </div>
    </div>
  )
}

// Page Animation Sample Component
function PageAnimationSample() {
  // Page Animation - 진짜 페이지 레벨 애니메이션
  const pageAnimations = usePageAnimations(useMemo(() => ({
    enter: { type: 'hero' },
    exit: { type: 'title' },
    layout: { type: 'card' },
    transition: { type: 'button' },
    hero: { type: 'hero' },
    flow: { type: 'card', delay: 400, threshold: 0.1 } // threshold를 낮춰서 더 빨리 트리거되도록
  }), []))

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section 
        data-animation-id="hero"
        style={pageAnimations.hero?.style}
        className="text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl text-white"
      >
        <div 
          data-animation-id="enter"
          style={pageAnimations.enter?.style}
          className="max-w-3xl mx-auto"
        >
          <Icon name="logIn" size={64} className="mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Page Animation
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-purple-100 leading-relaxed">
            페이지 전환과 레이아웃 애니메이션
          </p>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 text-lg">
            시작하기
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          data-animation-id="exit"
          style={pageAnimations.exit?.style}
          className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="logOut" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Exit Animation</h3>
          <p>페이지 종료 애니메이션</p>
        </div>
        
        <div 
          data-animation-id="layout"
          style={pageAnimations.layout?.style}
          className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="layers" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Layout Animation</h3>
          <p>레이아웃 변화 애니메이션</p>
        </div>
        
        <div 
          data-animation-id="transition"
          style={pageAnimations.transition?.style}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name="arrowRight" size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Transition</h3>
          <p>부드러운 전환 효과</p>
        </div>
        
        <div 
          data-animation-id="flow"
          style={pageAnimations.flow?.style}
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
            Page Animation의 특징
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            페이지 전환 시 자연스러운 애니메이션을 제공합니다. 
            진입, 종료, 레이아웃 변화, 전환 효과를 통합적으로 관리하여 
            일관된 사용자 경험을 만들어냅니다.
          </p>
        </div>
      </section>
    </div>
  )
}

// Page Animation Tab Component
function PageAnimationTab() {
  const [key, setKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const restartAnimation = () => {
    setIsAnimating(true)
    // 컴포넌트를 언마운트/마운트하여 애니메이션 재시작
    setKey(prev => prev + 1)
    setTimeout(() => setIsAnimating(false), 100)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
          📄 Page Animation
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
        <PageAnimationSample />
      </div>
    </div>
  )
}

// Advanced Animation Tab Component
function AdvancedAnimationTab() {
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
          style={{ opacity: titleRef.opacity }}
          className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
        >
          ⚡ Advanced Animation
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
          style={{ opacity: heroRef.opacity, transform: `translateY(${heroRef.translateY}px)` }}
          className="text-center py-16 px-4 sm:px-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl text-white"
        >
          <div className="max-w-3xl mx-auto">
            <Icon name="settings" size={64} className="mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Animation Playground
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
          style={{ opacity: cardsRef.opacity, transform: `scale(${cardsRef.scale})` }}
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
          style={{ opacity: ctaRef.opacity, transform: `scale(${ctaRef.scale})` }}
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