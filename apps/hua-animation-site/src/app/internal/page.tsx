'use client'

import { useMotion, useFadeIn, useSlideUp, useBounceIn, useScaleIn, useScrollReveal, useHoverAnimation, useSequence } from '@hua-labs/animation'

export default function InternalPage() {
  // Control API 테스트용 하나의 애니메이션 - 5초 동안 색상과 크기 변화
  const testAnimation = useMotion(
    { opacity: 0, scale: 0.5, backgroundColor: '#3B82F6' }, // from: 숨겨진 상태, 작은 크기, 파란색
    { opacity: 1, scale: 1.2, backgroundColor: '#EF4444' }, // to: 보이는 상태, 큰 크기, 빨간색
    { 
      duration: 5000, // 5초
      autoStart: false,
      ease: 'easeInOutCubic'
    }
  )

  // 제스처 트리거
  const scrollFadeIn = useScrollReveal(useBounceIn({ autoStart: false, duration: 2000 }), { 
    threshold: 0.5, 
    rootMargin: '-20% 0px' 
  })
  const scrollSlideUp = useScrollReveal(useSlideUp({ autoStart: false }), { 
    threshold: 0.5, 
    rootMargin: '-20% 0px' 
  })
  const hoverScale = useHoverAnimation(useMotion(
    { scale: 1, opacity: 1 }, // 초기: 보이는 상태
    { scale: 1.3, opacity: 1 }, // 호버: 30% 크기 증가
    { duration: 1000, autoStart: false, ease: 'easeInOut' }
  ), { 
    onHover: 'start', 
    onLeave: 'reset' 
  })
  const hoverBounce = useHoverAnimation(useMotion(
    { scale: 1, opacity: 1 }, // 초기: 보이는 상태
    { scale: 1.2, opacity: 1 }, // 호버: 20% 크기 증가 + 바운스 효과
    { duration: 1000, autoStart: false, ease: 'easeOutBounce' }
  ), { 
    onHover: 'start', 
    onLeave: 'reset' 
  })

  // 시퀀싱 - 개별 애니메이션으로 테스트
  const sequence1 = useMotion(
    { scale: 1, opacity: 1, backgroundColor: '#3B82F6' },
    { scale: 1.5, opacity: 1, backgroundColor: '#EF4444' },
    { duration: 2000, autoStart: false, ease: 'easeInOut' }
  )
  
  const sequence2 = useMotion(
    { scale: 1, opacity: 1, backgroundColor: '#10B981' },
    { scale: 1.3, opacity: 1, backgroundColor: '#F59E0B' },
    { duration: 2000, autoStart: false, ease: 'easeOut' }
  )
  
  const sequence3 = useMotion(
    { scale: 1, opacity: 1, backgroundColor: '#8B5CF6' },
    { scale: 1.4, opacity: 1, backgroundColor: '#EC4899' },
    { duration: 2000, autoStart: false, ease: 'easeOutBounce' }
  )
  
  const sequence4 = useMotion(
    { scale: 1, opacity: 1, backgroundColor: '#F97316' },
    { scale: 1.6, opacity: 1, backgroundColor: '#06B6D4' },
    { duration: 2000, autoStart: false, ease: 'easeInOut' }
  )

  // 시퀀스 시작 함수
  const startSequence = () => {
    console.log('Starting sequence...')
    sequence1.start()
    setTimeout(() => {
      console.log('Starting sequence 2...')
      sequence2.start()
    }, 1000)
    setTimeout(() => {
      console.log('Starting sequence 3...')
      sequence3.start()
    }, 2000)
    setTimeout(() => {
      console.log('Starting sequence 4...')
      sequence4.start()
    }, 3000)
  }

  const stopSequence = () => {
    sequence1.stop()
    sequence2.stop()
    sequence3.stop()
    sequence4.stop()
  }

  const resetSequence = () => {
    sequence1.reset()
    sequence2.reset()
    sequence3.reset()
    sequence4.reset()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">HUA Animation 1.0.0 Test</h1>

        {/* 애니메이션 제어 API 테스트 */}
        <section className="mb-12 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Animation Control API Test</h2>
          <p className="text-sm text-gray-600 mb-4">
            하나의 애니메이션으로 모든 Control API를 테스트합니다. (5초 동안 색상과 크기 변화)
          </p>
          
          {/* 테스트 과정 안내 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">테스트 과정:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. <strong>초기 상태</strong>: 요소가 숨겨진 상태로 시작 (작은 크기, 파란색)</li>
              <li>2. <strong>Start</strong>: 5초 동안 나타나면서 크기가 커지고 빨간색으로 변함</li>
              <li>3. <strong>Reset</strong>: 보이는 상태에서 숨겨진 상태로 복원</li>
              <li>4. <strong>Pause/Resume</strong>: 애니메이션 중간에 일시정지/재개 (색상 변화가 명확히 보임)</li>
              <li>5. <strong>Stop</strong>: 애니메이션 완전 정지</li>
            </ol>
          </div>

          {/* 테스트 대상 요소 */}
          <div className="mb-6">
            <div 
              ref={testAnimation.ref} 
              className="w-32 h-32 rounded flex items-center justify-center text-white mx-auto transition-colors"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Test Element
            </div>
          </div>

          {/* 제어 버튼들 */}
          <div className="space-x-2 mb-4">
            <button 
              onClick={testAnimation.start}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start
            </button>
            <button 
              onClick={testAnimation.pause}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Pause
            </button>
            <button 
              onClick={testAnimation.resume}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Resume
            </button>
            <button 
              onClick={testAnimation.stop}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Stop
            </button>
            <button 
              onClick={testAnimation.reset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          {/* 상태 표시 */}
          <div className="text-sm text-gray-600">
            <div>Status: <span className="font-medium">{testAnimation.isAnimating ? 'Playing' : 'Stopped'}</span></div>
            <div>Paused: <span className="font-medium">{testAnimation.isPaused ? 'Yes' : 'No'}</span></div>
          </div>
        </section>

        {/* 제스처 트리거 테스트 */}
        <section className="mb-12 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Gesture Triggers</h2>
          
          {/* 스크롤 트리거 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Scroll Reveal</h3>
            <p className="text-sm text-gray-600 mb-4">아래로 스크롤하면 애니메이션이 시작됩니다.</p>
            <div className="space-y-4">
              <div ref={scrollFadeIn.ref} className="w-full h-32 bg-blue-500 rounded flex items-center justify-center text-white">
                Scroll to reveal - Fade In
              </div>
              <div ref={scrollSlideUp.ref} className="w-full h-32 bg-green-500 rounded flex items-center justify-center text-white">
                Scroll to reveal - Slide Up
              </div>
            </div>
          </div>

          {/* 호버 트리거 */}
          <div>
            <h3 className="text-lg font-medium mb-4">Hover Animation</h3>
            <p className="text-sm text-gray-600 mb-4">마우스를 올리면 애니메이션이 시작되고, 떼면 원래 상태로 돌아갑니다.</p>
            <div className="grid grid-cols-2 gap-4">
              <div 
                ref={hoverScale.ref} 
                className="w-32 h-32 bg-purple-500 rounded flex items-center justify-center text-white cursor-pointer transition-all hover:shadow-lg"
                style={{ transform: 'scale(1)' }}
              >
                Hover to Scale
              </div>
              <div 
                ref={hoverBounce.ref} 
                className="w-32 h-32 bg-red-500 rounded flex items-center justify-center text-white cursor-pointer transition-all hover:shadow-lg"
                style={{ transform: 'scale(1)' }}
              >
                Hover to Bounce
              </div>
            </div>
          </div>
        </section>

        {/* 시퀀싱 테스트 */}
        <section className="mb-12 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Animation Sequencing</h2>
          <p className="text-sm text-gray-600 mb-4">여러 애니메이션이 순차적으로 실행됩니다. 각 사각형이 순서대로 색상과 크기가 변합니다.</p>
          <div className="mb-4 space-y-4">
            <div ref={sequence1.ref} className="w-32 h-32 bg-blue-500 rounded flex items-center justify-center text-white mx-auto">
              Sequence 1
            </div>
            <div ref={sequence2.ref} className="w-32 h-32 bg-green-500 rounded flex items-center justify-center text-white mx-auto">
              Sequence 2
            </div>
            <div ref={sequence3.ref} className="w-32 h-32 bg-purple-500 rounded flex items-center justify-center text-white mx-auto">
              Sequence 3
            </div>
            <div ref={sequence4.ref} className="w-32 h-32 bg-orange-500 rounded flex items-center justify-center text-white mx-auto">
              Sequence 4
            </div>
          </div>
          <div className="space-x-2">
            <button 
              onClick={startSequence}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start Sequence
            </button>
            <button 
              onClick={stopSequence}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Stop Sequence
            </button>
            <button 
              onClick={resetSequence}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset Sequence
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Playing: {sequence1.isAnimating || sequence2.isAnimating || sequence3.isAnimating || sequence4.isAnimating ? 'Yes' : 'No'} | 
            Current: {sequence1.isAnimating ? '1' : sequence2.isAnimating ? '2' : sequence3.isAnimating ? '3' : sequence4.isAnimating ? '4' : 'None'}
          </div>
        </section>

        {/* 스크롤 공간 */}
        <div className="h-96 bg-gray-200 rounded flex items-center justify-center">
          <p className="text-gray-600">Scroll down to test scroll reveal animations</p>
        </div>
      </div>
    </div>
  )
} 