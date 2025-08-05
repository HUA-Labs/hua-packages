'use client'

import { Icon } from '@hua-labs/ui'
import { useFadeIn, useSlideUp, useScaleIn, usePulse } from '@hua-labs/motion'

interface GettingStartedSectionProps {
  scrollToSection: (sectionId: string) => void
}

export default function GettingStartedSection({ scrollToSection }: GettingStartedSectionProps) {
  const titleRef = useFadeIn({ delay: 100 })
  const heroRef = useSlideUp({ delay: 200 })
  const cardsRef = useScaleIn({ delay: 300 })
  const ctaRef = usePulse({ autoStart: false })

  return (
    <section id="getting-started" className="mb-24">
      <div className="text-center mb-16">
        <h2 
          ref={titleRef.ref}
          style={titleRef.style}
          className="text-4xl font-bold mb-6 text-gray-900 dark:text-white"
        >
          <Icon name="target" size={40} className="inline-block align-text-bottom mr-3 text-blue-600 dark:text-blue-400" />
          시작하기
        </h2>
        <p 
          ref={heroRef.ref}
          style={heroRef.style}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
        >
          HUA Motion으로 첫 번째 모션을 만들어보세요. 간단하고 직관적인 API로 
          아름다운 애니메이션을 쉽게 구현할 수 있습니다.
        </p>
      </div>

      {/* 첫 번째 모션 예제 */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-left">
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          <Icon name="target" size={28} className="align-text-bottom mr-1 text-blue-600 dark:text-blue-400" />
          첫 번째 모션 만들기
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">1. 훅 임포트</h4>
            <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6 overflow-x-auto">
              <pre><code>{`import { useFadeIn, useSlideUp } from '@hua-labs/motion'`}</code></pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">2. 컴포넌트에서 사용</h4>
            <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6 overflow-x-auto">
              <pre><code>{`function MyComponent() {
  const fadeIn = useFadeIn({ delay: 200 })
  const slideUp = useSlideUp({ delay: 400 })
  
  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>
        페이드인 제목
      </h1>
      <p ref={slideUp.ref} style={slideUp.style}>
        슬라이드업 설명
      </p>
    </div>
  )
}`}</code></pre>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => scrollToSection('api-reference')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon name="code" size={20} className="mr-2" />
            더 많은 예제 보기
          </button>
        </div>
      </div>
    </section>
  )
} 