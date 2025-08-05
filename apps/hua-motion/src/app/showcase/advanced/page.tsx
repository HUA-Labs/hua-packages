'use client'

import { useFadeIn, useSlideUp, useScaleIn, useBounceIn } from '@hua-labs/motion'
import { Icon, Action } from '@hua-labs/ui'
import ShowcasePageLayout from '../../components/ShowcasePageLayout'

export default function AdvancedPage() {
  const titleRef = useFadeIn({ delay: 100 })
  const heroRef = useSlideUp({ delay: 200 })
  const cardsRef = useScaleIn({ delay: 300 })
  const ctaRef = useBounceIn({ delay: 500 })

  return (
    <ShowcasePageLayout
      title="Advanced Animation"
      description="고급 애니메이션 기법과 복잡한 인터랙션을 위한 완전한 제어 시스템"
      icon="zap"
      color="orange"
      primaryButton={{
        text: "플레이그라운드",
        href: "/playground",
        icon: "code"
      }}
      secondaryButton={{
        text: "문서 보기",
        href: "/docs",
        icon: "book"
      }}
      showUsageGuide={false}
    >
      {/* 고급 애니메이션 데모 */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="brain" size={32} className="mr-3" />
            고급 애니메이션 기법
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            복잡한 애니메이션과 인터랙션을 위한 완전한 제어
          </p>
        </div>
        
        <div 
          ref={heroRef.ref} 
          style={heroRef.style}
          className="bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 text-white p-12 rounded-3xl shadow-2xl shadow-orange-500/25 relative overflow-hidden"
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
              className="text-4xl sm:text-5xl font-bold mb-6 flex items-center justify-center"
            >
              <Icon name="sparkles" size={40} className="mr-3" />
              완전한 제어 시스템
            </h3>
            <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto">
              개별 애니메이션 훅을 조합하여 복잡한 인터랙션을 구현할 수 있습니다. 
              각 요소의 타이밍과 효과를 세밀하게 제어해보세요.
            </p>
            <div 
              ref={ctaRef.ref}
              style={ctaRef.style}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Action 
                href="/playground"
                variant="gradient" 
                gradient="orange"
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
              >
                <Icon name="code" size={20} className="mr-2" />
                플레이그라운드
              </Action>
              <Action 
                href="/docs"
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-white/30 text-white hover:bg-white/10"
              >
                <Icon name="book" size={20} className="mr-2" />
                고급 가이드
              </Action>
            </div>
          </div>
        </div>
      </section>

      {/* 개별 훅 데모 */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="layers" size={32} className="mr-3" />
            개별 애니메이션 훅
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            각 훅의 특성을 이해하고 조합해보세요
          </p>
        </div>
        
        <div 
          ref={cardsRef.ref}
          style={cardsRef.style}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Fade In */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-orange-500/10 border border-orange-200/50 dark:border-orange-800/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
                <Icon name="eye" size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Fade In</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                부드러운 페이드 인 효과
              </p>
              <div className="bg-orange-500/20 h-12 rounded-lg flex items-center justify-center">
                <span className="text-orange-700 dark:text-orange-300 text-sm font-medium">페이드 인</span>
              </div>
            </div>
          </div>
          
          {/* Slide Up */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-red-500/10 border border-red-200/50 dark:border-red-800/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
                <Icon name="arrowUp" size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Slide Up</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                아래에서 위로 슬라이드
              </p>
              <div className="bg-red-500/20 h-12 rounded-lg flex items-center justify-center">
                <span className="text-red-700 dark:text-red-300 text-sm font-medium">슬라이드 업</span>
              </div>
            </div>
          </div>
          
          {/* Scale In */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-pink-500/10 border border-pink-200/50 dark:border-pink-800/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/25">
                <Icon name="maximize2" size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Scale In</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                스케일 확대 효과
              </p>
              <div className="bg-pink-500/20 h-12 rounded-lg flex items-center justify-center">
                <span className="text-pink-700 dark:text-pink-300 text-sm font-medium">스케일 인</span>
              </div>
            </div>
          </div>
          
          {/* Bounce In */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-rose-500/10 border border-rose-200/50 dark:border-rose-800/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/25">
                <Icon name="zap" size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Bounce In</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                바운스 효과
              </p>
              <div className="bg-rose-500/20 h-12 rounded-lg flex items-center justify-center">
                <span className="text-rose-700 dark:text-rose-300 text-sm font-medium">바운스 인</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 고급 기능 소개 */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="settings" size={32} className="mr-3" />
            고급 기능
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            복잡한 애니메이션을 위한 고급 기능들
          </p>
        </div>
        
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-pink-500/10 border border-pink-200/50 dark:border-pink-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 애니메이션 체인 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/25">
                <Icon name="link" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">애니메이션 체인</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                여러 애니메이션을 순차적으로 연결하여 복잡한 시퀀스를 만들 수 있습니다.
              </p>
              <div className="bg-pink-500/20 h-20 rounded-xl flex items-center justify-center">
                <span className="text-pink-700 dark:text-pink-300 font-medium">체인 데모</span>
              </div>
            </div>
            
            {/* 제스처 애니메이션 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/25">
                <Icon name="hand" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">제스처 애니메이션</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                터치, 드래그, 스와이프 등 다양한 제스처에 반응하는 애니메이션을 구현할 수 있습니다.
              </p>
              <div className="bg-rose-500/20 h-20 rounded-xl flex items-center justify-center">
                <span className="text-rose-700 dark:text-rose-300 font-medium">제스처 데모</span>
              </div>
            </div>
            
            {/* 스프링 애니메이션 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
                <Icon name="waves" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">스프링 애니메이션</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                물리 기반의 자연스러운 스프링 효과로 더욱 생동감 있는 애니메이션을 만들 수 있습니다.
              </p>
              <div className="bg-red-500/20 h-20 rounded-xl flex items-center justify-center">
                <span className="text-red-700 dark:text-red-300 font-medium">스프링 데모</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 플레이그라운드 안내 */}
      <section className="mb-24">
        <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 dark:from-orange-500/20 dark:via-red-500/20 dark:to-pink-500/20 rounded-3xl p-12 border border-orange-300/30 dark:border-orange-700/30">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/25">
              <Icon name="code" size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              플레이그라운드에서 실험해보세요
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              고급 애니메이션 기능들을 자유롭게 실험하고 테스트할 수 있는 플레이그라운드를 제공합니다. 
              코드를 직접 작성하고 실시간으로 결과를 확인해보세요!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Action 
                href="/playground"
                variant="gradient" 
                gradient="orange"
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
              >
                <Icon name="play" size={20} className="mr-2" />
                플레이그라운드 시작
              </Action>
              <Action 
                href="/docs"
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
              >
                <Icon name="book" size={20} className="mr-2" />
                고급 가이드
              </Action>
            </div>
          </div>
        </div>
      </section>
    </ShowcasePageLayout>
  )
} 