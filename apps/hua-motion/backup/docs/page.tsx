'use client'

import React from 'react'
import { 
  Icon, 
  Button, 
  Panel
} from '@hua-labs/ui'
import { 
  useSmartAnimation, 
  useFadeIn, 
  useSlideUp, 
  useScaleIn,
  usePulse 
} from '@hua-labs/motion'

export default function DocsPage() {
  // 애니메이션 훅들
  const heroRef = useSmartAnimation({ 
    type: 'hero',
    entrance: 'fadeIn',
    delay: 0,
    threshold: 0
  })
  
  const titleRef = useSmartAnimation({ 
    type: 'title',
    entrance: 'slideUp',
    delay: 200,
    threshold: 0
  })
  
  const subtitleRef = useSmartAnimation({ 
    type: 'text',
    entrance: 'fadeIn',
    delay: 400,
    threshold: 0
  })

  const fadeIn1 = useFadeIn({ delay: 0.2, autoStart: true })
  const fadeIn2 = useFadeIn({ delay: 0.4, autoStart: true })
  const fadeIn3 = useFadeIn({ delay: 0.6, autoStart: true })
  
  const slideUp1 = useSlideUp({ delay: 0.3, autoStart: true })
  const slideUp2 = useSlideUp({ delay: 0.5, autoStart: true })
  const slideUp3 = useSlideUp({ delay: 0.7, autoStart: true })
  
  const scaleIn1 = useScaleIn({ delay: 0.4, autoStart: true })
  const scaleIn2 = useScaleIn({ delay: 0.6, autoStart: true })
  const scaleIn3 = useScaleIn({ delay: 0.8, autoStart: true })

  const pulse1 = usePulse({ autoStart: false })
  const pulse2 = usePulse({ autoStart: false })
  const pulse3 = usePulse({ autoStart: false })

  // 스무스 스크롤 함수
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* 히어로 섹션 */}
        <div 
          ref={heroRef.ref}
          style={heroRef.style}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-16 sm:p-24 mb-24"
        >
          {/* 애니메이션 배경 효과 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="relative z-10 text-center">
            <h1 
              ref={titleRef.ref}
              style={titleRef.style}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl"
            >
              📚 HUA Animation 문서
            </h1>
            <p 
              ref={subtitleRef.ref}
              style={subtitleRef.style}
              className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              3단계 애니메이션 시스템 완전 가이드
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={() => scrollToSection('getting-started')}
                variant="glass"
                size="lg"
                hover="glow"
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center">
                  <Icon name={"zap" as any} size={24} className="mr-3" />
                  시작하기
                </span>
              </Button>
              
              <Button 
                onClick={() => scrollToSection('api-reference')}
                variant="outline"
                size="lg"
                hover="scale"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <span className="flex items-center">
                  <Icon name={"type" as any} size={24} className="mr-3" />
                  API 참조
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Getting Started 섹션 */}
        <section id="getting-started" className="mb-24">
          <Panel style="glass" padding="lg" className="text-center">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              🚀 Getting Started
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              HUA Animation SDK를 처음 사용하시나요? 단계별로 따라해보세요!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* 단계 1 */}
              <div 
                ref={fadeIn1.ref}
                style={{
                  opacity: fadeIn1.opacity,
                  transform: `translateY(${fadeIn1.translateY}px)`,
                  transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
                }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-600/20 to-purple-600/10 p-8 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2"
                onMouseEnter={() => pulse1.start()}
                onMouseLeave={() => pulse1.stop()}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 text-center">
                  <div 
                    ref={scaleIn1.ref}
                    style={{
                      transform: `scale(${scaleIn1.scale})`,
                      opacity: scaleIn1.opacity,
                      transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
                    }}
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-500"
                  >
                    <div 
                      ref={pulse1.ref}
                      style={{
                        transform: pulse1.isAnimating ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s ease-in-out'
                      }}
                    >
                      <Icon name={"download" as any} size={32} className="text-white" />
                    </div>
                  </div>
                  <h3 
                    ref={slideUp1.ref}
                    style={{
                      opacity: slideUp1.opacity,
                      transform: `translateY(${slideUp1.translateY}px)`,
                      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
                    }}
                    className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
                  >
                    1. 설치하기
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm">
                    <code className="text-gray-800 dark:text-gray-200">
                      npm install @hua-labs/animation
                    </code>
                  </div>
                </div>
              </div>

              {/* 단계 2 */}
              <div 
                ref={fadeIn2.ref}
                style={{
                  opacity: fadeIn2.opacity,
                  transform: `translateY(${fadeIn2.translateY}px)`,
                  transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
                }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-600/20 to-teal-600/10 p-8 border border-green-200/50 dark:border-green-800/50 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:-translate-y-2"
                onMouseEnter={() => pulse2.start()}
                onMouseLeave={() => pulse2.stop()}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 text-center">
                  <div 
                    ref={scaleIn2.ref}
                    style={{
                      transform: `scale(${scaleIn2.scale})`,
                      opacity: scaleIn2.opacity,
                      transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
                    }}
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-500"
                  >
                    <div 
                      ref={pulse2.ref}
                      style={{
                        transform: pulse2.isAnimating ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s ease-in-out'
                      }}
                    >
                      <Icon name={"type" as any} size={32} className="text-white" />
                    </div>
                  </div>
                  <h3 
                    ref={slideUp2.ref}
                    style={{
                      opacity: slideUp2.opacity,
                      transform: `translateY(${slideUp2.translateY}px)`,
                      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
                    }}
                    className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
                  >
                    2. 사용하기
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm">
                    <code className="text-gray-800 dark:text-gray-200">
                      {`const animations = useSimplePageAnimation('home')`}
                    </code>
                  </div>
                </div>
              </div>

              {/* 단계 3 */}
              <div 
                ref={fadeIn3.ref}
                style={{
                  opacity: fadeIn3.opacity,
                  transform: `translateY(${fadeIn3.translateY}px)`,
                  transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
                }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-600/20 to-rose-600/10 p-8 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2"
                onMouseEnter={() => pulse3.start()}
                onMouseLeave={() => pulse3.stop()}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 text-center">
                  <div 
                    ref={scaleIn3.ref}
                    style={{
                      transform: `scale(${scaleIn3.scale})`,
                      opacity: scaleIn3.opacity,
                      transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
                    }}
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-500"
                  >
                    <div 
                      ref={pulse3.ref}
                      style={{
                        transform: pulse3.isAnimating ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s ease-in-out'
                      }}
                    >
                      <Icon name={"sparkles" as any} size={32} className="text-white" />
                    </div>
                  </div>
                  <h3 
                    ref={slideUp3.ref}
                    style={{
                      opacity: slideUp3.opacity,
                      transform: `translateY(${slideUp3.translateY}px)`,
                      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
                    }}
                    className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
                  >
                    3. 즐기기
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    프리셋을 사용하면 별도 설정 없이 바로 아름다운 애니메이션을 볼 수 있어요!
                  </p>
                </div>
              </div>
            </div>

            {/* 첫 번째 애니메이션 예제 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                🎯 첫 번째 애니메이션 만들기
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6 overflow-x-auto">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  {`import { useSimplePageAnimation } from '@hua-labs/animation'

function MyFirstAnimation() {
  const animations = useSimplePageAnimation('home')
  
  return (
    <div>
      <div data-animation-id="hero" style={animations.hero?.style}>
        <h1>안녕하세요! 👋</h1>
      </div>
      
      <div data-animation-id="title" style={animations.title?.style}>
        <h2>첫 번째 애니메이션입니다</h2>
      </div>
      
      <div data-animation-id="description" style={animations.description?.style}>
        <p>스크롤하면 요소들이 예쁘게 나타나요!</p>
      </div>
      
      <div data-animation-id="cta" style={animations.cta?.style}>
        <button>클릭해보세요</button>
      </div>
    </div>
  )
}`}
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                💡 <strong>Tip:</strong> <code>data-animation-id</code> 속성이 중요해요! 이 속성으로 애니메이션이 적용됩니다.
              </p>
            </div>
          </Panel>
        </section>

        {/* 3단계 시스템 소개 */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              🎨 3단계 애니메이션 시스템
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              간단한 사용법부터 고급 기능까지, 모든 수준의 개발자를 위한 완벽한 애니메이션
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tier 1 */}
            <Panel style="glass" padding="lg" className="text-center flex flex-col h-full">
              <div className="flex-1">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Icon name={"zap" as any} size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Tier 1: Simple Animation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  프리셋 기반의 간단하고 빠른 애니메이션
                </p>
                <ul className="text-left space-y-2 text-gray-600 dark:text-gray-300 mb-8">
                  <li>• 단 한 줄의 코드로 모든 애니메이션 설정</li>
                  <li>• 미리 정의된 프리셋 사용</li>
                  <li>• 빠른 프로토타이핑에 최적화</li>
                  <li>• 최소한의 설정으로 즉시 사용 가능</li>
                </ul>
              </div>
              <Button 
                href="/simple-animation"
                variant="gradient"
                gradient="blue"
                size="lg"
                hover="glow"
                className="mt-auto"
              >
                <Icon name={"play" as any} size={20} className="mr-3" />
                데모 보기
              </Button>
            </Panel>

            {/* Tier 2 */}
            <Panel style="glass" padding="lg" className="text-center flex flex-col h-full">
              <div className="flex-1">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Icon name={"layers" as any} size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Tier 2: Page Animation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  페이지 레벨의 세밀한 애니메이션 제어
                </p>
                <ul className="text-left space-y-2 text-gray-600 dark:text-gray-300 mb-8">
                  <li>• 각 요소별 개별 애니메이션 설정</li>
                  <li>• 호버/클릭 인터랙션 지원</li>
                  <li>• 스크롤 리빌 애니메이션</li>
                  <li>• 중앙집중식 상태 관리</li>
                </ul>
              </div>
              <Button 
                href="/page-animation"
                variant="gradient"
                gradient="green"
                size="lg"
                hover="glow"
                className="mt-auto"
              >
                <Icon name={"play" as any} size={20} className="mr-3" />
                데모 보기
              </Button>
            </Panel>

            {/* Tier 3 */}
            <Panel style="glass" padding="lg" className="text-center flex flex-col h-full">
              <div className="flex-1">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Icon name={"sparkles" as any} size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Tier 3: Smart Animation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  개별 요소의 완전한 애니메이션 제어
                </p>
                <ul className="text-left space-y-2 text-gray-600 dark:text-gray-300 mb-8">
                  <li>• 완전한 커스터마이징 가능</li>
                  <li>• 고급 인터랙션 지원</li>
                  <li>• 복잡한 애니메이션 시퀀스</li>
                  <li>• 최대한의 유연성</li>
                </ul>
              </div>
              <Button 
                href="/smart-animation"
                variant="gradient"
                gradient="purple"
                size="lg"
                hover="glow"
                className="mt-auto"
              >
                <Icon name={"play" as any} size={20} className="mr-3" />
                데모 보기
              </Button>
            </Panel>
          </div>
        </section>

        {/* API 참조 섹션 */}
        <section id="api-reference" className="mb-24">
          <Panel style="glass" padding="lg">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              📚 API 참조
            </h2>
            
            {/* Tier 1 API */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
                Tier 1: useSimplePageAnimation
              </h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">기본 사용법</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {`import { useSimplePageAnimation } from '@hua-labs/animation'

const animations = useSimplePageAnimation('home')`}
                  </code>
                </div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">지원하는 페이지 타입</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">'home'</code> - 홈페이지</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">'dashboard'</code> - 대시보드</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">'product'</code> - 제품 페이지</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">'blog'</code> - 블로그</li>
                </ul>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">반환값</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {`{
  hero: { ref, style, isVisible },
  title: { ref, style, isVisible },
  description: { ref, style, isVisible },
  cta: { ref, style, isVisible }
}`}
                  </code>
                </div>
              </div>
            </div>

            {/* Tier 2 API */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6 text-green-600 dark:text-green-400">
                Tier 2: usePageAnimations
              </h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">기본 사용법</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {`import { usePageAnimations } from '@hua-labs/animation'

const config = {
  hero: { type: 'hero' },
  title: { type: 'title' },
  button: { type: 'button', hover: true, click: true }
}

const animations = usePageAnimations(config)`}
                  </code>
                </div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">설정 옵션</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">type</code> - 애니메이션 타입 ('hero', 'title', 'button', 'card', 'text', 'image')</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">entrance</code> - 진입 애니메이션 ('fadeIn', 'slideUp', 'slideLeft', 'slideRight', 'scaleIn', 'bounceIn')</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">hover</code> - 호버 인터랙션 활성화</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">click</code> - 클릭 인터랙션 활성화</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">delay</code> - 애니메이션 지연시간 (ms)</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">duration</code> - 애니메이션 지속시간 (ms)</li>
                  <li>• <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">threshold</code> - Intersection Observer 임계값</li>
                </ul>
              </div>
            </div>

            {/* Tier 3 API */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6 text-purple-600 dark:text-purple-400">
                Tier 3: useSmartAnimation
              </h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">기본 사용법</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {`import { useSmartAnimation } from '@hua-labs/animation'

const animation = useSmartAnimation({
  type: 'hero',
  entrance: 'fadeIn',
  hover: true,
  click: true,
  delay: 200,
  duration: 800,
  threshold: 0.1
})

return (
  <div ref={animation.ref} style={animation.style}>
    스마트 애니메이션 요소
  </div>
)`}
                  </code>
                </div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">반환값</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {`{
  ref: RefObject<HTMLDivElement>,
  style: CSSProperties,
  isVisible: boolean,
  isHovered: boolean,
  isClicked: boolean
}`}
                  </code>
                </div>
              </div>
            </div>

            {/* 개별 애니메이션 훅들 */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                개별 애니메이션 훅
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* useFadeIn */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">useFadeIn</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    투명도 변화를 통한 페이드 인 애니메이션
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const fadeIn = useFadeIn({ 
  duration: 1000, 
  autoStart: true,
  delay: 200 
})

return <div ref={fadeIn.ref} style={{ opacity: fadeIn.opacity }}>`}
                    </code>
                  </div>
                </div>

                {/* useSlideUp */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">useSlideUp</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    아래에서 위로 슬라이드 애니메이션
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const slideUp = useSlideUp({ 
  duration: 800, 
  delay: 200 
})

return <div ref={slideUp.ref} style={{ 
  transform: \`translateY(\${slideUp.translateY}px)\` 
}}>`}
                    </code>
                  </div>
                </div>

                {/* useScaleIn */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">useScaleIn</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    크기 확대를 통한 스케일 인 애니메이션
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const scaleIn = useScaleIn({ 
  duration: 600 
})

return <div ref={scaleIn.ref} style={{ 
  transform: \`scale(\${scaleIn.scale})\` 
}}>`}
                    </code>
                  </div>
                </div>

                {/* usePulse */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">usePulse</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    지속적인 펄스 애니메이션 효과
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const pulse = usePulse({ 
  interval: 2000,
  autoStart: false 
})

return <div ref={pulse.ref} style={{ 
  transform: pulse.isAnimating ? 'scale(1.1)' : 'scale(1)' 
}}>`}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* 고급 애니메이션 훅들 */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                고급 애니메이션 훅
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* useGesture */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">useGesture</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    드래그, 스와이프, 핀치 등 제스처 애니메이션
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const gesture = useGesture({
  drag: true,
  swipe: true,
  pinch: true
})

return <div ref={gesture.ref} style={gesture.style}>`}
                    </code>
                  </div>
                </div>

                {/* useOrchestration */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">useOrchestration</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    복잡한 애니메이션 시퀀스 관리
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const chain = createAnimationChain([
  { hook: useFadeIn, config: { duration: 500 } },
  { hook: useSlideUp, config: { duration: 800 } },
  { hook: useScaleIn, config: { duration: 600 } }
])

const orchestration = useOrchestration(chain)`}
                    </code>
                  </div>
                </div>

                {/* useLayoutAnimation */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">useLayoutAnimation</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    레이아웃 변경 애니메이션
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const layout = useLayoutAnimation({
  width: { from: 100, to: 200 },
  height: { from: 100, to: 200 }
})

return <div ref={layout.ref} style={layout.style}>`}
                    </code>
                  </div>
                </div>

                {/* useSpring */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">useSpring</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    스프링 물리 기반 애니메이션
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {`const spring = useSpring({ 
  tension: 100, 
  friction: 10 
})

return <div ref={spring.ref} style={{ 
  transform: \`translateY(\${spring.translateY}px)\` 
}}>`}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Easing 함수들 */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Easing 함수
              </h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  다양한 easing 함수를 사용하여 애니메이션의 자연스러움을 조절할 수 있습니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">기본 Easing</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>• linear</li>
                      <li>• easeIn</li>
                      <li>• easeOut</li>
                      <li>• easeInOut</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">고급 Easing</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>• easeInBounce</li>
                      <li>• easeOutElastic</li>
                      <li>• easeInOutBack</li>
                      <li>• easeInOutCubic</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">특수 Easing</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>• pulse</li>
                      <li>• pulseSmooth</li>
                      <li>• skeletonWave</li>
                      <li>• blink</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-6 overflow-x-auto">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {`import { easeInBounce, easeOutElastic } from '@hua-labs/animation'

const animation = useFadeIn({ 
  duration: 1000, 
  easing: easeInBounce 
})`}
                  </code>
                </div>
              </div>
                         </div>
           </Panel>
         </section>
       </div>
       

     </div>
   )
 } 