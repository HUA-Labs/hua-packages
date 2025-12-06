'use client'

import { Icon } from '@hua-labs/ui'
import { Panel } from '@hua-labs/ui'

export default function ApiReferenceSection() {
  return (
    <section id="api-reference" className="mb-24">
      <Panel style="glass" padding="lg">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">
          <Icon name="code" size={40} className="inline-block align-text-bottom mr-3 text-blue-600 dark:text-blue-400" />
          API 참조
        </h2>

        {/* Simple Page Motion */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">기본 사용법</h4>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto">
            <pre><code>{`import { useSimpleMotion } from '@hua-labs/motion-core'

const motions = useSimpleMotion('home')`}</code></pre>
          </div>
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">지원하는 페이지 타입</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl text-center">
              <code className="text-blue-600 dark:text-blue-400">&apos;home&apos;</code>
              <p className="text-gray-600 dark:text-gray-400 mt-1">홈페이지</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl text-center">
              <code className="text-green-600 dark:text-green-400">&apos;about&apos;</code>
              <p className="text-gray-600 dark:text-gray-400 mt-1">소개 페이지</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-xl text-center">
              <code className="text-purple-600 dark:text-purple-400">&apos;contact&apos;</code>
              <p className="text-gray-600 dark:text-gray-400 mt-1">연락처</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-3 rounded-xl text-center">
              <code className="text-orange-600 dark:text-orange-400">&apos;blog&apos;</code>
              <p className="text-gray-600 dark:text-gray-400 mt-1">블로그</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl text-center">
              <code className="text-red-600 dark:text-red-400">&apos;landing&apos;</code>
              <p className="text-gray-600 dark:text-gray-400 mt-1">랜딩 페이지</p>
            </div>
          </div>
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">반환값</h4>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
            <pre><code>{`{
  hero: { ref, style, isVisible },
  title: { ref, style, isVisible },
  description: { ref, style, isVisible },
  cta: { ref, style, isVisible }
}`}</code></pre>
          </div>
        </div>

        {/* Page Motions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">페이지 모션</h4>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto">
            <pre><code>{`import { usePageMotions } from '@hua-labs/motion-core'

const config = {
  hero: { type: 'hero' },
  title: { type: 'title' },
  button: { type: 'button', hover: true, click: true }
}

const motions = usePageMotions(config)`}</code></pre>
          </div>
        </div>

        {/* Smart Motion */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">스마트 모션</h4>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto">
            <pre><code>{`import { useMotion } from '@hua-labs/motion-core'

const motion = useMotion({
  type: 'hero',
  entrance: 'fadeIn',
  hover: true,
  click: true,
  delay: 200,
  duration: 800,
  threshold: 0.1
})

return (
  <div ref={motion.ref} style={motion.style}>
    스마트 모션 요소
  </div>
)`}</code></pre>
          </div>
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">반환값</h4>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
            <pre><code>{`{
  ref: RefObject<HTMLDivElement>,
  style: CSSProperties,
  isVisible: boolean,
  isHovered: boolean,
  isClicked: boolean
}`}</code></pre>
          </div>
        </div>

        {/* 고급 모션 훅 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h4 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            <Icon name="sparkles" size={28} className="align-text-bottom mr-2 text-purple-600 dark:text-purple-400" />
            고급 모션 훅
          </h4>
          
          <div className="grid grid-cols-1 gap-6">
            {/* useGesture */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <h5 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                <Icon name="hand" size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                useGesture
              </h5>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                제스처 기반 모션을 위한 훅입니다.
              </p>
              <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                <pre><code>{`const gesture = useGesture({
  drag: true,
  swipe: true,
  pinch: true
})

return <div ref={gesture.ref} style={gesture.style}>`}</code></pre>
              </div>
            </div>

            {/* useOrchestration */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <h5 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                <Icon name="music" size={20} className="mr-2 text-green-600 dark:text-green-400" />
                useOrchestration
              </h5>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                여러 모션을 순차적으로 실행하는 훅입니다.
              </p>
              <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                <pre><code>{`const chain = createMotionChain([
  { hook: useFadeIn, config: { duration: 500 } },
  { hook: useSlideUp, config: { duration: 800 } },
  { hook: useScaleIn, config: { duration: 600 } }
])

const orchestration = useOrchestration(chain)`}</code></pre>
              </div>
            </div>

            {/* useLayoutMotion */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <h5 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                <Icon name="move" size={20} className="mr-2 text-purple-600 dark:text-purple-400" />
                useLayoutMotion
              </h5>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                레이아웃 변경에 따른 모션 훅입니다.
              </p>
              <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                <pre><code>{`const layout = useLayoutMotion({
  width: { from: 100, to: 200 },
  height: { from: 100, to: 200 }
})

return <div ref={layout.ref} style={layout.style}>`}</code></pre>
              </div>
            </div>

            {/* useSpringMotion */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <h5 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                <Icon name="zap" size={20} className="mr-2 text-orange-600 dark:text-orange-400" />
                useSpringMotion
              </h5>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                스프링 물리 기반 모션 훅입니다.
              </p>
              <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                <pre><code>{`const spring = useSpringMotion({ 
  tension: 100, 
  friction: 10 
})

return <div ref={spring.ref} style={{ 
  transform: \`translateY(\${spring.translateY}px)\` 
}}>`}</code></pre>
              </div>
            </div>
          </div>

          {/* Easing 함수 */}
          <div className="mt-8">
            <h5 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              <Icon name="gauge" size={20} className="align-text-bottom mr-2 text-blue-600 dark:text-blue-400" />
              Easing 함수
            </h5>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              모션의 가속도와 감속도를 제어하는 이징 함수들을 제공합니다.
            </p>
            <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-6 overflow-x-auto">
              <pre><code>{`import { easeInBounce, easeOutElastic } from '@hua-labs/motion-core'

const motion = useFadeIn({ 
  duration: 1000, 
  easing: easeInBounce 
})`}</code></pre>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  )
} 