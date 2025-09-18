'use client'

import React from 'react'
import { 
  useGesture, 
  useOrchestration, 
  createAnimationChain,
  useLayoutAnimation,
  createLayoutTransition
} from '@hua-labs/animation'

export default function AdvancedPage() {
  // 제스처 애니메이션
  const gesture = useGesture({
    onDrag: (delta) => {
      console.log('Dragging:', delta)
    },
    onSwipe: (direction) => {
      console.log('Swiped:', direction)
    },
    onPinch: (scale) => {
      console.log('Pinched:', scale)
    },
    onRotate: (rotation) => {
      console.log('Rotated:', rotation)
    },
    dragConstraints: {
      left: -100,
      right: 100,
      top: -50,
      bottom: 50
    }
  })

  // 오케스트레이션 애니메이션
  const animationChain = createAnimationChain()
    .add('step1', () => console.log('Step 1'), { duration: 1000 })
    .add('step2', () => console.log('Step 2'), { duration: 800 })
    .add('step3', () => console.log('Step 3'), { duration: 1200 })
    .build()

  const orchestration = useOrchestration({
    steps: animationChain,
    autoStart: false,
    loop: false,
    onComplete: () => console.log('Orchestration complete!'),
    onStepComplete: (stepId) => console.log(`Step ${stepId} complete!`)
  })

  // 레이아웃 애니메이션
  const layoutTransition = createLayoutTransition(
    {
      width: 200,
      height: 100,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 10
    },
    {
      width: 300,
      height: 150,
      flexDirection: 'column' as const,
      justifyContent: 'space-between' as const,
      gap: 20
    },
    {
      duration: 1000,
      easing: 'ease-in-out'
    }
  )

  const layoutAnimation = useLayoutAnimation(layoutTransition)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 Advanced Animation
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            프레이머 모션을 대체할 수 있는 고급 애니메이션 기능들
          </p>
        </header>

        {/* 제스처 애니메이션 섹션 */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              🖐️ 제스처 애니메이션
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              드래그, 스와이프, 핀치, 회전 제스처를 지원합니다.
            </p>
            
            <div 
              ref={gesture.ref}
              className="w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${gesture.state.delta.x}px, ${gesture.state.delta.y}px) scale(${gesture.state.scale}) rotate(${gesture.state.rotation}deg)`,
                transition: gesture.state.isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {gesture.state.isDragging && '드래그 중...'}
              {gesture.state.isPinching && '핀치 중...'}
              {gesture.state.isRotating && '회전 중...'}
              {!gesture.state.isDragging && !gesture.state.isPinching && !gesture.state.isRotating && '제스처 테스트'}
            </div>

            <div className="mt-4 p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
              <h4 className="font-bold mb-2 text-gray-900 dark:text-gray-100">제스처 상태:</h4>
              <p className="text-gray-700 dark:text-gray-300">드래그: {gesture.state.isDragging ? '✅' : '❌'}</p>
              <p className="text-gray-700 dark:text-gray-300">핀치: {gesture.state.isPinching ? '✅' : '❌'}</p>
              <p className="text-gray-700 dark:text-gray-300">회전: {gesture.state.isRotating ? '✅' : '❌'}</p>
              <p className="text-gray-700 dark:text-gray-300">델타: ({gesture.state.delta.x}, {gesture.state.delta.y})</p>
              <p className="text-gray-700 dark:text-gray-300">스케일: {gesture.state.scale.toFixed(2)}</p>
              <p className="text-gray-700 dark:text-gray-300">회전: {gesture.state.rotation.toFixed(1)}°</p>
            </div>
          </div>
        </section>

        {/* 오케스트레이션 섹션 */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              🎼 애니메이션 오케스트레이션
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              복잡한 애니메이션 시퀀스를 체이닝으로 구성할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-20 rounded-lg flex items-center justify-center text-white font-bold transition-all duration-500 ${
                    orchestration.state.currentStep === step - 1
                      ? 'bg-green-500 scale-110'
                      : orchestration.state.currentStep > step - 1
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`}
                >
                  Step {step}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => orchestration.play()}
                disabled={orchestration.state.isPlaying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {orchestration.state.isPlaying ? '재생 중...' : '재생'}
              </button>
              <button
                onClick={() => orchestration.pause()}
                disabled={!orchestration.state.isPlaying}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                일시정지
              </button>
              <button
                onClick={() => orchestration.resume()}
                disabled={orchestration.state.isPlaying || orchestration.state.isComplete}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                재개
              </button>
              <button
                onClick={() => orchestration.reset()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                리셋
              </button>
            </div>

            <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
              <h4 className="font-bold mb-2 text-gray-900 dark:text-gray-100">오케스트레이션 상태:</h4>
              <p className="text-gray-700 dark:text-gray-300">재생 중: {orchestration.state.isPlaying ? '✅' : '❌'}</p>
              <p className="text-gray-700 dark:text-gray-300">현재 스텝: {orchestration.state.currentStep + 1}</p>
              <p className="text-gray-700 dark:text-gray-300">진행률: {(orchestration.state.progress * 100).toFixed(1)}%</p>
              <p className="text-gray-700 dark:text-gray-300">완료: {orchestration.state.isComplete ? '✅' : '❌'}</p>
            </div>
          </div>
        </section>

        {/* 레이아웃 애니메이션 섹션 */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              📐 레이아웃 애니메이션
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              Flexbox와 Grid 레이아웃 변화를 부드럽게 애니메이션합니다.
            </p>

            <div
              ref={layoutAnimation.ref}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4"
              style={layoutAnimation.state.currentStyle}
            >
              <div className="bg-blue-500 text-white p-2 rounded text-center">아이템 1</div>
              <div className="bg-green-500 text-white p-2 rounded text-center">아이템 2</div>
              <div className="bg-purple-500 text-white p-2 rounded text-center">아이템 3</div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => layoutAnimation.start()}
                disabled={layoutAnimation.state.isAnimating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {layoutAnimation.state.isAnimating ? '애니메이션 중...' : '레이아웃 변경'}
              </button>
              <button
                onClick={() => layoutAnimation.reset()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                리셋
              </button>
            </div>

            <div className="mt-4 p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
              <h4 className="font-bold mb-2 text-gray-900 dark:text-gray-100">레이아웃 상태:</h4>
              <p className="text-gray-700 dark:text-gray-300">애니메이션 중: {layoutAnimation.state.isAnimating ? '✅' : '❌'}</p>
              <p className="text-gray-700 dark:text-gray-300">진행률: {(layoutAnimation.state.progress * 100).toFixed(1)}%</p>
            </div>
          </div>
        </section>

        {/* 이징 함수 데모 섹션 */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              📈 고급 이징 함수들
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              프레이머 모션과 유사한 다양한 이징 함수들을 제공합니다.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {['linear', 'easeIn', 'easeOut', 'easeInOut', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic', 'easeInQuart', 'easeOutQuart', 'easeInOutQuart', 'easeInQuint', 'easeOutQuint', 'easeInOutQuint'].map((name) => (
                <div key={name} className="text-center">
                  <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold">
                    {name}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{name}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
              <h4 className="font-bold mb-2 text-gray-900 dark:text-gray-100">사용 가능한 이징 함수들:</h4>
              <p className="text-gray-700 dark:text-gray-300">
                linear, easeIn, easeOut, easeInOut, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint, easeInOutQuint, easeInSine, easeOutSine, easeInOutSine, easeInExpo, easeOutExpo, easeInOutExpo, easeInCirc, easeOutCirc, easeInOutCirc, easeInBounce, easeOutBounce, easeInOutBounce, easeInBack, easeOutBack, easeInOutBack, easeInElastic, easeOutElastic, easeInOutElastic, steps
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 