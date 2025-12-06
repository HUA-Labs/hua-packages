'use client'

import { useState, useEffect, useMemo } from 'react'
import { Action, Panel, Icon } from '@hua-labs/ui'
import { useFadeIn, useSlideLeft, useSlideRight, useScaleIn, useBounceIn } from '@hua-labs/motion-core'

export function AdvancedPageTransition() {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'contact'>('home')
  const [transitionType, setTransitionType] = useState<'slide' | 'fade' | 'scale' | 'bounce'>('slide')
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [transitionDuration, setTransitionDuration] = useState(500)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 우리 모션 라이브러리 훅들 사용
  const fadeInRef = useFadeIn({ delay: 0, duration: transitionDuration, autoStart: false })
  const slideLeftRef = useSlideLeft({ delay: 0, duration: transitionDuration, autoStart: false })
  const slideRightRef = useSlideRight({ delay: 0, duration: transitionDuration, autoStart: false })
  const scaleInRef = useScaleIn({ delay: 0, duration: transitionDuration, autoStart: false })
  const bounceInRef = useBounceIn({ delay: 0, duration: transitionDuration, autoStart: false })
  // useFlipIn은 현재 Core에 없으므로 제거

  const pages = {
    home: {
      title: '🏠 홈',
      content: 'HUA Motion Advanced의 홈페이지입니다. 다양한 페이지 전환 효과를 체험해보세요!',
      color: 'from-blue-500 to-cyan-600'
    },
    about: {
      title: 'ℹ️ 소개',
      content: '고급 모션과 페이지 전환을 위한 Advanced 패키지입니다. 복잡한 애니메이션 시퀀스를 쉽게 구현할 수 있습니다.',
      color: 'from-purple-500 to-pink-600'
    },
    contact: {
      title: '📞 연락처',
      content: 'HUA Labs와 연락하거나 기술 지원을 받으려면 언제든지 문의해주세요.',
      color: 'from-green-500 to-emerald-600'
    }
  }

  const currentPageData = pages[currentPage]

  // 현재 선택된 전환 타입에 따른 ref와 style 가져오기 - useMemo로 최적화
  const currentMotion = useMemo(() => {
    switch (transitionType) {
      case 'fade':
        return { ref: fadeInRef.ref, style: fadeInRef.style, start: fadeInRef.start, reset: fadeInRef.reset }
      case 'slide':
        return slideDirection === 'left' 
          ? { ref: slideLeftRef.ref, style: slideLeftRef.style, start: slideLeftRef.start, reset: slideLeftRef.reset }
          : { ref: slideRightRef.ref, style: slideRightRef.style, start: slideRightRef.start, reset: slideRightRef.reset }
      case 'scale':
        return { ref: scaleInRef.ref, style: scaleInRef.style, start: scaleInRef.start, reset: scaleInRef.reset }
      case 'bounce':
        return { ref: bounceInRef.ref, style: bounceInRef.style, start: bounceInRef.start, reset: bounceInRef.reset }
      default:
        return { ref: fadeInRef.ref, style: fadeInRef.style, start: fadeInRef.start, reset: fadeInRef.reset }
    }
  }, [transitionType, slideDirection, transitionDuration, fadeInRef, slideLeftRef, slideRightRef, scaleInRef, bounceInRef])

  const handlePageChange = async (page: 'home' | 'about' | 'contact') => {
    if (isTransitioning || currentPage === page) return

    setIsTransitioning(true)
    
    // 모든 효과에 대해 일관된 처리
    currentMotion.start?.()
    
    // 페이지 변경
    setCurrentPage(page)
    
    // 전환 완료 대기 (duration + 여유 시간)
    setTimeout(() => {
      setIsTransitioning(false)
    }, transitionDuration + 200) // 200ms로 늘려서 애니메이션 완료 보장
  }

  // 스타일 우선순위 조정 - 훅의 스타일이 Tailwind CSS보다 우선
  const combinedStyle = {
    ...currentMotion.style,
    // Tailwind CSS와 충돌하는 속성들을 명시적으로 설정
    transform: currentMotion.style?.transform,
    opacity: currentMotion.style?.opacity,
    transition: currentMotion.style?.transition,
    perspective: currentMotion.style?.perspective,
    transformStyle: currentMotion.style?.transformStyle,
    backfaceVisibility: currentMotion.style?.backfaceVisibility
  }

  return (
    <div className="space-y-8">
      {/* 컨트롤 패널 */}
      <Panel className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Icon name="settings" className="w-5 h-5 mr-2 text-blue-600" />
          전환 효과 설정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* 전환 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전환 타입
            </label>
            <select
              value={transitionType}
              onChange={(e) => setTransitionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="slide">Slide (슬라이드)</option>
              <option value="fade">Fade (페이드)</option>
              <option value="scale">Scale (스케일)</option>
              <option value="bounce">Bounce (바운스)</option>
            </select>
          </div>

          {/* 슬라이드 방향 선택 (슬라이드 타입일 때만 표시) */}
          {transitionType === 'slide' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                슬라이드 방향
              </label>
              <select
                value={slideDirection}
                onChange={(e) => setSlideDirection(e.target.value as 'left' | 'right')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left (왼쪽)</option>
                <option value="right">Right (오른쪽)</option>
              </select>
            </div>
          )}

          {/* 전환 시간 조정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전환 시간: {transitionDuration}ms
            </label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={transitionDuration}
              onChange={(e) => setTransitionDuration(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 상태 표시 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <div className={`px-3 py-2 rounded-md text-sm font-medium ${
              isTransitioning 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isTransitioning ? '전환 중...' : '대기 중'}
            </div>
          </div>
        </div>

        {/* 페이지 네비게이션 */}
        <div className="flex gap-2">
          {(['home', 'about', 'contact'] as const).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={isTransitioning || currentPage === page}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
              }`}
            >
              {pages[page].title}
            </button>
          ))}
        </div>
      </Panel>

      {/* 페이지 컨텐츠 */}
      <Panel className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Icon name="layers" className="w-5 h-5 mr-2 text-purple-600" />
          페이지 전환 데모 (HUA Motion 라이브러리 사용)
        </h3>
        
        <div 
          ref={currentMotion.ref}
          style={combinedStyle}
          className={`bg-gradient-to-r ${currentPageData.color} text-white p-8 rounded-2xl text-center min-h-[300px] flex flex-col justify-center`}
        >
          <h2 className="text-3xl font-bold mb-4">{currentPageData.title}</h2>
          <p className="text-lg opacity-90 leading-relaxed max-w-2xl mx-auto">
            {currentPageData.content}
          </p>
          
          {/* 전환 효과 정보 */}
          <div className="mt-6 p-4 bg-white/20 rounded-lg">
            <p className="text-sm opacity-90">
              <strong>현재 전환:</strong> {transitionType} 
              {transitionType === 'slide' && ` (${slideDirection === 'left' ? '왼쪽' : '오른쪽'})`}
              ({transitionDuration}ms)
            </p>
            <p className="text-xs opacity-75 mt-1">
              <strong>HUA Motion 라이브러리 사용:</strong> {transitionType === 'fade' ? 'useFadeIn' : 
                                                           transitionType === 'slide' ? (slideDirection === 'left' ? 'useSlideLeft' : 'useSlideRight') : 
                                                           transitionType === 'scale' ? 'useScaleIn' : 
                                                           transitionType === 'bounce' ? 'useBounceIn' : 'useFadeIn'} 훅
            </p>
          </div>
        </div>
      </Panel>

      {/* 코드 예제 */}
      <Panel className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Icon name="code" className="w-5 h-5 mr-2 text-green-600" />
          HUA Motion 라이브러리 사용 예제
        </h3>
        
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
          <pre className="text-green-400 text-sm">
            <code>{`import { useFadeIn, useSlideLeft, useSlideRight, useScaleIn, useBounceIn } from '@hua-labs/motion-core'

function PageTransitionDemo() {
  const [transitionType, setTransitionType] = useState('slide')
  const [slideDirection, setSlideDirection] = useState('right')
  
  // 우리 모션 라이브러리 훅들 사용 (autoStart: false로 설정)
  const fadeInRef = useFadeIn({ delay: 0, duration: 500, autoStart: false })
  const slideLeftRef = useSlideLeft({ delay: 0, duration: 500, autoStart: false })
  const slideRightRef = useSlideRight({ delay: 0, duration: 500, autoStart: false })
  const scaleInRef = useScaleIn({ delay: 0, duration: 500, autoStart: false })
  const bounceInRef = useBounceIn({ delay: 0, duration: 500, autoStart: false })
  // useFlipIn은 Core에 없으므로 제거
  
  const getCurrentMotion = () => {
    switch (transitionType) {
      case 'fade': return { ref: fadeInRef.ref, style: fadeInRef.style, start: fadeInRef.start }
      case 'slide': return slideDirection === 'left' 
        ? { ref: slideLeftRef.ref, style: slideLeftRef.style, start: slideLeftRef.start }
        : { ref: slideRightRef.ref, style: slideRightRef.style, start: slideRightRef.start }
      case 'scale': return { ref: scaleInRef.ref, style: scaleInRef.style, start: scaleInRef.start }
      case 'bounce': return { ref: bounceInRef.ref, style: bounceInRef.style, start: bounceInRef.start }
      default: return { ref: fadeInRef.ref, style: fadeInRef.style, start: fadeInRef.start }
    }
  }
  
  const handlePageChange = (page) => {
    const currentMotion = getCurrentMotion()
    currentMotion.start?.() // 훅의 start 함수 호출
    setCurrentPage(page)
  }
  
  const currentMotion = getCurrentMotion()
  
  return (
    <div ref={currentMotion.ref} style={currentMotion.style}>
      페이지 컨텐츠
    </div>
  )
}`}</code>
          </pre>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Action 
            variant="gradient" 
            gradient="green" 
            size="sm"
            onClick={() => navigator.clipboard.writeText(`import { useFadeIn, useSlideLeft, useSlideRight, useScaleIn, useBounceIn } from '@hua-labs/motion-core'

function PageTransitionDemo() {
  const [transitionType, setTransitionType] = useState('slide')
  const [slideDirection, setSlideDirection] = useState('right')
  
  // 우리 모션 라이브러리 훅들 사용 (autoStart: false로 설정)
  const fadeInRef = useFadeIn({ delay: 0, duration: 500, autoStart: false })
  const slideLeftRef = useSlideLeft({ delay: 0, duration: 500, autoStart: false })
  const slideRightRef = useSlideRight({ delay: 0, duration: 500, autoStart: false })
  const scaleInRef = useScaleIn({ delay: 0, duration: 500, autoStart: false })
  const bounceInRef = useBounceIn({ delay: 0, duration: 500, autoStart: false })
  // useFlipIn은 Core에 없으므로 제거
  
  const getCurrentMotion = () => {
    switch (transitionType) {
      case 'fade': return { ref: fadeInRef.ref, style: fadeInRef.style, start: fadeInRef.start }
      case 'slide': return slideDirection === 'left' 
        ? { ref: slideLeftRef.ref, style: slideLeftRef.style, start: slideLeftRef.start }
        : { ref: slideRightRef.ref, style: slideRightRef.style, start: slideRightRef.start }
      case 'scale': return { ref: scaleInRef.ref, style: scaleInRef.style, start: scaleInRef.start }
      case 'bounce': return { ref: bounceInRef.ref, style: bounceInRef.style, start: bounceInRef.start }
      default: return { ref: fadeInRef.ref, style: fadeInRef.style, start: fadeInRef.start }
    }
  }
  
  const handlePageChange = (page) => {
    const currentMotion = getCurrentMotion()
    currentMotion.start?.() // 훅의 start 함수 호출
    setCurrentPage(page)
  }
  
  const currentMotion = getCurrentMotion()
  
  return (
    <div ref={currentMotion.ref} style={currentMotion.style}>
      페이지 컨텐츠
    </div>
  )
}`)}
          >
            <Icon name="copy" className="w-4 h-5 mr-2" />
            코드 복사
          </Action>
        </div>
      </Panel>

      {/* 기능 설명 */}
      <Panel className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Icon name="info" className="w-5 h-5 mr-2 text-cyan-600" />
          HUA Motion 라이브러리 기반 페이지 전환
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">🎯 HUA Motion 훅들</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>useFadeIn:</strong> 자연스러운 페이드 인/아웃</li>
              <li>• <strong>useSlideLeft:</strong> 왼쪽으로 슬라이드 전환</li>
              <li>• <strong>useSlideRight:</strong> 오른쪽으로 슬라이드 전환</li>
              <li>• <strong>useScaleIn:</strong> 확대/축소 기반 전환</li>
              <li>• <strong>useBounceIn:</strong> 탄력있는 바운스 효과</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">⚡ 라이브러리 장점</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>일관된 API:</strong> 모든 훅이 동일한 패턴</li>
              <li>• <strong>성능 최적화:</strong> 내장된 최적화 로직</li>
              <li>• <strong>타입 안전성:</strong> TypeScript 완벽 지원</li>
              <li>• <strong>접근성:</strong> 스크린 리더 지원</li>
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  )
}
