'use client'

import React, { useState, useEffect } from 'react'
import { 
  useSimplePageAnimation, 
  useSmartAnimation, 
  usePageAnimations,
  useFadeIn,
  useSlideUp,
  useScaleIn,
  useBounceIn
} from '@hua-labs/animation'
import { Icon, Button } from '@hua-labs/ui'

type TabType = 'simple' | 'smart' | 'page' | 'advanced'

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simple')
  const [isAnimating, setIsAnimating] = useState(true)

  // Simple Animation
  const simpleAnimations = useSimplePageAnimation('home')
  
  // Smart Animation - threshold를 0.1로 설정하여 애니메이션이 처음부터 시작되도록 함
  const heroRef = useSmartAnimation<HTMLDivElement>({ type: 'hero', threshold: 0.1 })
  const titleRef = useSmartAnimation<HTMLHeadingElement>({ type: 'title', threshold: 0.1 })
  const buttonRef = useSmartAnimation<HTMLButtonElement>({ type: 'button', threshold: 0.1 })
  const cardRef = useSmartAnimation<HTMLDivElement>({ type: 'card', threshold: 0.1 })
  
  // Page Animation
  const pageAnimations = usePageAnimations({
    enter: { type: 'hero' },
    exit: { type: 'title' },
    layout: { type: 'card' },
    transition: { type: 'button' }
  })
  
  // Advanced Animation - 개별 훅들 사용
  const fadeInAnimation = useFadeIn({ delay: 200 })
  const slideUpAnimation = useSlideUp({ delay: 400 })
  const scaleInAnimation = useScaleIn({ delay: 600 })
  const bounceInAnimation = useBounceIn({ delay: 800 })

  // 페이지 로드 시 자동 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAnimating) {
        startAllAnimations()
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [activeTab, isAnimating])

  const startAllAnimations = () => {
    setIsAnimating(true)
    // 모든 애니메이션은 자동으로 Intersection Observer에 의해 시작됨
    // 페이지를 스크롤하거나 요소가 화면에 나타나면 자동 시작
  }

  const stopAllAnimations = () => {
    setIsAnimating(false)
    // 애니메이션 상태를 비활성화
  }

  const resetAnimations = () => {
    setIsAnimating(true)
    // 페이지를 새로고침하거나 요소를 다시 화면에 보이게 하면 자동 시작
    window.scrollTo(0, 0)
    setTimeout(() => {
      window.scrollTo(0, 100)
    }, 100)
  }

  const tabs = [
    { id: 'simple' as TabType, name: 'Simple Animation', icon: 'zap', color: 'indigo' },
    { id: 'smart' as TabType, name: 'Smart Animation', icon: 'sparkles', color: 'green' },
    { id: 'page' as TabType, name: 'Page Animation', icon: 'layers', color: 'purple' },
    { id: 'advanced' as TabType, name: 'Advanced', icon: 'settings', color: 'blue' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <Icon name={"zap" as any} size={32} className="text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Animation Test Lab
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            모든 애니메이션 기능을 한 곳에서 테스트해보세요
          </p>
          
          {/* Control Panel */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              variant="gradient" 
              gradient="green" 
              size="lg"
              onClick={startAllAnimations}
              disabled={isAnimating}
            >
              <Icon name={"play" as any} size={20} className="mr-2" />
              Start All
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={stopAllAnimations}
              disabled={!isAnimating}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Icon name={"pause" as any} size={20} className="mr-2" />
              Stop All
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={resetAnimations}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Icon name={"refresh" as any} size={20} className="mr-2" />
              Reset
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/25`
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon name={tab.icon as any} size={20} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/50">
          {activeTab === 'simple' && (
            <SimpleAnimationTab animations={simpleAnimations} />
          )}
          
          {activeTab === 'smart' && (
            <SmartAnimationTab 
              heroRef={heroRef}
              titleRef={titleRef}
              buttonRef={buttonRef}
              cardRef={cardRef}
            />
          )}
          
          {activeTab === 'page' && (
            <PageAnimationTab animations={pageAnimations} />
          )}
          
          {activeTab === 'advanced' && (
            <AdvancedAnimationTab 
              fadeInAnimation={fadeInAnimation}
              slideUpAnimation={slideUpAnimation}
              scaleInAnimation={scaleInAnimation}
              bounceInAnimation={bounceInAnimation}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Simple Animation Tab Component
function SimpleAnimationTab({ animations }: { animations: any }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🎨 Simple Animation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          프리셋 기반의 간단하고 빠른 애니메이션
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          data-animation-id="hero"
          style={animations.hero?.style}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"star" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Hero Section</h3>
          <p>자동으로 애니메이션이 적용됩니다</p>
        </div>
        
        <div 
          data-animation-id="title"
          style={animations.title?.style}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"type" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Title Section</h3>
          <p>타이틀 애니메이션 효과</p>
        </div>
        
        <div 
          data-animation-id="description"
          style={animations.description?.style}
          className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"fileText" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Description</h3>
          <p>설명 텍스트 애니메이션</p>
        </div>
        
        <div 
          data-animation-id="cta"
          style={animations.cta?.style}
          className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"zap" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Call to Action</h3>
          <p>CTA 버튼 애니메이션</p>
        </div>
      </div>
    </div>
  )
}

// Smart Animation Tab Component
function SmartAnimationTab({ 
  heroRef, 
  titleRef, 
  buttonRef, 
  cardRef 
}: { 
  heroRef: any
  titleRef: any
  buttonRef: any
  cardRef: any
}) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          🧠 Smart Animation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          개별 요소별 완전한 제어가 가능한 애니메이션
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          ref={heroRef.ref}
          style={heroRef.style}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"sparkles" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Hero Element</h3>
          <p>개별 제어 가능한 히어로</p>
        </div>
        
        <div 
          ref={titleRef.ref}
          style={titleRef.style}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"type" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Title Element</h3>
          <p>개별 제어 가능한 타이틀</p>
        </div>
        
        <div 
          ref={cardRef.ref}
          style={cardRef.style}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"layers" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Card Element</h3>
          <p>호버/클릭 효과 포함</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white text-center">
          <Icon name={"mousePointer" as any} size={48} className="mx-auto mb-4" />
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
      </div>
    </div>
  )
}

// Page Animation Tab Component
function PageAnimationTab({ animations }: { animations: any }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
          📄 Page Animation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          페이지 전환과 레이아웃 애니메이션
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          style={animations.enter?.style}
          className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"logIn" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Enter Animation</h3>
          <p>페이지 진입 애니메이션</p>
        </div>
        
        <div 
          style={animations.exit?.style}
          className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"logOut" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Exit Animation</h3>
          <p>페이지 종료 애니메이션</p>
        </div>
        
        <div 
          style={animations.layout?.style}
          className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"layers" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Layout Animation</h3>
          <p>레이아웃 변화 애니메이션</p>
        </div>
        
        <div 
          style={animations.transition?.style}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"arrowRight" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Transition</h3>
          <p>부드러운 전환 효과</p>
        </div>
      </div>
    </div>
  )
}

// Advanced Animation Tab Component
function AdvancedAnimationTab({ 
  fadeInAnimation, 
  slideUpAnimation, 
  scaleInAnimation, 
  bounceInAnimation 
}: { 
  fadeInAnimation: any
  slideUpAnimation: any
  scaleInAnimation: any
  bounceInAnimation: any
}) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          ⚡ Advanced Animation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          개별 애니메이션 훅들을 직접 사용
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          ref={fadeInAnimation.ref}
          style={fadeInAnimation.style}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"eye" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Fade In</h3>
          <p>페이드 인 애니메이션</p>
        </div>
        
        <div 
          ref={slideUpAnimation.ref}
          style={slideUpAnimation.style}
          className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"arrowUp" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Slide Up</h3>
          <p>슬라이드 업 애니메이션</p>
        </div>
        
        <div 
          ref={scaleInAnimation.ref}
          style={scaleInAnimation.style}
          className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"maximize" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Scale In</h3>
          <p>스케일 인 애니메이션</p>
        </div>
        
        <div 
          ref={bounceInAnimation.ref}
          style={bounceInAnimation.style}
          className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white text-center"
        >
          <Icon name={"zap" as any} size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Bounce In</h3>
          <p>바운스 인 애니메이션</p>
        </div>
      </div>
    </div>
  )
} 