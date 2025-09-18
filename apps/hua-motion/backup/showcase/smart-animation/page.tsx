'use client'

import { useSmartAnimation } from '@hua-labs/animation'
import { Icon, Button } from '@hua-labs/ui'

export default function SmartAnimationPage() {
  const heroRef = useSmartAnimation<HTMLDivElement>({ type: 'hero' })
  const titleRef = useSmartAnimation<HTMLHeadingElement>({ type: 'title' })
  const buttonRef = useSmartAnimation<HTMLButtonElement>({ type: 'button' })
  const cardRef = useSmartAnimation<HTMLDivElement>({ type: 'card' })
  const textRef = useSmartAnimation<HTMLParagraphElement>({ type: 'text' })
  const imageRef = useSmartAnimation<HTMLDivElement>({ type: 'image' })
  
  // 인터랙티브 데모용 별도 ref들
  const hoverButtonRef = useSmartAnimation<HTMLButtonElement>({ type: 'button', hover: true, click: false })
  const clickButtonRef = useSmartAnimation<HTMLButtonElement>({ type: 'button', hover: false, click: true })
  const bothButtonRef = useSmartAnimation<HTMLButtonElement>({ type: 'button', hover: true, click: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto p-8 relative">
        <header className="text-center mb-20">
          <div className="inline-flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/25">
              <Icon name="sparkles" size={32} className="text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Smart Animation
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            모든 애니메이션 기능을 한 곳에서 체험해보세요. 개별 요소별 완전한 제어가 가능합니다.
          </p>
          
          {/* 사용법 안내 카드 */}
          <div className="max-w-6xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-green-500/10 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Icon name="bookOpen" size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                사용법 가이드
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/50 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">개별 요소 설정</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`const heroRef = useSmartAnimation({ type: 'hero' })
const buttonRef = useSmartAnimation({ 
  type: 'button', 
  hover: true, 
  click: true 
})`}
                  </code>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-lg">요소에 적용</h3>
                <div className="bg-gray-900 dark:bg-gray-900 p-4 rounded-xl text-sm">
                  <code className="text-green-400">
                    {`<div ref={heroRef.ref} style={heroRef.style}>
  히어로 섹션
</div>`}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 p-6 rounded-2xl border border-green-300/30 dark:border-green-700/30">
              <div className="flex items-start space-x-3">
                <Icon name="zap" size={20} className="text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">⚡ 실시간 제어</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl text-center">
                      <code className="text-green-600 dark:text-green-400">heroRef.start()</code>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">애니메이션 시작</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl text-center">
                      <code className="text-green-600 dark:text-green-400">heroRef.stop()</code>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">애니메이션 정지</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl text-center">
                      <code className="text-green-600 dark:text-green-400">heroRef.reset()</code>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">애니메이션 리셋</p>
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
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              🎨 히어로 섹션
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              각 요소별로 세밀한 애니메이션 제어가 가능합니다
            </p>
          </div>
          
          <div 
            ref={heroRef.ref} 
            style={heroRef.style}
            className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white p-12 rounded-3xl shadow-2xl shadow-green-500/25 relative overflow-hidden"
          >
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-2xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <h3 
                ref={titleRef.ref} 
                style={titleRef.style}
                className="text-4xl sm:text-5xl font-bold mb-6"
              >
                🚀 개별 요소 제어
              </h3>
              <p 
                ref={textRef.ref} 
                style={textRef.style}
                className="text-xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto"
              >
                각 요소별로 세밀한 애니메이션 제어가 가능합니다. 
                호버, 클릭, 스크롤 등 다양한 인터랙션을 지원합니다.
              </p>
              <button
                ref={buttonRef.ref}
                style={buttonRef.style}
                className="px-10 py-4 bg-white text-green-600 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg"
              >
                🎯 시작하기
              </button>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              🎮 인터랙티브 데모
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              다양한 인터랙션 효과를 체험해보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-green-500/10 border border-green-200/50 dark:border-green-800/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                  <Icon name="mousePointer" size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">호버 효과</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  마우스를 올려보세요
                </p>
                <button
                  ref={hoverButtonRef.ref}
                  style={hoverButtonRef.style}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  호버해보세요
                </button>
              </div>
            </div>
            
            <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-emerald-500/10 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                                     <Icon name="mousePointer" size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">클릭 효과</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  클릭해보세요
                </p>
                <button
                  ref={clickButtonRef.ref}
                  style={clickButtonRef.style}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  클릭해보세요
                </button>
              </div>
            </div>
            
            <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-teal-500/10 border border-teal-200/50 dark:border-teal-800/50 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25">
                  <Icon name="zap" size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">호버 + 클릭</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  모든 효과를 체험해보세요
                </p>
                <button
                  ref={bothButtonRef.ref}
                  style={bothButtonRef.style}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  모든 효과
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Card Demo Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              🃏 카드 애니메이션
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              카드 타입 애니메이션을 체험해보세요
            </p>
          </div>
          
          <div 
            ref={cardRef.ref}
            style={cardRef.style}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl shadow-teal-500/10 border border-teal-200/50 dark:border-teal-800/50 relative overflow-hidden"
          >
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500 rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500 rounded-full blur-2xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-teal-500/25">
                <Icon name="layers" size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                카드 애니메이션
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                카드 타입의 애니메이션은 hover와 click 효과를 자동으로 제공합니다. 
                마우스를 올리거나 클릭해보세요!
              </p>
              <div className="flex justify-center space-x-4">
                                 <Button variant="gradient" gradient="green" size="lg">
                  호버해보세요
                </Button>
                <Button variant="outline" size="lg" className="border-teal-500 text-teal-600 hover:bg-teal-50">
                  클릭해보세요
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Image Demo Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              🖼️ 이미지 애니메이션
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              이미지 타입 애니메이션을 체험해보세요
            </p>
          </div>
          
          <div 
            ref={imageRef.ref}
            style={imageRef.style}
            className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl shadow-cyan-500/25 relative overflow-hidden"
          >
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-56 h-56 bg-white rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 text-center text-white">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Icon name="image" size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6">
                이미지 애니메이션
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
                이미지 타입의 애니메이션은 스케일과 투명도 변화를 제공합니다. 
                마우스를 올려보세요!
              </p>
              <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <div className="w-32 h-32 bg-gradient-to-r from-white/30 to-white/10 rounded-xl flex items-center justify-center">
                  <Icon name="image" size={48} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 