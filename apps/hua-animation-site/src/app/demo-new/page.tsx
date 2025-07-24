'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hua-labs/ui'
import { useTranslation } from '@hua-labs/i18n-sdk/beginner'
import {
  useFadeIn,
  useBounceIn,
  useScaleIn,
  useSlideLeft,
  useSlideRight,
  useSlideUp,
  useMotion,
  useInteractive,
  useRepeat,
  useSkeleton,
  usePerformanceMonitor,
  useSpring,
  useScrollReveal,
  useHoverAnimation,
  useSequence
} from '@hua-labs/animation'

export default function DemoNewPage() {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            HUA Animation - Complete Demo
          </h1>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔄 재실행
          </button>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          모든 애니메이션 예시를 한 곳에서 확인하세요
        </p>
      </div>

      {/* 기본 애니메이션들 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">기본 애니메이션</h2>

        


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Fade In */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fade In</CardTitle>
              <CardDescription className="text-xs">부드러운 페이드인</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <FadeDemo />
            </CardContent>
          </Card>

          {/* Bounce In */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bounce In</CardTitle>
              <CardDescription className="text-xs">바운스 효과</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <BounceDemo />
            </CardContent>
          </Card>

          {/* Scale In */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Scale In</CardTitle>
              <CardDescription className="text-xs">크기 변화</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <ScaleDemo />
            </CardContent>
          </Card>

        </div>
      </section>

      {/* 슬라이드 애니메이션들 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">슬라이드 애니메이션</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Slide Left */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Slide Left</CardTitle>
              <CardDescription className="text-xs">왼쪽에서 슬라이드</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SlideLeftDemo />
            </CardContent>
          </Card>

          {/* Slide Right */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Slide Right</CardTitle>
              <CardDescription className="text-xs">오른쪽에서 슬라이드</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SlideRightDemo />
            </CardContent>
          </Card>

          {/* Slide Up */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Slide Up</CardTitle>
              <CardDescription className="text-xs">아래에서 위로 슬라이드</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SlideUpDemo />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 반복 애니메이션들 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">반복 애니메이션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Pulse */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pulse</CardTitle>
              <CardDescription className="text-xs">펄스 효과</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <RepeatPulseDemo />
            </CardContent>
          </Card>

          {/* Bounce */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bounce</CardTitle>
              <CardDescription className="text-xs">바운스 반복</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <RepeatBounceDemo />
            </CardContent>
          </Card>

          {/* Wave */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Wave</CardTitle>
              <CardDescription className="text-xs">웨이브 효과</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <RepeatWaveDemo />
            </CardContent>
          </Card>

          {/* Fade */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fade</CardTitle>
              <CardDescription className="text-xs">페이드 반복</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <RepeatFadeDemo />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 스프링 애니메이션들 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">스프링 애니메이션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Gentle */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Gentle Spring</CardTitle>
                  <CardDescription className="text-xs">부드러운 스프링</CardDescription>
                </div>
                <button 
                  onClick={() => (document.querySelector('[data-spring="gentle"]') as HTMLElement)?.click()} 
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                  title="재실행"
                >
                  🔄
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SpringGentleDemo />
            </CardContent>
          </Card>

          {/* Fast */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Fast Spring</CardTitle>
                  <CardDescription className="text-xs">빠른 스프링</CardDescription>
                </div>
                <button 
                  onClick={() => (document.querySelector('[data-spring="fast"]') as HTMLElement)?.click()} 
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                  title="재실행"
                >
                  🔄
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SpringFastDemo />
            </CardContent>
          </Card>

          {/* Bouncy */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Bouncy Spring</CardTitle>
                  <CardDescription className="text-xs">바운스 스프링</CardDescription>
                </div>
                <button 
                  onClick={() => (document.querySelector('[data-spring="bouncy"]') as HTMLElement)?.click()} 
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                  title="재실행"
                >
                  🔄
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SpringBounceDemo />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 인터랙티브 & 고급 애니메이션들 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">인터랙티브 & 고급 애니메이션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Hover */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Hover Animation</CardTitle>
              <CardDescription className="text-xs">마우스 오버 효과</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <HoverDemo />
            </CardContent>
          </Card>

          {/* Click */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Click Animation</CardTitle>
              <CardDescription className="text-xs">클릭 효과</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <ClickDemo />
            </CardContent>
          </Card>

          {/* Scroll Reveal */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Scroll Reveal</CardTitle>
              <CardDescription className="text-xs">스크롤 시 나타나는 효과</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <ScrollRevealDemo />
            </CardContent>
          </Card>

          {/* Sequence */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Animation Sequence</CardTitle>
              <CardDescription className="text-xs">순차적 애니메이션</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SequenceDemo />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 스켈레톤 & 성능 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">스켈레톤 & 성능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Skeleton */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Skeleton Loading</CardTitle>
              <CardDescription className="text-xs">로딩 스켈레톤</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <SkeletonDemo />
            </CardContent>
          </Card>

          {/* Performance Monitor */}
          <Card className="aspect-square flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Performance Monitor</CardTitle>
              <CardDescription className="text-xs">성능 모니터링</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <PerformanceDemo />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

// 기본 애니메이션 컴포넌트들
function FadeDemo() {
  const animation = useFadeIn({
    duration: 2000,
    delay: 500,
    autoStart: false
  })

  React.useEffect(() => {
    const timer = setTimeout(() => animation.start(), 500)
    return () => clearTimeout(timer)
  }, [animation])

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Fade In</div>
    </div>
  )
}

function BounceDemo() {
  const animation = useBounceIn({
    duration: 2000,
    delay: 800,
    autoStart: false
  })

  React.useEffect(() => {
    const timer = setTimeout(() => animation.start(), 800)
    return () => clearTimeout(timer)
  }, [animation])

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Bounce In</div>
    </div>
  )
}

function ScaleDemo() {
  const animation = useScaleIn({
    scale: 0,
    duration: 2000,
    delay: 1100,
    autoStart: false
  })

  React.useEffect(() => {
    const timer = setTimeout(() => animation.start(), 1100)
    return () => clearTimeout(timer)
  }, [animation])

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Scale In</div>
    </div>
  )
}

function SlideUpDemo() {
  const animation = useSlideUp({
    distance: 50,
    duration: 2000,
    delay: 400,
    autoStart: false
  })

  React.useEffect(() => {
    const timer = setTimeout(() => animation.start(), 400)
    return () => clearTimeout(timer)
  }, [animation])

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Slide Up</div>
    </div>
  )
}

// 슬라이드 애니메이션 컴포넌트들
function SlideLeftDemo() {
  const animation = useSlideLeft({
    distance: 100,
    duration: 2000,
    delay: 200
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Slide Left</div>
    </div>
  )
}

function SlideRightDemo() {
  const animation = useSlideRight({
    distance: 100,
    duration: 2000,
    delay: 300
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Slide Right</div>
    </div>
  )
}

// 반복 애니메이션 컴포넌트들
function RepeatPulseDemo() {
  const animation = useRepeat({
    effect: 'pulse',
    duration: 1200,
    intensity: 1.3,
    repeat: Infinity,
    yoyo: true,
    delay: 500
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Pulse</div>
    </div>
  )
}

function RepeatBounceDemo() {
  const animation = useRepeat({
    effect: 'bounce',
    duration: 1000,
    intensity: 1.2,
    repeat: Infinity,
    yoyo: true,
    delay: 800
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Bounce</div>
    </div>
  )
}

function RepeatWaveDemo() {
  const animation = useRepeat({
    effect: 'wave',
    duration: 1000,
    intensity: 1.1,
    repeat: Infinity,
    yoyo: true,
    delay: 1100
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Wave</div>
    </div>
  )
}

function RepeatFadeDemo() {
  const animation = useRepeat({
    effect: 'fade',
    duration: 1000,
    intensity: 1.0,
    repeat: Infinity,
    yoyo: true,
    delay: 1400
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Fade</div>
    </div>
  )
}

// 스프링 애니메이션 컴포넌트들
function SpringGentleDemo() {
  const animation = useSpring({
    from: 0.3,
    to: 1,
    type: 'gentle',
    delay: 100
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Gentle</div>
      <button 
        data-spring="gentle"
        onClick={() => animation.restart()} 
        className="hidden"
      >
        재실행
      </button>
    </div>
  )
}

function SpringFastDemo() {
  const animation = useSpring({
    from: 0.3,
    to: 1,
    type: 'fast',
    delay: 200
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Fast</div>
      <button 
        data-spring="fast"
        onClick={() => animation.restart()} 
        className="hidden"
      >
        재실행
      </button>
    </div>
  )
}

function SpringBounceDemo() {
  const animation = useSpring({
    from: 0.3,
    to: 1,
    type: 'bounce',
    delay: 300
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Bouncy</div>
      <button 
        data-spring="bouncy"
        onClick={() => animation.restart()} 
        className="hidden"
      >
        재실행
      </button>
    </div>
  )
}

// 인터랙티브 애니메이션 컴포넌트들
function HoverDemo() {
  const animation = useInteractive({
    type: 'hover',
    effect: 'scale',
    intensity: 1.2,
    duration: 300
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg cursor-pointer"
      />
      <div className="text-xs mt-2 text-gray-500">Hover</div>
    </div>
  )
}

function ClickDemo() {
  const animation = useInteractive({
    type: 'click',
    effect: 'scale',
    intensity: 0.8,
    duration: 300
  })

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={animation.ref}
        className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg cursor-pointer transform origin-center"
      />
      <div className="text-xs mt-2 text-gray-500">Click</div>
    </div>
  )
}

// 고급 애니메이션 컴포넌트들
function ScrollRevealDemo() {
  const scrollReveal = useScrollReveal(
    () => useFadeIn({ duration: 1000, ease: 'easeOut' }),
    { threshold: 0.1, triggerOnce: false }
  )

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div
        ref={scrollReveal.ref}
        className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg"
      />
      <div className="text-xs mt-2 text-gray-500">Scroll Reveal</div>
      <div className="text-xs text-gray-400">스크롤해보세요</div>
    </div>
  )
}

function SequenceDemo() {
  const animation1 = useFadeIn({ duration: 800, ease: 'easeOut', delay: 0 })
  const animation2 = useScaleIn({ duration: 600, ease: 'easeOut', delay: 200 })
  const animation3 = useSlideUp({ duration: 600, ease: 'easeOut', delay: 400 })

  React.useEffect(() => {
    const timer = setTimeout(() => {
      animation1.start()
      animation2.start()
      animation3.start()
    }, 1000)
    return () => clearTimeout(timer)
  }, [animation1, animation2, animation3])

  return (
    <div className="flex flex-col items-center justify-center h-20">
      <div className="flex justify-center space-x-2">
        <div
          ref={animation1.ref}
          className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
        >
          1
        </div>
        <div
          ref={animation2.ref}
          className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
        >
          2
        </div>
        <div
          ref={animation3.ref}
          className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
        >
          3
        </div>
      </div>
      <div className="text-xs mt-2 text-gray-500">Sequence</div>
      <div className="text-xs text-gray-400">순차 실행</div>
    </div>
  )
}

// 스켈레톤 & 성능 컴포넌트들
function SkeletonDemo() {
  const skeleton = useSkeleton({
    duration: 1500,
    repeat: Infinity,
    gradient: "linear-gradient(90deg, #e5e7eb 0%, #d1d5db 25%, #9ca3af 50%, #d1d5db 75%, #e5e7eb 100%)"
  })

  return (
    <div className="flex flex-col items-center justify-center h-20 space-y-2">
      <div
        ref={skeleton.ref}
        className="w-16 h-16 bg-gray-300 rounded-lg"
      />
      <div className="text-xs text-gray-500">Loading...</div>
    </div>
  )
}

function PerformanceDemo() {
  const performance = usePerformanceMonitor({
    interval: 1000,
    targetFps: 60
  })

  return (
    <div className="text-center flex flex-col items-center justify-center h-20">
      <div className="text-sm">
        <div>FPS: {performance.fps}</div>
        <div>Memory: {performance.memory}MB</div>
      </div>
    </div>
  )
} 