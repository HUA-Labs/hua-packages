'use client'

import { useSimplePageAnimation } from '@hua-labs/animation'
import { Icon } from '@hua-labs/ui'

export default function SimpleAnimationPage() {
  const presetAnimations = useSimplePageAnimation('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 relative">
        <header className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Icon name="zap" size={24} className="text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simple Animation
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            프리셋 기반의 간단하고 빠른 애니메이션으로 아름다운 웹 경험을 만들어보세요
          </p>
          
          {/* 사용법 안내 카드 */}
          <div className="max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon name="bookOpen" size={20} className="text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                사용법 가이드
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">훅 가져오기</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`import { useSimplePageAnimation } from '@hua-labs/animation'`}
                  </code>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">프리셋 사용</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`const animations = useSimplePageAnimation('home')`}
                  </code>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-800/50 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">요소에 적용</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`<div data-animation-id="hero" style={animations.hero?.style}>
  히어로 섹션
</div>`}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 p-6 rounded-2xl border border-indigo-300/30 dark:border-indigo-700/30">
              <div className="flex items-start space-x-3">
                                 <Icon name="zap" size={20} className="text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">💡 중요 팁</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">data-animation-id</code> 속성이 중요해요! 
                    "hero", "title", "description", "cta" 중 하나를 사용하세요.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    {['hero', 'title', 'description', 'cta'].map((id) => (
                      <div key={id} className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-center font-mono text-indigo-600 dark:text-indigo-400">
                        {id}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-20">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🎯 프리셋 애니메이션 데모
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                아래 요소들이 자동으로 애니메이션됩니다!
              </p>
            </div>
            
            <div 
              data-animation-id="hero"
              style={presetAnimations.hero?.style}
              className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white p-8 rounded-2xl mb-8 shadow-xl shadow-indigo-500/25 relative overflow-hidden"
            >
              {/* 배경 패턴 */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl" />
              </div>
              
              <div className="relative z-10">
                <h3 
                  data-animation-id="title"
                  style={presetAnimations.title?.style}
                  className="text-3xl sm:text-4xl font-bold mb-4"
                >
                  ✨ 프리셋 히어로 섹션
                </h3>
                <p 
                  data-animation-id="description"
                  style={presetAnimations.description?.style}
                  className="text-lg sm:text-xl mb-6 opacity-90 leading-relaxed"
                >
                  단 한 줄의 코드로 모든 애니메이션이 자동으로 설정됩니다! 
                  복잡한 설정 없이 바로 아름다운 애니메이션을 경험해보세요.
                </p>
                <button 
                  data-animation-id="cta"
                  style={presetAnimations.cta?.style}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  🚀 시작하기
                </button>
              </div>
            </div>
            
            {/* 디버그 정보 */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <Icon name="activity" size={20} className="mr-2 text-indigo-600" />
                디버그 정보
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { key: 'hero', label: 'Hero Section' },
                  { key: 'title', label: 'Title' },
                  { key: 'description', label: 'Description' },
                  { key: 'cta', label: 'CTA Button' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${presetAnimations[key as keyof typeof presetAnimations] ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 