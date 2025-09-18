'use client'

import { useSimpleMotion } from '@hua-labs/motion'
import { Icon } from '@hua-labs/ui'
import ShowcasePageLayout from '../../components/ShowcasePageLayout'

export default function SimpleMotionPage() {
  const presetAnimations = useSimpleMotion('home')

  return (
    <ShowcasePageLayout
              title="Simple Motion"
              description="프리셋 기반의 간단하고 빠른 모션으로 아름다운 웹 경험을 만들어보세요"
      icon="zap"
      color="blue"
      primaryButton={{
        text: "테스트 랩",
        href: "/test",
        icon: "flask-conical"
      }}
      secondaryButton={{
        text: "문서 보기",
        href: "/docs",
        icon: "book"
      }}
    >
      {/* 프리셋 애니메이션 데모 */}
      <section className="mb-20">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 shadow-2xl shadow-indigo-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center">
              <Icon name="target" size={32} className="mr-3" />
              프리셋 애니메이션 데모
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              아래 요소들이 자동으로 애니메이션됩니다!
            </p>
          </div>
          
          <div 
                    data-motion-id="hero"
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
                        data-motion-id="title"
        style={presetAnimations.title?.style}
                className="text-3xl sm:text-4xl font-bold mb-4 flex items-center"
              >
                <Icon name="sparkles" size={32} className="mr-3" />
                프리셋 히어로 섹션
              </h3>
              <p 
                        data-motion-id="description"
        style={presetAnimations.description?.style}
                className="text-lg sm:text-xl mb-6 opacity-90 leading-relaxed"
              >
                단 한 줄의 코드로 모든 애니메이션이 자동으로 설정됩니다! 
                복잡한 설정 없이 바로 아름다운 애니메이션을 경험해보세요.
              </p>
              <button 
                        data-motion-id="cta"
        style={presetAnimations.cta?.style}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center"
              >
                <Icon name="rocket" size={20} className="mr-2" />
                시작하기
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
    </ShowcasePageLayout>
  )
} 