'use client'

import { Icon } from '@hua-labs/ui'

export default function IndividualHooksSection() {
  return (
    <section className="mb-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          <Icon name="brain" size={40} className="inline-block align-text-bottom mr-3 text-blue-600 dark:text-blue-400" />
          개별 모션 훅
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          각각의 모션 훅을 독립적으로 사용하여 원하는 모션을 정확히 구현하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* useFadeIn */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <Icon name="eye" size={24} className="mr-3 text-blue-600 dark:text-blue-400" />
            useFadeIn
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            요소를 부드럽게 페이드인하는 모션 훅입니다.
          </p>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
            <pre><code>{`const fadeIn = useFadeIn({ 
  duration: 1000, 
  autoStart: true,
  delay: 200 
})

return <div ref={fadeIn.ref} style={{ opacity: fadeIn.opacity }}>`}</code></pre>
          </div>
        </div>

        {/* useSlideUp */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <Icon name="arrowUp" size={24} className="mr-3 text-green-600 dark:text-green-400" />
            useSlideUp
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            요소를 아래에서 위로 슬라이드하는 모션 훅입니다.
          </p>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
            <pre><code>{`const slideUp = useSlideUp({ 
  duration: 800, 
  delay: 200 
})

return <div ref={slideUp.ref} style={{ 
  transform: \`translateY(\${slideUp.translateY}px)\` 
}}>`}</code></pre>
          </div>
        </div>

        {/* useScaleIn */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <Icon name="maximize" size={24} className="mr-3 text-purple-600 dark:text-purple-400" />
            useScaleIn
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            요소를 스케일링하여 확대/축소하는 모션 훅입니다.
          </p>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
            <pre><code>{`const scaleIn = useScaleIn({ 
  duration: 600 
})

return <div ref={scaleIn.ref} style={{ 
  transform: \`scale(\${scaleIn.scale})\` 
}}>`}</code></pre>
          </div>
        </div>

        {/* usePulse */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <Icon name="activity" size={24} className="mr-3 text-orange-600 dark:text-orange-400" />
            usePulse
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            요소를 주기적으로 펄스하는 모션 훅입니다.
          </p>
          <div className="prose prose-base dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
            <pre><code>{`const pulse = usePulse({ 
  interval: 2000,
  autoStart: false 
})

return <div ref={pulse.ref} style={{ 
  transform: pulse.isAnimating ? 'scale(1.1)' : 'scale(1)' 
}}>`}</code></pre>
          </div>
        </div>
      </div>
    </section>
  )
} 