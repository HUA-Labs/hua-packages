'use client'

import { useMemo } from 'react'
import { usePageAnimations } from '@hua-labs/animation'
import { Icon, Button } from '@hua-labs/ui'

export default function PageAnimationPage() {
  const config = useMemo(() => ({
    card1: { type: 'card' as const },
    card2: { type: 'card' as const, hover: true },
    card3: { type: 'card' as const, click: true },
    hero: { type: 'hero' as const },
    title: { type: 'title' as const },
    button: { type: 'button' as const, hover: true, click: true }
  }), [])

  const pageAnimations = usePageAnimations(config)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto p-8 relative">
        <header className="text-center mb-20">
          <div className="inline-flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <Icon name="layers" size={32} className="text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Page Animation
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            페이지 레벨의 세밀한 애니메이션 제어로 완벽한 사용자 경험을 만들어보세요
          </p>
          
          {/* 사용법 안내 카드 */}
          <div className="max-w-6xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Icon name="bookOpen" size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                사용법 가이드
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">설정 객체 만들기</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`const config = {
  hero: { type: 'hero' },
  card: { type: 'card', hover: true },
  button: { type: 'button', click: true }
}`}
                  </code>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">훅 사용하기</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`const animations = usePageAnimations(config)`}
                  </code>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">요소에 적용</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`<div ref={animations.hero.ref} style={animations.hero.style}>
  히어로 섹션
</div>`}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-6 rounded-2xl border border-blue-300/30 dark:border-blue-700/30">
              <div className="flex items-start space-x-3">
                <Icon name="zap" size={20} className="text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">💡 중요 팁</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    호버/클릭 효과를 원한다면 <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">data-animation-id</code> 속성도 추가하세요!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl text-center">
                      <code className="text-blue-600 dark:text-blue-400">hover: true</code>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">호버 효과</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl text-center">
                      <code className="text-blue-600 dark:text-blue-400">click: true</code>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">클릭 효과</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl text-center">
                      <code className="text-blue-600 dark:text-blue-400">type: 'card'</code>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">카드 타입</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🎨 히어로 섹션
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              페이지 레벨의 세밀한 애니메이션 제어를 체험해보세요
            </p>
          </div>
          
          <div 
            data-animation-id="hero"
            style={pageAnimations.hero?.style}
            className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white p-12 rounded-3xl shadow-2xl shadow-blue-500/25 relative overflow-hidden"
          >
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-2xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <h3 
                data-animation-id="title"
                style={pageAnimations.title?.style}
                className="text-4xl sm:text-5xl font-bold mb-6"
              >
                🚀 페이지 레벨 제어
              </h3>
              <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto">
                각 요소별로 세밀한 애니메이션 제어가 가능합니다. 
                호버, 클릭, 스크롤 등 다양한 인터랙션을 지원합니다.
              </p>
              <button 
                data-animation-id="button"
                style={pageAnimations.button?.style}
                className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg"
              >
                🎯 상호작용 버튼
              </button>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🃏 카드 섹션
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              다양한 인터랙션 효과를 체험해보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              data-animation-id="card1"
              style={pageAnimations.card1?.style}
              className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                  <Icon name="layers" size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">기본 카드</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  기본 애니메이션만 적용된 카드입니다.
                </p>
                <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                  기본 효과
                </div>
              </div>
            </div>
            
            <div 
              data-animation-id="card2"
              style={pageAnimations.card2?.style}
              className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-indigo-500/10 border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                  <Icon name="mousePointer" size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">호버 카드</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  마우스를 올려보세요! 호버 효과가 있습니다.
                </p>
                <div className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium">
                  호버 효과
                </div>
              </div>
            </div>
            
            <div 
              data-animation-id="card3"
              style={pageAnimations.card3?.style}
              className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-purple-500/10 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                  <Icon name="zap" size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">클릭 카드</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  클릭해보세요! 클릭 효과가 있습니다.
                </p>
                <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium">
                  클릭 효과
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎮 인터랙티브 데모
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              실제 사용 사례를 체험해보세요
            </p>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl shadow-purple-500/10 border border-purple-200/50 dark:border-purple-800/50 relative overflow-hidden">
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500 rounded-full blur-2xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/25">
                <Icon name="sparkles" size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                완벽한 페이지 애니메이션
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                페이지 레벨 애니메이션으로 모든 요소가 조화롭게 움직입니다. 
                사용자 경험을 한 단계 끌어올려보세요!
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="gradient" gradient="purple" size="lg">
                  시작하기
                </Button>
                <Button variant="outline" size="lg" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                  더 알아보기
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 